/**
 * AG18 — Content-Auditor Cron
 * GET /api/cron/content-audit?secret=CRON_SECRET
 *
 * Läuft am 15. jeden Monats 01:00 UTC via Vercel Cron.
 * Prüft: Kennzahlen, Fehlerkatalog, Weisungen, internal_rules.json
 * Erstellt GitHub Issue mit Audit-Ergebnis.
 */

import { NextRequest, NextResponse } from "next/server";
import { runContentAudit } from "@/lib/logic/agents/ag18-content-auditor";

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
    console.log("[ContentAudit] AG18 gestartet:", new Date().toISOString());
    const result = await runContentAudit();
    console.log("[ContentAudit] AG18 fertig:", result.gesamt_status);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      agent: "AG18",
      ...result,
    });
  } catch (err: unknown) {
    console.error("[ContentAudit] AG18 Fehler:", err);
    return NextResponse.json(
      {
        success: false,
        agent: "AG18",
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
