/**
 * AG15 — Wöchentlicher Rechts-Update Cron
 *
 * Läuft automatisch jeden Montag 03:00 UTC via Vercel Cron.
 * Kann auch manuell ausgelöst werden (CRON_SECRET erforderlich).
 *
 * Was es tut:
 *   Phase 1: 15 Quellen auf neue Urteile prüfen → Supabase urteile-Tabelle
 *   Phase 2: Gesetzesseiten auf neue Regelbedarfe/Freibeträge prüfen → kennzahlen
 *   Phase 3: Neue Behördenfehlertypen aus Urteilen ableiten → behoerdenfehler
 *   Phase 4: BA/DRV Weisungen überwachen → weisungen
 *   Phase 5: Audit-Protokoll schreiben → update_protokoll
 */

import { NextRequest, NextResponse } from "next/server";
import { runRechtsMonitor } from "@/lib/logic/agents/ag15-rechts-monitor";
import { reportError, reportInfo } from "@/lib/error-reporter";

const CRON_SECRET = process.env.CRON_SECRET;

function checkAuth(req: NextRequest): boolean {
  if (!CRON_SECRET) return false; // Kein Secret konfiguriert → Zugang gesperrt
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
    reportInfo("[RechtsUpdate] AG15 gestartet", { timestamp: new Date().toISOString() });
    const result = await runRechtsMonitor();
    reportInfo("[RechtsUpdate] AG15 fertig", { urteile_neu: result.urteile_neu, kennzahlen_geaendert: result.kennzahlen_geaendert, fehler_hinzugefuegt: result.fehler_hinzugefuegt, weisungen_neu: result.weisungen_neu, struktur_prs: result.struktur_prs });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      agent: "AG15",
      ...result,
    });
  } catch (err: unknown) {
    await reportError(err, { context: "[RechtsUpdate] AG15 Fehler" });
    return NextResponse.json(
      {
        success: false,
        agent: "AG15",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
