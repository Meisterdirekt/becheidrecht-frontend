/**
 * AG17 — Agent-Auditor Cron-Endpunkt.
 * Läuft mittwochs 05:00 UTC via Vercel Cron.
 * Auth via ?secret=CRON_SECRET Query-Parameter.
 *
 * Ablauf:
 * 1. Supabase: Letzte 7 Tage Analysen abfragen
 * 2. Per-Agent-Metriken berechnen (TypeScript — kein LLM)
 * 3. Formatierter Metriken-Report für AG17 bauen
 * 4. AG17 ausführen (Anomalie-Erkennung + GitHub Issue)
 * 5. Ergebnis zurückgeben
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeExecute } from "@/lib/logic/agents/utils";
import type { PipelineState } from "@/lib/logic/agents/types";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function verifyCronSecret(req: Request): boolean {
  const url = new URL(req.url);
  const authHeader = req.headers?.get?.("authorization") || "";
  const secret = url.searchParams.get("secret") || authHeader.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return secret === expected;
}

// ---------------------------------------------------------------------------
// Typen für Metriken-Berechnung
// ---------------------------------------------------------------------------

interface AgentMetric {
  agent_id: string;
  successes: number;
  failures: number;
  total: number;
  success_rate: number;
  avg_duration_ms: number | null;
  durations: number[];
  error_count: number;
}

interface SystemMetrics {
  total_analyses: number;
  budget_exceeded_rate: number;
  notfall_rate: number;
  avg_cost_per_analysis: number;
  total_cost_eur: number;
}

// ---------------------------------------------------------------------------
// Metriken aus Supabase berechnen
// ---------------------------------------------------------------------------

async function computeMetrics(): Promise<{
  agentMetrics: Record<string, AgentMetric>;
  system: SystemMetrics;
  raw_count: number;
}> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const emptyResult = {
    agentMetrics: {},
    system: {
      total_analyses: 0,
      budget_exceeded_rate: 0,
      notfall_rate: 0,
      avg_cost_per_analysis: 0,
      total_cost_eur: 0,
    },
    raw_count: 0,
  };

  if (!supabaseUrl || !serviceKey) return emptyResult;

  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Primär: user_fristen (immer vorhanden, enthält analyse_meta)
    const { data: fristenData, error: fristenError } = await supabase
      .from("user_fristen")
      .select("created_at, analyse_meta, routing_stufe")
      .gte("created_at", weekAgo.toISOString())
      .limit(200);

    if (fristenError || !fristenData || fristenData.length === 0) {
      return emptyResult;
    }

    const agentMetrics: Record<string, AgentMetric> = {};
    let totalCost = 0;
    let budgetExceededCount = 0;
    let notfallCount = 0;

    for (const row of fristenData) {
      // routing_stufe direkt auf row oder in analyse_meta
      const routingStufe =
        (row.routing_stufe as string | null) ??
        (row.analyse_meta as Record<string, unknown> | null)?.routing_stufe ??
        null;

      if (routingStufe === "NOTFALL") notfallCount++;

      const meta = row.analyse_meta as Record<string, unknown> | null;
      if (!meta) continue;

      // Token-Kosten tracking
      const cost = (meta.token_kosten_eur as number | null) ?? 0;
      totalCost += cost;
      if (cost > 0.8) budgetExceededCount++;

      // Per-Agent-Metriken aus agenten_details
      const details = meta.agenten_details as
        | Record<string, { success: boolean; durationMs: number; error?: string }>
        | null;
      if (!details) continue;

      for (const [agentId, detail] of Object.entries(details)) {
        if (!agentMetrics[agentId]) {
          agentMetrics[agentId] = {
            agent_id: agentId,
            successes: 0,
            failures: 0,
            total: 0,
            success_rate: 0,
            avg_duration_ms: null,
            durations: [],
            error_count: 0,
          };
        }

        const m = agentMetrics[agentId];
        m.total++;
        if (detail.success) {
          m.successes++;
        } else {
          m.failures++;
          m.error_count++;
        }
        if (detail.durationMs > 0) {
          m.durations.push(detail.durationMs);
        }
      }
    }

    // Success-Rate + Avg-Duration berechnen
    for (const m of Object.values(agentMetrics)) {
      m.success_rate =
        m.total > 0 ? Math.round((m.successes / m.total) * 100) : 0;
      m.avg_duration_ms =
        m.durations.length > 0
          ? Math.round(
              m.durations.reduce((a, b) => a + b, 0) / m.durations.length,
            )
          : null;
    }

    const total = fristenData.length;

    return {
      agentMetrics,
      system: {
        total_analyses: total,
        budget_exceeded_rate:
          total > 0 ? Math.round((budgetExceededCount / total) * 100) : 0,
        notfall_rate:
          total > 0 ? Math.round((notfallCount / total) * 100) : 0,
        avg_cost_per_analysis:
          total > 0 ? Math.round((totalCost / total) * 10000) / 10000 : 0,
        total_cost_eur: Math.round(totalCost * 100) / 100,
      },
      raw_count: total,
    };
  } catch (err) {
    console.error("[Agent-Audit] Metriken-Fehler:", err);
    return emptyResult;
  }
}

// ---------------------------------------------------------------------------
// Agent-Name-Mapping
// ---------------------------------------------------------------------------

const AGENT_NAMES: Record<string, string> = {
  AG01: "Triage",
  AG02: "Analytiker",
  AG03: "Kritiker",
  AG04: "Rechercheur",
  AG05: "Wissensverwalter",
  AG06: "Prompt-Optimierer",
  AG07: "Brief-Generator",
  AG08: "Security-Gate",
  AG09: "Frontend-Agent",
  AG10: "Backend-Agent",
  AG11: "DevOps-Agent",
  AG12: "Dok-Prozessor",
  AG13: "Erklärer",
  AG14: "Präzedenz-Analyzer",
  AG15: "Rechts-Monitor",
  AG16: "Vercel-Ops-Agent",
  AG17: "Agent-Auditor",
};

// ---------------------------------------------------------------------------
// Metriken-Report formatieren (für AG17)
// ---------------------------------------------------------------------------

function formatMetricsReport(
  agentMetrics: Record<string, AgentMetric>,
  system: SystemMetrics,
  rawCount: number,
): string {
  const lines: string[] = [
    `ANALYSEN_GESAMT: ${system.total_analyses}`,
    `ROHDATEN: ${rawCount} Datensätze der letzten 7 Tage`,
    ``,
    `SYSTEM-METRIKEN:`,
    `budget_exceeded_rate: ${system.budget_exceeded_rate}%`,
    `notfall_rate: ${system.notfall_rate}%`,
    `avg_cost_per_analysis: ${system.avg_cost_per_analysis} EUR`,
    `total_cost_eur: ${system.total_cost_eur} EUR`,
    ``,
    `AGENTEN-METRIKEN (7 Tage):`,
  ];

  // Anomalie-Marker für AG17-Extraktion
  const anomalies: string[] = [];

  // Alle bekannten Agenten — sortiert
  const allAgentIds = [
    "AG01", "AG02", "AG03", "AG04", "AG05", "AG06", "AG07",
    "AG08", "AG09", "AG10", "AG11", "AG12", "AG13", "AG14",
    "AG15", "AG16", "AG17",
  ];

  for (const agentId of allAgentIds) {
    const m = agentMetrics[agentId];
    const name = AGENT_NAMES[agentId] ?? agentId;

    if (!m || m.total === 0) {
      lines.push(`${agentId} (${name}): keine Daten (läuft selten oder noch nicht ausgeführt)`);
      continue;
    }

    const durationStr = m.avg_duration_ms
      ? `${m.avg_duration_ms}ms`
      : "N/A";

    lines.push(
      `${agentId} (${name}): success_rate=${m.success_rate}% avg_duration=${durationStr} errors=${m.error_count} total=${m.total}`,
    );

    // Anomalie-Erkennung
    if (m.success_rate < 80) {
      anomalies.push(`KRITISCH: ${agentId} success_rate=${m.success_rate}%`);
    } else if (m.success_rate < 90) {
      anomalies.push(`WARNUNG: ${agentId} success_rate=${m.success_rate}%`);
    }

    if (m.avg_duration_ms && m.avg_duration_ms > 15000) {
      anomalies.push(`KRITISCH: ${agentId} avg_duration_ms=${m.avg_duration_ms}`);
    } else if (m.avg_duration_ms && m.avg_duration_ms > 8000) {
      anomalies.push(`WARNUNG: ${agentId} avg_duration_ms=${m.avg_duration_ms}`);
    }

    if (m.error_count > 15) {
      anomalies.push(`KRITISCH: ${agentId} error_count=${m.error_count}`);
    } else if (m.error_count > 5) {
      anomalies.push(`WARNUNG: ${agentId} error_count=${m.error_count}`);
    }
  }

  // System-Anomalien
  if (system.budget_exceeded_rate > 15) {
    anomalies.push(`KRITISCH: SYSTEM budget_exceeded_rate=${system.budget_exceeded_rate}%`);
  }
  if (system.notfall_rate > 25) {
    anomalies.push(`WARNUNG: SYSTEM notfall_rate=${system.notfall_rate}%`);
  }
  if (system.avg_cost_per_analysis > 0.35) {
    anomalies.push(`KRITISCH: SYSTEM avg_cost_per_analysis=${system.avg_cost_per_analysis}`);
  }

  if (anomalies.length > 0) {
    lines.push(``, `ERKANNTE ANOMALIEN:`);
    lines.push(...anomalies);
  } else {
    lines.push(``, `ANOMALIEN: Keine — alle Agenten im Normbereich.`);
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// GET Handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Agent-Audit] AG17 Cron gestartet");

  // 1. Metriken berechnen (TypeScript — kein LLM)
  const { agentMetrics, system, raw_count } = await computeMetrics();

  // 2. Report formatieren
  const metricsReport = formatMetricsReport(agentMetrics, system, raw_count);

  // 3. AG17 ausführen
  const pipeline: PipelineState = {};
  const ctx = {
    documentText: metricsReport,
    routingStufe: "NORMAL" as const,
    fristTage: null,
    pipeline,
  };

  try {
    const { ag17AgentAuditor } = await import(
      "@/lib/logic/agents/ag17-agent-auditor"
    );
    const result = await safeExecute(
      "AG17",
      () => ag17AgentAuditor.execute(ctx),
      {
        analyses_checked: raw_count,
        agents_audited: 0,
        anomalies: [],
        issues_created: [],
        health_status: "healthy" as const,
        report: "Fehler beim Ausführen von AG17",
      },
    );

    console.log(
      `[Agent-Audit] AG17 abgeschlossen — Health: ${result.data.health_status}, ` +
      `Anomalien: ${result.data.anomalies.length}, Issue: ${result.data.issues_created[0] ?? "keins"}`,
    );

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      agent: "AG17",
      analyses_checked: raw_count,
      agents_audited: result.data.agents_audited,
      anomalies_found: result.data.anomalies.length,
      health_status: result.data.health_status,
      issues_created: result.data.issues_created,
      system_metrics: system,
      duration_ms: result.durationMs,
      error: result.error,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Agent-Audit] Fehler: ${message}`);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
