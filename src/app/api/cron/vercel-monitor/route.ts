/**
 * AG16 — Vercel-Ops-Agent Cron-Endpunkt.
 * Läuft täglich 06:00 UTC via Vercel Cron.
 * Auth via ?secret=CRON_SECRET Query-Parameter.
 *
 * Ablauf:
 * 1. Env-Var-Check (welche Required-Vars fehlen?)
 * 2. Kontext-String bauen (Datum, Status, fehlende Vars)
 * 3. AG16 ausführen (Deployment-Check + Issue-Erstellung)
 * 4. Ergebnis zurückgeben
 */

import { NextResponse } from "next/server";
import { safeExecute } from "@/lib/logic/agents/utils";
import type { PipelineState } from "@/lib/logic/agents/types";
import { reportInfo } from "@/lib/error-reporter";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Required + Recommended Env-Vars (Werte niemals ausgeben!)
// ---------------------------------------------------------------------------

const REQUIRED_VARS = [
  "ANTHROPIC_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
] as const;

const RECOMMENDED_VARS = [
  "GITHUB_TOKEN",
  "GITHUB_REPO",
  "VERCEL_TOKEN",
  "MOLLIE_API_KEY",
  "TAVILY_API_KEY",
  "SENTRY_DSN",
  "NEXT_PUBLIC_APP_URL",
  "VERCEL_PROJECT_ID",
] as const;

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
// Kontext aufbauen (keine Werte ausgeben — nur Existenz prüfen)
// ---------------------------------------------------------------------------

function buildContext(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const missingRequired = REQUIRED_VARS.filter(
    (v) => !process.env[v],
  );
  const missingRecommended = RECOMMENDED_VARS.filter(
    (v) => !process.env[v],
  );

  const presentRequired = REQUIRED_VARS.filter((v) => !!process.env[v]);
  const presentRecommended = RECOMMENDED_VARS.filter((v) => !!process.env[v]);

  const lines: string[] = [
    `DATUM: ${dateStr}`,
    `UHRZEIT: ${now.toISOString()}`,
    ``,
    `ENV-VAR-STATUS:`,
    `REQUIRED vorhanden (${presentRequired.length}/${REQUIRED_VARS.length}): ${presentRequired.join(", ")}`,
    missingRequired.length > 0
      ? `FEHLENDE REQUIRED-VARS: ${missingRequired.join(", ")}`
      : `REQUIRED: Alle vorhanden ✓`,
    `RECOMMENDED vorhanden (${presentRecommended.length}/${RECOMMENDED_VARS.length}): ${presentRecommended.join(", ")}`,
    missingRecommended.length > 0
      ? `FEHLENDE RECOMMENDED-VARS: ${missingRecommended.join(", ")}`
      : `RECOMMENDED: Alle vorhanden ✓`,
    ``,
    `AUFTRAG:`,
    `1. Rufe list_deployments auf (letzte 10 Deployments prüfen)`,
    `2. Bei ERROR-Deployment: get_deployment_logs aufrufen und Root Cause analysieren`,
    `3. Rufe get_project_info auf (Domain + Framework-Status)`,
    `4. GitHub Issue NUR bei echtem Problem erstellen`,
    `5. Bei fehlendem VERCEL_TOKEN: nur Env-Var-Check-Issue erstellen (wenn REQUIRED fehlen)`,
  ];

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// GET Handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  reportInfo("[Vercel-Monitor] AG16 Cron gestartet");

  const context = buildContext();

  const pipeline: PipelineState = {};
  const ctx = {
    documentText: context,
    routingStufe: "NORMAL" as const,
    fristTage: null,
    pipeline,
  };

  try {
    const { ag16VercelAgent } = await import(
      "@/lib/logic/agents/ag16-vercel-agent"
    );
    const result = await safeExecute(
      "AG16",
      () => ag16VercelAgent.execute(ctx),
      {
        deployments_checked: 0,
        failed_deployments: 0,
        env_vars_missing: [],
        issues_created: [],
        health_status: "healthy" as const,
        summary: "Fehler beim Ausführen von AG16",
      },
    );

    reportInfo("[Vercel-Monitor] AG16 abgeschlossen", { health_status: result.data.health_status, issues_created: result.data.issues_created.length });

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      agent: "AG16",
      health_status: result.data.health_status,
      deployments_checked: result.data.deployments_checked,
      failed_deployments: result.data.failed_deployments,
      env_vars_missing: result.data.env_vars_missing,
      issues_created: result.data.issues_created,
      duration_ms: result.durationMs,
      error: result.error,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Vercel-Monitor] Fehler: ${message}`);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
