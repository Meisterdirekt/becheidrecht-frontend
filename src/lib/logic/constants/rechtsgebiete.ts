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
  SGB_II: ["Bürgergeld", "Grundsicherungsgeld", "Jobcenter", "Regelbedarfsstufe", "KdU"],
  SGB_III: ["Arbeitslosengeld", "Arbeitsagentur für Arbeit", "ALG I"],
  SGB_V: ["Krankengeld", "Krankenkasse", "GKV", "Krankenversicherung"],
  SGB_XI: ["Pflegegeld", "Pflegegrad", "Pflegekasse"],
  SGB_VI: ["Rente", "DRV", "Rentenversicherung", "Erwerbsminderung"],
  SGB_XII: ["Grundsicherung", "Sozialhilfe", "Sozialamt"],
  SGB_IX: ["Eingliederungshilfe", "Schwerbehinderung", "Behinderung"],
  ASYL: ["Asyl", "BAMF", "Aufenthaltsgestattung", "AsylbLG"],
  BAFOEG: ["BAföG", "Bildungsförderung"],
  WOHNGELD: ["Wohngeld", "Wohngeldbehörde"],
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
  ueberpruefung: { norm: "§ 44 SGB X", beschreibung: "Überprüfungsantrag bei bestandskräftigen Bescheiden, keine Frist" },
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
