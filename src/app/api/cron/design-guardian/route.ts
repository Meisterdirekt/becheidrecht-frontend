/**
 * AG19 — Design-Quality-Guardian Cron
 * GET /api/cron/design-guardian?secret=CRON_SECRET
 *
 * Läuft jeden Donnerstag 05:00 UTC via Vercel Cron.
 * Statische Code-Analyse gegen Design-System-Regeln.
 * Erstellt GitHub Issue mit Findings + Design-Score.
 */

import { NextRequest, NextResponse } from "next/server";
import { runDesignGuardian } from "@/lib/logic/agents/ag19-design-guardian";
import { reportError, reportInfo } from "@/lib/error-reporter";

export const runtime = "nodejs";
export const maxDuration = 30;

const CRON_SECRET = process.env.CRON_SECRET;

function checkAuth(req: NextRequest): boolean {
  if (!CRON_SECRET) return false;
  const authHeader = req.headers.get("authorization");
  const secretParam = req.nextUrl.searchParams.get("secret");
  const provided = authHeader?.replace("Bearer ", "") || secretParam || "";
  return provided === CRON_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    reportInfo("[DesignGuardian] AG19 gestartet", { timestamp: new Date().toISOString() });
    const result = await runDesignGuardian();
    reportInfo("[DesignGuardian] AG19 fertig", { score: result.gesamt_score, status: result.gesamt_status });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      agent: "AG19",
      score: result.gesamt_score,
      status: result.gesamt_status,
      violations: {
        farben: result.farb_violations.length,
        responsive: result.responsive_violations.length,
        a11y: result.a11y_violations.length,
        verboten: result.verbotene_patterns.length,
        tailwind: result.tailwind_violations.length,
        darkmode: result.darkmode_violations.length,
        klassen: result.klassen_violations.length,
      },
      dateien_geprueft: result.dateien_geprueft,
      issues_created: result.issues_created,
      zusammenfassung: result.zusammenfassung,
    });
  } catch (err: unknown) {
    await reportError(err, { context: "[DesignGuardian] AG19 Fehler" });
    return NextResponse.json(
      {
        success: false,
        agent: "AG19",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}

// POST für manuelle Trigger
export async function POST(req: NextRequest) {
  return GET(req);
}
