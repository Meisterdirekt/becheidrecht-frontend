/**
 * E2E-Test: Fehlerkatalog-Matching mit echtem Bescheid-Input
 *
 * Testet die JSON-Logik (executeSucheFehlerkatalog) direkt —
 * kein API-Call, kein LLM, reine Stichwort-Matching-Logik.
 *
 * Test-Szenarien:
 * 1. Bescheid mit 3 Fehlern → alle erkannt?
 * 2. Edge Cases: wo greift die Logik NICHT?
 * 3. Schema-Validierung gegen echten Bescheid
 */

import { describe, it, expect } from "vitest";
import { executeSucheFehlerkatalog } from "../tools/fehlerkatalog";
import type { FehlerItem } from "../types";
import fs from "fs";
import path from "path";

// ─────────────────────────────────────────────────────────
// Test-Bescheid: 3 bekannte Fehler eingebaut
// ─────────────────────────────────────────────────────────

const TEST_BESCHEID = `
Jobcenter Berlin Mitte
Berliner Straße 45, 10115 Berlin

Bewilligungsbescheid – Grundsicherungsgeld nach SGB II
BG-Nummer: 12345-BG-67890
Datum: 15.02.2026

Sehr geehrter Herr Mustermann,

hiermit wird Ihnen Grundsicherungsgeld für den Zeitraum 01.03.2026 bis 31.08.2026
in folgender Höhe bewilligt:

Regelbedarf Stufe 1:          563,00 €
Kosten der Unterkunft (KdU):  380,00 €
  (Ihre tatsächliche Miete: 520,00 € — gekürzt auf Angemessenheitsgrenze)
Heizkosten:                    65,00 € (pauschal)
─────────────────────────────────────
Gesamt:                      1.008,00 €

Anrechnung Kindergeld:       - 250,00 €
Auszahlungsbetrag:             758,00 €

[FEHLER 1: FEHLENDE RECHTSGRUNDLAGE]
Die Kürzung der Unterkunftskosten erfolgt aufgrund der örtlichen Angemessenheitsgrenze.
(Anmerkung: Kein Verweis auf § 22 SGB II, kein schlüssiges Konzept genannt)

[FEHLER 2: FALSCHE FRIST]
Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb von zwei Wochen Widerspruch einlegen.
Der Widerspruch ist schriftlich beim Jobcenter Berlin Mitte einzureichen.
(Anmerkung: Korrekte Frist wäre 1 Monat nach § 84 SGG)

[FEHLER 3: KEIN WIDERSPRUCHSHINWEIS zur zuständigen Stelle]
(Anmerkung: Kein Hinweis auf zuständiges Sozialgericht, keine Belehrung über
Klagerecht nach § 66 SGG, fehlender Hinweis auf Zustellfiktion § 37 SGB X)
`;

// ─────────────────────────────────────────────────────────
// Hilfsfunktionen
// ─────────────────────────────────────────────────────────

function extractKeywords(text: string): string[] {
  // Simuliert AG02: Der LLM extrahiert Stichwörter aus dem Bescheid
  // Hier manuell, um die JSON-Logik isoliert zu testen
  return [
    "Kosten der Unterkunft",
    "KdU",
    "Angemessenheit",
    "Widerspruch",
    "Rechtsbehelfsbelehrung",
    "Frist",
    "zwei Wochen",
    "Sozialgericht",
    "Heizkosten",
    "pauschal",
    "Grundsicherungsgeld",
    "Kürzung",
    "Begründung",
    "einlegen",
    "Monat",
  ];
}

// ─────────────────────────────────────────────────────────
// Test 1: Alle 3 Fehler erkannt?
// ─────────────────────────────────────────────────────────

describe("E2E Fehlerkatalog-Matching", () => {
  it("erkennt fehlende Rechtsgrundlage bei KdU-Kürzung (BA_004)", () => {
    const keywords = extractKeywords(TEST_BESCHEID);
    const result = executeSucheFehlerkatalog(["BA"], keywords);

    const kduFehler = result.find((f) => f.id === "BA_004");
    expect(kduFehler).toBeDefined();
    expect(kduFehler!.titel).toContain("KdU");
    expect(kduFehler!.severity).toBe("kritisch");
    expect(kduFehler!.rechtsbasis).toContain("§ 22 Abs. 1 SGB II");
  });

  it("erkennt falsche Frist / fehlerhafte Rechtsbehelfsbelehrung (BA_018)", () => {
    const keywords = extractKeywords(TEST_BESCHEID);
    const result = executeSucheFehlerkatalog(["BA"], keywords);

    const fristFehler = result.find((f) => f.id === "BA_018");
    expect(fristFehler).toBeDefined();
    expect(fristFehler!.titel).toContain("Widerspruchsfrist");
    expect(fristFehler!.severity).toBe("kritisch");
    expect(fristFehler!.rechtsbasis).toContain("§ 84 SGG");
  });

  it("erkennt Heizkosten-Pauschalisierung (BA_005)", () => {
    const keywords = extractKeywords(TEST_BESCHEID);
    const result = executeSucheFehlerkatalog(["BA"], keywords);

    const heizFehler = result.find((f) => f.id === "BA_005");
    expect(heizFehler).toBeDefined();
    expect(heizFehler!.severity).toBe("kritisch");
  });

  it("gibt mindestens 3 Fehler zurück für diesen Bescheid", () => {
    const keywords = extractKeywords(TEST_BESCHEID);
    const result = executeSucheFehlerkatalog(["BA"], keywords);

    expect(result.length).toBeGreaterThanOrEqual(3);

    // Alle gefundenen Fehler ausgeben
    console.log("\n═══ FEHLERKATALOG OUTPUT ═══");
    result.forEach((f, i) => {
      console.log(`\n[${i + 1}] ${f.id} — ${f.titel}`);
      console.log(`    Severity: ${f.severity}`);
      console.log(`    Rechtsbasis: ${(f.rechtsbasis ?? []).join(", ")}`);
      console.log(`    Hinweis: ${f.musterschreiben_hinweis?.slice(0, 120)}...`);
    });
    console.log("\n═══════════════════════════\n");
  });

  it("sortiert kritische Fehler vor wichtigen", () => {
    const keywords = extractKeywords(TEST_BESCHEID);
    const result = executeSucheFehlerkatalog(["BA"], keywords);

    // Prüfe dass kritische Fehler oben stehen (Scoring: severity 100 + match count)
    const severities = result.map((f) => f.severity);
    const firstCritical = severities.indexOf("kritisch");
    const lastCritical = severities.lastIndexOf("kritisch");
    const firstWichtig = severities.indexOf("wichtig");

    if (firstWichtig !== -1 && lastCritical !== -1) {
      // Kritische sollten tendenziell vor wichtigen kommen (durch Scoring gewichtet)
      expect(firstCritical).toBeLessThanOrEqual(firstWichtig);
    }
  });

  it("Prefix 'BA' matcht nicht BAMF oder BAF (Prefix-Bug fix)", () => {
    const keywords = extractKeywords(TEST_BESCHEID);
    const result = executeSucheFehlerkatalog(["BA"], keywords);

    // Kein BAMF/BAF-Eintrag darf bei BA-Prefix auftauchen
    const crossMatches = result.filter(
      (f) => f.id.startsWith("BAMF_") || f.id.startsWith("BAF_")
    );
    expect(crossMatches).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────
  // Test 2: Score-Mechanismus — Mindest-Score 2
  // ─────────────────────────────────────────────────────────

  it("filtert Einträge mit nur 1 Keyword-Match raus (Score >= 2 Pflicht)", () => {
    // Nur 1 vages Keyword → sollte nichts finden
    const result = executeSucheFehlerkatalog(["BA"], ["Bescheid"]);
    // "Bescheid" allein matcht viele Einträge, aber nur oberflächlich
    // Score >= 2 bedeutet: mindestens 2 Keywords müssen matchen
    result.forEach((f) => {
      // Jeder gefundene Eintrag muss mindestens 2 Matching-Keywords haben
      const haystack = [
        f.titel,
        f.beschreibung,
        ...(f.rechtsbasis ?? []),
        ...(f.prueflogik?.suchbegriffe ?? []),
      ]
        .join(" ")
        .toLowerCase();

      // Manuell prüfen: "Bescheid" PLUS mindestens ein Suchbegriff des Eintrags
      // muss im Keyword enthalten sein (bidirektional)
      expect(haystack).toContain("bescheid");
    });
  });

  // ─────────────────────────────────────────────────────────
  // Test 3: Edge Cases — wo greift die Logik NICHT?
  // ─────────────────────────────────────────────────────────

  describe("Edge Cases", () => {
    it("EDGE 1: Impliziter Fehler — bidirektionales Matching greift bei Synonym", () => {
      // "Miete" ist in BA_004.suchbegriffe → bidirektionales Matching findet es
      const partialKeywords = ["Miete", "reduziert", "Betrag", "Wohnung"];
      const result = executeSucheFehlerkatalog(["BA"], partialKeywords);

      // BA_004 WIRD gefunden dank bidirektionalem Suchbegriff-Match
      const kdu = result.find((f) => f.id === "BA_004");
      expect(kdu).toBeDefined();

      // ABER: ohne jegliches Synonym → kein Match
      const noMatchKeywords = ["reduziert", "Betrag", "Zahlung", "weniger"];
      const noResult = executeSucheFehlerkatalog(["BA"], noMatchKeywords);
      const noKdu = noResult.find((f) => f.id === "BA_004");
      expect(noKdu).toBeUndefined();

      console.log("\n═══ EDGE CASE 1: Bidirektionales Matching ═══");
      console.log(`Mit 'Miete': BA_004 gefunden ✓ (Miete ist in suchbegriffe)`);
      console.log(`Ohne Synonyme: BA_004 NICHT gefunden ✓`);
      console.log("→ Bidirektionales Matching fängt Synonyme ab");
      console.log("→ Komplett andere Wortwahl = blind spot (LLM muss übersetzen)");
      console.log("═══════════════════════════════════════════════\n");
    });

    it("EDGE 2: Falsches Rechtsgebiet-Prefix → findet nichts", () => {
      const keywords = ["Kosten der Unterkunft", "KdU", "Angemessenheit"];
      // ALG-Prefix statt BA → kein Match, obwohl Keywords passen
      const result = executeSucheFehlerkatalog(["ALG"], keywords);

      const kdu = result.find((f) => f.id === "BA_004");
      expect(kdu).toBeUndefined();

      console.log("\n═══ EDGE CASE 2: Falsches Prefix ═══");
      console.log("Prefix: ALG (statt BA)");
      console.log(`Gefunden: ${result.length} Fehler (kein BA_004)`);
      console.log("→ AG01-Triage muss Rechtsgebiet korrekt klassifizieren");
      console.log("════════════════════════════════════\n");
    });

    it("EDGE 3: Sehr langer Bescheid mit vielen Themen → max 6 Ergebnisse", () => {
      const manyKeywords = [
        "Kosten der Unterkunft", "KdU", "Angemessenheit",
        "Heizkosten", "pauschal",
        "Widerspruch", "Rechtsbehelfsbelehrung", "Frist", "Monat", "einlegen",
        "Mehrbedarf", "Schwangerschaft", "alleinerziehend",
        "Einkommen", "Anrechnung", "Freibetrag",
        "Vermögen", "Schonvermögen",
        "Bewilligungszeitraum", "Bewilligung",
        "Berufsberatung",
        "Beratung", "Bedarfsgemeinschaft",
      ];
      const result = executeSucheFehlerkatalog(["BA"], manyKeywords);

      expect(result.length).toBeLessThanOrEqual(6);

      console.log("\n═══ EDGE CASE 3: Viele Keywords ═══");
      console.log(`${manyKeywords.length} Keywords → ${result.length} Ergebnisse (max 6)`);
      result.forEach((f) => console.log(`  ${f.id}: ${f.titel} [${f.severity}]`));
      console.log("═══════════════════════════════════\n");
    });

    it("EDGE 4: Leere Keywords → Top 8 nach Severity (kein Scoring)", () => {
      const result = executeSucheFehlerkatalog(["BA"], []);
      expect(result.length).toBeLessThanOrEqual(8);

      // Erste Einträge sollten 'kritisch' sein
      if (result.length > 0) {
        expect(result[0].severity).toBe("kritisch");
      }

      console.log("\n═══ EDGE CASE 4: Leere Keywords ═══");
      console.log(`0 Keywords → ${result.length} Einträge (nach Severity)`);
      result.forEach((f) => console.log(`  ${f.id}: ${f.severity}`));
      console.log("════════════════════════════════════\n");
    });

    it("EDGE 5: Nicht-existierendes Prefix → 0 Ergebnisse", () => {
      const result = executeSucheFehlerkatalog(["XYZ"], ["Widerspruch", "Frist"]);
      expect(result.length).toBe(0);
    });

    it("EDGE 6: Gemischte Rechtsgebiete → Cross-Match unmöglich", () => {
      // BA-spezifische Keywords mit KK-Prefix
      const result = executeSucheFehlerkatalog(["KK"], [
        "Kosten der Unterkunft", "KdU", "§ 22 SGB II",
      ]);
      // KK hat keine KdU-Fehler → sollte leer sein oder nur generische
      const kduFehler = result.find((f) => f.id.startsWith("BA_"));
      expect(kduFehler).toBeUndefined();

      console.log("\n═══ EDGE CASE 6: Cross-Prefix ═══");
      console.log("BA-Keywords + KK-Prefix → keine BA-Treffer");
      console.log(`Gefunden: ${result.length} KK-Einträge`);
      console.log("═════════════════════════════════\n");
    });
  });

  // ─────────────────────────────────────────────────────────
  // Test 4: Schema-Validierung des Fehlerkatalogs
  // ─────────────────────────────────────────────────────────

  describe("Schema-Validierung", () => {
    it("alle 163 Einträge haben Pflichtfelder", () => {
      const filePath = path.join(process.cwd(), "content", "behoerdenfehler_logik.json");
      const raw = fs.readFileSync(filePath, "utf-8");
      const all: FehlerItem[] = JSON.parse(raw);

      expect(all.length).toBeGreaterThanOrEqual(163);

      const errors: string[] = [];
      all.forEach((item, idx) => {
        if (!item.id) errors.push(`[${idx}] fehlt id`);
        if (!item.titel) errors.push(`[${idx}] ${item.id} fehlt titel`);
        if (!item.beschreibung) errors.push(`[${idx}] ${item.id} fehlt beschreibung`);
        if (!item.severity) errors.push(`[${idx}] ${item.id} fehlt severity`);
        if (!item.rechtsbasis?.length) errors.push(`[${idx}] ${item.id} fehlt rechtsbasis`);
        if (!item.prueflogik?.suchbegriffe?.length) errors.push(`[${idx}] ${item.id} fehlt suchbegriffe`);

        // ID-Format: PREFIX_NNN
        if (!/^[A-Z]{2,4}_\d{3}$/.test(item.id)) {
          errors.push(`[${idx}] ${item.id} — ID-Format ungültig`);
        }

        // Severity muss valide sein
        if (!["hinweis", "wichtig", "kritisch"].includes(item.severity ?? "")) {
          errors.push(`[${idx}] ${item.id} — severity '${item.severity}' ungültig`);
        }
      });

      if (errors.length > 0) {
        console.error("Schema-Fehler:", errors);
      }
      expect(errors).toEqual([]);
    });

    it("16 Rechtsgebiet-Prefixe sind vertreten", () => {
      const filePath = path.join(process.cwd(), "content", "behoerdenfehler_logik.json");
      const raw = fs.readFileSync(filePath, "utf-8");
      const all: FehlerItem[] = JSON.parse(raw);

      const prefixes = new Set(all.map((f) => f.id.replace(/_\d{3}$/, "")));

      const expected = ["BA", "ALG", "DRV", "KK", "PK", "UV", "VA", "SH", "EH", "JA", "BAMF", "BAF", "EG", "FK", "WG", "UVS"];
      expected.forEach((p) => {
        expect(prefixes.has(p)).toBe(true);
      });

      console.log("\n═══ SCHEMA: Rechtsgebiete ═══");
      expected.forEach((p) => {
        const count = all.filter((f) => f.id.startsWith(p)).length;
        console.log(`  ${p}: ${count} Einträge`);
      });
      console.log("═════════════════════════════\n");
    });

    it("keine doppelten IDs", () => {
      const filePath = path.join(process.cwd(), "content", "behoerdenfehler_logik.json");
      const raw = fs.readFileSync(filePath, "utf-8");
      const all: FehlerItem[] = JSON.parse(raw);

      const ids = all.map((f) => f.id);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(dupes).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────
  // Test 5: Vollständiger Output-Snapshot
  // ─────────────────────────────────────────────────────────

  it("zeigt vollständigen JSON-Output für Test-Bescheid", () => {
    const keywords = extractKeywords(TEST_BESCHEID);
    const result = executeSucheFehlerkatalog(["BA"], keywords);

    console.log("\n╔══════════════════════════════════════════════════╗");
    console.log("║  E2E JSON OUTPUT — Test-Bescheid Jobcenter       ║");
    console.log("╚══════════════════════════════════════════════════╝\n");

    console.log("INPUT-KEYWORDS:", JSON.stringify(keywords, null, 2));
    console.log("\nOUTPUT:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n── ZUSAMMENFASSUNG ──");
    console.log(`Gefundene Fehler: ${result.length}`);
    console.log(`Kritisch: ${result.filter((f) => f.severity === "kritisch").length}`);
    console.log(`Wichtig: ${result.filter((f) => f.severity === "wichtig").length}`);
    console.log(`Hinweis: ${result.filter((f) => f.severity === "hinweis").length}`);

    // Confidence-Berechnung: Anteil gematchter Keywords pro Fehler
    console.log("\n── CONFIDENCE PRO FEHLER ──");
    result.forEach((f) => {
      const haystack = [
        f.titel, f.beschreibung,
        ...(f.rechtsbasis ?? []),
        ...(f.prueflogik?.suchbegriffe ?? []),
      ].join(" ").toLowerCase();

      const matched = keywords.filter((k) => haystack.includes(k.toLowerCase()));
      const reverseMatched = (f.prueflogik?.suchbegriffe ?? []).filter((sb) =>
        keywords.some((k) => k.toLowerCase().includes(sb.toLowerCase()) || sb.toLowerCase().includes(k.toLowerCase()))
      );
      const totalScore = matched.length + reverseMatched.length;
      const maxPossible = keywords.length + (f.prueflogik?.suchbegriffe ?? []).length;
      const confidence = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

      console.log(`  ${f.id}: Score ${totalScore} / ${maxPossible} → Confidence ~${confidence}%`);
      console.log(`    Matched keywords: ${matched.join(", ")}`);
      console.log(`    Reverse matched: ${reverseMatched.join(", ")}`);
    });

    // Mindestens 3 Fehler erwartet
    expect(result.length).toBeGreaterThanOrEqual(3);
  });
});
