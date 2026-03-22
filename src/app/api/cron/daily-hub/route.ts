/**
 * Daily Hub — Konsolidierter Cron-Endpunkt fuer Hobby-Plan (max 2 Crons)
 * GET /api/cron/daily-hub?secret=CRON_SECRET
 *
 * Laeuft taeglich 03:00 UTC via Vercel Cron.
 * Fuehrt alle taeglichen Tasks aus und prueft ob heute ein
 * woechentlicher oder monatlicher Task faellig ist.
 *
 * Taeglich:  backend-health, data-retention, costs-monitor, fristen-reminder
 * So:        agent-batch + urteile-update (parallel)
 * Di:        design-audit
 * Mi:        agent-audit
 * Do:        design-guardian
 * Fr:        feedback-learner (AG20)
 * 1. des Monats: rechts-update
 * 15. des Monats: content-audit
 *
 * Vercel-Monitor laeuft nicht im Hub — vercel-monitor wuerde sich selbst
 * pruefen, was in einem Cron keinen Sinn ergibt.
 */

import { NextRequest, NextResponse } from "next/server";
import { reportInfo, reportError } from "@/lib/error-reporter";

export const runtime = "nodejs";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

function checkAuth(req: NextRequest): boolean {
  if (!CRON_SECRET) return false;
  const authHeader = req.headers.get("authorization");
  const secretParam = req.nextUrl.searchParams.get("secret");
  const provided = authHeader?.replace("Bearer ", "") || secretParam || "";
  return provided === CRON_SECRET;
}

type TaskResult = {
  name: string;
  success: boolean;
  durationMs: number;
  error?: string;
  skipped?: boolean;
};

async function runTask(
  name: string,
  baseUrl: string,
  path: string,
  timeoutMs: number = 50_000
): Promise<TaskResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${baseUrl}${path}?secret=${CRON_SECRET}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    const body = await res.json().catch(() => ({}));
    return {
      name,
      success: res.ok && body.success !== false,
      durationMs: Date.now() - start,
      error: !res.ok ? `HTTP ${res.status}` : body.success === false ? body.message : undefined,
    };
  } catch (err) {
    return {
      name,
      success: false,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=So, 1=Mo, 2=Di, 3=Mi, 4=Do
  const dayOfMonth = now.getUTCDate();

  // Base-URL fuer interne Aufrufe
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  reportInfo("[DailyHub] Gestartet", {
    dayOfWeek,
    dayOfMonth,
    timestamp: now.toISOString(),
  });

  const results: TaskResult[] = [];

  // --- Taegliche Tasks (parallel, wichtigste zuerst) ---
  const dailyTasks = [
    runTask("backend-health", baseUrl, "/api/cron/backend-health", 15_000),
    runTask("data-retention", baseUrl, "/api/cron/data-retention", 10_000),
    runTask("costs-monitor", baseUrl, "/api/cron/costs-monitor", 10_000),
    runTask("fristen-reminder", baseUrl, "/api/cron/fristen-reminder", 15_000),
    runTask("subscription-expiry", baseUrl, "/api/cron/subscription-expiry", 15_000),
  ];

  const dailyResults = await Promise.allSettled(dailyTasks);
  for (const r of dailyResults) {
    if (r.status === "fulfilled") {
      results.push(r.value);
    } else {
      results.push({ name: "unknown", success: false, durationMs: 0, error: String(r.reason) });
    }
  }

  // --- Woechentliche Tasks (sequentiell, nur am richtigen Tag) ---
  if (dayOfWeek === 0) {
    // Sonntag: agent-batch + urteile-update (parallel)
    const sundayTasks = [
      runTask("agent-batch", baseUrl, "/api/cron/agent-batch", 20_000),
      runTask("urteile-update", baseUrl, "/api/cron/urteile-update", 40_000),
    ];
    const sundayResults = await Promise.allSettled(sundayTasks);
    for (const r of sundayResults) {
      if (r.status === "fulfilled") results.push(r.value);
      else results.push({ name: "sunday-task", success: false, durationMs: 0, error: String(r.reason) });
    }
  }
  if (dayOfWeek === 2) {
    // Dienstag: design-audit
    results.push(await runTask("design-audit", baseUrl, "/api/cron/design-audit", 40_000));
  }
  if (dayOfWeek === 3) {
    // Mittwoch: agent-audit
    results.push(await runTask("agent-audit", baseUrl, "/api/cron/agent-audit", 20_000));
  }
  if (dayOfWeek === 4) {
    // Donnerstag: design-guardian
    results.push(await runTask("design-guardian", baseUrl, "/api/cron/design-guardian", 10_000));
  }
  if (dayOfWeek === 5) {
    // Freitag: feedback-learner (AG20)
    results.push(await runTask("feedback-learner", baseUrl, "/api/cron/feedback-learner", 15_000));
  }

  // --- Monatliche Tasks ---
  if (dayOfMonth === 1) {
    // 1. des Monats: rechts-update (AG15) — bekommt mehr Zeit
    results.push(await runTask("rechts-update", baseUrl, "/api/cron/rechts-update", 50_000));
  }
  if (dayOfMonth === 15) {
    // 15. des Monats: content-audit
    results.push(await runTask("content-audit", baseUrl, "/api/cron/content-audit", 10_000));
  }

  const totalMs = Date.now() - start;
  const failed = results.filter((r) => !r.success && !r.skipped);
  const summary = {
    success: failed.length === 0,
    timestamp: now.toISOString(),
    totalMs,
    tasksRun: results.length,
    tasksFailed: failed.length,
    results,
  };

  if (failed.length > 0) {
    await reportError(
      new Error(`DailyHub: ${failed.length} Tasks fehlgeschlagen`),
      {
        context: "daily-hub",
        failed: failed.map((f) => `${f.name}: ${f.error}`).join(", "),
      }
    );
  }

  reportInfo("[DailyHub] Fertig", {
    totalMs,
    tasksRun: results.length,
    tasksFailed: failed.length,
  });

  return NextResponse.json(summary, {
    status: failed.length > 0 ? 207 : 200,
  });
}
