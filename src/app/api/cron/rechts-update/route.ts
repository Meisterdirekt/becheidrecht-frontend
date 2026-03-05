/**
 * AG04 + AG05 — Monatlicher Rechts-Update Cron
 *
 * Läuft automatisch am 1. jeden Monats via Vercel Cron.
 * Kann auch manuell ausgelöst werden (Admin-Key erforderlich).
 *
 * Was es tut:
 * 1. Fetcht aktuelle Entscheidungen von Whitelist-Domains (BSG, BVerfG, etc.)
 * 2. Claude Haiku analysiert & klassifiziert jede Entscheidung
 * 3. Neue Erkenntnisse werden in Supabase gespeichert (urteile + update_protokoll)
 * 4. Gibt Zusammenfassung zurück
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Konfiguration
// ---------------------------------------------------------------------------

const WHITELIST_SOURCES = [
  {
    name: "BSG Entscheidungen",
    url: "https://www.bsg.bund.de/DE/Entscheidungen/entscheidungen_node.html",
    rechtsgebiet: "BSG",
  },
  {
    name: "Gesetze im Internet — SGB II",
    url: "https://www.gesetze-im-internet.de/sgb_2/",
    rechtsgebiet: "SGB_II",
  },
  {
    name: "BMAS Meldungen",
    url: "https://www.bmas.de/DE/Service/Presse/Meldungen/meldungen.html",
    rechtsgebiet: "ALLGEMEIN",
  },
];

const CRON_SECRET = process.env.CRON_SECRET;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

/** Fetcht eine URL und gibt bereinigten Text zurück (max 8.000 Zeichen) */
async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "BescheidRecht-Bot/1.0 (legal research)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return `Fetch-Fehler: HTTP ${res.status}`;

    const html = await res.text();

    // Einfache HTML-Bereinigung: Tags entfernen, Whitespace normalisieren
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8_000);

    return text;
  } catch (err: unknown) {
    return `Fetch-Fehler: ${err instanceof Error ? err.message : String(err)}`;
  }
}

interface UrteileEintrag {
  gericht: string;
  aktenzeichen: string;
  entscheidungsdatum: string | null;
  leitsatz: string;
  volltext_url: string | null;
  rechtsgebiet: string;
  stichwort: string[];
  relevanz_score: number;
}

/** Nutzt Claude Haiku um neue Entscheidungen zu extrahieren */
async function extractDecisions(
  pageText: string,
  source: (typeof WHITELIST_SOURCES)[0],
  anthropic: Anthropic
): Promise<UrteileEintrag[]> {
  const today = new Date().toISOString().split("T")[0];

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    system: [
      {
        type: "text",
        text: `Du extrahierst Rechtsentscheidungen aus Webseiten-Texten.
Gib ausschließlich valides JSON zurück: ein Array von Objekten.
Jedes Objekt hat: gericht (string), aktenzeichen (string), entscheidungsdatum (YYYY-MM-DD oder null),
leitsatz (string, max 300 Zeichen), volltext_url (string oder null),
rechtsgebiet (SGB_II|SGB_V|SGB_XI|SGB_XII|RV|ALLGEMEIN),
stichwort (string[]), relevanz_score (1-5, 5=sehr wichtig).
Heute ist ${today}. Nur Entscheidungen der letzten 60 Tage. Leeres Array wenn keine gefunden.`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Quelle: ${source.name}\nURL: ${source.url}\n\n${pageText}`,
      },
    ],
  });

  try {
    const text =
      response.content[0].type === "text" ? response.content[0].text : "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as UrteileEintrag[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Hauptlogik
// ---------------------------------------------------------------------------

async function runRechtsUpdate(): Promise<{
  quellen_gecheckt: number;
  neue_eintraege: number;
  details: string[];
}> {
  if (!ANTHROPIC_KEY || !SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Fehlende Umgebungsvariablen: ANTHROPIC_API_KEY, Supabase-Keys");
  }

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  let neueEintraege = 0;
  const details: string[] = [];

  for (const source of WHITELIST_SOURCES) {
    try {
      console.log(`[RechtsUpdate] Fetche: ${source.name}`);
      const pageText = await fetchPageText(source.url);

      if (pageText.startsWith("Fetch-Fehler:")) {
        details.push(`⚠ ${source.name}: ${pageText}`);
        continue;
      }

      const decisions = await extractDecisions(pageText, source, anthropic);
      console.log(`[RechtsUpdate] ${source.name}: ${decisions.length} Entscheidungen gefunden`);

      for (const d of decisions) {
        if (!d.aktenzeichen || !d.leitsatz) continue;

        // Prüfen ob bereits vorhanden (upsert via aktenzeichen)
        const { error } = await supabase.from("urteile").upsert(
          {
            gericht: d.gericht,
            aktenzeichen: d.aktenzeichen,
            entscheidungsdatum: d.entscheidungsdatum || null,
            leitsatz: d.leitsatz.slice(0, 1000),
            volltext_url: d.volltext_url || null,
            rechtsgebiet: d.rechtsgebiet,
            stichwort: d.stichwort || [],
            relevanz_score: d.relevanz_score || 3,
          },
          { onConflict: "aktenzeichen" }
        );

        if (!error) {
          neueEintraege++;
        }
      }

      details.push(`✓ ${source.name}: ${decisions.length} Einträge verarbeitet`);
    } catch (err: unknown) {
      details.push(`✗ ${source.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Audit-Trail in update_protokoll schreiben
  try {
    await supabase.from("update_protokoll").insert({
      agent_id: "AG05",
      tabelle: "urteile",
      operation: "CRON_UPDATE",
      notiz: `Monatlicher Update: ${neueEintraege} neue Einträge aus ${WHITELIST_SOURCES.length} Quellen`,
    });
  } catch {
    // Protokoll-Fehler nicht kritisch (Tabelle evtl. noch nicht angelegt)
  }

  return {
    quellen_gecheckt: WHITELIST_SOURCES.length,
    neue_eintraege: neueEintraege,
    details,
  };
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  // Authentifizierung: Vercel Cron sendet automatisch Authorization-Header
  // Manuell: ?secret=CRON_SECRET oder Authorization: Bearer CRON_SECRET
  const authHeader = req.headers.get("authorization");
  const secretParam = req.nextUrl.searchParams.get("secret");

  const providedSecret =
    authHeader?.replace("Bearer ", "") || secretParam || "";

  if (CRON_SECRET && providedSecret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[RechtsUpdate] Cron gestartet:", new Date().toISOString());
    const result = await runRechtsUpdate();
    console.log("[RechtsUpdate] Fertig:", result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: unknown) {
    console.error("[RechtsUpdate] Fehler:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// POST für manuelle Trigger mit Body
export async function POST(req: NextRequest) {
  return GET(req);
}
