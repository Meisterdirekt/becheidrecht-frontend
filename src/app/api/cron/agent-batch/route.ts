/**
 * Wöchentlicher Cron-Endpunkt für Batch-Agenten (AG09/AG10/AG11).
 * Läuft Sonntag 02:00 UTC via Vercel Cron.
 * Auth via ?secret=CRON_SECRET Query-Parameter.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { AgentContext, PipelineState } from "@/lib/logic/agents/types";
import { safeExecute } from "@/lib/logic/agents/utils";

export const runtime = "nodejs";

function verifyCronSecret(req: Request): boolean {
  const url = new URL(req.url);
  const authHeader = req.headers?.get?.("authorization") || "";
  const secret = url.searchParams.get("secret") || authHeader.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return secret === expected;
}

async function getRecentAnalysisSummary(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    return "Keine Supabase-Verbindung — Batch-Analyse mit leeren Daten.";
  }

  try {
    const supabase = createClient(url, serviceKey);

    // Letzte 7 Tage Analysen holen
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("user_fristen")
      .select("behoerde, rechtsgebiet, analyse_meta")
      .gte("created_at", weekAgo.toISOString())
      .limit(50);

    if (error || !data || data.length === 0) {
      return "Keine Analysen in den letzten 7 Tagen.";
    }

    const summary = [
      `${data.length} Analysen in den letzten 7 Tagen.`,
      `Behörden: ${[...new Set(data.map((d) => d.behoerde).filter(Boolean))].join(", ")}`,
      `Rechtsgebiete: ${[...new Set(data.map((d) => d.rechtsgebiet).filter(Boolean))].join(", ")}`,
    ].join("\n");

    return summary;
  } catch {
    return "Fehler beim Laden der Analysen.";
  }
}

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Agent-Batch] Wöchentlicher Cron gestartet");

  // --- Graceful Degradation: GITHUB_TOKEN + GITHUB_REPO prüfen ---
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO;

  if (!githubToken || !githubRepo) {
    const fehlend = !githubToken && !githubRepo
      ? "GITHUB_TOKEN und GITHUB_REPO"
      : !githubToken ? "GITHUB_TOKEN" : "GITHUB_REPO";

    console.log(`[Agent-Batch] ${fehlend} fehlt — AG09/AG10/AG11 übersprungen`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      skipped: true,
      reason: `${fehlend} nicht konfiguriert — Batch-Agenten übersprungen`,
      results: {
        AG09: { success: true, issues: 0, error: `Übersprungen — ${fehlend} fehlt` },
        AG10: { success: true, issues: 0, error: `Übersprungen — ${fehlend} fehlt` },
        AG11: { success: true, issues: 0, error: `Übersprungen — ${fehlend} fehlt` },
      },
    });
  }

  const summary = await getRecentAnalysisSummary();

  const pipeline: PipelineState = {};
  const ctx: AgentContext = {
    documentText: summary,
    routingStufe: "NORMAL",
    fristTage: null,
    pipeline,
  };

  const results: Record<string, { success: boolean; issues: number; error?: string }> = {};

  // AG09 Frontend
  try {
    const { ag09FrontendAgent } = await import("@/lib/logic/agents/ag09-frontend-agent");
    const result = await safeExecute(
      "AG09",
      () => ag09FrontendAgent.execute(ctx),
      { issues_created: 0, issue_urls: [] }
    );
    results["AG09"] = {
      success: result.success,
      issues: result.data.issues_created,
      error: result.error,
    };
  } catch (err) {
    results["AG09"] = { success: false, issues: 0, error: String(err) };
  }

  // AG10 Backend
  try {
    const { ag10BackendAgent } = await import("@/lib/logic/agents/ag10-backend-agent");
    const result = await safeExecute(
      "AG10",
      () => ag10BackendAgent.execute(ctx),
      { issues_created: 0, issue_urls: [] }
    );
    results["AG10"] = {
      success: result.success,
      issues: result.data.issues_created,
      error: result.error,
    };
  } catch (err) {
    results["AG10"] = { success: false, issues: 0, error: String(err) };
  }

  // AG11 DevOps
  try {
    const { ag11DevopsAgent } = await import("@/lib/logic/agents/ag11-devops-agent");
    const result = await safeExecute(
      "AG11",
      () => ag11DevopsAgent.execute(ctx),
      { issues_created: 0, issue_urls: [] }
    );
    results["AG11"] = {
      success: result.success,
      issues: result.data.issues_created,
      error: result.error,
    };
  } catch (err) {
    results["AG11"] = { success: false, issues: 0, error: String(err) };
  }

  console.log("[Agent-Batch] Ergebnisse:", results);

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    results,
  });
}
