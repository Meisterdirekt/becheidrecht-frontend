/**
 * AG-BACKEND — Täglicher Backend-Health-Check
 * GET /api/cron/backend-health?secret=CRON_SECRET
 *
 * Läuft täglich 03:00 UTC via Vercel Cron.
 * Prüft: DB-Tabellen, Latenz, Kosten-Anomalien, Analyse-Volumen.
 * Erstellt GitHub Issue bei Problemen.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reportInfo } from "@/lib/error-reporter";
import { createGitHubIssueManaged } from "@/lib/logic/agents/tools/github-issues";

export const runtime = "nodejs";
export const maxDuration = 30;

function verifySecret(req: Request): boolean {
  const url = new URL(req.url);
  const authHeader = req.headers?.get?.("authorization") || "";
  const secret = url.searchParams.get("secret") || authHeader.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  return !!expected && secret === expected;
}

type TableCheck = { name: string; ok: boolean; count?: number; latencyMs: number; error?: string };

async function checkTables(): Promise<TableCheck[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return [];

  const supabase = createClient(url, serviceKey);

  const tables = [
    "user_fristen",
    "profiles",
    "analysis_results",
    "urteile",
    "kennzahlen",
    "update_protokoll",
    "site_feedback",
    "user_subscriptions",
  ];

  const results = await Promise.all(
    tables.map(async (table): Promise<TableCheck> => {
      const t0 = Date.now();
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        return {
          name: table,
          ok: !error,
          count: count ?? undefined,
          latencyMs: Date.now() - t0,
          error: error?.message,
        };
      } catch (err) {
        return {
          name: table,
          ok: false,
          latencyMs: Date.now() - t0,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  return results;
}

async function checkCostAnomaly(): Promise<{ ok: boolean; totalEur: number; avgEur: number; maxEur: number; anomaly?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return { ok: true, totalEur: 0, avgEur: 0, maxEur: 0 };

  try {
    const supabase = createClient(url, serviceKey);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from("analysis_results")
      .select("kosten_eur, created_at")
      .gte("created_at", yesterday.toISOString())
      .not("kosten_eur", "is", null);

    if (error || !data || data.length === 0) {
      return { ok: true, totalEur: 0, avgEur: 0, maxEur: 0 };
    }

    const costs = data.map((r) => Number(r.kosten_eur) || 0);
    const totalEur = costs.reduce((a, b) => a + b, 0);
    const avgEur = totalEur / costs.length;
    const maxEur = Math.max(...costs);

    const anomaly =
      totalEur > 10
        ? `Tageskosten kritisch: €${totalEur.toFixed(2)} (Limit: €10)`
        : totalEur > 5
        ? `Tageskosten erhöht: €${totalEur.toFixed(2)} (Warnung ab €5)`
        : maxEur > 0.8
        ? `Einzelanalyse teuer: €${maxEur.toFixed(2)} (Max: €0.80)`
        : undefined;

    return { ok: !anomaly, totalEur, avgEur, maxEur, anomaly };
  } catch {
    return { ok: true, totalEur: 0, avgEur: 0, maxEur: 0 };
  }
}

async function checkHealthEndpoint(baseUrl: string): Promise<{ ok: boolean; latencyMs: number; status?: number }> {
  const t0 = Date.now();
  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(8_000),
    });
    return { ok: res.ok, latencyMs: Date.now() - t0, status: res.status };
  } catch {
    return { ok: false, latencyMs: Date.now() - t0, status: 0 };
  }
}

export async function GET(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  reportInfo("[AG-BACKEND] Täglicher Health-Check gestartet");

  const productionUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const [tables, costs, health] = await Promise.all([
    checkTables(),
    checkCostAnomaly(),
    checkHealthEndpoint(productionUrl),
  ]);

  const failedTables = tables.filter((t) => !t.ok);
  const slowTables = tables.filter((t) => t.ok && t.latencyMs > 2000);
  const problems: string[] = [];

  if (failedTables.length > 0) {
    problems.push(`${failedTables.length} DB-Tabellen nicht erreichbar: ${failedTables.map((t) => t.name).join(", ")}`);
  }
  if (slowTables.length > 0) {
    problems.push(`${slowTables.length} Tabellen langsam (>2s): ${slowTables.map((t) => `${t.name} ${t.latencyMs}ms`).join(", ")}`);
  }
  if (costs.anomaly) {
    problems.push(costs.anomaly);
  }
  if (!health.ok) {
    problems.push(`Health-Endpoint nicht erreichbar (Status: ${health.status}, ${health.latencyMs}ms)`);
  }

  if (problems.length > 0) {
    const tableRows = tables
      .map((t) => `| ${t.name} | ${t.ok ? "✅" : "❌"} | ${t.count ?? "—"} | ${t.latencyMs}ms |${t.error ? ` ${t.error}` : ""} |`)
      .join("\n");

    const issueBody = [
      `## AG-BACKEND Health-Report — ${new Date().toLocaleDateString("de-DE")}`,
      "",
      `### 🚨 Probleme (${problems.length})`,
      problems.map((p) => `- ${p}`).join("\n"),
      "",
      `### Datenbank-Status`,
      `| Tabelle | Status | Einträge | Latenz |`,
      `|---------|--------|---------|--------|`,
      tableRows,
      "",
      `### Kosten (letzte 24h)`,
      `- Gesamt: €${costs.totalEur.toFixed(3)}`,
      `- Ø pro Analyse: €${costs.avgEur.toFixed(3)}`,
      `- Max Einzelanalyse: €${costs.maxEur.toFixed(3)}`,
      "",
      `### Health-Endpoint`,
      `- Status: ${health.ok ? "✅ OK" : "❌ FEHLER"} (HTTP ${health.status}, ${health.latencyMs}ms)`,
      "",
      `---`,
      `*Automatisch erstellt von AG-BACKEND • ${new Date().toISOString()}*`,
    ].join("\n");

    await createGitHubIssueManaged({
      title: `🔧 AG-BACKEND: ${problems.length} Problem(e) — ${new Date().toLocaleDateString("de-DE")}`,
      body: issueBody,
      labels: ["backend", "automated", "monitoring"],
      agentPrefix: "AG-BACKEND",
    });
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    problems: problems.length,
    tables: { total: tables.length, failed: failedTables.length, slow: slowTables.length },
    costs: { totalEur: costs.totalEur, anomaly: costs.anomaly ?? null },
    health: { ok: health.ok, latencyMs: health.latencyMs },
  });
}
