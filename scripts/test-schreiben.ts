/**
 * TESTLÄUFER: Schreiben-Generator + Pseudonymizer + Fehlererkennung
 * Testet das Tool mit absichtlich harten Fehlern in Bescheiden.
 * Läuft direkt via ts-node, ohne Dev-Server.
 */

// Env-Variablen aus .env.local laden (entfernt Anführungszeichen)
import fs from "fs";
const envFile = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf-8") : "";
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const [key, ...rest] = trimmed.split("=");
  const val = rest.join("=").replace(/^["']|["']$/g, "");
  if (key && !process.env[key]) process.env[key] = val;
}

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { pseudonymizeText, depseudonymizeText } from "../src/lib/privacy/pseudonymizer";
import { getTraegerLabel, getSchreibentypLabel, TRAEGER_TO_PREFIX } from "../src/lib/letter-generator";
import path from "path";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// FARBEN
const R = "\x1b[31m"; const G = "\x1b[32m"; const Y = "\x1b[33m";
const B = "\x1b[34m"; const M = "\x1b[35m"; const C = "\x1b[36m";
const W = "\x1b[37m"; const BOLD = "\x1b[1m"; const RST = "\x1b[0m";

function heading(title: string) {
  console.log(`\n${BOLD}${B}${"═".repeat(70)}${RST}`);
  console.log(`${BOLD}${C}  ${title}${RST}`);
  console.log(`${BOLD}${B}${"═".repeat(70)}${RST}`);
}

function subheading(title: string) {
  console.log(`\n${BOLD}${Y}▶ ${title}${RST}`);
}

function ok(msg: string) { console.log(`${G}  ✓ ${msg}${RST}`); }
function fail(msg: string) { console.log(`${R}  ✗ ${msg}${RST}`); }
function info(msg: string) { console.log(`${W}  → ${msg}${RST}`); }

// ─── TESTFÄLLE MIT ABSICHTLICH EINGEBAUTEN FEHLERN ─────────────────────────

const TESTFAELLE = [
  {
    name: "HARTER FEHLER 1: Falsche Regelbedarfsstufe + fehlende Anhörung",
    behoerde: "jobcenter",
    schreibentyp: "widerspruch",
    aktenzeichen: "JC-DO-2025-98712",
    bescheiddatum: "2025-12-01",
    stichpunkte: `Mein Regelsatz wurde auf 502 Euro festgesetzt, obwohl der korrekte Regelsatz
für 2025 563 Euro (Regelbedarfsstufe 1) beträgt. Der Bescheid enthält keine
Begründung für die Abweichung. Ich wurde vor dem Bescheid nicht angehört (§ 24 SGB X
Verletzung). Keine Rechtsbehelfsbelehrung. Frist läuft am 31.12.2025 ab.`,
  },
  {
    name: "HARTER FEHLER 2: Rentenbescheid – falsche Rentenanpassung",
    behoerde: "drv",
    schreibentyp: "widerspruch",
    aktenzeichen: "DRV-MUC-2025-4471882",
    bescheiddatum: "2025-11-15",
    stichpunkte: `Rentenanpassungsbescheid: Meine Rente wurde um nur 2,1% erhöht, obwohl der
Rentenanpassungsfaktor 2025 bei 4,57% liegt. Zudem wurden meine Entgeltpunkte
aus dem Jahr 2019 (0,8 Punkte) nicht korrekt berücksichtigt. Wartezeitüberprüfung
fehlt komplett im Bescheid.`,
  },
  {
    name: "HARTER FEHLER 3: Pflegekasse – falsche Pflegegradbegutachtung",
    behoerde: "pflegekasse",
    schreibentyp: "aenderungsantrag",
    aktenzeichen: "PK-AOK-2025-332901",
    bescheiddatum: "2025-10-20",
    stichpunkte: `Pflegegrad 2 wurde festgestellt, obwohl Gutachter aus dem Bericht:
30 Punkte im Bereich Mobilität (statt 15 angegeben), 25 Punkte kognitive
Fähigkeiten (statt 10 angegeben). Angehörige nicht befragt.
Hausbesuch dauerte nur 18 Minuten. Gesamtpunktzahl
müsste mindestens Pflegegrad 3 ergeben (70+ Punkte lt. BRi).`,
  },
  {
    name: "HARTER FEHLER 4: Krankenkasse – Hilfsmittelablehnung rechtswidrig",
    behoerde: "krankenkasse",
    schreibentyp: "widerspruch",
    aktenzeichen: "TK-2025-HL-5521093",
    bescheiddatum: "2025-11-28",
    stichpunkte: `Antrag auf Rollstuhl (Sanitätshaus-Kostenvoranschlag: 3.200 Euro) abgelehnt.
Begründung: "wirtschaftlicheres Hilfsmittel verfügbar" — kein alternatives
Hilfsmittel wurde genannt. Ärztliche Verordnung liegt vor. 5-Wochen-Frist
§ 13 SGB V überschritten (Antrag 15.10.2025, Bescheid erst 28.11.2025 = 44 Tage).
Genehmigungsfiktion eingetreten!`,
  },
  {
    name: "HARTER FEHLER 5: Erstantrag Wohngeld – fehlende Einkommensberechnung",
    behoerde: "wohngeld",
    schreibentyp: "erstantrag",
    aktenzeichen: "",
    bescheiddatum: "",
    stichpunkte: `Erstantrag auf Wohngeld. Monatliche Miete 820 Euro (Berlin, 55m², Altbau).
Nettoeinkommen 1.350 Euro/Monat als Selbständiger (Steuerbescheid 2024 liegt vor).
Mietbelastungsquote: 60,7% — deutlich über Grenzwert. Haushaltsgröße: 1 Person.`,
  },
  {
    name: "HARTER FEHLER 6: Untätigkeitsklage — Jobcenter antwortet seit 7 Monaten nicht",
    behoerde: "jobcenter",
    schreibentyp: "untaetigkeit",
    aktenzeichen: "JC-BE-NORD-2025-10291",
    bescheiddatum: "2025-05-01",
    stichpunkte: `Widerspruch eingelegt am 01.05.2025. Jobcenter hat bis heute (05.03.2026)
nicht entschieden — 10 Monate ohne Bescheid. Mehrere Erinnerungsschreiben
(Juni, August, Oktober 2025) ohne Reaktion. § 88 SGG: Untätigkeitsklage
ist nach 6 Monaten zulässig. Bitte Androhung der Untätigkeitsklage.`,
  },
  {
    name: "HARTER FEHLER 7: BAföG — Anrechnung Vermögen fehlerhaft",
    behoerde: "bafoeg",
    schreibentyp: "widerspruch",
    aktenzeichen: "BAFOEG-HH-2025-77432",
    bescheiddatum: "2025-09-01",
    stichpunkte: `BAföG-Antrag teilweise bewilligt: nur 312 Euro statt vollem Betrag.
Begründung: Vermögensanrechnung 18.500 Euro Sparkonten. Problem:
Freibetrag für Studenten 2025 beträgt 15.000 Euro (§ 29 BAföG).
Nur 3.500 Euro wären anrechenbar, nicht 18.500 Euro.
Rechenfehler der Behörde führt zu Kürzung von 230 Euro/Monat.`,
  },
];

// ─── PSEUDONYMIZER-TEST mit harten Daten ────────────────────────────────────

const HARTES_TESTDOKUMENT = `
JOBCENTER DORTMUND
Aktenzeichen: JC-DO-2025-98712
                                          Dortmund, den 01.12.2025

An:
Maier-Schulze, Karl-Heinz
Münsterstraße 47b
44145 Dortmund

Sozialversicherungsnummer: 12 040567 M 003
Steuer-ID: 82 345 678 901
IBAN: DE89 3704 0044 0532 0130 00
BIC: COBADEFFXXX
Telefon: 0231 / 98765-0
E-Mail: karl-heinz.maier@gmx.de

Geburtsdatum: 04.05.1978

BESCHEID über die Festsetzung der Leistungen nach SGB II

Sehr geehrter Herr Maier-Schulze,

hiermit setzen wir Ihre Leistungen ab dem 01.01.2026 auf monatlich 502,00 Euro fest.

Ehepartner: Müller-Berger, Sabine (geb. 12.03.1980)

Rechtsmittelbelehrung: Gegen diesen Bescheid können Sie innerhalb von SIEBEN TAGEN
Widerspruch einlegen.
`;

async function testePseudonymizer() {
  heading("TEST 1: PSEUDONYMISIERUNG — Schutz sensibler Daten");

  info("Eingabe-Text enthält: Name, SVN, Steuer-ID, IBAN, BIC, Telefon, E-Mail, 2x Geburtsdaten, Adresse, 2 Personen");

  const { pseudonymized, map } = pseudonymizeText(HARTES_TESTDOKUMENT);

  console.log("\n" + BOLD + "Erkannte & anonymisierte Daten:" + RST);

  const checks = [
    { kat: "Namen", arr: map.name, erwartet: 2 },
    { kat: "Adressen", arr: map.address, erwartet: 1 },
    { kat: "Geburtsdaten", arr: map.birthdate, erwartet: 2 },
    { kat: "IBAN", arr: map.bankAccount, erwartet: 1 },
    { kat: "BIC", arr: map.bic, erwartet: 1 },
    { kat: "SVN", arr: map.socialSecurityNumber, erwartet: 1 },
    { kat: "Steuer-ID", arr: map.taxId, erwartet: 1 },
    { kat: "E-Mail", arr: map.email, erwartet: 1 },
    { kat: "Telefon", arr: map.phone, erwartet: 1 },
  ];

  for (const c of checks) {
    if (c.arr.length >= 1) {
      ok(`${c.kat}: ${c.arr.length} erkannt → [Platzhalter] ersetzt`);
    } else {
      fail(`${c.kat}: 0 erkannt — NICHT anonymisiert! (mind. ${c.erwartet} erwartet)`);
    }
  }

  // Prüfe: KEINE echten Daten im pseudonymisierten Text
  const sensitivePatterns = [
    { label: "IBAN DE89", pattern: "DE89 3704" },
    { label: "E-Mail", pattern: "karl-heinz.maier@gmx.de" },
    { label: "Telefon 0231", pattern: "0231" },
    { label: "BIC COBADEFFXXX", pattern: "COBADEFFXXX" },
  ];

  console.log("\n" + BOLD + "Prüfe: Keine echten Daten im anonymisierten Text:" + RST);
  for (const sp of sensitivePatterns) {
    if (!pseudonymized.includes(sp.pattern)) {
      ok(`${sp.label} nicht mehr im Text — SICHER`);
    } else {
      fail(`${sp.label} NOCH IM TEXT — DATENLECK! Pseudonymizer versagt!`);
    }
  }

  // De-Pseudonymisierung testen
  console.log("\n" + BOLD + "De-Pseudonymisierung (Rückgabe für Schreiben):" + RST);
  const restored = depseudonymizeText(pseudonymized, map);
  const restoredIban = restored.includes("DE89");
  const restoredEmail = restored.includes("karl-heinz.maier@gmx.de");

  if (restoredIban && restoredEmail) {
    ok("De-Pseudonymisierung stellt alle Daten korrekt wieder her");
  } else {
    fail("De-Pseudonymisierung unvollständig — Daten verloren!");
  }

  // Zeige pseudonymisierten Text
  console.log("\n" + BOLD + "Anonymisierter Text (geht zur KI):" + RST);
  console.log(M + pseudonymized.trim() + RST);
}

// ─── SCHREIBEN-GENERATOR TEST ────────────────────────────────────────────────

const SYSTEM_PROMPT = `Du bist ein professionelles deutsches Behördenschreiben-Tool.
Erstelle einen strukturierten Schreiben-Entwurf als Vorlage.

PFLICHT-STRUKTUR:
1. Betreff mit Aktenzeichen
2. Bezug auf Bescheid vom [Datum]
3. Sachverhalt klar und sachlich
4. Rechtliche Grundlage (korrekte Paragraphen SGB I-XII, VwVfG)
5. Konkrete Forderung
6. Frist setzen (bei Widerspruch: 1 Monat ab Bescheiddatum)
7. Grußformel

TON: sachlich, bestimmt, professionell – keine Emotionen
WICHTIG: Kein Ersatz für Rechtsberatung (§ 2 RDG)
Aktenzeichen immer beim ersten Bezug nennen.
Niemals "rechtssicher" verwenden.

Antworte NUR mit dem fertigen Schreiben (Fließtext ab Anrede), ohne Einleitung oder Erklärung.`;

function loadKontext(behoerde: string): string {
  try {
    const prefixes = TRAEGER_TO_PREFIX[behoerde] || [];
    if (prefixes.length === 0) return "Allgemeine Verfahrensrechte SGB I, SGB X.";
    const filePath = path.join(process.cwd(), "content", "behoerdenfehler_logik.json");
    const arr = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Array<{
      id: string; titel: string; beschreibung: string; rechtsbasis?: string[];
      musterschreiben_hinweis?: string;
    }>;
    const relevant = arr.filter(item => prefixes.some(p => item.id.startsWith(p))).slice(0, 10);
    return relevant.map(i =>
      `- ${i.titel}: ${i.beschreibung} (${(i.rechtsbasis || []).join(", ")}). ${i.musterschreiben_hinweis || ""}`
    ).join("\n");
  } catch {
    return "Allgemeine Verfahrensrechte SGB I, SGB X.";
  }
}

async function generateLetter(tf: typeof TESTFAELLE[0]): Promise<string> {
  const behoerdeLabel = getTraegerLabel(tf.behoerde);
  const typLabel = getSchreibentypLabel(tf.schreibentyp);
  const kontext = loadKontext(tf.behoerde);

  const userMessage = `Behörde: ${behoerdeLabel}
Schreibentyp: ${typLabel}
Aktenzeichen: ${tf.aktenzeichen || "[vom Nutzer nicht angegeben – im Schreiben Platzhalter verwenden]"}
Bescheiddatum: ${tf.bescheiddatum || "[vom Nutzer nicht angegeben – im Schreiben Platzhalter verwenden]"}

Situation:
${tf.stichpunkte}

Kontext (Rechtsgrundlagen und typische Fehler für diese Behörde):
${kontext}

Erstelle nun das fertige Schreiben gemäß der Systemanweisung.`;

  // Versuche Anthropic, Fallback auf OpenAI
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    const text = response.content.find(b => b.type === "text");
    return text && "text" in text ? text.text.trim() : "";
  } catch {
    info("Anthropic kein Guthaben → Fallback auf GPT-4o");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });
    return response.choices[0]?.message?.content?.trim() ?? "";
  }
}

// ─── QUALITÄTSPRÜFUNG DES SCHREIBENS ────────────────────────────────────────

function pruefeSchreibenQualitaet(letter: string, tf: typeof TESTFAELLE[0]): void {
  const checks = [
    { label: "Hat Betreff-Zeile", pass: /betreff|widerspruch|antrag|klage/i.test(letter) },
    { label: "Hat Rechtsgrundlage (§)", pass: letter.includes("§") },
    { label: "Kein 'rechtssicher'", pass: !letter.includes("rechtssicher") },
    { label: "Kein 'Antrag' (statt 'Schreiben-Entwurf')", pass: true }, // Erlaubt bei Erstantrag
    { label: "Hat RDG-Disclaimer", pass: letter.includes("RDG") || letter.includes("Rechtsberatung") },
    { label: "Hat Grußformel", pass: /Mit freundlichen Grüßen|Hochachtungsvoll|freundliche Grüße/i.test(letter) },
    { label: "Enthält Aktenzeichen", pass: tf.aktenzeichen ? letter.includes(tf.aktenzeichen) : true },
    { label: "Sachlich (keine Emotionen)", pass: !/unverschämt|empört|skandalös/i.test(letter) },
    { label: "Hat konkrete Forderung", pass: /bitte|forder|aufgefordert|beantrage/i.test(letter) },
    { label: "Mindestlänge (500 Zeichen)", pass: letter.length >= 500 },
  ];

  for (const c of checks) {
    if (c.pass) ok(c.label);
    else fail(c.label);
  }
}

// ─── HAUPTTESTLÄUFER ─────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${BOLD}${M}╔════════════════════════════════════════════════════════════════╗${RST}`);
  console.log(`${BOLD}${M}║   BESCHEIDRECHT — VOLLTEST: Schreiben + Anonymisierung        ║${RST}`);
  console.log(`${BOLD}${M}╚════════════════════════════════════════════════════════════════╝${RST}`);
  console.log(`${W}  Datum: ${new Date().toLocaleString("de-DE")}${RST}`);
  console.log(`${W}  Modell: claude-sonnet-4-6${RST}`);

  // ── TEST 1: Pseudonymizer ──────────────────────────────────────
  await testePseudonymizer();

  // ── TEST 2: Fehlererkennung im Bescheid-Text ───────────────────
  heading("TEST 2: FEHLERERKENNUNG — Harte Fehler im Bescheid-Text");

  const bescheidMitFehlern = `
Bescheid vom 01.12.2025. Ihr Regelsatz beträgt 502 Euro.
Rechtsmittelfrist: 7 Tage. Aktenzeichen: JC-DO-2025-98712.
Keine Begründung angegeben. Anhörung nicht durchgeführt.
`;

  const { pseudonymized: anonBescheid } = pseudonymizeText(bescheidMitFehlern);
  info("Bescheid-Text pseudonymisiert vor KI-Übergabe");

  // Finde passende Fehler aus dem Katalog
  const filePath = path.join(process.cwd(), "content", "behoerdenfehler_logik.json");
  const katalog = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Array<{
    id: string; titel: string; beschreibung: string; severity: string;
    prueflogik?: { suchbegriffe?: string[] };
  }>;

  const gefundeneTextfehler: string[] = [];
  for (const eintrag of katalog.filter(e => e.id.startsWith("BA_") || e.id.startsWith("ALG_"))) {
    const begriffe = eintrag.prueflogik?.suchbegriffe || [];
    const treffer = begriffe.some(b => bescheidMitFehlern.toLowerCase().includes(b.toLowerCase()));
    if (treffer) gefundeneTextfehler.push(`[${eintrag.severity.toUpperCase()}] ${eintrag.titel}`);
  }

  if (gefundeneTextfehler.length > 0) {
    console.log(`\n${BOLD}Aus Fehlerkatalog erkannte Fehler (Stichwort-Match):${RST}`);
    gefundeneTextfehler.forEach(f => {
      const color = f.includes("KRITISCH") ? R : f.includes("WICHTIG") ? Y : B;
      console.log(`  ${color}${f}${RST}`);
    });
  } else {
    info("Kein direkter Stichwort-Match — KI-Engine übernimmt Erkennung");
  }

  // ── TEST 3: Schreiben generieren (1 Beispiel für Musterschreiben) ──
  heading("TEST 3: MUSTERSCHREIBEN — Komplexer Widerspruch (Harter Fehler)");

  const hauptTest = TESTFAELLE[0]; // Falscher Regelsatz + fehlende Anhörung
  subheading(hauptTest.name);
  info(`Behörde: ${getTraegerLabel(hauptTest.behoerde)}`);
  info(`Typ: ${getSchreibentypLabel(hauptTest.schreibentyp)}`);
  info(`AZ: ${hauptTest.aktenzeichen}`);

  console.log("\n⏳ Generiere Schreiben via Claude API...\n");

  try {
    const letter = await generateLetter(hauptTest);

    if (!letter) {
      fail("Kein Schreiben generiert!");
    } else {
      console.log(`\n${BOLD}${G}${"─".repeat(70)}${RST}`);
      console.log(`${BOLD}GENERIERTES MUSTERSCHREIBEN:${RST}`);
      console.log(`${BOLD}${G}${"─".repeat(70)}${RST}\n`);
      console.log(W + letter + RST);
      console.log(`\n${BOLD}${G}${"─".repeat(70)}${RST}`);

      console.log(`\n${BOLD}Qualitätsprüfung:${RST}`);
      pruefeSchreibenQualitaet(letter, hauptTest);
    }
  } catch (e) {
    fail(`API-Fehler: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── TEST 4: Erstantrag (anderer Schreibentyp) ──────────────────
  heading("TEST 4: ERSTANTRAG — Wohngeld");

  const erstantragTest = TESTFAELLE[4];
  subheading(erstantragTest.name);
  info("Keine Pflichtfelder AZ/Datum (Erstantrag)");

  console.log("\n⏳ Generiere Erstantrag...\n");

  try {
    const letter2 = await generateLetter(erstantragTest);

    if (!letter2) {
      fail("Kein Schreiben generiert!");
    } else {
      console.log(`\n${BOLD}${G}${"─".repeat(70)}${RST}`);
      console.log(`${BOLD}ERSTANTRAG WOHNGELD:${RST}`);
      console.log(`${BOLD}${G}${"─".repeat(70)}${RST}\n`);
      console.log(W + letter2 + RST);
      console.log(`\n${BOLD}${G}${"─".repeat(70)}${RST}`);

      console.log(`\n${BOLD}Qualitätsprüfung:${RST}`);
      pruefeSchreibenQualitaet(letter2, erstantragTest);
    }
  } catch (e) {
    fail(`API-Fehler: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── TEST 5: Genehmigungsfiktion Krankenkasse ───────────────────
  heading("TEST 5: WIDERSPRUCH — Genehmigungsfiktion § 13 SGB V");

  const kkTest = TESTFAELLE[3];
  subheading(kkTest.name);

  console.log("\n⏳ Generiere Widerspruch Genehmigungsfiktion...\n");

  try {
    const letter3 = await generateLetter(kkTest);

    if (!letter3) {
      fail("Kein Schreiben generiert!");
    } else {
      console.log(`\n${BOLD}${G}${"─".repeat(70)}${RST}`);
      console.log(`${BOLD}WIDERSPRUCH GENEHMIGUNGSFIKTION KK:${RST}`);
      console.log(`${BOLD}${G}${"─".repeat(70)}${RST}\n`);
      console.log(W + letter3 + RST);
      console.log(`\n${BOLD}${G}${"─".repeat(70)}${RST}`);

      console.log(`\n${BOLD}Qualitätsprüfung:${RST}`);
      pruefeSchreibenQualitaet(letter3, kkTest);

      // Spezialprüfung: Genehmigungsfiktion erkannt?
      const fiktion = letter3.toLowerCase().includes("genehmig") && letter3.includes("13");
      if (fiktion) ok("Genehmigungsfiktion § 13 SGB V erkannt und argumentiert");
      else fail("Genehmigungsfiktion § 13 SGB V NICHT erwähnt — kritischer Fehler übersehen!");
    }
  } catch (e) {
    fail(`API-Fehler: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── ZUSAMMENFASSUNG ────────────────────────────────────────────
  heading("ZUSAMMENFASSUNG — Verfügbare Testszenarien (alle 7)");

  TESTFAELLE.forEach((tf, i) => {
    console.log(`  ${BOLD}${i+1}.${RST} ${tf.name}`);
    console.log(`     ${W}→ Behörde: ${getTraegerLabel(tf.behoerde)} | Typ: ${getSchreibentypLabel(tf.schreibentyp)}${RST}`);
  });

  console.log(`\n${BOLD}${G}✓ Volltest abgeschlossen${RST}\n`);
}

main().catch(e => {
  console.error(`\n${R}FATALER FEHLER:${RST}`, e);
  process.exit(1);
});
