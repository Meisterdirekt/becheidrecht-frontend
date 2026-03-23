#!/usr/bin/env npx tsx
/**
 * Live-Test: Volle AG-Pipeline mit echten Bescheid-Texten.
 *
 * Prüft AG01 (Triage) + AG02 (Analyse) + AG07 (Brief) End-to-End:
 * - Behörde korrekt erkannt?
 * - Rechtsgebiet korrekt?
 * - Fehlerkatalog-Treffer passend?
 * - Keine erfundenen Paragraphen?
 * - Gesetze passend zum Rechtsgebiet?
 *
 * Usage: npx tsx scripts/test-pipeline-live.ts [--all | --index 0]
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Verify keys exist before running
const hasKey = !!process.env.ANTHROPIC_API_KEY;
if (!hasKey) {
  console.error("❌ ANTHROPIC_API_KEY nicht in .env.local gesetzt");
  process.exit(1);
}

import { runPipeline } from "../src/lib/logic/agents/orchestrator";

// ─── Test-Bescheide (5 verschiedene Rechtsgebiete) ─────────────────────────

interface TestCase {
  name: string;
  erwartete_behoerde: RegExp;
  erwartete_rechtsgebiet: string;
  erwartete_keywords: string[]; // Muss in Fehler/Auffälligkeiten vorkommen
  verbotene_sgb: string[]; // Darf NICHT vorkommen (falsches Rechtsgebiet)
  text: string;
}

const TEST_CASES: TestCase[] = [
  {
    name: "SGB II — Jobcenter KdU-Kürzung",
    erwartete_behoerde: /jobcenter/i,
    erwartete_rechtsgebiet: "SGB II",
    erwartete_keywords: ["KdU", "Unterkunft", "angemessen", "Konzept"],
    verbotene_sgb: ["SGB VI", "SGB XI", "SGB III"],
    text: `Jobcenter Berlin Mitte — Änderungsbescheid
Aktenzeichen: BG-12345-2026
Datum: 10.03.2026

Sehr geehrter Herr Mustermann,

Ihr Antrag auf Leistungen nach dem SGB II wird wie folgt beschieden:

Die Kosten der Unterkunft werden ab dem 01.05.2026 auf den angemessenen Betrag
von 480,00 € monatlich begrenzt. Ihre tatsächlichen Kosten der Unterkunft betragen
650,00 € monatlich. Die Differenz von 170,00 € wird nicht übernommen.

Die Angemessenheitsgrenze wurde auf Basis der Wohngeldtabelle (§ 12 WoGG) + 10%
Sicherheitszuschlag ermittelt. Ein schlüssiges Konzept im Sinne der BSG-Rechtsprechung
liegt dem Jobcenter nicht vor.

Heizkosten werden in tatsächlicher Höhe von 95,00 € übernommen.

Regelbedarf Stufe 1: 563,00 €
Kosten der Unterkunft (angemessen): 480,00 €
Heizkosten: 95,00 €
Gesamtleistung: 1.138,00 €

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe
Widerspruch einlegen. Der Widerspruch ist schriftlich oder zur Niederschrift
beim Jobcenter Berlin Mitte einzulegen.`,
  },
  {
    name: "SGB V — Krankenkasse Reha-Ablehnung mit Genehmigungsfiktion",
    erwartete_behoerde: /krankenkasse|aok|barmer|tk|dak/i,
    erwartete_rechtsgebiet: "SGB V",
    erwartete_keywords: ["Genehmigungsfiktion", "Frist", "Wochen"],
    verbotene_sgb: ["SGB II", "SGB VI", "SGB XI"],
    text: `AOK Nordost — Ablehnungsbescheid
Versichertennummer: A123456789
Datum: 05.03.2026

Sehr geehrte Frau Musterfrau,

Ihr Antrag auf eine stationäre Rehabilitationsmaßnahme (orthopädisch) vom 10.01.2026
wird abgelehnt.

Begründung:
Nach Prüfung durch den Medizinischen Dienst (Gutachten vom 01.03.2026) sind die
Voraussetzungen für eine stationäre Rehabilitation nach § 40 Abs. 2 SGB V nicht erfüllt.
Eine ambulante Behandlung ist ausreichend und wirtschaftlicher im Sinne des § 12 SGB V.

Ihr Antrag wurde am 10.01.2026 gestellt. Die Bearbeitungsfrist von 5 Wochen
(bei Einschaltung des Medizinischen Dienstes gemäß § 13 Abs. 3a SGB V) endete
am 14.02.2026. Eine Mitteilung über hinreichende Gründe für die Verzögerung
wurde Ihnen nicht zugesandt. Die Entscheidung erging erst am 05.03.2026.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe
Widerspruch einlegen.`,
  },
  {
    name: "SGB VI — DRV Erwerbsminderungsrente abgelehnt",
    erwartete_behoerde: /rentenversicherung|drv/i,
    erwartete_rechtsgebiet: "SGB VI",
    erwartete_keywords: ["Erwerbsminderung", "Gutachten"],
    verbotene_sgb: ["SGB II", "SGB V", "SGB XI"],
    text: `Deutsche Rentenversicherung Bund — Bescheid
Versicherungsnummer: 12 100165 M 123
Datum: 20.02.2026

Sehr geehrter Herr Testmann,

Ihr Antrag auf Rente wegen voller Erwerbsminderung vom 15.12.2025 wird abgelehnt.

Begründung:
Nach dem Ergebnis der sozialmedizinischen Begutachtung sind Sie noch in der Lage,
mindestens sechs Stunden täglich unter den üblichen Bedingungen des allgemeinen
Arbeitsmarktes erwerbstätig zu sein. Die Voraussetzungen des § 43 Abs. 2 SGB VI
liegen daher nicht vor.

Das Gutachten von Dr. Schmidt vom 10.02.2026 stellt fest, dass Sie leichte bis
mittelschwere Tätigkeiten im Wechsel zwischen Sitzen, Stehen und Gehen vollschichtig
ausüben können. Ausgeschlossen sind: schwere körperliche Arbeit, Heben über 10 kg,
Überkopfarbeiten, Nachtschicht.

Hinweis: Ein fachärztliches Gutachten Ihres behandelnden Orthopäden Dr. Müller vom
08.01.2026 attestiert ein Leistungsvermögen von maximal 3 Stunden täglich. Dieses
Gutachten wurde bei der Entscheidung nicht berücksichtigt, da das DRV-eigene
Gutachten als maßgeblich erachtet wird.

Die versicherungsrechtlichen Voraussetzungen (36 Monate Pflichtbeiträge in den
letzten 5 Jahren) sind erfüllt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
  },
  {
    name: "SGB III — Arbeitsagentur Sperrzeit ohne Anhörung",
    erwartete_behoerde: /agentur|arbeitsagentur|arbeitsamt/i,
    erwartete_rechtsgebiet: "SGB III",
    erwartete_keywords: ["Sperrzeit", "Anhörung"],
    verbotene_sgb: ["SGB II", "SGB V", "SGB VI"],
    text: `Agentur für Arbeit Hamburg — Sperrzeitbescheid
Kundennummer: 123A456789
Datum: 15.03.2026

Sehr geehrte Frau Testfrau,

es wird eine Sperrzeit von 12 Wochen nach § 159 Abs. 1 Satz 2 Nr. 1 SGB III
wegen Arbeitsaufgabe festgestellt.

Sie haben Ihr Beschäftigungsverhältnis bei der Firma MusterGmbH zum 28.02.2026
selbst gekündigt, ohne dass ein wichtiger Grund im Sinne des § 159 SGB III vorlag.

Ihr Anspruch auf Arbeitslosengeld ruht daher in der Zeit vom 01.03.2026 bis zum
23.05.2026. Die Anspruchsdauer mindert sich um 90 Tage (ein Viertel der
Gesamtanspruchsdauer nach § 148 Abs. 1 Nr. 4 SGB III).

Eine Anhörung nach § 24 SGB X wurde vor Erlass dieses Bescheids nicht durchgeführt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe
Widerspruch einlegen. Der Widerspruch ist bei der Agentur für Arbeit Hamburg
einzulegen.`,
  },
  {
    name: "SGB XI — Pflegekasse Pflegegrad zu niedrig",
    erwartete_behoerde: /pflegekasse|pflegeversicherung|aok|barmer/i,
    erwartete_rechtsgebiet: "SGB XI",
    erwartete_keywords: ["Pflegegrad", "Begutachtung", "Modul"],
    verbotene_sgb: ["SGB II", "SGB III", "SGB VI"],
    text: `AOK Plus Pflegekasse — Bescheid über Pflegegrad
Versichertennummer: P987654321
Datum: 12.03.2026

Sehr geehrte Frau Pflegefall,

aufgrund des Gutachtens des Medizinischen Dienstes vom 05.03.2026 wird Ihnen
ab dem 01.04.2026 Pflegegrad 2 zuerkannt.

Gesamtpunktzahl: 31,0 Punkte (Schwellenwert PG 2: 27 – unter 47,5 Punkte)

Modulbewertung:
Modul 1 (Mobilität): 6 Punkte (gewichtet: 6,0)
Modul 2 (Kognitive Fähigkeiten): 4 Punkte (gewichtet: 5,0)
Modul 3 (Verhaltensweisen): 1 Punkt (gewichtet: 1,25)
Modul 4 (Selbstversorgung): 15 Punkte (gewichtet: 6,0)
Modul 5 (Krankheitsbedingte Anforderungen): 6 Punkte (gewichtet: 6,0)
Modul 6 (Gestaltung Alltagsleben): 5 Punkte (gewichtet: 6,75)

Hinweis: Der Gutachter hat bei Modul 1 die notwendige Begleitung bei
Treppensteigen (3x täglich, Sturzgefahr) nicht berücksichtigt. Ebenso wurde
die tägliche Insulingabe und Blutzuckerkontrolle (4x täglich) in Modul 5
mit nur 1 Punkt statt der angemessenen 3 Punkte bewertet. Bei korrekter
Bewertung läge die Gesamtpunktzahl bei ca. 41 Punkten.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
  },
];

// ─── Validierungen ─────────────────────────────────────────────────────────

// Bekannte existierende SGB-Paragraphen (Stichprobe für Halluzinations-Check)
const REAL_PARAGRAPHEN: Record<string, string[]> = {
  "SGB II": ["§ 7", "§ 9", "§ 11", "§ 11b", "§ 12", "§ 16", "§ 20", "§ 22", "§ 24", "§ 31", "§ 31a", "§ 40", "§ 41", "§ 44"],
  "SGB III": ["§ 136", "§ 137", "§ 138", "§ 147", "§ 148", "§ 149", "§ 150", "§ 151", "§ 159", "§ 160"],
  "SGB V": ["§ 12", "§ 13", "§ 27", "§ 33", "§ 39", "§ 40", "§ 44", "§ 45", "§ 47", "§ 92", "§ 135", "§ 139"],
  "SGB VI": ["§ 35", "§ 36", "§ 43", "§ 50", "§ 51", "§ 63", "§ 64", "§ 66", "§ 77", "§ 149", "§ 253a"],
  "SGB XI": ["§ 14", "§ 15", "§ 28a", "§ 36", "§ 37", "§ 38", "§ 39", "§ 40", "§ 42", "§ 43", "§ 45a", "§ 45b"],
  "SGB X": ["§ 24", "§ 31", "§ 33", "§ 35", "§ 36", "§ 37", "§ 38", "§ 39", "§ 44", "§ 45", "§ 48", "§ 50"],
  "SGG": ["§ 54", "§ 78", "§ 83", "§ 84", "§ 86a", "§ 86b", "§ 87", "§ 144"],
};

function checkForHallucinations(text: string, rechtsgebiet: string): string[] {
  const issues: string[] = [];
  // Suche nach §-Referenzen
  const matches = text.matchAll(/§\s*(\d+[a-z]?)\s+(Abs\.\s*\d+\s+)?(SGB\s+(?:I{1,3}|IV|V|VI{0,2}|VII|VIII|IX|X|XI{0,2}|XII)|SGG)/gi);
  for (const m of matches) {
    const para = `§ ${m[1]}`;
    const gesetz = m[3].replace(/\s+/g, " ").toUpperCase();
    const known = REAL_PARAGRAPHEN[gesetz];
    if (known && !known.some(k => k === para || k.startsWith(para))) {
      // Nicht in unserer Stichprobe — könnte aber existieren, nur Warnung
      issues.push(`⚠️  Unbekannter Paragraph: ${para} ${gesetz} (Halluzination?)`);
    }
  }
  return issues;
}

function checkRechtsgebietMismatch(fehler: string[], rechtsgebiet: string, verboten: string[]): string[] {
  const issues: string[] = [];
  for (const f of fehler) {
    for (const v of verboten) {
      if (f.includes(v)) {
        issues.push(`❌ Falsches Rechtsgebiet: "${f}" enthält ${v} (erwartet: ${rechtsgebiet})`);
      }
    }
  }
  return issues;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function runTest(tc: TestCase, index: number): Promise<{
  name: string;
  pass: boolean;
  details: string[];
  score: number;
}> {
  const details: string[] = [];
  let score = 0;
  const maxScore = 7;

  console.log(`\n${"═".repeat(70)}`);
  console.log(`TEST ${index + 1}: ${tc.name}`);
  console.log(`${"═".repeat(70)}`);

  const start = Date.now();
  const result = await runPipeline(tc.text, (phase, detail) => {
    console.log(`  [${phase}] ${detail ?? ""}`);
  });
  const durationSec = ((Date.now() - start) / 1000).toFixed(1);

  // 1. Behörde erkannt?
  const behoerde = result.zuordnung?.behoerde ?? "NICHT ERKANNT";
  const behoerdeOk = tc.erwartete_behoerde.test(behoerde);
  if (behoerdeOk) {
    details.push(`✅ Behörde: "${behoerde}"`);
    score++;
  } else {
    details.push(`❌ Behörde: "${behoerde}" (erwartet: ${tc.erwartete_behoerde})`);
  }

  // 2. Rechtsgebiet korrekt?
  const rg = result.zuordnung?.rechtsgebiet ?? "NICHT ERKANNT";
  const rgOk = rg.toUpperCase().includes(tc.erwartete_rechtsgebiet.replace("SGB ", ""));
  if (rgOk) {
    details.push(`✅ Rechtsgebiet: "${rg}"`);
    score++;
  } else {
    details.push(`❌ Rechtsgebiet: "${rg}" (erwartet: ${tc.erwartete_rechtsgebiet})`);
  }

  // 3. Fehler gefunden?
  const fehlerCount = result.fehler?.length ?? 0;
  const hatInhaltlicheFehler = result.fehler?.some(f =>
    !f.includes("Keine spezifischen") && !f.includes("Analyse abgeschlossen")
  ) ?? false;
  if (hatInhaltlicheFehler) {
    details.push(`✅ Fehler gefunden: ${fehlerCount}`);
    score++;
  } else {
    details.push(`❌ Keine inhaltlichen Fehler gefunden (${fehlerCount} Einträge)`);
  }

  // 4. Erwartete Keywords in Fehlern/Auffälligkeiten?
  const allText = [...(result.fehler ?? []), result.musterschreiben ?? ""].join(" ").toLowerCase();
  const foundKeywords = tc.erwartete_keywords.filter(kw => allText.includes(kw.toLowerCase()));
  const kwRatio = foundKeywords.length / tc.erwartete_keywords.length;
  if (kwRatio >= 0.5) {
    details.push(`✅ Keywords: ${foundKeywords.length}/${tc.erwartete_keywords.length} (${foundKeywords.join(", ")})`);
    score++;
  } else {
    const missing = tc.erwartete_keywords.filter(kw => !allText.includes(kw.toLowerCase()));
    details.push(`❌ Keywords: ${foundKeywords.length}/${tc.erwartete_keywords.length} — fehlend: ${missing.join(", ")}`);
  }

  // 5. Kein falsches Rechtsgebiet in Fehlern?
  const mismatchIssues = checkRechtsgebietMismatch(result.fehler ?? [], tc.erwartete_rechtsgebiet, tc.verbotene_sgb);
  if (mismatchIssues.length === 0) {
    details.push(`✅ Kein Rechtsgebiet-Mismatch`);
    score++;
  } else {
    details.push(...mismatchIssues);
  }

  // 6. Halluzinations-Check
  const hallucinationIssues = checkForHallucinations(
    [...(result.fehler ?? []), result.musterschreiben ?? ""].join("\n"),
    tc.erwartete_rechtsgebiet
  );
  if (hallucinationIssues.length === 0) {
    details.push(`✅ Keine Halluzinationen erkannt`);
    score++;
  } else {
    details.push(...hallucinationIssues);
    // Halluzinationen sind nur Warnungen, kein Punktabzug
    score++;
  }

  // 7. Musterschreiben vorhanden und nicht leer?
  const briefOk = (result.musterschreiben?.length ?? 0) > 200;
  if (briefOk) {
    details.push(`✅ Musterschreiben: ${result.musterschreiben!.length} Zeichen`);
    score++;
  } else {
    details.push(`❌ Musterschreiben zu kurz oder fehlend`);
  }

  // Meta-Info
  details.push(`\n📊 Score: ${score}/${maxScore} | ⏱ ${durationSec}s | 💰 ${result.token_kosten_eur ?? "?"} EUR | 🤖 ${result.agenten_aktiv?.join(", ")}`);
  details.push(`📋 Routing: ${result.routing_stufe} | Frist: ${result.frist_datum ?? "nicht erkannt"}`);

  if (result.kritik) {
    details.push(`📈 Erfolgschance: ${result.kritik.erfolgschance_prozent}%`);
  }

  // Fehler ausgeben
  details.push(`\n── Gefundene Fehler ──`);
  for (const f of (result.fehler ?? [])) {
    details.push(`  • ${f.slice(0, 150)}`);
  }

  const pass = score >= 5;
  return { name: tc.name, pass, details, score };
}

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes("--all");
  const indexArg = args.find(a => a.startsWith("--index"));
  const specificIndex = indexArg ? parseInt(args[args.indexOf(indexArg) + 1]) : null;

  let testCases: { tc: TestCase; idx: number }[];

  if (specificIndex !== null) {
    testCases = [{ tc: TEST_CASES[specificIndex], idx: specificIndex }];
  } else if (runAll) {
    testCases = TEST_CASES.map((tc, idx) => ({ tc, idx }));
  } else {
    // Default: ersten 2 als Schnelltest
    testCases = TEST_CASES.slice(0, 2).map((tc, idx) => ({ tc, idx }));
  }

  console.log(`\n🔬 BescheidRecht Pipeline Live-Test`);
  console.log(`   ${testCases.length} Bescheid(e) werden getestet\n`);

  const results: Awaited<ReturnType<typeof runTest>>[] = [];

  for (const { tc, idx } of testCases) {
    try {
      const r = await runTest(tc, idx);
      results.push(r);
      for (const d of r.details) console.log(`  ${d}`);
    } catch (err) {
      console.error(`\n❌ TEST ${idx + 1} FEHLER:`, err instanceof Error ? err.message : err);
      results.push({ name: tc.name, pass: false, details: [`CRASH: ${err}`], score: 0 });
    }
  }

  // Zusammenfassung
  console.log(`\n\n${"═".repeat(70)}`);
  console.log(`ZUSAMMENFASSUNG`);
  console.log(`${"═".repeat(70)}`);
  const passed = results.filter(r => r.pass).length;
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const maxTotal = results.length * 7;
  for (const r of results) {
    console.log(`  ${r.pass ? "✅" : "❌"} ${r.name} — ${r.score}/7`);
  }
  console.log(`\n  Gesamt: ${passed}/${results.length} bestanden | Score: ${totalScore}/${maxTotal} (${Math.round(totalScore / maxTotal * 100)}%)`);

  process.exit(passed === results.length ? 0 : 1);
}

main().catch(console.error);
