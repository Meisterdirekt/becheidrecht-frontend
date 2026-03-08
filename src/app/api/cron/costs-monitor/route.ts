/**
 * AG-COSTS — Tägliches Kosten-Monitoring
 * GET /api/cron/costs-monitor?secret=CRON_SECRET
 *
 * Läuft täglich 07:00 UTC via Vercel Cron.
 * Analysiert Claude-API-Kosten der letzten 24h + 7-Tage-Trend.
 * Alert via GitHub Issue bei Anomalien oder Schwellwert-Überschreitung.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 25;

function verifySecret(req: Request): boolean {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  return !!expected && secret === expected;
}

type CostRecord = {
  created_at: string;
  kosten_eur: number;
  token_gesamt: number;
  agenten_status?: Record<string, unknown>;
};

type DailyStats = {
  date: string;
  totalEur: number;
  analyzeCount: number;
  avgEur: number;
  maxEur: number;
  totalTokens: number;
};

async function getCostData(): Promise<{ last24h: CostRecord[]; last7days: CostRecord[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    return { last24h: [], last7days: [] };
  }

  const supabase = createClient(url, serviceKey);

  const ago24h = new Date();
  ago24h.setHours(ago24h.getHours() - 24);

  const ago7d = new Date();
  ago7d.setDate(ago7d.getDate() - 7);

  const [res24h, res7d] = await Promise.all([
    supabase
      .from("analysis_results")
      .select("created_at, kosten_eur, token_gesamt, agenten_status")
      .gte("created_at", ago24h.toISOString())
      .not("kosten_eur", "is", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("analysis_results")
      .select("created_at, kosten_eur, token_gesamt, agenten_status")
      .gte("created_at", ago7d.toISOString())
      .not("kosten_eur", "is", null)
      .order("created_at", { ascending: true }),
  ]);

  return {
    last24h: (res24h.data || []) as CostRecord[],
    last7days: (res7d.data || []) as CostRecord[],
  };
}

function aggregateByDay(records: CostRecord[]): DailyStats[] {
  const byDay = new Map<string, CostRecord[]>();

  for (const r of records) {
    const day = r.created_at.substring(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(r);
  }

  return Array.from(byDay.entries()).map(([date, recs]) => {
    const costs = recs.map((r) => Number(r.kosten_eur) || 0);
    const tokens = recs.map((r) => Number(r.token_gesamt) || 0);
    return {
      date,
      totalEur: costs.reduce((a, b) => a + b, 0),
      analyzeCount: recs.length,
      avgEur: costs.reduce((a, b) => a + b, 0) / costs.length,
      maxEur: Math.max(...costs),
      totalTokens: tokens.reduce((a, b) => a + b, 0),
    };
  });
}

async function createGitHubIssue(title: string, body: string, labels: string[]): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return;

  await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body, labels }),
  });
}

export async function GET(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[AG-COSTS] Tägliches Kosten-Monitoring gestartet");

  const { last24h, last7days } = await getCostData();

  if (last24h.length === 0 && last7days.length === 0) {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Keine Analyse-Daten gefunden (analysis_results leer oder Tabelle nicht deployed)",
    });
  }

  const daily24h = last24h.reduce((a, r) => a + (Number(r.kosten_eur) || 0), 0);
  const total24hTokens = last24h.reduce((a, r) => a + (Number(r.token_gesamt) || 0), 0);
  const max24h = last24h.length > 0 ? Math.max(...last24h.map((r) => Number(r.kosten_eur) || 0)) : 0;
  const weeklyStats = aggregateByDay(last7days);
  const weeklyTotal = last7days.reduce((a, r) => a + (Number(r.kosten_eur) || 0), 0);

  // Schwellwerte
  const WARN_EUR_DAY = 5;
  const CRIT_EUR_DAY = 10;
  const WARN_EUR_ANALYSIS = 0.5;
  const CRIT_EUR_ANALYSIS = 0.8;

  const alerts: Array<{ level: "warn" | "critical"; message: string }> = [];

  if (daily24h >= CRIT_EUR_DAY) {
    alerts.push({ level: "critical", message: `Tageskosten KRITISCH: €${daily24h.toFixed(2)} (Limit: €${CRIT_EUR_DAY})` });
  } else if (daily24h >= WARN_EUR_DAY) {
    alerts.push({ level: "warn", message: `Tageskosten erhöht: €${daily24h.toFixed(2)} (Warnung ab €${WARN_EUR_DAY})` });
  }

  if (max24h >= CRIT_EUR_ANALYSIS) {
    alerts.push({ level: "critical", message: `Teuerste Einzelanalyse KRITISCH: €${max24h.toFixed(3)} (Max: €${CRIT_EUR_ANALYSIS})` });
  } else if (max24h >= WARN_EUR_ANALYSIS) {
    alerts.push({ level: "warn", message: `Teuerste Einzelanalyse erhöht: €${max24h.toFixed(3)} (Warnung ab €${WARN_EUR_ANALYSIS})` });
  }

  // Trend-Check: Heute vs. Woche-Durchschnitt
  const weeklyAvgDay = weeklyStats.length > 0 ? weeklyTotal / weeklyStats.length : 0;
  if (weeklyAvgDay > 0 && daily24h > weeklyAvgDay * 2.5) {
    alerts.push({ level: "warn", message: `Kosten 2.5x über Wochendurchschnitt (€${weeklyAvgDay.toFixed(2)}/Tag)` });
  }

  if (alerts.length > 0) {
    const hasCritical = alerts.some((a) => a.level === "critical");
    const weeklyRows = weeklyStats
      .map((d) => `| ${d.date} | ${d.analyzeCount} | €${d.totalEur.toFixed(3)} | €${d.avgEur.toFixed(3)} | ${(d.totalTokens / 1000).toFixed(0)}K |`)
      .join("\n");

    const body = [
      `## AG-COSTS Report — ${new Date().toLocaleDateString("de-DE")}`,
      "",
      `### ${hasCritical ? "🚨 Kritische Alerts" : "⚠️ Warnungen"} (${alerts.length})`,
      alerts.map((a) => `- ${a.level === "critical" ? "🚨" : "⚠️"} ${a.message}`).join("\n"),
      "",
      `### Letzte 24 Stunden`,
      `- Analysen: ${last24h.length}`,
      `- Gesamtkosten: €${daily24h.toFixed(3)}`,
      `- Max Einzelanalyse: €${max24h.toFixed(3)}`,
      `- Tokens gesamt: ${(total24hTokens / 1000).toFixed(0)}K`,
      "",
      `### 7-Tage-Trend`,
      `| Tag | Analysen | Gesamt | Ø | Tokens |`,
      `|-----|----------|--------|---|--------|`,
      weeklyRows,
      "",
      `**Woche gesamt:** €${weeklyTotal.toFixed(3)} | Ø €${weeklyAvgDay.toFixed(3)}/Tag`,
      "",
      `### Schwellwerte`,
      `| Typ | Warnung | Kritisch |`,
      `|-----|---------|----------|`,
      `| Tageskosten | €${WARN_EUR_DAY} | €${CRIT_EUR_DAY} |`,
      `| Einzelanalyse | €${WARN_EUR_ANALYSIS} | €${CRIT_EUR_ANALYSIS} |`,
      "",
      `---`,
      `*Automatisch erstellt von AG-COSTS • ${new Date().toISOString()}*`,
    ].join("\n");

    await createGitHubIssue(
      `${hasCritical ? "🚨" : "⚠️"} AG-COSTS: ${alerts.length} Alert(s) — ${new Date().toLocaleDateString("de-DE")}`,
      body,
      ["costs", "automated", hasCritical ? "critical" : "warning"]
    );
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    last24h: {
      analyzeCount: last24h.length,
      totalEur: daily24h,
      maxEur: max24h,
      tokens: total24hTokens,
    },
    weekly: {
      totalEur: weeklyTotal,
      avgPerDay: weeklyStats.length > 0 ? weeklyTotal / weeklyStats.length : 0,
      days: weeklyStats.length,
    },
    alerts: alerts.length,
  });
}
