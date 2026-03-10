/**
 * AG18 — Content-Auditor
 *
 * Monatlicher Audit (15. des Monats, 01:00 UTC) — prüft:
 *   1. Hardcoded Werte in Prompts vs. aktuelle kennzahlen-DB
 *   2. Statische Fehlerkatalog-Einträge auf veraltete Rechtsbasis
 *   3. Weisungen-Abdeckung über alle 16 Rechtsgebiete
 *   4. internal_rules.json vs. kennzahlen-DB
 *
 * Erstellt GitHub Issue mit konkreten Findings + Handlungsempfehlungen.
 * Kosten: ~€0.01 pro Lauf (überwiegend TypeScript-Logik, minimaler Haiku-Einsatz).
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import type { Agent, AgentContext, AgentResult } from "./types";
import { emptyTokenUsage, HAIKU_MODEL } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContentAuditResult {
  kennzahlen_abweichungen: KennzahlenAbweichung[];
  veraltete_eintraege: VeralteterEintrag[];
  weisungen_luecken: string[];
  internal_rules_abweichungen: KennzahlenAbweichung[];
  gesamt_status: "ok" | "warnung" | "kritisch";
  issues_created: string[];
  zusammenfassung: string;
}

interface KennzahlenAbweichung {
  schluessel: string;
  hardcoded_wert: number | string;
  db_wert: number | string | null;
  quelle: string;
  severity: "info" | "warnung" | "kritisch";
}

interface VeralteterEintrag {
  id: string;
  titel: string;
  problem: string;
  severity: "warnung" | "kritisch";
}

interface FehlerkatalogEintrag {
  id: string;
  titel: string;
  beschreibung: string;
  rechtsbasis: string[];
  severity: string;
  prueflogik: { bedingungen: string[]; suchbegriffe: string[] };
  musterschreiben_hinweis: string;
  severity_beschreibung: string;
}

// ---------------------------------------------------------------------------
// Hardcoded Werte aus prompts.ts (AG02, Zeile 103-106)
// Diese werden gegen die kennzahlen-DB geprüft.
// ---------------------------------------------------------------------------

const PROMPT_HARDCODES: Record<string, { wert: number; einheit: string; quelle: string }> = {
  "regelbedarf_rs1": { wert: 563, einheit: "EUR", quelle: "prompts.ts AG02 Zeile 103" },
  "regelbedarf_rs2": { wert: 506, einheit: "EUR", quelle: "prompts.ts AG02 Zeile 103" },
  "regelbedarf_rs3": { wert: 451, einheit: "EUR", quelle: "prompts.ts AG02 Zeile 103" },
  "regelbedarf_rs4": { wert: 471, einheit: "EUR", quelle: "prompts.ts AG02 Zeile 103" },
  "regelbedarf_rs5": { wert: 390, einheit: "EUR", quelle: "kennzahlen.ts REGELBEDARF.RS5" },
  "regelbedarf_rs6": { wert: 357, einheit: "EUR", quelle: "prompts.ts AG02 Zeile 103" },
  "kindergeld":      { wert: 259, einheit: "EUR", quelle: "kennzahlen.ts KINDERGELD_PRO_MONAT" },
  "grundfreibetrag_11b": { wert: 100, einheit: "EUR", quelle: "prompts.ts AG02 Zeile 105" },
};

const INTERNAL_RULES_CHECKS: Record<string, { schluessel: string; feld: string }> = {
  "REGELSATZ_DE": { schluessel: "regelbedarf_rs1", feld: "REGELSATZ_DE" },
  "SCHONVERMOEGEN": { schluessel: "schonvermoegen", feld: "SCHONVERMOEGEN" },
};

// Alle 16 Rechtsgebiete — Weisungen sollten für ALLE existieren
const ALLE_RECHTSGEBIETE = [
  "BA", "ALG", "DRV", "KK", "PK", "UV", "VA", "SH",
  "EH", "JA", "BAMF", "BAF", "EG", "FK", "WG", "UVS",
];

const RECHTSGEBIET_TRAEGER: Record<string, string> = {
  BA: "jobcenter", ALG: "arbeitsagentur", DRV: "drv",
  KK: "krankenkasse", PK: "pflegekasse", UV: "unfallversicherung",
  VA: "versorgungsamt", SH: "sozialhilfe", EH: "eingliederungshilfe",
  JA: "jugendamt", BAMF: "bamf", BAF: "bafoeg",
  EG: "elterngeld", FK: "familienkasse", WG: "wohngeld", UVS: "unterhaltsvorschuss",
};

// ---------------------------------------------------------------------------
// Supabase Client
// ---------------------------------------------------------------------------

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// Phase 1: Kennzahlen vs. Hardcodes
// ---------------------------------------------------------------------------

async function checkKennzahlenVsHardcodes(): Promise<KennzahlenAbweichung[]> {
  const abweichungen: KennzahlenAbweichung[] = [];
  const supabase = getAdminClient();

  if (!supabase) {
    abweichungen.push({
      schluessel: "supabase",
      hardcoded_wert: "—",
      db_wert: null,
      quelle: "Supabase nicht konfiguriert",
      severity: "kritisch",
    });
    return abweichungen;
  }

  // Alle kennzahlen aus DB laden
  const { data: kennzahlen, error } = await supabase
    .from("kennzahlen")
    .select("schluessel, wert, einheit, gueltig_ab")
    .order("gueltig_ab", { ascending: false });

  if (error) {
    // Tabelle existiert möglicherweise nicht
    if (error.code === "42P01") {
      abweichungen.push({
        schluessel: "kennzahlen_tabelle",
        hardcoded_wert: "erwartet",
        db_wert: null,
        quelle: "Supabase kennzahlen-Tabelle fehlt",
        severity: "kritisch",
      });
      return abweichungen;
    }
    console.error("[AG18] Kennzahlen-Query Fehler:", error.message);
    return abweichungen;
  }

  // DB-Werte als Map (neuester Wert pro Schlüssel)
  const dbMap = new Map<string, { wert: number; gueltig_ab: string }>();
  for (const row of kennzahlen ?? []) {
    const key = String(row.schluessel).toLowerCase();
    if (!dbMap.has(key)) {
      dbMap.set(key, { wert: Number(row.wert), gueltig_ab: String(row.gueltig_ab ?? "") });
    }
  }

  // Vergleich: Prompt-Hardcodes vs. DB
  for (const [key, cfg] of Object.entries(PROMPT_HARDCODES)) {
    const dbEntry = dbMap.get(key);
    if (!dbEntry) {
      abweichungen.push({
        schluessel: key,
        hardcoded_wert: cfg.wert,
        db_wert: null,
        quelle: cfg.quelle,
        severity: "info",
      });
      continue;
    }

    if (dbEntry.wert !== cfg.wert) {
      abweichungen.push({
        schluessel: key,
        hardcoded_wert: `${cfg.wert}${cfg.einheit}`,
        db_wert: `${dbEntry.wert}${cfg.einheit} (gültig ab ${dbEntry.gueltig_ab})`,
        quelle: cfg.quelle,
        severity: "kritisch",
      });
    }
  }

  return abweichungen;
}

// ---------------------------------------------------------------------------
// Phase 2: internal_rules.json vs. DB
// ---------------------------------------------------------------------------

function checkInternalRules(dbAbweichungen: KennzahlenAbweichung[]): KennzahlenAbweichung[] {
  const abweichungen: KennzahlenAbweichung[] = [];

  let rules: Record<string, unknown>;
  try {
    const rulesPath = path.join(process.cwd(), "src", "lib", "vault", "internal_rules.json");
    rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  } catch {
    abweichungen.push({
      schluessel: "internal_rules.json",
      hardcoded_wert: "erwartet",
      db_wert: null,
      quelle: "src/lib/vault/internal_rules.json nicht lesbar",
      severity: "warnung",
    });
    return abweichungen;
  }

  // Prüfe ob internal_rules.json mit Prompt-Hardcodes konsistent ist
  const regelsatz = rules["REGELSATZ_DE"];
  if (typeof regelsatz === "number" && regelsatz !== PROMPT_HARDCODES["regelbedarf_rs1"].wert) {
    abweichungen.push({
      schluessel: "REGELSATZ_DE",
      hardcoded_wert: `${regelsatz}€ (internal_rules.json)`,
      db_wert: `${PROMPT_HARDCODES["regelbedarf_rs1"].wert}€ (prompts.ts)`,
      quelle: "internal_rules.json vs. prompts.ts — inkonsistent!",
      severity: "kritisch",
    });
  }

  // Prüfe ob DB-Werte (aus Phase 1) von internal_rules abweichen
  for (const [field, cfg] of Object.entries(INTERNAL_RULES_CHECKS)) {
    const ruleValue = rules[field];
    if (typeof ruleValue !== "number") continue;

    const dbAbweichung = dbAbweichungen.find((a) => a.schluessel === cfg.schluessel && a.db_wert !== null);
    if (dbAbweichung && dbAbweichung.severity === "kritisch") {
      abweichungen.push({
        schluessel: field,
        hardcoded_wert: `${ruleValue} (internal_rules.json)`,
        db_wert: String(dbAbweichung.db_wert),
        quelle: `internal_rules.json:${cfg.feld} weicht von kennzahlen-DB ab`,
        severity: "kritisch",
      });
    }
  }

  return abweichungen;
}

// ---------------------------------------------------------------------------
// Phase 3: Fehlerkatalog-Stichprobe
// ---------------------------------------------------------------------------

function checkFehlerkatalog(): VeralteterEintrag[] {
  const probleme: VeralteterEintrag[] = [];

  let eintraege: FehlerkatalogEintrag[];
  try {
    const katalogPath = path.join(process.cwd(), "content", "behoerdenfehler_logik.json");
    eintraege = JSON.parse(fs.readFileSync(katalogPath, "utf8"));
  } catch {
    probleme.push({
      id: "SYSTEM",
      titel: "Fehlerkatalog nicht lesbar",
      problem: "content/behoerdenfehler_logik.json konnte nicht geladen werden",
      severity: "kritisch",
    });
    return probleme;
  }

  // Check 1: Mindestanzahl
  if (eintraege.length < 120) {
    probleme.push({
      id: "SYSTEM",
      titel: "Fehlerkatalog zu klein",
      problem: `Nur ${eintraege.length} Einträge (Minimum: 120)`,
      severity: "kritisch",
    });
  }

  // Check 2: Rechtsgebiet-Verteilung
  const gebietCounts: Record<string, number> = {};
  for (const e of eintraege) {
    const prefix = e.id.split("_")[0];
    gebietCounts[prefix] = (gebietCounts[prefix] || 0) + 1;
  }

  for (const gebiet of ALLE_RECHTSGEBIETE) {
    if (!gebietCounts[gebiet] || gebietCounts[gebiet] === 0) {
      probleme.push({
        id: `${gebiet}_MISSING`,
        titel: `Rechtsgebiet ${gebiet} fehlt im Fehlerkatalog`,
        problem: `Keine Einträge mit Prefix "${gebiet}_" gefunden`,
        severity: "kritisch",
      });
    }
  }

  // Check 3: Strukturelle Integrität
  const ids = new Set<string>();
  for (const e of eintraege) {
    // Duplikate
    if (ids.has(e.id)) {
      probleme.push({
        id: e.id,
        titel: e.titel,
        problem: `Doppelte ID: ${e.id}`,
        severity: "warnung",
      });
    }
    ids.add(e.id);

    // Leere Pflichtfelder
    if (!e.titel?.trim()) {
      probleme.push({ id: e.id, titel: "(leer)", problem: "Leerer Titel", severity: "warnung" });
    }
    if (!e.rechtsbasis || e.rechtsbasis.length === 0) {
      probleme.push({ id: e.id, titel: e.titel, problem: "Keine Rechtsbasis angegeben", severity: "warnung" });
    }
    if (!e.prueflogik?.suchbegriffe || e.prueflogik.suchbegriffe.length === 0) {
      probleme.push({ id: e.id, titel: e.titel, problem: "Keine Suchbegriffe in prueflogik", severity: "warnung" });
    }

    // Veraltete Gesetzesreferenzen (bekannte Muster)
    for (const basis of e.rechtsbasis ?? []) {
      if (basis.includes("Hartz IV") || basis.includes("ALG II")) {
        probleme.push({
          id: e.id,
          titel: e.titel,
          problem: `Veraltete Referenz "${basis}" — seit 2023 Bürgergeld (SGB II)`,
          severity: "kritisch",
        });
      }
    }
  }

  return probleme;
}

// ---------------------------------------------------------------------------
// Phase 4: Weisungen-Abdeckung
// ---------------------------------------------------------------------------

async function checkWeisungenCoverage(): Promise<string[]> {
  const luecken: string[] = [];

  // Statische Weisungen-Datei prüfen
  let staticWeisungen: Record<string, unknown> = {};
  try {
    const weisungenPath = path.join(process.cwd(), "content", "weisungen_2025_2026.json");
    staticWeisungen = JSON.parse(fs.readFileSync(weisungenPath, "utf8"));
  } catch {
    luecken.push("weisungen_2025_2026.json nicht lesbar");
  }

  // Welche Träger haben statische Weisungen?
  const staticTraeger = new Set(Object.keys(staticWeisungen));

  // DB-Weisungen prüfen
  const supabase = getAdminClient();
  const dbTraeger = new Set<string>();

  if (supabase) {
    const { data, error } = await supabase
      .from("weisungen")
      .select("traeger")
      .limit(1000);

    if (!error && data) {
      for (const row of data) {
        dbTraeger.add(String(row.traeger).toLowerCase());
      }
    }
  }

  // Prüfe welche Rechtsgebiete weder statische noch dynamische Weisungen haben
  for (const [gebiet, traeger] of Object.entries(RECHTSGEBIET_TRAEGER)) {
    const hasStatic = staticTraeger.has(traeger) ||
      staticTraeger.has(`bundesagentur_fuer_arbeit`) && (gebiet === "BA" || gebiet === "ALG");
    const hasDb = dbTraeger.has(traeger);

    if (!hasStatic && !hasDb) {
      luecken.push(`${gebiet} (${traeger}): Keine Weisungen — weder statisch noch in DB`);
    }
  }

  return luecken;
}

// ---------------------------------------------------------------------------
// GitHub Issue erstellen
// ---------------------------------------------------------------------------

async function createGitHubIssue(title: string, body: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return null;

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
        labels: ["content-audit", "automated", "legal"],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.html_url ?? null;
    }
    console.error("[AG18] GitHub Issue Fehler:", res.status, await res.text());
    return null;
  } catch (err) {
    console.error("[AG18] GitHub Issue Exception:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Report formatieren
// ---------------------------------------------------------------------------

function formatReport(result: ContentAuditResult): string {
  const lines: string[] = [
    `## AG18 Content-Audit — ${new Date().toLocaleDateString("de-DE")}`,
    `**Status:** ${result.gesamt_status === "ok" ? "✅ Alles aktuell" : result.gesamt_status === "warnung" ? "⚠️ Warnungen" : "🔴 Kritische Abweichungen"}`,
    "",
  ];

  // Kennzahlen-Abweichungen
  if (result.kennzahlen_abweichungen.length > 0) {
    lines.push("### 📊 Kennzahlen vs. Hardcoded Werte");
    lines.push("| Schlüssel | Hardcoded | DB-Wert | Quelle | Severity |");
    lines.push("|-----------|----------|---------|--------|----------|");
    for (const a of result.kennzahlen_abweichungen) {
      const icon = a.severity === "kritisch" ? "🔴" : a.severity === "warnung" ? "🟡" : "ℹ️";
      lines.push(`| ${a.schluessel} | ${a.hardcoded_wert} | ${a.db_wert ?? "—"} | ${a.quelle} | ${icon} ${a.severity} |`);
    }
    lines.push("");
  }

  // internal_rules Abweichungen
  if (result.internal_rules_abweichungen.length > 0) {
    lines.push("### 📋 internal_rules.json Abweichungen");
    for (const a of result.internal_rules_abweichungen) {
      lines.push(`- **${a.schluessel}**: ${a.hardcoded_wert} vs. ${a.db_wert} — ${a.quelle}`);
    }
    lines.push("");
  }

  // Veraltete Einträge
  if (result.veraltete_eintraege.length > 0) {
    lines.push(`### 📖 Fehlerkatalog-Probleme (${result.veraltete_eintraege.length})`);
    for (const e of result.veraltete_eintraege.slice(0, 20)) {
      const icon = e.severity === "kritisch" ? "🔴" : "🟡";
      lines.push(`- ${icon} **${e.id}** ${e.titel}: ${e.problem}`);
    }
    if (result.veraltete_eintraege.length > 20) {
      lines.push(`- ... und ${result.veraltete_eintraege.length - 20} weitere`);
    }
    lines.push("");
  }

  // Weisungen-Lücken
  if (result.weisungen_luecken.length > 0) {
    lines.push(`### 📜 Weisungen-Abdeckung (${result.weisungen_luecken.length} Lücken)`);
    for (const l of result.weisungen_luecken) {
      lines.push(`- ⚠️ ${l}`);
    }
    lines.push("");
  }

  // Handlungsempfehlungen
  const criticalCount = result.kennzahlen_abweichungen.filter((a) => a.severity === "kritisch").length +
    result.veraltete_eintraege.filter((e) => e.severity === "kritisch").length +
    result.internal_rules_abweichungen.filter((a) => a.severity === "kritisch").length;

  if (criticalCount > 0) {
    lines.push("### 🎯 Handlungsempfehlungen");
    lines.push("1. **Sofort**: Kritische Kennzahlen-Abweichungen in `prompts.ts` und `internal_rules.json` aktualisieren");
    lines.push("2. **Sofort**: Veraltete Fehlerkatalog-Einträge korrigieren (Hartz IV → Bürgergeld etc.)");
    lines.push("3. **Diese Woche**: Weisungen für fehlende Rechtsgebiete ergänzen");
    lines.push("");
  }

  lines.push("---");
  lines.push(`*Automatisch erstellt von AG18 Content-Auditor • ${new Date().toISOString()}*`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Haupt-Funktion
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Agent-Interface für Registry
// ---------------------------------------------------------------------------

async function execute(_ctx: AgentContext): Promise<AgentResult<ContentAuditResult>> {
  const start = Date.now();
  const result = await runContentAudit();
  return {
    agentId: "AG18",
    success: result.gesamt_status !== "kritisch",
    data: result,
    tokens: emptyTokenUsage(),
    durationMs: Date.now() - start,
  };
}

export const ag18ContentAuditor: Agent<ContentAuditResult> = {
  id: "AG18",
  name: "Content-Auditor",
  model: () => HAIKU_MODEL,
  execute,
};

// ---------------------------------------------------------------------------
// Haupt-Funktion (direkt aufrufbar von Cron-Route)
// ---------------------------------------------------------------------------

export async function runContentAudit(): Promise<ContentAuditResult> {
  console.log("[AG18] Content-Audit gestartet:", new Date().toISOString());

  // Phase 1: Kennzahlen vs. Hardcodes
  const kennzahlenAbw = await checkKennzahlenVsHardcodes();
  console.log(`[AG18] Phase 1: ${kennzahlenAbw.length} Kennzahlen-Findings`);

  // Phase 2: internal_rules.json prüfen
  const internalAbw = checkInternalRules(kennzahlenAbw);
  console.log(`[AG18] Phase 2: ${internalAbw.length} internal_rules-Findings`);

  // Phase 3: Fehlerkatalog-Stichprobe
  const veralteteEintraege = checkFehlerkatalog();
  console.log(`[AG18] Phase 3: ${veralteteEintraege.length} Fehlerkatalog-Findings`);

  // Phase 4: Weisungen-Abdeckung
  const weisungenLuecken = await checkWeisungenCoverage();
  console.log(`[AG18] Phase 4: ${weisungenLuecken.length} Weisungen-Lücken`);

  // Gesamt-Status bestimmen
  const hasCritical =
    kennzahlenAbw.some((a) => a.severity === "kritisch") ||
    veralteteEintraege.some((e) => e.severity === "kritisch") ||
    internalAbw.some((a) => a.severity === "kritisch");

  const hasWarning =
    kennzahlenAbw.some((a) => a.severity === "warnung") ||
    veralteteEintraege.some((e) => e.severity === "warnung") ||
    internalAbw.some((a) => a.severity === "warnung") ||
    weisungenLuecken.length > 0;

  const gesamtStatus = hasCritical ? "kritisch" : hasWarning ? "warnung" : "ok";

  const result: ContentAuditResult = {
    kennzahlen_abweichungen: kennzahlenAbw,
    veraltete_eintraege: veralteteEintraege,
    weisungen_luecken: weisungenLuecken,
    internal_rules_abweichungen: internalAbw,
    gesamt_status: gesamtStatus,
    issues_created: [],
    zusammenfassung: `AG18 Content-Audit: ${gesamtStatus.toUpperCase()} — ${kennzahlenAbw.length} Kennzahlen, ${veralteteEintraege.length} Katalog, ${weisungenLuecken.length} Weisungen-Lücken`,
  };

  // GitHub Issue erstellen (immer — auch bei "ok" als Audit-Trail)
  const report = formatReport(result);
  const severityLabel = gesamtStatus === "kritisch" ? "🔴 KRITISCH" : gesamtStatus === "warnung" ? "⚠️ Warnung" : "✅ OK";
  const issueUrl = await createGitHubIssue(
    `📋 AG18 Content-Audit: ${severityLabel} — ${new Date().toLocaleDateString("de-DE")}`,
    report,
  );

  if (issueUrl) {
    result.issues_created.push(issueUrl);
    console.log(`[AG18] GitHub Issue erstellt: ${issueUrl}`);
  }

  console.log(`[AG18] Content-Audit abgeschlossen: ${gesamtStatus}`);
  return result;
}
