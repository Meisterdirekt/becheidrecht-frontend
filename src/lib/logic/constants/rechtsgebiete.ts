/**
 * Zentrale Rechtsgebiet-Konstanten und Validierung.
 *
 * Single Source of Truth für alle 16 Rechtsgebiete,
 * Träger-Zuordnung und SGB-Normalisierung.
 */

export const RECHTSGEBIETE = [
  "BA", "ALG", "DRV", "KK", "PK", "UV", "VA", "SH",
  "EH", "JA", "BAMF", "BAF", "EG", "FK", "WG", "UVS",
] as const;

export type Rechtsgebiet = (typeof RECHTSGEBIETE)[number];

export const RECHTSGEBIET_TRAEGER: Record<Rechtsgebiet, string> = {
  BA: "jobcenter",
  ALG: "arbeitsagentur",
  DRV: "drv",
  KK: "krankenkasse",
  PK: "pflegekasse",
  UV: "unfallversicherung",
  VA: "versorgungsamt",
  SH: "sozialhilfe",
  EH: "eingliederungshilfe",
  JA: "jugendamt",
  BAMF: "bamf",
  BAF: "bafoeg",
  EG: "elterngeld",
  FK: "familienkasse",
  WG: "wohngeld",
  UVS: "unterhaltsvorschuss",
};

/**
 * SGB-Notation normalisieren: "SGB II" → "SGB_II", "SGB_II" bleibt.
 */
export function normalizeSgb(input: string): string {
  return input.replace(/^(SGB)\s+/i, "$1_").toUpperCase();
}

/**
 * SGB-Code → Rechtsgebiet-Prefix Mapping.
 * z.B. "SGB_II" → "BA", "SGB_V" → "KK"
 */
export const SGB_TO_RECHTSGEBIET: Record<string, Rechtsgebiet> = {
  SGB_II: "BA",
  SGB_III: "ALG",
  SGB_V: "KK",
  SGB_VI: "DRV",
  SGB_IX: "EH",
  SGB_XI: "PK",
  SGB_XII: "SH",
  ASYL: "BAMF",
  BAFOEG: "BAF",
  KINDERGELD: "FK",
  WOHNGELD: "WG",
};

// ---------------------------------------------------------------------------
// Signalwörter pro Rechtsgebiet (Single Source of Truth für AG01-Triage)
// ---------------------------------------------------------------------------

export const SGB_SIGNAL_WORDS: Record<string, string[]> = {
  SGB_II: ["Bürgergeld", "Grundsicherungsgeld", "Jobcenter", "Regelbedarfsstufe", "KdU", "Kosten der Unterkunft", "Eingliederungsvereinbarung", "Bedarfsgemeinschaft"],
  SGB_III: ["Arbeitslosengeld", "Arbeitsagentur für Arbeit", "ALG I", "Sperrzeit", "Bemessungsentgelt", "Anwartschaftszeit"],
  SGB_V: ["Krankengeld", "Krankenkasse", "GKV", "Krankenversicherung", "Hilfsmittel", "Heilmittel", "Zuzahlung", "Wirtschaftlichkeitsgebot"],
  SGB_VI: ["Rente", "DRV", "Rentenversicherung", "Erwerbsminderung", "Erwerbsminderungsrente", "Altersrente", "Wartezeit", "Rentenwert", "Entgeltpunkte"],
  SGB_VII: ["Unfallversicherung", "Berufsgenossenschaft", "Unfallkasse", "Arbeitsunfall", "Wegeunfall", "Berufskrankheit", "Verletztengeld", "MdE"],
  SGB_VIII: ["Jugendamt", "Jugendhilfe", "Hilfe zur Erziehung", "Inobhutnahme", "Eingliederungshilfe für Kinder", "Kindertagesbetreuung"],
  SGB_IX: ["Eingliederungshilfe", "Schwerbehinderung", "Behinderung", "Teilhabe", "Persönliches Budget", "GdB", "Merkzeichen"],
  SGB_XI: ["Pflegegeld", "Pflegegrad", "Pflegekasse", "Pflegesachleistung", "Verhinderungspflege", "Kurzzeitpflege", "Pflegebedürftigkeit"],
  SGB_XII: ["Grundsicherung", "Sozialhilfe", "Sozialamt", "Grundsicherung im Alter", "Hilfe zum Lebensunterhalt"],
  ASYL: ["Asyl", "BAMF", "Aufenthaltsgestattung", "AsylbLG", "Aufenthaltserlaubnis", "Duldung", "Flüchtlingsanerkennung"],
  BAFOEG: ["BAföG", "Bildungsförderung", "Ausbildungsförderung", "Studierendenwerk"],
  BEEG: ["Elterngeld", "ElterngeldPlus", "Elterngeldstelle", "Partnerschaftsbonus", "BEEG"],
  KINDERGELD: ["Kindergeld", "Familienkasse", "Kinderzuschlag", "BKGG"],
  WOHNGELD: ["Wohngeld", "Wohngeldbehörde", "Wohngeldbescheid", "Mietzuschuss", "Lastenzuschuss"],
  UVG: ["Unterhaltsvorschuss", "Unterhaltsvorschussgesetz", "UVG", "Unterhaltsvorschusskasse"],
};

// ---------------------------------------------------------------------------
// Formelle Prüfnormen SGB X (Single Source of Truth für AG02)
// ---------------------------------------------------------------------------

export const FORMELLE_NORMEN = {
  begruendung: { norm: "§ 35 SGB X", pflicht: "bei belastenden Bescheiden" },
  anhoerung: { norm: "§ 24 SGB X", pflicht: "vor erstmaligem belastendem Bescheid" },
  rechtsbehelfsbelehrung: { norm: "§ 36 SGB X", pflicht: "bei allen Bescheiden" },
  aufhebung_45: { norm: "§ 45 SGB X", beschreibung: "Rücknahme rechtswidriger begünstigender VA" },
  aufhebung_48: { norm: "§ 48 SGB X", beschreibung: "Aufhebung bei Änderung der Verhältnisse" },
  ueberpruefung: { norm: "§ 44 SGB X", beschreibung: "Rücknahme rechtswidriger nicht begünstigender VA: Soweit Recht unrichtig angewandt oder falscher Sachverhalt zugrunde gelegt wurde und Sozialleistungen zu Unrecht nicht erbracht wurden, ist der VA auch nach Bestandskraft zurückzunehmen (Abs. 1). Nachzahlung rückwirkend, begrenzt auf 4 Jahre vor Antragstellung (Abs. 4). Kein Ermessen — gebundene Entscheidung. Quelle: gesetze-im-internet.de/sgb_10/__44.html" },
  klagefrist: { norm: "§ 87 SGG", beschreibung: "1 Monat nach Zustellung des Widerspruchsbescheids" },
  widerspruchsfrist: { norm: "§ 84 SGG", beschreibung: "1 Monat ab Bekanntgabe" },
  bekanntgabe: { norm: "§ 37 Abs. 2 SGB X", beschreibung: "Bescheiddatum + 3 Tage Postlaufzeit" },
} as const;

export type FormelleNorm = keyof typeof FORMELLE_NORMEN;

// ---------------------------------------------------------------------------
// Helper: Signalwörter-Block für Prompts generieren
// ---------------------------------------------------------------------------

export function signalwoerterPromptBlock(): string {
  return Object.entries(SGB_SIGNAL_WORDS)
    .map(([sgb, words]) => `• ${words.map(w => `"${w}"`).join(" / ")} → ${sgb.replace("_", " ")}`)
    .join("\n");
}

export function formelleNormenPromptBlock(): string {
  return [
    `• Begründung vorhanden? (${FORMELLE_NORMEN.begruendung.norm} — ${FORMELLE_NORMEN.begruendung.pflicht})`,
    `• Anhörung durchgeführt? (${FORMELLE_NORMEN.anhoerung.norm} — ${FORMELLE_NORMEN.anhoerung.pflicht})`,
    `• Rechtsbehelfsbelehrung vorhanden und korrekt? (${FORMELLE_NORMEN.rechtsbehelfsbelehrung.norm})`,
    `• Aktenzeichen vorhanden?`,
    `• Bei Aufhebungsbescheiden: Welche Ermächtigungsgrundlage? (${FORMELLE_NORMEN.aufhebung_45.norm} oder ${FORMELLE_NORMEN.aufhebung_48.norm}?)`,
    `• Überprüfungsantrag möglich? (${FORMELLE_NORMEN.ueberpruefung.norm} — ${FORMELLE_NORMEN.ueberpruefung.beschreibung})`,
    `• Klagefrist beachten: ${FORMELLE_NORMEN.klagefrist.beschreibung} (${FORMELLE_NORMEN.klagefrist.norm})`,
  ].join("\n");
}

const RECHTSGEBIET_SET = new Set<string>(RECHTSGEBIETE);

/**
 * Prüft ob ein String ein gültiges Rechtsgebiet ist.
 */
export function isValidRechtsgebiet(code: string | null | undefined): code is Rechtsgebiet {
  return typeof code === "string" && RECHTSGEBIET_SET.has(code);
}
