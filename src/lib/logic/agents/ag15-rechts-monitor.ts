/**
 * AG15 — Autonomer Rechts-Monitor (Sonnet/Haiku · wöchentlicher Cron)
 *
 * 5-Phasen-Pipeline:
 *   1. Urteile-Update     — 15 Quellen, Claude Sonnet, Supabase upsert
 *   2. Kennzahlen-Check   — Regelbedarfe/Freibeträge, Claude Haiku, Supabase upsert
 *   3. Fehlerkatalog-Ext. — neue Fehlertypen aus Änderungen, Claude Sonnet, DB insert
 *   4. Weisungen-Monitor  — BA/DRV/Pflege, Claude Haiku, DB + Protokoll
 *   5. Audit-Report       — update_protokoll, MonitorResult
 *
 * Sicherheit:
 *   - Whitelist-only (15 definierte Domains)
 *   - Max 20 Urteile + 5 Fehlerkatalog-Einträge pro Lauf
 *   - Kein Update existierender Fehlerkatalog-JSON-Einträge
 *   - 15s Timeout pro Source-Fetch
 *   - Graceful Degradation: jede Phase kann unabhängig fehlschlagen
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { extractJsonSafe } from "./utils";

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

export interface MonitorResult {
  urteile_neu: number;
  kennzahlen_geaendert: number;
  fehler_hinzugefuegt: number;
  weisungen_neu: number;
  quellen_gecheckt: number;
  fehler_quellen: string[];
  zusammenfassung: string;
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
// Quellen-Konfiguration (15 Quellen — vollständige Whitelist)
// ---------------------------------------------------------------------------

const QUELLEN = {
  urteile: [
    { name: "BSG Entscheidungen",      url: "https://www.bsg.bund.de/DE/Entscheidungen/entscheidungen_node.html", rechtsgebiet: "BSG" },
    { name: "BVerfG Entscheidungen",   url: "https://www.bundesverfassungsgericht.de/DE/Entscheidungen/entscheidungen_node.html", rechtsgebiet: "VERFASSUNG" },
    { name: "Sozialgerichtsbarkeit",   url: "https://www.sozialgerichtsbarkeit.de/sgb/", rechtsgebiet: "SGG" },
    { name: "BMAS Meldungen",          url: "https://www.bmas.de/DE/Service/Presse/Meldungen/meldungen.html", rechtsgebiet: "ALLGEMEIN" },
    { name: "DRV Aktuelles",           url: "https://www.deutsche-rentenversicherung.de/DRV/DE/Aktuelles/Meldungen/meldungen_node.html", rechtsgebiet: "SGB_VI" },
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
    { name: "BA Weisungen SGB II",     url: "https://www.arbeitsagentur.de/institutionen/arbeitgeber/hinweise-informationen/fachliche-weisungen-sgb-ii", traeger: "jobcenter", rechtsgebiet: "SGB_II" },
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

function getAnthropicKey(): string | null {
  return process.env.ANTHROPIC_API_KEY || null;
}

async function fetchPageText(url: string): Promise<string | null> {
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

async function runPhase1Urteile(
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

  for (const quelle of QUELLEN.urteile) {
    try {
      const pageText = await fetchPageText(quelle.url);
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

      console.log(`[AG15 P1] ${quelle.name}: ${toProcess.length} verarbeitet, ${neu} gesamt neu`);
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

  for (const quelle of QUELLEN.gesetze) {
    try {
      const pageText = await fetchPageText(quelle.url);
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

        if (!error) geaendert++;
      }

      console.log(`[AG15 P2] ${quelle.name}: ${updates.length} Kennzahlen geprüft`);
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
    console.log("[AG15 P3] Keine Änderungen in P1/P2 — Fehlerkatalog-Erweiterung übersprungen");
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

    console.log(`[AG15 P3] ${hinzugefuegt} neue Fehlertypen eingefügt`);
  } catch (err) {
    console.warn("[AG15 P3] Fehlerkatalog-Erweiterung fehlgeschlagen:", err);
  }

  return { hinzugefuegt };
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
    text: `Du erkennst Fachliche Weisungen, Rundschreiben und Dienstanweisungen in Behörden-Webseiten.
Suche nach Dokumenten mit Nummern wie "FH 2026/12", "HEGA 03/2026", "DA-KV 2026" oder Datumsangaben.
Antworte mit JSON-Array oder []:
[{"traeger":"jobcenter","weisung_nr":"FH 2026/12","titel":"Fachliche Weisung zu...","gueltig_ab":"2026-03-01","rechtsgebiet":"SGB_II"}]
Traeger: jobcenter | arbeitsagentur | drv | pflegekasse | sozialhilfe`,
    cache_control: { type: "ephemeral" },
  }];

  for (const quelle of QUELLEN.weisungen) {
    try {
      const pageText = await fetchPageText(quelle.url);
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

      console.log(`[AG15 P4] ${quelle.name}: ${weisungen.length} Weisungen verarbeitet`);
    } catch (err) {
      fehlerQuellen.push(`${quelle.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { neu, fehlerQuellen };
}

// ---------------------------------------------------------------------------
// Haupt-Einstiegspunkt
// ---------------------------------------------------------------------------

export async function runRechtsMonitor(): Promise<MonitorResult> {
  const apiKey = getAnthropicKey();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY fehlt");

  const anthropic = new Anthropic({ apiKey });

  const alleFehlerQuellen: string[] = [];
  const gesamtQuellen = QUELLEN.urteile.length + QUELLEN.gesetze.length + QUELLEN.weisungen.length;

  console.log("[AG15] Rechts-Monitor gestartet:", new Date().toISOString());

  // Phase 1: Urteile (alle 6 Urteilsquellen)
  const p1 = await runPhase1Urteile(anthropic);
  alleFehlerQuellen.push(...p1.fehlerQuellen);

  // Phase 2: Kennzahlen (alle 8 Gesetzesquellen)
  const p2 = await runPhase2Kennzahlen(anthropic);
  alleFehlerQuellen.push(...p2.fehlerQuellen);

  // Phase 3: Fehlerkatalog-Erweiterung (basiert auf P1+P2)
  const p3 = await runPhase3Fehlerkatalog(anthropic, p1.neu, p2.geaendert);

  // Phase 4: Weisungen (1 Weisungsquelle)
  const p4 = await runPhase4Weisungen(anthropic);
  alleFehlerQuellen.push(...p4.fehlerQuellen);

  // Phase 5: Audit-Protokoll
  const zusammenfassung =
    `AG15 Wochenlauf: ${p1.neu} neue Urteile, ${p2.geaendert} Kennzahlen, ` +
    `${p3.hinzugefuegt} Fehlertypen, ${p4.neu} Weisungen. ` +
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
    console.warn("[AG15 P5] update_protokoll Insert fehlgeschlagen");
  }

  const result: MonitorResult = {
    urteile_neu: p1.neu,
    kennzahlen_geaendert: p2.geaendert,
    fehler_hinzugefuegt: p3.hinzugefuegt,
    weisungen_neu: p4.neu,
    quellen_gecheckt: gesamtQuellen - alleFehlerQuellen.length,
    fehler_quellen: alleFehlerQuellen,
    zusammenfassung,
  };

  console.log("[AG15] Fertig:", result);
  return result;
}
