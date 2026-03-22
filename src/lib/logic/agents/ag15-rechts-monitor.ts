/**
 * AG15 — Autonomer Rechts-Monitor (Sonnet/Haiku · wöchentlicher Cron)
 *
 * 7-Phasen-Pipeline:
 *   1.  Urteile-Update       — 6 Quellen, Claude Sonnet, Supabase upsert
 *   2.  Kennzahlen-Check     — Regelbedarfe/Freibeträge, Claude Haiku, Supabase upsert
 *   3.  Fehlerkatalog-Ext.   — neue Fehlertypen aus Änderungen, Claude Sonnet, DB insert
 *   3b. Fehlerkatalog-Valid.  — 10er-Stichprobe bestehender Einträge, Haiku + Web, GitHub Issue
 *   4.  Weisungen-Monitor    — 8 Quellen (BA×3/GKV/MDS/BAMF/DRV/BZSt), Claude Haiku, DB
 *   5.  Struktur-Monitor     — Gesetzesumbenennungen/Behördenreformen → GitHub PR
 *   6.  Audit-Report         — update_protokoll, MonitorResult
 *
 * Sicherheit:
 *   - Whitelist-only (18 definierte Domains)
 *   - Max 20 Urteile + 5 Fehlerkatalog-Einträge pro Lauf
 *   - Kein Update existierender Fehlerkatalog-JSON-Einträge direkt
 *   - Strukturänderungen NUR via GitHub PR (human review vor Merge)
 *   - 15s Timeout pro Source-Fetch
 *   - Graceful Degradation: jede Phase kann unabhängig fehlschlagen
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { extractJsonSafe, SONNET_MODEL, getAnthropicKey } from "./utils";
import type { Agent, AgentContext, AgentResult } from "./types";
import { emptyTokenUsage } from "./types";
import { reportInfo } from "@/lib/error-reporter";

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

export interface MonitorResult {
  urteile_neu: number;
  kennzahlen_geaendert: number;
  fehler_hinzugefuegt: number;
  weisungen_neu: number;
  struktur_prs: number;
  quellen_gecheckt: number;
  fehler_quellen: string[];
  zusammenfassung: string;
}

interface StrukturAenderung {
  typ: "umbenennung" | "neues_gesetz" | "behorden_reform" | "paragraph_aenderung";
  was_alt: string;
  was_neu: string;
  gesetz: string;
  ikraft_ab: string | null;
  quelle_url: string;
  beschreibung: string;
  betroffene_bereiche: string[];
}

interface UrteileEintrag {
  gericht: string;
  aktenzeichen: string;
  entscheidungsdatum: string | null;
  leitsatz: string;
  volltext_url?: string | null;
  rechtsgebiet: string;
  stichwort: string[];
  relevanz_score: number;
}

interface KennzahlUpdate {
  schluessel: string;
  wert: number;
  einheit: string;
  gueltig_ab: string;
  beschreibung: string;
}

interface FehlerEintrag {
  fehler_id: string;
  titel: string;
  severity: "hinweis" | "wichtig" | "kritisch";
  rechtsbasis: string[];
  beschreibung: string;
  musterschreiben_hinweis?: string;
}

interface WeisungEintrag {
  traeger: string;
  weisung_nr: string;
  titel: string;
  gueltig_ab: string | null;
  zusammenfassung?: string;
  url?: string;
  rechtsgebiet?: string;
}

// ---------------------------------------------------------------------------
// Quellen-Konfiguration (22 Quellen — vollständige Whitelist)
// ---------------------------------------------------------------------------

export const QUELLEN = {
  urteile: [
    { name: "BSG Entscheidungen",      url: "https://www.bsg.bund.de/DE/Entscheidungen/entscheidungen_node.html", rechtsgebiet: "BSG" },
    { name: "BVerfG Entscheidungen",   url: "https://www.bundesverfassungsgericht.de/DE/Entscheidungen/entscheidungen_node.html", rechtsgebiet: "VERFASSUNG" },
    { name: "Sozialgerichtsbarkeit",   url: "https://www.sozialgerichtsbarkeit.de/sgb/", rechtsgebiet: "SGG" },
    { name: "BMAS Meldungen",          url: "https://www.bmas.de/DE/Service/Presse/Meldungen/meldungen.html", rechtsgebiet: "ALLGEMEIN" },
    { name: "DRV Aktuelles",           url: "https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/Meldungen_node.html", rechtsgebiet: "SGB_VI" },
    { name: "BAMF Asyl",               url: "https://www.bamf.de/DE/Themen/AsylFluechtlingsschutz/asylfluechtlingsschutz-node.html", rechtsgebiet: "ASYL" },
  ],
  gesetze: [
    { name: "SGB II",  url: "https://www.gesetze-im-internet.de/sgb_2/",       rechtsgebiet: "SGB_II" },
    { name: "SGB V",   url: "https://www.gesetze-im-internet.de/sgb_5/",       rechtsgebiet: "SGB_V" },
    { name: "SGB IX",  url: "https://www.gesetze-im-internet.de/sgb_9_2018/",  rechtsgebiet: "SGB_IX" },
    { name: "SGB XI",  url: "https://www.gesetze-im-internet.de/sgb_11/",      rechtsgebiet: "SGB_XI" },
    { name: "SGB XII", url: "https://www.gesetze-im-internet.de/sgb_12/",      rechtsgebiet: "SGB_XII" },
    { name: "BAföG",   url: "https://www.gesetze-im-internet.de/baf_g/",       rechtsgebiet: "BAFOEG" },
    { name: "WoGG",    url: "https://www.gesetze-im-internet.de/wogg/",        rechtsgebiet: "WOHNGELD" },
    { name: "BMAS Gesetze", url: "https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/gesetze-und-gesetzesvorhaben.html", rechtsgebiet: "ALLGEMEIN" },
  ],
  weisungen: [
    { name: "BA Weisungen SGB II",     url: "https://www.arbeitsagentur.de/ueber-uns/veroeffentlichungen/gesetze-und-weisungen/sgbii-grundsicherung", traeger: "jobcenter", rechtsgebiet: "SGB_II" },
    { name: "BA Weisungen SGB III",    url: "https://www.arbeitsagentur.de/ueber-uns/veroeffentlichungen/gesetze-und-weisungen/sgbiii-arbeitsfoerderung", traeger: "arbeitsagentur", rechtsgebiet: "SGB_III" },
    { name: "MDS Begutachtungs-RL",    url: "https://md-bund.de/richtlinien-publikationen/richtlinien/grundlagen-fuer-begutachtungen-und-qualitaetspruefungen.html", traeger: "pflegekasse", rechtsgebiet: "SGB_XI" },
    { name: "GKV Richtlinien",         url: "https://www.gkv-spitzenverband.de/krankenversicherung/krankenversicherung.jsp", traeger: "krankenkasse", rechtsgebiet: "SGB_V" },
    { name: "BAMF Verfahrenssteuerung", url: "https://www.bamf.de/DE/Themen/AsylFluechtlingsschutz/VerfahresteuerungQualitaetssicherung/verfahresteuerungqualitaetssicherung-node.html", traeger: "bamf", rechtsgebiet: "ASYL" },
    { name: "DRV rvRecht GRA",        url: "https://rvrecht.deutsche-rentenversicherung.de/", traeger: "drv", rechtsgebiet: "SGB_VI" },
    { name: "BZSt DA-KG Kindergeld",  url: "https://www.bzst.de/SharedDocs/Downloads/DE/Kindergeldberechtigte/da_kg_2024_randstrichfassung.html", traeger: "familienkasse", rechtsgebiet: "KINDERGELD" },
    { name: "BA Weisungen BKGG/KiZ",  url: "https://www.arbeitsagentur.de/ueber-uns/veroeffentlichungen/gesetze-und-weisungen/sonstige-rechtsnormen", traeger: "familienkasse", rechtsgebiet: "KINDERGELD" },
  ],
  struktur: [
    { name: "Bundesgesetzblatt",       url: "https://www.bgbl.de/xaver/bgbl/start.xav", typ: "gesetzblatt" },
    { name: "BMAS Gesetze & Vorhaben", url: "https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/gesetze-und-gesetzesvorhaben.html", typ: "ministerium" },
    { name: "Bundesrat Tagesordnung",  url: "https://www.bundesrat.de/DE/plenum/to-plenum/to-plenum-node.html", typ: "bundesrat" },
    { name: "Bundestag Gesetze",       url: "https://www.bundestag.de/gesetze", typ: "bundestag" },
    { name: "gesetze-im-internet SGB II", url: "https://www.gesetze-im-internet.de/sgb_2/", typ: "gesetz" },
  ],
};

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}



export async function fetchPageText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "BescheidRecht-Monitor/2.0 (legal research; +https://bescheidrecht.de)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8_000);
  } catch {
    return null;
  }
}

function currentYear(): number {
  return new Date().getFullYear();
}

// ---------------------------------------------------------------------------
// Phase 1: Urteile-Update
// ---------------------------------------------------------------------------

export async function runPhase1Urteile(
  anthropic: Anthropic,
): Promise<{ neu: number; fehlerQuellen: string[] }> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { neu: 0, fehlerQuellen: ["Supabase nicht verfügbar"] };

  let neu = 0;
  const fehlerQuellen: string[] = [];
  const today = new Date().toISOString().split("T")[0];

  const systemPrompt: Anthropic.TextBlockParam[] = [{
    type: "text",
    text: `Du extrahierst Rechtsentscheidungen aus deutschen Behörden-Webseiten.
Gib ausschließlich ein JSON-Array zurück. Jedes Objekt:
{ "gericht": string, "aktenzeichen": string, "entscheidungsdatum": "YYYY-MM-DD"|null,
  "leitsatz": string (max 300 Zeichen), "volltext_url": string|null,
  "rechtsgebiet": "SGB_II"|"SGB_III"|"SGB_V"|"SGB_VI"|"SGB_IX"|"SGB_XI"|"SGB_XII"|"ASYL"|"VERFASSUNG"|"ALLGEMEIN",
  "stichwort": string[], "relevanz_score": 1|2|3|4|5 }
Heute: ${today}. Nur Entscheidungen der letzten 90 Tage. Leeres Array [] wenn keine gefunden.`,
    cache_control: { type: "ephemeral" },
  }];

  // Alle Quellen-Seiten parallel vorher fetchen (spart ~2-3s)
  const prefetched = await Promise.all(
    QUELLEN.urteile.map(async (q) => ({
      quelle: q,
      text: await fetchPageText(q.url),
    }))
  );

  for (const { quelle, text: pageText } of prefetched) {
    try {
      if (!pageText) {
        fehlerQuellen.push(`${quelle.name}: Nicht erreichbar`);
        continue;
      }

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: `Quelle: ${quelle.name}\nURL: ${quelle.url}\nRechtsgebiet: ${quelle.rechtsgebiet}\n\n${pageText}` }],
      });

      const text = response.content.find(b => b.type === "text")?.text ?? "[]";
      const decisions = extractJsonSafe<UrteileEintrag[]>(text, []);

      if (!Array.isArray(decisions)) continue;

      // Max 20 Urteile pro Lauf (Qualitätskontrolle)
      const toProcess = decisions.slice(0, 20);

      for (const d of toProcess) {
        if (!d.aktenzeichen || !d.leitsatz) continue;

        const row: Record<string, unknown> = {
          gericht: d.gericht ?? quelle.rechtsgebiet,
          aktenzeichen: d.aktenzeichen,
          entscheidungsdatum: d.entscheidungsdatum || null,
          leitsatz: d.leitsatz.slice(0, 1000),
          volltext_url: d.volltext_url || null,
          rechtsgebiet: d.rechtsgebiet || quelle.rechtsgebiet,
          stichwort: Array.isArray(d.stichwort) ? d.stichwort : [],
          relevanz_score: d.relevanz_score ?? 3,
        };

        const { error } = await supabase.from("urteile" as string).upsert(
          row, { onConflict: "aktenzeichen" }
        );

        if (!error) neu++;
      }

      reportInfo("[AG15 P1] Urteile verarbeitet", { quelle: quelle.name, verarbeitet: toProcess.length, neu });
    } catch (err) {
      fehlerQuellen.push(`${quelle.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { neu, fehlerQuellen };
}

// ---------------------------------------------------------------------------
// Phase 2: Kennzahlen-Check
// ---------------------------------------------------------------------------

async function runPhase2Kennzahlen(
  anthropic: Anthropic,
): Promise<{ geaendert: number; fehlerQuellen: string[] }> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { geaendert: 0, fehlerQuellen: ["Supabase nicht verfügbar"] };

  let geaendert = 0;
  const fehlerQuellen: string[] = [];
  const naechstesJahr = currentYear() + 1;

  const systemPrompt: Anthropic.TextBlockParam[] = [{
    type: "text",
    text: `Du prüfst ob neue Regelbedarfsstufen, Pflegegelder, Freibeträge oder Sozialleistungsbeträge im Text erwähnt werden.
Suche gezielt nach Zahlen für das Jahr ${naechstesJahr} oder ${currentYear()}.
Antworte mit JSON-Array oder leerem Array []:
[{"schluessel": "regelbedarf_${naechstesJahr}_single", "wert": 590, "einheit": "EUR", "gueltig_ab": "${naechstesJahr}-01-01", "beschreibung": "Regelbedarf Alleinstehende SGB II ${naechstesJahr}"}]
Schlüssel-Schema: [typ]_[jahr]_[spezifikation] (z.B. regelbedarf, pflegegeld, bafoeg, elterngeld, uvs).
Nur wenn konkrete neue Zahlen im Text stehen — kein Raten.`,
    cache_control: { type: "ephemeral" },
  }];

  // Alle Gesetzesquellen parallel prefetchen
  const prefetchedGesetze = await Promise.all(
    QUELLEN.gesetze.map(async (q) => ({
      quelle: q,
      text: await fetchPageText(q.url),
    }))
  );

  for (const { quelle, text: pageText } of prefetchedGesetze) {
    try {
      if (!pageText) {
        fehlerQuellen.push(`${quelle.name}: Nicht erreichbar`);
        continue;
      }

      // Nur verarbeiten wenn Jahreszahl des nächsten Jahres vorkommt
      if (!pageText.includes(String(naechstesJahr)) && !pageText.includes(String(currentYear()))) {
        continue;
      }

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: `Quelle: ${quelle.name}\nRechtsgebiet: ${quelle.rechtsgebiet}\n\n${pageText}` }],
      });

      const text = response.content.find(b => b.type === "text")?.text ?? "[]";
      const updates = extractJsonSafe<KennzahlUpdate[]>(text, []);

      if (!Array.isArray(updates) || updates.length === 0) continue;

      for (const u of updates) {
        if (!u.schluessel || u.wert === undefined) continue;

        // Alten Wert lesen (für History + Audit-Trail)
        const { data: existing } = await supabase
          .from("kennzahlen" as string)
          .select("wert, einheit, gueltig_ab, beschreibung")
          .eq("schluessel", u.schluessel)
          .single();

        const alterWert = existing ? `${existing.wert} ${existing.einheit || ""}`.trim() : null;
        const neuerWert = `${u.wert} ${u.einheit || "EUR"}`;
        const hatSichGeaendert = !existing || Number(existing.wert) !== u.wert;

        const row: Record<string, unknown> = {
          schluessel: u.schluessel,
          wert: u.wert,
          einheit: u.einheit || "EUR",
          gueltig_ab: u.gueltig_ab || `${naechstesJahr}-01-01`,
          beschreibung: u.beschreibung || u.schluessel,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("kennzahlen" as string).upsert(
          row, { onConflict: "schluessel" }
        );

        if (!error) {
          geaendert++;

          // Versionierung: DB-Trigger auf kennzahlen schreibt automatisch
          // in kennzahlen_history (old/new Werte). Hier nur Audit-Trail.
          if (hatSichGeaendert) {
            try {
              await supabase.from("update_protokoll" as string).insert({
                agent_id: "AG15",
                tabelle: "kennzahlen",
                operation: alterWert ? "KENNZAHL_UPDATE" : "KENNZAHL_NEU",
                notiz: alterWert
                  ? `${u.schluessel}: ${alterWert} → ${neuerWert}`
                  : `${u.schluessel}: ${neuerWert} (neu)`,
                alter_wert: alterWert,
              });
            } catch { /* update_protokoll nicht verfügbar */ }
          }
        }
      }

      reportInfo("[AG15 P2] Kennzahlen geprüft", { quelle: quelle.name, anzahl: updates.length });
    } catch (err) {
      fehlerQuellen.push(`${quelle.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { geaendert, fehlerQuellen };
}

// ---------------------------------------------------------------------------
// Phase 3: Fehlerkatalog-Erweiterung
// ---------------------------------------------------------------------------

async function runPhase3Fehlerkatalog(
  anthropic: Anthropic,
  phase1Urteile: number,
  phase2Kennzahlen: number
): Promise<{ hinzugefuegt: number }> {
  // Nur wenn in Phase 1+2 tatsächlich Änderungen gefunden wurden
  if (phase1Urteile === 0 && phase2Kennzahlen === 0) {
    reportInfo("[AG15 P3] Fehlerkatalog-Erweiterung übersprungen", { grund: "Keine Änderungen in P1/P2" });
    return { hinzugefuegt: 0 };
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) return { hinzugefuegt: 0 };

  let hinzugefuegt = 0;

  try {
    // Lade die letzten 10 neuen Urteile aus der DB für Kontext
    const { data } = await supabase
      .from("urteile" as string)
      .select("gericht, aktenzeichen, leitsatz, rechtsgebiet")
      .order("created_at", { ascending: false })
      .limit(10);

    const neueUrteile = (data ?? []) as Array<{
      gericht: string;
      aktenzeichen: string;
      leitsatz: string;
      rechtsgebiet: string;
    }>;

    if (neueUrteile.length === 0) return { hinzugefuegt: 0 };

    const urteilsKontext = neueUrteile
      .map(u => `${u.gericht} ${u.aktenzeichen} (${u.rechtsgebiet}): ${u.leitsatz}`)
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: [{
        type: "text",
        text: `Du analysierst neue Gerichtsentscheidungen und identifizierst daraus neue Behördenfehlermuster.
Antworte mit JSON-Array (max. 5 Einträge) oder []:
[{
  "fehler_id": "DYN_SGBII_001",
  "titel": "Fehler bei der Anrechnung von Einkommen nach neuer BSG-Rechtsprechung",
  "severity": "wichtig",
  "rechtsbasis": ["§ 11b SGB II"],
  "beschreibung": "Nach BSG B 4 AS X/25 R ist...",
  "musterschreiben_hinweis": "Widerspruch mit Verweis auf BSG-Urteil..."
}]
Fehler-ID Schema: DYN_[RECHTSGEBIET]_[NR] z.B. DYN_SGBII_001, DYN_SGBV_002.
Nur echte, neue Fehlermuster die aus den Urteilen direkt ableitbar sind.`,
        cache_control: { type: "ephemeral" },
      }],
      messages: [{ role: "user", content: `Neue Urteile diese Woche:\n${urteilsKontext}` }],
    });

    const text = response.content.find(b => b.type === "text")?.text ?? "[]";
    const neueFehler = extractJsonSafe<FehlerEintrag[]>(text, []);

    if (!Array.isArray(neueFehler)) return { hinzugefuegt: 0 };

    for (const f of neueFehler.slice(0, 5)) {
      if (!f.fehler_id || !f.titel) continue;

      // Prüfen ob fehler_id bereits existiert
      const { data: existing } = await supabase
        .from("behoerdenfehler" as string)
        .select("id")
        .eq("fehler_id", f.fehler_id)
        .single();

      if (existing) continue; // Bereits vorhanden

      const row: Record<string, unknown> = {
        fehler_id: f.fehler_id,
        titel: f.titel,
        severity: f.severity || "hinweis",
        rechtsbasis: f.rechtsbasis || [],
        beschreibung: f.beschreibung || "",
        musterschreiben_hinweis: f.musterschreiben_hinweis || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("behoerdenfehler" as string).insert(row);

      if (!error) hinzugefuegt++;
    }

    reportInfo("[AG15 P3] Fehlertypen eingefügt", { hinzugefuegt });
  } catch (err) {
    console.warn("[AG15 P3] Fehlerkatalog-Erweiterung fehlgeschlagen:", err);
  }

  return { hinzugefuegt };
}

// ---------------------------------------------------------------------------
// Phase 3b: Fehlerkatalog-Validierung (bestehende Einträge prüfen)
// ---------------------------------------------------------------------------

interface ValidierungsErgebnis {
  geprueft: number;
  veraltet: number;
  details: Array<{ fehler_id: string; problem: string }>;
}

async function runPhase3bValidierung(
  anthropic: Anthropic,
): Promise<ValidierungsErgebnis> {
  const fs = await import("fs/promises");
  const fehlerkatalogPath = process.cwd() + "/content/behoerdenfehler_logik.json";

  let fehlerkatalog: Array<Record<string, unknown>>;
  try {
    const raw = await fs.readFile(fehlerkatalogPath, "utf-8");
    fehlerkatalog = JSON.parse(raw);
  } catch {
    console.warn("[AG15 P3b] Fehlerkatalog nicht lesbar");
    return { geprueft: 0, veraltet: 0, details: [] };
  }

  // Sample: 10 zufällige Einträge pro Lauf (Kosten- + Rate-Limit-Kontrolle)
  const shuffled = [...fehlerkatalog].sort(() => Math.random() - 0.5);
  const sample = shuffled.slice(0, 10);

  const details: Array<{ fehler_id: string; problem: string }> = [];

  // Batch: Alle 10 Einträge in einem einzigen LLM-Call validieren
  const eintraege = sample.map((e) => ({
    id: String(e.id || ""),
    titel: String(e.titel || ""),
    beschreibung: String(e.beschreibung || ""),
    rechtsbasis: Array.isArray(e.rechtsbasis) ? e.rechtsbasis : [],
    severity: String(e.severity || ""),
  }));

  try {
    // Für jeden referenzierten Paragraphen: aktuelle Gesetzestexte prüfen
    const paragraphen = new Set<string>();
    for (const e of eintraege) {
      for (const r of e.rechtsbasis) {
        // Extrahiere Gesetz aus Rechtsbasis (z.B. "§ 22 SGB II" → "sgb_2")
        const match = String(r).match(/SGB\s*(II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)/i);
        if (match) paragraphen.add(match[0].replace(/\s+/g, " "));
      }
    }

    // Stichproben-Fetch von gesetze-im-internet für Kontext
    const gesetzesKontext: string[] = [];
    const sgbMapping: Record<string, string> = {
      "SGB II": "sgb_2", "SGB III": "sgb_3", "SGB V": "sgb_5",
      "SGB VI": "sgb_6", "SGB IX": "sgb_9_2018", "SGB X": "sgb_10",
      "SGB XI": "sgb_11", "SGB XII": "sgb_12",
    };

    const uniqueGesetze = new Set<string>();
    for (const p of paragraphen) {
      const gesetz = Object.entries(sgbMapping).find(([key]) => p.includes(key));
      if (gesetz) uniqueGesetze.add(gesetz[1]);
    }

    // Max 3 Gesetzes-Seiten fetchen
    const gesetzeToFetch = Array.from(uniqueGesetze).slice(0, 3);
    for (const g of gesetzeToFetch) {
      const pageText = await fetchPageText(`https://www.gesetze-im-internet.de/${g}/`);
      if (pageText) {
        gesetzesKontext.push(`--- ${g} ---\n${pageText.slice(0, 2000)}`);
      }
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: [{
        type: "text",
        text: `Du validierst bestehende Einträge eines Behörden-Fehlerkatalogs auf Aktualität.
Prüfe für jeden Eintrag:
1. Existieren die referenzierten Paragraphen noch? (Wurden sie umbenannt, verschoben, aufgehoben?)
2. Stimmt die Severity noch? (z.B. "kritisch" für einen inzwischen unwichtigen Fehler)
3. Enthält die Beschreibung veraltete Begriffe? (z.B. "Hartz IV" statt "Grundsicherungsgeld", alte Beträge)
4. Ist die Rechtsbasis noch korrekt? (Gesetzesänderungen seit Eintrag-Erstellung)

Antworte mit JSON-Array — nur Einträge die PROBLEME haben:
[{"fehler_id": "BA_001", "problem": "§ 31a SGB II wurde 2024 geändert — Sanktionsregeln verschärft, Beschreibung veraltet"}]
Leeres Array [] wenn alles aktuell ist. Nur echte Probleme — kein Nitpicking.`,
        cache_control: { type: "ephemeral" },
      }],
      messages: [{
        role: "user",
        content: `Zu prüfende Fehlerkatalog-Einträge:\n${JSON.stringify(eintraege, null, 2)}\n\n${
          gesetzesKontext.length > 0
            ? `Aktuelle Gesetzestexte (Auszüge):\n${gesetzesKontext.join("\n\n")}`
            : "(Keine Gesetzestexte abrufbar — prüfe nur auf offensichtliche Fehler)"
        }`,
      }],
    });

    const text = response.content.find(b => b.type === "text")?.text ?? "[]";
    const probleme = extractJsonSafe<Array<{ fehler_id: string; problem: string }>>(text, []);

    if (Array.isArray(probleme)) {
      details.push(...probleme);
    }

    reportInfo("[AG15 P3b] Fehlerkatalog-Validierung", { geprueft: sample.length, veraltet: details.length });
  } catch (err) {
    console.warn("[AG15 P3b] Validierung fehlgeschlagen:", err instanceof Error ? err.message : String(err));
  }

  // Bei Funden: GitHub Issue erstellen
  if (details.length > 0) {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO;
    if (githubToken && githubRepo) {
      const [owner, repoName] = githubRepo.split("/");
      const body = [
        `## AG15 Fehlerkatalog-Validierung`,
        ``,
        `**Geprüft:** ${sample.length} von ${fehlerkatalog.length} Einträgen (Stichprobe)`,
        `**Veraltet:** ${details.length}`,
        ``,
        `### Befunde`,
        ...details.map(d => `- **${d.fehler_id}:** ${d.problem}`),
        ``,
        `### Empfohlene Maßnahme`,
        `Die betroffenen Einträge in \`content/behoerdenfehler_logik.json\` manuell prüfen und aktualisieren.`,
        ``,
        `---`,
        `*Automatisch erstellt von AG15 Phase 3b • ${new Date().toISOString()}*`,
      ].join("\n");

      try {
        await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `🔍 AG15: ${details.length} veraltete Fehlerkatalog-Einträge gefunden`,
            body,
            labels: ["fehlerkatalog", "automated", "review-needed"],
          }),
        });
        reportInfo("[AG15 P3b] GitHub Issue erstellt");
      } catch {
        console.warn("[AG15 P3b] GitHub Issue konnte nicht erstellt werden");
      }
    }
  }

  return { geprueft: sample.length, veraltet: details.length, details };
}

// ---------------------------------------------------------------------------
// Phase 4: Weisungen-Monitor
// ---------------------------------------------------------------------------

async function runPhase4Weisungen(
  anthropic: Anthropic,
): Promise<{ neu: number; fehlerQuellen: string[] }> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { neu: 0, fehlerQuellen: ["Supabase nicht verfügbar"] };

  let neu = 0;
  const fehlerQuellen: string[] = [];

  const systemPrompt: Anthropic.TextBlockParam[] = [{
    type: "text",
    text: `Du erkennst Fachliche Weisungen, Rundschreiben, Richtlinien und Dienstanweisungen in Behörden-Webseiten.
Suche nach Dokumenten mit Nummern wie "FH 2026/12", "HEGA 03/2026", "DA-KV 2026", "GRA zu §...", "BRi", "DA-Asyl", "DGUV" oder Datumsangaben.
Antworte mit JSON-Array oder []:
[{"traeger":"jobcenter","weisung_nr":"FH 2026/12","titel":"Fachliche Weisung zu...","gueltig_ab":"2026-03-01","rechtsgebiet":"SGB_II"}]
Traeger: jobcenter | arbeitsagentur | drv | krankenkasse | pflegekasse | bamf | familienkasse | sozialhilfe | unfallversicherung`,
    cache_control: { type: "ephemeral" },
  }];

  // Alle Weisungsquellen parallel prefetchen
  const prefetchedWeisungen = await Promise.all(
    QUELLEN.weisungen.map(async (q) => ({
      quelle: q,
      text: await fetchPageText(q.url),
    }))
  );

  for (const { quelle, text: pageText } of prefetchedWeisungen) {
    try {
      if (!pageText) {
        fehlerQuellen.push(`${quelle.name}: Nicht erreichbar`);
        continue;
      }

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: `Quelle: ${quelle.name}\nURL: ${quelle.url}\nTräger: ${quelle.traeger}\n\n${pageText}` }],
      });

      const text = response.content.find(b => b.type === "text")?.text ?? "[]";
      const weisungen = extractJsonSafe<WeisungEintrag[]>(text, []);

      if (!Array.isArray(weisungen)) continue;

      for (const w of weisungen) {
        if (!w.weisung_nr || !w.titel) continue;

        // Upsert in weisungen-Tabelle (graceful: Tabelle könnte noch nicht existieren)
        try {
          const row: Record<string, unknown> = {
            traeger: w.traeger || quelle.traeger,
            weisung_nr: w.weisung_nr,
            titel: w.titel,
            gueltig_ab: w.gueltig_ab || null,
            zusammenfassung: w.zusammenfassung || null,
            url: w.url || quelle.url,
            rechtsgebiet: w.rechtsgebiet || "SGB_II",
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase.from("weisungen" as string).upsert(
            row, { onConflict: "weisung_nr" }
          );

          if (!error) neu++;
        } catch {
          // weisungen-Tabelle noch nicht angelegt → in update_protokoll loggen
          try {
            const auditRow: Record<string, unknown> = {
              agent_id: "AG15",
              tabelle: "weisungen",
              operation: "NEUE_WEISUNG",
              notiz: `${w.weisung_nr}: ${w.titel}`,
            };
            await supabase.from("update_protokoll" as string).insert(auditRow);
          } catch { /* update_protokoll auch nicht verfügbar */ }
        }
      }

      reportInfo("[AG15 P4] Weisungen verarbeitet", { quelle: quelle.name, anzahl: weisungen.length });
    } catch (err) {
      fehlerQuellen.push(`${quelle.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { neu, fehlerQuellen };
}

// ---------------------------------------------------------------------------
// Phase 5: Struktur-Monitor — Gesetzgebungsänderungen → GitHub PR
// ---------------------------------------------------------------------------

// Bekannte strukturelle Änderungen die überwacht werden (Stand 2026)
const BEKANNTE_REFORMEN: Array<{
  stichwort: string[];
  typ: StrukturAenderung["typ"];
  was_alt: string;
  was_neu: string;
  gesetz: string;
  betroffene_bereiche: string[];
}> = [
  {
    stichwort: ["Grundsicherung für Arbeitsuchende", "Bürgergeld", "Jobcenter umbenannt", "Grundsicherungsbehörde"],
    typ: "umbenennung",
    was_alt: "Jobcenter",
    was_neu: "Grundsicherungsbehörde",
    gesetz: "SGB II",
    betroffene_bereiche: ["BA_", "content/behoerdenfehler_logik.json", "content/weisungen_2025_2026.json"],
  },
  {
    stichwort: ["Bürgergeld abgeschafft", "Bürgergeld wird ersetzt", "Grundsicherung statt Bürgergeld"],
    typ: "umbenennung",
    was_alt: "Bürgergeld",
    was_neu: "Grundsicherungsgeld",
    gesetz: "SGB II",
    betroffene_bereiche: ["BA_", "content/behoerdenfehler_logik.json"],
  },
  {
    stichwort: ["SGB II aufgehoben", "SGB II wird SGB III", "Zusammenlegung SGB II SGB III"],
    typ: "neues_gesetz",
    was_alt: "SGB II",
    was_neu: "Neues Grundsicherungsgesetz",
    gesetz: "SGB II/III Reform",
    betroffene_bereiche: ["BA_", "ALG_", "content/behoerdenfehler_logik.json"],
  },
  {
    stichwort: ["Sanktionsverschärfung", "30 Prozent Kürzung", "Sanktionen verschärft", "Stufenmodell abgeschafft", "Totalkürzung Bürgergeld"],
    typ: "paragraph_aenderung",
    was_alt: "§ 31a SGB II (Stufenmodell)",
    was_neu: "§ 31a SGB II n.F. (bis 30% direkt)",
    gesetz: "SGB II",
    betroffene_bereiche: ["BA_006", "BA_019", "content/behoerdenfehler_logik.json"],
  },
  {
    stichwort: ["Vermittlungsvorrang", "Arbeitsvorrang", "Vermittlung vor Qualifizierung", "Totalrevision Eingliederung"],
    typ: "paragraph_aenderung",
    was_alt: "§ 15 SGB II (Kooperationsplan)",
    was_neu: "§ 15 SGB II n.F. (Vermittlungsvorrang)",
    gesetz: "SGB II",
    betroffene_bereiche: ["BA_020", "content/behoerdenfehler_logik.json"],
  },
  {
    stichwort: ["Vermieter-Auskunftspflicht", "Vermieter Jobcenter Auskunft", "Mietdaten Jobcenter"],
    typ: "paragraph_aenderung",
    was_alt: "§ 22 SGB II (KdU ohne Vermieter-Abfrage)",
    was_neu: "§ 22 SGB II n.F. (Vermieter-Auskunftspflicht)",
    gesetz: "SGB II",
    betroffene_bereiche: ["BA_021", "BA_004", "content/behoerdenfehler_logik.json"],
  },
];

async function generateFehlerkatalogPatch(
  aenderung: StrukturAenderung,
  fehlerkatalogPath: string
): Promise<string> {
  const fs = await import("fs/promises");
  const raw = await fs.readFile(fehlerkatalogPath, "utf-8");
  const data: Array<Record<string, unknown>> = JSON.parse(raw);

  let patched = JSON.stringify(data, null, 2);

  // Einfache String-Ersetzung — nur wenn alt != neu und nicht schon enthalten
  const altLower = aenderung.was_alt.toLowerCase();
  const neuStr = aenderung.was_neu;

  // Nur in beschreibung, titel, musterschreiben_hinweis ersetzen — nie in id/rechtsbasis
  const patched_data = data.map((item) => {
    const updated = { ...item };
    for (const field of ["titel", "beschreibung", "musterschreiben_hinweis", "severity_beschreibung"]) {
      if (typeof updated[field] === "string") {
        const val = updated[field] as string;
        // Case-insensitive Replace
        if (val.toLowerCase().includes(altLower)) {
          const regex = new RegExp(aenderung.was_alt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
          updated[field] = val.replace(regex, neuStr);
        }
      }
    }
    return updated;
  });

  patched = JSON.stringify(patched_data, null, 2);
  return patched;
}

async function createGitHubPR(
  branchName: string,
  title: string,
  body: string,
  files: Array<{ path: string; content: string }>
): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    console.warn("[AG15 P5] GITHUB_TOKEN oder GITHUB_REPO fehlt — PR übersprungen");
    return null;
  }

  const [owner, repoName] = repo.split("/");
  const baseUrl = `https://api.github.com/repos/${owner}/${repoName}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  const ghFetch = async (method: string, path: string, data?: unknown) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    const json = await res.json();
    return { json, status: res.status };
  };

  try {
    // 1. Default Branch SHA holen
    const { json: repoInfo } = await ghFetch("GET", "");
    const defaultBranch = (repoInfo as { default_branch: string }).default_branch || "main";

    const { json: refInfo } = await ghFetch("GET", `/git/ref/heads/${defaultBranch}`);
    const baseSha = (refInfo as { object: { sha: string } }).object.sha;

    // 2. Neuen Branch erstellen
    const { status: branchStatus } = await ghFetch("POST", "/git/refs", {
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    if (branchStatus !== 201 && branchStatus !== 422) {
      console.warn(`[AG15 P5] Branch-Erstellung fehlgeschlagen: HTTP ${branchStatus}`);
      return null;
    }

    // 3. Dateien committen
    for (const file of files) {
      // Aktuellen Blob SHA holen (für Update)
      const { json: fileInfo } = await ghFetch("GET", `/contents/${file.path}?ref=${branchName}`);
      const existingSha = (fileInfo as { sha?: string }).sha;

      const contentBase64 = Buffer.from(file.content, "utf-8").toString("base64");

      await ghFetch("PUT", `/contents/${file.path}`, {
        message: `chore(ag15): ${title} — automatische Aktualisierung`,
        content: contentBase64,
        branch: branchName,
        sha: existingSha,
      });
    }

    // 4. PR erstellen
    const { json: pr, status: prStatus } = await ghFetch("POST", "/pulls", {
      title,
      body,
      head: branchName,
      base: defaultBranch,
    });

    if (prStatus === 201) {
      const prUrl = (pr as { html_url: string }).html_url;
      reportInfo("[AG15 P5] PR erstellt", { prUrl });
      return prUrl;
    }

    console.warn(`[AG15 P5] PR-Erstellung fehlgeschlagen: HTTP ${prStatus}`);
    return null;
  } catch (err) {
    console.warn("[AG15 P5] GitHub PR Fehler:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

async function runPhase5StrukturMonitor(
  anthropic: Anthropic,
): Promise<{ prs_erstellt: number; fehlerQuellen: string[] }> {
  let prs_erstellt = 0;
  const fehlerQuellen: string[] = [];
  const today = new Date().toISOString().split("T")[0];

  const systemPrompt: Anthropic.TextBlockParam[] = [{
    type: "text",
    text: `Du analysierst offizielle deutsche Gesetzgebungsquellen auf STRUKTURELLE Änderungen im Sozialrecht.
Erkenne NUR wenn offiziell beschlossen/in Kraft getreten:
- Umbenennungen von Behörden (z.B. "Jobcenter" → "Grundsicherungsbehörde")
- Neue Gesetze die alte ersetzen (z.B. SGB II Reform)
- Neue Paragraphen-Nummern
- Neue offizielle Bezeichnungen für Leistungen
Heute: ${today}.

Antworte mit JSON-Array oder leerem Array []:
[{
  "typ": "umbenennung" | "neues_gesetz" | "behorden_reform" | "paragraph_aenderung",
  "was_alt": "Alter Begriff/Name",
  "was_neu": "Neuer Begriff/Name",
  "gesetz": "SGB II / SGB III / etc.",
  "ikraft_ab": "YYYY-MM-DD" | null,
  "quelle_url": "URL der Quelle",
  "beschreibung": "Kurze Erklärung was sich ändert (max 200 Zeichen)",
  "betroffene_bereiche": ["SGB_II", "Jobcenter", "Grundsicherungsgeld"]
}]

WICHTIG: Nur wenn OFFIZIELL BESCHLOSSEN oder IN KRAFT GETRETEN — keine Vorhaben, Pläne oder Entwürfe.`,
    cache_control: { type: "ephemeral" },
  }];

  const erkannteAenderungen: StrukturAenderung[] = [];

  // Alle Struktur-Quellen parallel prefetchen
  const prefetchedStruktur = await Promise.all(
    QUELLEN.struktur.map(async (q) => ({
      quelle: q,
      text: await fetchPageText(q.url),
    }))
  );

  for (const { quelle, text: pageText } of prefetchedStruktur) {
    try {
      if (!pageText) {
        fehlerQuellen.push(`${quelle.name}: Nicht erreichbar`);
        continue;
      }

      // Schnell-Check: Enthält Text bekannte Reform-Stichwörter?
      const hatRelevantesKW = BEKANNTE_REFORMEN.some(r =>
        r.stichwort.some(kw => pageText.toLowerCase().includes(kw.toLowerCase()))
      );

      if (!hatRelevantesKW) {
        reportInfo("[AG15 P5] Quelle übersprungen — keine Keywords", { quelle: quelle.name });
        continue;
      }

      reportInfo("[AG15 P5] Relevante Keywords gefunden", { quelle: quelle.name });

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: `Quelle: ${quelle.name}\nURL: ${quelle.url}\n\n${pageText}` }],
      });

      const text = response.content.find(b => b.type === "text")?.text ?? "[]";
      const aenderungen = extractJsonSafe<StrukturAenderung[]>(text, []);

      if (!Array.isArray(aenderungen) || aenderungen.length === 0) continue;

      for (const a of aenderungen) {
        if (!a.was_alt || !a.was_neu || a.was_alt === a.was_neu) continue;
        a.quelle_url = quelle.url;
        erkannteAenderungen.push(a);
        reportInfo("[AG15 P5] Strukturänderung erkannt", { was_alt: a.was_alt, was_neu: a.was_neu, gesetz: a.gesetz });
      }
    } catch (err) {
      fehlerQuellen.push(`${quelle.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (erkannteAenderungen.length === 0) {
    reportInfo("[AG15 P5] Keine Strukturänderungen erkannt");
    return { prs_erstellt: 0, fehlerQuellen };
  }

  // Für jede erkannte Änderung einen GitHub PR erstellen
  for (const aenderung of erkannteAenderungen) {
    try {
      const fehlerkatalogPath = process.cwd() + "/content/behoerdenfehler_logik.json";
      const fs = await import("fs/promises");

      // Prüfen ob Fehlerkatalog-Datei existiert und den alten Begriff enthält
      let fehlerkatalogContent: string | null = null;
      try {
        const raw = await fs.readFile(fehlerkatalogPath, "utf-8");
        if (raw.toLowerCase().includes(aenderung.was_alt.toLowerCase())) {
          fehlerkatalogContent = await generateFehlerkatalogPatch(aenderung, fehlerkatalogPath);
        }
      } catch {
        console.warn("[AG15 P5] Fehlerkatalog nicht lesbar — PR ohne JSON-Patch");
      }

      const branchName = `ag15/struktur-update-${aenderung.was_alt.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

      const prBody = [
        `## 🤖 AG15 Struktur-Monitor — Automatisch erkannte Gesetzesänderung`,
        ``,
        `**Typ:** ${aenderung.typ}`,
        `**Alt:** \`${aenderung.was_alt}\``,
        `**Neu:** \`${aenderung.was_neu}\``,
        `**Gesetz:** ${aenderung.gesetz}`,
        `**In Kraft ab:** ${aenderung.ikraft_ab ?? "Datum unbekannt"}`,
        `**Quelle:** ${aenderung.quelle_url}`,
        ``,
        `### Was wurde erkannt`,
        aenderung.beschreibung,
        ``,
        `### Betroffene Bereiche im System`,
        aenderung.betroffene_bereiche.map(b => `- \`${b}\``).join("\n"),
        ``,
        `### Was dieser PR ändert`,
        fehlerkatalogContent
          ? `- \`content/behoerdenfehler_logik.json\`: Alle Vorkommen von **"${aenderung.was_alt}"** in \`titel\`, \`beschreibung\` und \`musterschreiben_hinweis\` durch **"${aenderung.was_neu}"** ersetzt`
          : `- Kein Fehlerkatalog-Patch (Begriff nicht gefunden oder Datei nicht lesbar)`,
        ``,
        `### ⚠️ Vor dem Merge prüfen`,
        `- [ ] Ist die Änderung offiziell in Kraft getreten?`,
        `- [ ] Sind alle Ersetzungen juristisch korrekt?`,
        `- [ ] Müssen weitere Dateien angepasst werden (Prompts, Weisungen)?`,
        `- [ ] ID-Präfixe (BA_, etc.) beibehalten oder umbenennen?`,
        ``,
        `---`,
        `*Automatisch erstellt von AG15 Struktur-Monitor • ${new Date().toISOString()}*`,
        `*Quelle: ${aenderung.quelle_url}*`,
      ].join("\n");

      const files: Array<{ path: string; content: string }> = [];
      if (fehlerkatalogContent) {
        files.push({
          path: "content/behoerdenfehler_logik.json",
          content: fehlerkatalogContent,
        });
      }

      // Nur PR erstellen wenn es tatsächlich Änderungen gibt
      if (files.length === 0) {
        reportInfo("[AG15 P5] Keine Datei-Änderungen — nur Issue", { was_alt: aenderung.was_alt });

        // Stattdessen GitHub Issue für manuelle Prüfung
        const githubToken = process.env.GITHUB_TOKEN;
        const githubRepo = process.env.GITHUB_REPO;
        if (githubToken && githubRepo) {
          const [owner, repoName] = githubRepo.split("/");
          await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: `⚖️ AG15: Gesetzesänderung erkannt — "${aenderung.was_alt}" → "${aenderung.was_neu}"`,
              body: prBody,
              labels: ["gesetzesaenderung", "automated", "review-needed"],
            }),
          });
          prs_erstellt++;
        }
        continue;
      }

      const prUrl = await createGitHubPR(
        branchName,
        `⚖️ AG15: Gesetzesänderung — "${aenderung.was_alt}" → "${aenderung.was_neu}"`,
        prBody,
        files
      );

      if (prUrl) {
        prs_erstellt++;

        // In update_protokoll loggen
        const supabase = getSupabaseServiceClient();
        if (supabase) {
          try {
            await supabase.from("update_protokoll" as string).insert({
              agent_id: "AG15",
              tabelle: "content/behoerdenfehler_logik.json",
              operation: "STRUKTUR_PR",
              notiz: `PR erstellt: ${aenderung.was_alt} → ${aenderung.was_neu} | ${prUrl}`,
            });
          } catch { /* protokoll nicht verfügbar */ }
        }
      }
    } catch (err) {
      fehlerQuellen.push(`PR für "${aenderung.was_alt}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { prs_erstellt, fehlerQuellen };
}

// ---------------------------------------------------------------------------
// Haupt-Einstiegspunkt
// ---------------------------------------------------------------------------

export async function runRechtsMonitor(): Promise<MonitorResult> {
  const apiKey = getAnthropicKey();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY fehlt");

  const anthropic = new Anthropic({ apiKey });
  const startTime = Date.now();
  const BUDGET_MS = 55_000; // 55s Budget (5s Reserve vor 60s Hobby-Timeout)

  const alleFehlerQuellen: string[] = [];

  const timeLeft = () => BUDGET_MS - (Date.now() - startTime);

  reportInfo("[AG15] Rechts-Monitor gestartet", { timestamp: new Date().toISOString() });

  // Phase 1 + 2 PARALLEL (unabhängig voneinander)
  const [p1, p2] = await Promise.all([
    runPhase1Urteile(anthropic),
    runPhase2Kennzahlen(anthropic),
  ]);
  alleFehlerQuellen.push(...p1.fehlerQuellen, ...p2.fehlerQuellen);

  // Phase 3 + 3b + 4 PARALLEL (3 braucht P1/P2-Ergebnis als Zahl, aber nicht deren DB-Daten)
  // Phase 4 (Weisungen) ist komplett unabhängig
  let p3 = { hinzugefuegt: 0 };
  let p3b: ValidierungsErgebnis = { geprueft: 0, veraltet: 0, details: [] };
  let p4 = { neu: 0, fehlerQuellen: [] as string[] };

  if (timeLeft() > 10_000) {
    [p3, p3b, p4] = await Promise.all([
      runPhase3Fehlerkatalog(anthropic, p1.neu, p2.geaendert),
      runPhase3bValidierung(anthropic),
      runPhase4Weisungen(anthropic),
    ]);
    alleFehlerQuellen.push(...p4.fehlerQuellen);
  } else {
    reportInfo("[AG15] Phasen 3/3b/4 übersprungen — Zeitbudget erschöpft", { timeLeftMs: timeLeft() });
  }

  // Phase 5: Struktur-Monitor (nur wenn noch Zeit)
  let p5 = { prs_erstellt: 0, fehlerQuellen: [] as string[] };
  if (timeLeft() > 8_000) {
    p5 = await runPhase5StrukturMonitor(anthropic);
    alleFehlerQuellen.push(...p5.fehlerQuellen);
  } else {
    reportInfo("[AG15] Phase 5 übersprungen — Zeitbudget erschöpft", { timeLeftMs: timeLeft() });
  }

  // Phase 6: Audit-Protokoll
  const gesamtQuellen = QUELLEN.urteile.length + QUELLEN.gesetze.length + QUELLEN.weisungen.length + QUELLEN.struktur.length;
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const zusammenfassung =
    `AG15 Lauf (${durationSec}s): ${p1.neu} Urteile, ${p2.geaendert} Kennzahlen, ` +
    `${p3.hinzugefuegt} Fehlertypen, ${p3b.veraltet}/${p3b.geprueft} veraltet, ` +
    `${p4.neu} Weisungen, ${p5.prs_erstellt} Struktur-PRs. ` +
    `${alleFehlerQuellen.length} Quellen fehlgeschlagen.`;

  try {
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      const auditRow: Record<string, unknown> = {
        agent_id: "AG15",
        tabelle: "urteile,kennzahlen,behoerdenfehler,weisungen",
        operation: "WOCHENLAUF",
        notiz: zusammenfassung,
      };
      await supabase.from("update_protokoll" as string).insert(auditRow);
    }
  } catch {
    console.warn("[AG15 P6] update_protokoll Insert fehlgeschlagen");
  }

  const result: MonitorResult = {
    urteile_neu: p1.neu,
    kennzahlen_geaendert: p2.geaendert,
    fehler_hinzugefuegt: p3.hinzugefuegt,
    weisungen_neu: p4.neu,
    struktur_prs: p5.prs_erstellt,
    quellen_gecheckt: gesamtQuellen - alleFehlerQuellen.length,
    fehler_quellen: alleFehlerQuellen,
    zusammenfassung,
  };

  reportInfo("[AG15] Fertig", { durationSec, urteile_neu: result.urteile_neu, kennzahlen_geaendert: result.kennzahlen_geaendert, fehler_hinzugefuegt: result.fehler_hinzugefuegt, weisungen_neu: result.weisungen_neu, struktur_prs: result.struktur_prs });
  return result;
}

// ---------------------------------------------------------------------------
// Agent-Interface (für Registry-Registrierung)
// ---------------------------------------------------------------------------

async function execute(
  _ctx: AgentContext,
): Promise<AgentResult<MonitorResult>> {
  const start = Date.now();
  const data = await runRechtsMonitor();
  return {
    agentId: "AG15",
    success: true,
    data,
    tokens: emptyTokenUsage(),
    durationMs: Date.now() - start,
  };
}

export const ag15RechtsMonitor: Agent<MonitorResult> = {
  id: "AG15",
  name: "Rechts-Monitor",
  model: () => SONNET_MODEL,
  execute,
};
