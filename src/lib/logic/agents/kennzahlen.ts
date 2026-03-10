/**
 * Zentrale Kennzahlen für alle Agenten-Prompts.
 *
 * EINMAL IM JAHR AKTUALISIEREN (Januar) — alle Richtwerte an einer Stelle.
 * Quelle: gesetze-im-internet.de, BMAS-Bekanntmachungen, BGBl.
 *
 * Letzte Aktualisierung: 01.01.2026
 */

// ---------------------------------------------------------------------------
// Gültigkeitszeitraum
// ---------------------------------------------------------------------------
export const KENNZAHLEN_JAHR = 2026;

// ---------------------------------------------------------------------------
// SGB II — Regelbedarfsstufen (§ 20 SGB II i.V.m. RBEG)
// ---------------------------------------------------------------------------
export const REGELBEDARF = {
  RS1: 563, // Alleinstehend / Alleinerziehend
  RS2: 506, // Paare je Partner
  RS3: 451, // Erwachsene im Haushalt anderer
  RS4: 471, // Jugendliche 14–17
  RS5: 357, // Kinder 6–13
  RS6: 357, // Kinder 0–5
} as const;

// ---------------------------------------------------------------------------
// SGB II — Einkommensanrechnung (§ 11b SGB II)
// ---------------------------------------------------------------------------
export const EINKOMMENSANRECHNUNG = {
  grundfreibetrag: 100,
  erwerbstaetig_stufe1: { von: 100, bis: 520, prozent: 20 },
  erwerbstaetig_stufe2: { von: 520, bis: 1000, prozent: 30 },
  erwerbstaetig_stufe3_ohne_kinder: { von: 1000, bis: 1200, prozent: 10 },
  erwerbstaetig_stufe3_mit_kindern: { von: 1000, bis: 1500, prozent: 10 },
} as const;

// ---------------------------------------------------------------------------
// Kindergeld (§ 66 EStG / § 6 BKGG)
// ---------------------------------------------------------------------------
export const KINDERGELD_PRO_MONAT = 259;

// ---------------------------------------------------------------------------
// Prompt-Textblock für AG02 (und andere Agenten die Kennzahlen brauchen)
// ---------------------------------------------------------------------------
export function kennzahlenPromptBlock(): string {
  const r = REGELBEDARF;
  const e = EINKOMMENSANRECHNUNG;
  return [
    `• SGB II Regelbedarfsstufen ${KENNZAHLEN_JAHR}: RS1=${r.RS1}€, RS2=${r.RS2}€, RS3=${r.RS3}€, RS4=${r.RS4}€, RS5=${r.RS5}€, RS6=${r.RS6}€`,
    `• KdU: Wurde eine konkrete Angemessenheitsgrenze genannt und begründet?`,
    `• Einkommensanrechnung § 11b SGB II: Grundfreibetrag ${e.grundfreibetrag}€, Erwerbstätigenfreibetrag ${e.erwerbstaetig_stufe1.prozent}% von ${e.erwerbstaetig_stufe1.von}–${e.erwerbstaetig_stufe1.bis}€, ${e.erwerbstaetig_stufe2.prozent}% von ${e.erwerbstaetig_stufe2.von}–${e.erwerbstaetig_stufe2.bis}€, ${e.erwerbstaetig_stufe3_ohne_kinder.prozent}% von ${e.erwerbstaetig_stufe3_ohne_kinder.von}–${e.erwerbstaetig_stufe3_ohne_kinder.bis}€ (ohne Kinder) bzw. ${e.erwerbstaetig_stufe3_mit_kindern.von}–${e.erwerbstaetig_stufe3_mit_kindern.bis}€ (mit Kindern)`,
    `• Kindergeld: ${KINDERGELD_PRO_MONAT}€/Monat (${KENNZAHLEN_JAHR}) — wird es korrekt als Einkommen des Kindes behandelt?`,
    `• Überzahlungsberechnung: Ist sie nachvollziehbar und korrekt berechnet?`,
  ].join("\n");
}
