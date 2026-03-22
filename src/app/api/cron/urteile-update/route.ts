/**
 * Woechentlicher Urteile-Crawler — sonntags via Daily-Hub.
 * Extrahiert AG15 Phase 1 (Urteile-Update) fuer hoehere Frische.
 *
 * AG15 laeuft weiterhin monatlich mit allen 7 Phasen.
 * Dieser Endpunkt fuehrt NUR Phase 1 (neue Urteile) aus.
 *
 * Auth via ?secret=CRON_SECRET Query-Parameter.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicKey, createAnthropicClient } from "@/lib/logic/agents/utils";
import { runPhase1Urteile } from "@/lib/logic/agents/ag15-rechts-monitor";
import { reportError, reportInfo } from "@/lib/error-reporter";

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
// GET Handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  reportInfo("[Urteile-Update] Woechentlicher Crawl gestartet");

  const apiKey = getAnthropicKey();
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "Kein ANTHROPIC_API_KEY",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const anthropic: Anthropic = createAnthropicClient(apiKey);
    const start = Date.now();

    const { neu, fehlerQuellen } = await runPhase1Urteile(anthropic);

    const durationMs = Date.now() - start;

    reportInfo("[Urteile-Update] Abgeschlossen", {
      urteile_neu: neu,
      fehler_quellen: fehlerQuellen.length,
      durationMs,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      urteile_neu: neu,
      fehler_quellen: fehlerQuellen,
      duration_ms: durationMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await reportError(err, { context: "[Urteile-Update] Fehler" });
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
