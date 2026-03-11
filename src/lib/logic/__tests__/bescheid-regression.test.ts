/**
 * Regressionstests: Fehlerkatalog-Suche gegen Test-Bescheide mit Ground-Truth.
 *
 * Testet NICHT die LLM-Agenten (deterministisch unmöglich),
 * sondern ob die Fehlerkatalog-Suche bei korrekten Stichwörtern
 * die erwarteten Fehler findet.
 */

import { describe, it, expect } from "vitest";
import { executeSucheFehlerkatalog } from "../agents/tools/fehlerkatalog";
import { TEST_BESCHEIDE } from "./test-bescheide";

describe("Fehlerkatalog-Regression: Top-5 Rechtsgebiete", () => {
  for (const bescheid of TEST_BESCHEIDE) {
    it(`${bescheid.name} → findet ${bescheid.erwartete_fehler_ids.join(", ")}`, () => {
      const ergebnisse = executeSucheFehlerkatalog(
        bescheid.prefixes,
        bescheid.erwartete_stichworte
      );

      const gefundeneIds = ergebnisse.map((e) => e.id);

      for (const erwartetId of bescheid.erwartete_fehler_ids) {
        expect(
          gefundeneIds,
          `Fehler ${erwartetId} nicht gefunden bei "${bescheid.name}". ` +
            `Gefunden: [${gefundeneIds.join(", ")}]. ` +
            `Stichworte: [${bescheid.erwartete_stichworte.join(", ")}]`
        ).toContain(erwartetId);
      }
    });

    it(`${bescheid.name} → Severity mindestens "${bescheid.min_severity}"`, () => {
      const ergebnisse = executeSucheFehlerkatalog(
        bescheid.prefixes,
        bescheid.erwartete_stichworte
      );

      const severityOrder: Record<string, number> = {
        hinweis: 0,
        wichtig: 1,
        kritisch: 2,
      };

      const minRequired = severityOrder[bescheid.min_severity];

      // Mindestens ein Treffer muss die erwartete Severity haben
      const hatErwarteteSeverity = ergebnisse.some(
        (e) => (severityOrder[e.severity ?? "hinweis"] ?? 0) >= minRequired
      );

      expect(
        hatErwarteteSeverity,
        `Kein Treffer mit Severity >= "${bescheid.min_severity}" bei "${bescheid.name}"`
      ).toBe(true);
    });
  }

  it("Alle 15 Test-Bescheide sind definiert", () => {
    expect(TEST_BESCHEIDE.length).toBe(15);
  });

  it("Jeder Test-Bescheid hat mindestens eine erwartete Fehler-ID", () => {
    for (const b of TEST_BESCHEIDE) {
      expect(
        b.erwartete_fehler_ids.length,
        `${b.name} hat keine erwarteten Fehler-IDs`
      ).toBeGreaterThan(0);
    }
  });

  it("Keine doppelten Test-Namen", () => {
    const namen = TEST_BESCHEIDE.map((b) => b.name);
    expect(new Set(namen).size).toBe(namen.length);
  });
});
