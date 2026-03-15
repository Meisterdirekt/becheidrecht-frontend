/**
 * Health-Check Endpoint — öffentlich, kein Auth
 * GET /api/health
 *
 * Für UptimeRobot, Monitoring-Dienste und AG-BACKEND.
 * Gibt HTTP 200 (gesund) oder 503 (degradiert) zurück.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckResult = { ok: boolean; latencyMs?: number; detail?: string };

async function checkDatabase(): Promise<CheckResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    return { ok: false, detail: "Supabase env vars fehlen" };
  }

  const t0 = Date.now();
  try {
    const supabase = createClient(url, serviceKey);
    const { error } = await supabase
      .from("user_fristen")
      .select("id")
      .limit(1)
      .abortSignal(AbortSignal.timeout(4_000));

    const latencyMs = Date.now() - t0;

    if (error && error.code !== "PGRST116") {
      return { ok: false, latencyMs, detail: "Datenbankfehler" };
    }
    return { ok: true, latencyMs };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - t0,
      detail: "Datenbankverbindung fehlgeschlagen",
    };
  }
}

function checkEnvVars(): CheckResult {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    // Keine Variablennamen in der Response — verhindert Information Disclosure
    return { ok: false, detail: `${missing.length} erforderliche Variable(n) fehlen` };
  }
  return { ok: true };
}

function checkOptionalEnvVars(): { configured: number; total: number } {
  const vars = ["MOLLIE_API_KEY", "TAVILY_API_KEY", "CRON_SECRET", "GITHUB_TOKEN", "SENTRY_DSN"];
  const configured = vars.filter((k) => !!process.env[k]).length;
  return { configured, total: vars.length };
}

export async function GET() {
  const t0 = Date.now();

  const [db, env] = await Promise.all([checkDatabase(), Promise.resolve(checkEnvVars())]);

  const optional = checkOptionalEnvVars();
  const healthy = db.ok && env.ok;
  const status = healthy ? "healthy" : "degraded";

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptimeMs: Date.now() - t0,
      checks: {
        database: db,
        env: env,
        optional,
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
