/**
 * LIVE-DEMO: Bescheid hochladen → Engine-Output zeigen
 * Ruft runForensicAnalysis direkt auf (kein Dev-Server nötig).
 */
import fs from "fs";
import path from "path";

// Env laden
const envFile = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf-8") : "";
for (const line of envFile.split("\n")) {
  const t = line.trim();
  if (t.startsWith("#") || !t.includes("=")) continue;
  const [k, ...rest] = t.split("=");
  const v = rest.join("=").replace(/^["']|["']$/g, "");
  if (k && !process.env[k]) process.env[k] = v;
}

import { pseudonymizeText } from "../src/lib/privacy/pseudonymizer";
import { runForensicAnalysis } from "../src/lib/logic/engine";

const B = "\x1b[34m"; const G = "\x1b[32m"; const R = "\x1b[31m";
const Y = "\x1b[33m"; const M = "\x1b[35m"; const C = "\x1b[36m";
const W = "\x1b[37m"; const BOLD = "\x1b[1m"; const RST = "\x1b[0m";

// ─── DER HOCHGELADENE TESTBESCHEID (mit harten eingebauten Fehlern) ──────────

const TESTBESCHEID = `
JOBCENTER DORTMUND-NORD
Märkische Straße 22-24
44141 Dortmund
Telefon: 0231 / 10 99-0

                                             Dortmund, den 01.12.2025

Maier-Schulze, Karl-Heinz
Münsterstraße 47b
44145 Dortmund

Sozialversicherungsnummer: 12 040567 M 003
Aktenzeichen: JC-DO-2025-98712

BESCHEID
über die Festsetzung von Leistungen zur Sicherung des Lebensunterhalts
nach dem Zweiten Buch Sozialgesetzbuch (SGB II)
für den Zeitraum 01.01.2026 bis 30.06.2026

Sehr geehrter Herr Maier-Schulze,

Sie erhalten ab dem 01.01.2026 folgende monatliche Leistungen:

Regelbedarf (Regelbedarfsstufe 1):          502,00 EUR
Kosten der Unterkunft und Heizung:           420,00 EUR
Warmwasserpauschale:                         -10,22 EUR
----------------------------------------------------------
Gesamtleistung monatlich:                    911,78 EUR

Begründung: Kein Anspruch auf erhöhten Regelsatz festgestellt.

Hinweis: Gegen diesen Bescheid können Sie innerhalb von 7 TAGEN
nach Bekanntgabe Widerspruch einlegen.

Rechtsbehelfsbelehrung: [nicht vorhanden]

Sachbearbeiter: Müller, Thomas
Telefon: 0231 / 10 99-452

Mit freundlichen Grüßen
Jobcenter Dortmund-Nord
`;

async function main() {
  console.log(`\n${BOLD}${M}╔══════════════════════════════════════════════════════════════════╗${RST}`);
  console.log(`${BOLD}${M}║  LIVE-DEMO: Bescheid-Upload → KI-Analyse (GPT-4o)               ║${RST}`);
  console.log(`${BOLD}${M}╚══════════════════════════════════════════════════════════════════╝${RST}`);

  // ── SCHRITT 1: Eingabe-Dokument zeigen ─────────────────────────
  console.log(`\n${BOLD}${B}═══ EINGABE: Hochgeladener Bescheid ════════════════════════════════${RST}`);
  console.log(Y + TESTBESCHEID.trim() + RST);

  // ── SCHRITT 2: Pseudonymisierung ────────────────────────────────
  console.log(`\n${BOLD}${B}═══ SCHRITT 1: Pseudonymisierung (vor KI-Übergabe) ═════════════════${RST}`);
  const { pseudonymized, map } = pseudonymizeText(TESTBESCHEID);

  const stats = [
    map.name.length > 0 && `Namen: ${map.name.length}`,
    map.address.length > 0 && `Adressen: ${map.address.length}`,
    map.phone.length > 0 && `Telefon: ${map.phone.length}`,
    map.socialSecurityNumber.length > 0 && `SVN: ${map.socialSecurityNumber.length}`,
  ].filter(Boolean).join(" | ");

  console.log(`${G}  ✓ Anonymisiert: ${stats}${RST}`);
  console.log(`${W}  → Anonymisierter Text geht zur KI:${RST}`);
  console.log(M + pseudonymized.trim() + RST);

  // ── SCHRITT 3: KI-Analyse ────────────────────────────────────────
  console.log(`\n${BOLD}${B}═══ SCHRITT 2: GPT-4o Analyse ══════════════════════════════════════${RST}`);
  console.log(`${W}  ⏳ GPT-4o analysiert den Bescheid...${RST}`);

  const startTime = Date.now();
  const result = await runForensicAnalysis(pseudonymized);
  const dauer = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`${G}  ✓ Analyse abgeschlossen in ${dauer}s${RST}`);

  // ── SCHRITT 4: Zuordnung ─────────────────────────────────────────
  if (result.zuordnung) {
    console.log(`\n${BOLD}${C}══ ZUORDNUNG ═══${RST}`);
    console.log(`  Behörde:     ${BOLD}${result.zuordnung.behoerde}${RST}`);
    console.log(`  Rechtsgebiet: ${BOLD}${result.zuordnung.rechtsgebiet}${RST}`);
    console.log(`  Untergebiet:  ${BOLD}${result.zuordnung.untergebiet}${RST}`);
  }

  // ── SCHRITT 5: Erkannte Fehler ───────────────────────────────────
  console.log(`\n${BOLD}${R}══ ERKANNTE FEHLER / AUFFÄLLIGKEITEN ══${RST}`);
  const fehler = Array.isArray(result.fehler) ? result.fehler : [];
  if (fehler.length === 0) {
    console.log(`${Y}  Keine Fehler erkannt.${RST}`);
  } else {
    fehler.forEach((f, i) => {
      console.log(`\n  ${BOLD}${R}${i + 1}.${RST} ${W}${f}${RST}`);
    });
  }

  // ── SCHRITT 6: Musterschreiben ────────────────────────────────────
  console.log(`\n${BOLD}${G}══ GENERIERTES MUSTERSCHREIBEN ══════════════════════════════════════${RST}`);
  console.log(W + (result.musterschreiben || "Kein Schreiben generiert.") + RST);
  console.log(`${BOLD}${G}═════════════════════════════════════════════════════════════════════${RST}`);

  // ── QUALITÄTSPRÜFUNG ─────────────────────────────────────────────
  console.log(`\n${BOLD}══ QUALITÄTSPRÜFUNG DES OUTPUTS ══${RST}`);
  const ms = result.musterschreiben || "";
  const pruefungen = [
    { label: "Fehler erkannt (mind. 1)", pass: fehler.length >= 1 },
    { label: "Falschen Regelsatz 502€ angesprochen", pass: ms.includes("502") || fehler.some(f => String(f).includes("502")) },
    { label: "§ 24 SGB X (Anhörung) erkannt", pass: ms.includes("24") || fehler.some(f => String(f).includes("24") || String(f).toLowerCase().includes("anhör")) },
    { label: "7-Tage-Frist als Fehler erkannt", pass: ms.includes("7") || fehler.some(f => String(f).includes("7") || String(f).toLowerCase().includes("frist")) },
    { label: "Rechtsbehelfsbelehrung als Fehler erkannt", pass: fehler.some(f => String(f).toLowerCase().includes("rechtsbehelf") || String(f).toLowerCase().includes("belehrung")) || ms.toLowerCase().includes("rechtsbehelf") },
    { label: "Zuordnung korrekt (Jobcenter)", pass: result.zuordnung?.behoerde?.toLowerCase().includes("jobcenter") ?? false },
    { label: "Musterschreiben vorhanden (>200 Zeichen)", pass: ms.length > 200 },
    { label: "Widerspruch im Schreiben", pass: ms.toLowerCase().includes("widerspruch") },
  ];

  let bestanden = 0;
  for (const p of pruefungen) {
    if (p.pass) { console.log(`${G}  ✓ ${p.label}${RST}`); bestanden++; }
    else { console.log(`${R}  ✗ ${p.label}${RST}`); }
  }

  console.log(`\n${BOLD}  Ergebnis: ${bestanden}/${pruefungen.length} Checks bestanden${bestanden >= 6 ? ` ${G}✓ BESTANDEN${RST}` : ` ${R}✗ DURCHGEFALLEN${RST}`}${RST}`);
  console.log();
}

main().catch(e => {
  console.error("\x1b[31mFEHLER:\x1b[0m", e);
  process.exit(1);
});
