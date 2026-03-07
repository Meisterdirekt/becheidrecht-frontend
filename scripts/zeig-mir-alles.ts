/**
 * KOMPLETTER WEBSITE-FLOW: Upload → Anonymisierung → Analyse → Musterschreiben
 * Zeigt exakt was auf der Website passiert (nach erfolgreicher Auth).
 */
import fs from "fs";
import path from "path";

const envFile = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf-8") : "";
for (const line of envFile.split("\n")) {
  const t = line.trim();
  if (t.startsWith("#") || !t.includes("=")) continue;
  const [k, ...rest] = t.split("=");
  const v = rest.join("=").replace(/^["']|["']$/g, "");
  if (k && !process.env[k]) process.env[k] = v;
}

import { pseudonymizeText, depseudonymizeText } from "../src/lib/privacy/pseudonymizer";
import { runForensicAnalysis } from "../src/lib/logic/engine";
import OpenAI from "openai";

// ─── HOCHGELADENER BESCHEID (mit 4 eingebauten harten Fehlern) ──────────────

const HOCHGELADENER_BESCHEID = `JOBCENTER DORTMUND-NORD
Märkische Straße 22-24, 44141 Dortmund
Aktenzeichen: JC-DO-2025-98712

An:
Schmidt, Thomas
Rheinische Straße 105
44147 Dortmund
Sozialversicherungsnummer: 12 040567 M 003

Dortmund, den 01.12.2025

B E S C H E I D
über die Festsetzung von Leistungen nach SGB II (Bürgergeld)
Bewilligungszeitraum: 01.01.2026 – 30.06.2026

Sehr geehrter Herr Schmidt,

auf Grundlage Ihres Antrags erhalten Sie folgende Leistungen:

  Regelbedarf Stufe 1 ......................  502,00 €
  Kosten der Unterkunft ....................  310,00 €
  Warmwasserpauschale ......................  - 10,22 €
  ------------------------------------------------
  GESAMT monatlich .........................  801,78 €

FEHLER 1 — REGELSATZ FALSCH:
Der Regelbedarf beträgt 502 Euro. Der gesetzlich festgelegte Regelsatz 2025
für Regelbedarfsstufe 1 beträgt jedoch 563 Euro (RBEG 2025, BGBl. I 2024).

FEHLER 2 — KEINE ANHÖRUNG:
Eine Anhörung nach § 24 SGB X vor Erlass des Bescheids hat nicht stattgefunden.

FEHLER 3 — FALSCHE WIDERSPRUCHSFRIST:
Widerspruch kann innerhalb von 7 (sieben) Tagen eingelegt werden.
(Korrekt wäre: 1 Monat, § 84 SGG / § 36 SGB II)

FEHLER 4 — KEINE RECHTSBEHELFSBELEHRUNG:
Eine ordnungsgemäße Rechtsbehelfsbelehrung fehlt vollständig.

Mit freundlichen Grüßen
Sachbearbeiter: Müller, Klaus
`;

const hr = "─".repeat(68);
const HR = "═".repeat(68);

function box(title: string, color: string) {
  console.log(`\n\x1b[1m${color}${HR}\x1b[0m`);
  console.log(`\x1b[1m${color}  ${title}\x1b[0m`);
  console.log(`\x1b[1m${color}${HR}\x1b[0m`);
}

async function main() {
  console.clear();
  console.log(`\x1b[1m\x1b[35m
╔══════════════════════════════════════════════════════════════════╗
║     BESCHEIDRECHT — LIVE WEBSITE FLOW                          ║
║     Upload → Anonymisierung → KI-Analyse → Musterschreiben     ║
╚══════════════════════════════════════════════════════════════════╝\x1b[0m`);

  // ═══════════════════════════════════════════════════════════════
  // SCHRITT 1: DOKUMENT WIRD HOCHGELADEN
  // ═══════════════════════════════════════════════════════════════
  box("SCHRITT 1 — HOCHGELADENES DOKUMENT (Nutzer-Upload)", "\x1b[33m");
  console.log(`\x1b[90m  (Auf der Website: PDF oder Foto → OCR → Text)\x1b[0m`);
  console.log(`\n\x1b[37m${HOCHGELADENER_BESCHEID}\x1b[0m`);

  // ═══════════════════════════════════════════════════════════════
  // SCHRITT 2: PSEUDONYMISIERUNG
  // ═══════════════════════════════════════════════════════════════
  box("SCHRITT 2 — PSEUDONYMISIERUNG (vor KI-Übergabe)", "\x1b[34m");

  const { pseudonymized, map } = pseudonymizeText(HOCHGELADENER_BESCHEID);

  console.log(`\x1b[90m  Was anonymisiert wurde:\x1b[0m`);
  if (map.name.length)       console.log(`\x1b[32m  ✓ Namen (${map.name.length}x):     ${map.name.map((n,i)=>`"${n}"→[NAME_${i+1}]`).join(", ")}\x1b[0m`);
  if (map.address.length)    console.log(`\x1b[32m  ✓ Adressen (${map.address.length}x):  ${map.address.map((a,i)=>`"${a}"→[ADRESSE_${i+1}]`).join(", ")}\x1b[0m`);
  if (map.phone.length)      console.log(`\x1b[32m  ✓ Telefon (${map.phone.length}x):    ersetzt\x1b[0m`);
  if (map.socialSecurityNumber.length) console.log(`\x1b[32m  ✓ SVN (${map.socialSecurityNumber.length}x):       ersetzt\x1b[0m`);

  console.log(`\n\x1b[33m  → Anonymisierter Text (geht zur KI):\x1b[0m`);
  console.log(`\x1b[35m${hr}`);
  console.log(pseudonymized.trim());
  console.log(`${hr}\x1b[0m`);

  // ═══════════════════════════════════════════════════════════════
  // SCHRITT 3: KI-ANALYSE
  // ═══════════════════════════════════════════════════════════════
  box("SCHRITT 3 — GPT-4o-mini ANALYSE", "\x1b[34m");
  console.log(`\x1b[37m  ⏳ KI analysiert Bescheid...\x1b[0m`);

  const t0 = Date.now();
  const result = await runForensicAnalysis(pseudonymized);
  const sek = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\x1b[32m  ✓ Fertig in ${sek}s\x1b[0m`);

  // ═══════════════════════════════════════════════════════════════
  // SCHRITT 4: ERGEBNIS ANZEIGEN
  // ═══════════════════════════════════════════════════════════════
  box("SCHRITT 4 — ERGEBNIS: WAS DIE WEBSITE ANZEIGT", "\x1b[32m");

  // Zuordnung
  if (result.zuordnung) {
    console.log(`\n\x1b[1m\x1b[36m  📋 ZUORDNUNG:\x1b[0m`);
    console.log(`     Behörde:      \x1b[1m${result.zuordnung.behoerde}\x1b[0m`);
    console.log(`     Rechtsgebiet: \x1b[1m${result.zuordnung.rechtsgebiet}\x1b[0m`);
    console.log(`     Bereich:      \x1b[1m${result.zuordnung.untergebiet}\x1b[0m`);
  }

  // Erkannte Fehler
  const fehler = Array.isArray(result.fehler) ? result.fehler : [];
  console.log(`\n\x1b[1m\x1b[31m  ⚠️  ERKANNTE AUFFÄLLIGKEITEN (${fehler.length} gefunden):\x1b[0m`);
  fehler.forEach((f, i) => {
    const depseudo = depseudonymizeText(String(f), map);
    console.log(`\n  \x1b[31m${i + 1}.\x1b[0m \x1b[37m${depseudo}\x1b[0m`);
  });

  // Musterschreiben (mit De-Pseudonymisierung)
  const rawSchreiben = result.musterschreiben || "";
  const schreiben = depseudonymizeText(rawSchreiben, map);

  console.log(`\n\x1b[1m\x1b[32m  📄 GENERIERTES MUSTERSCHREIBEN:\x1b[0m`);
  console.log(`\x1b[32m  ${hr}\x1b[0m`);
  console.log(`\x1b[37m${schreiben}\x1b[0m`);
  console.log(`\x1b[32m  ${hr}\x1b[0m`);

  // ═══════════════════════════════════════════════════════════════
  // SCHRITT 5: SCHREIBEN-GENERATOR (generate-letter Route)
  // ═══════════════════════════════════════════════════════════════
  box("SCHRITT 5 — ANTRAGS-GENERATOR (generate-letter)", "\x1b[34m");
  console.log(`\x1b[90m  (Nutzer wählt: Jobcenter → Widerspruch → trägt Aktenzeichen ein)\x1b[0m`);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const SYSTEM_PROMPT = `Du bist ein professionelles deutsches Behördenschreiben-Tool.
Erstelle einen strukturierten Schreiben-Entwurf als Vorlage.
PFLICHT-STRUKTUR: 1. Betreff mit Aktenzeichen  2. Bezug auf Bescheid vom Datum
3. Sachverhalt klar und sachlich  4. Rechtliche Grundlage (korrekte §§ SGB II, SGB X)
5. Konkrete Forderung  6. Frist (Widerspruch: 1 Monat)  7. Grußformel
TON: sachlich, bestimmt, professionell. WICHTIG: § 2 RDG beachten.
Nie "rechtssicher". Antworte NUR mit dem fertigen Schreiben ab Anrede.`;

  const userMsg = `Behörde: Jobcenter / Agentur für Arbeit (SGB II/III)
Schreibentyp: Widerspruch gegen Bescheid
Aktenzeichen: JC-DO-2025-98712
Bescheiddatum: 01.12.2025

Situation:
Regelsatz auf 502€ festgesetzt, korrekt wären 563€ (Regelbedarfsstufe 1, 2025).
Keine Begründung. Keine Anhörung (§ 24 SGB X). Falsche Widerspruchsfrist 7 Tage statt 1 Monat.
Rechtsbehelfsbelehrung fehlt komplett.

Kontext:
- Regelbedarfsstufe 1 für 2025: 563€ (RBEG 2025)
- Anhörungspflicht: § 24 SGB X
- Widerspruchsfrist: § 84 SGG (1 Monat)
- Begründungspflicht: § 35 SGB X`;

  console.log(`\n\x1b[37m  ⏳ Generiere Widerspruch-Schreiben...\x1b[0m`);
  const t1 = Date.now();

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1500,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMsg },
    ],
  });

  const antragRaw = resp.choices[0]?.message?.content?.trim() ?? "";
  const RDG = antragRaw.includes("RDG") ? "" :
    "\n\n---\n⚠ Dieser Entwurf wurde von einer KI erstellt und stellt keine Rechtsberatung " +
    "im Sinne des § 2 RDG dar. Vor dem Absenden bitte vollständig prüfen.\n---";
  const antrag = antragRaw + RDG;

  console.log(`\x1b[32m  ✓ Fertig in ${((Date.now()-t1)/1000).toFixed(1)}s\x1b[0m`);
  console.log(`\n\x1b[1m\x1b[32m  ✉  FERTIGER WIDERSPRUCH (für PDF-Download auf der Website):\x1b[0m`);
  console.log(`\x1b[32m  ${hr}\x1b[0m`);
  console.log(`\x1b[37m${antrag}\x1b[0m`);
  console.log(`\x1b[32m  ${hr}\x1b[0m`);

  console.log(`\n\x1b[1m\x1b[32m✅ VOLLTEST ABGESCHLOSSEN — Alle 3 Kernfunktionen laufen mit OpenAI\x1b[0m\n`);
}

main().catch(e => {
  console.error("\x1b[31mFehler:\x1b[0m", e instanceof Error ? e.message : e);
  process.exit(1);
});
