/**
 * Zentrale Kennzahlen für alle Agenten-Prompts.
 *
 * EINMAL IM JAHR AKTUALISIEREN (Januar) — alle Richtwerte an einer Stelle.
 * Quelle: gesetze-im-internet.de, BMAS-Bekanntmachungen, BGBl.
 *
 * Letzte Aktualisierung: 11.03.2026 (Legal-Watchdog-Update)
 */

// ---------------------------------------------------------------------------
// Gültigkeitszeitraum
// ---------------------------------------------------------------------------
export const KENNZAHLEN_JAHR = 2026;

// ---------------------------------------------------------------------------
// SGB II — Regelbedarfsstufen (§ 20 SGB II i.V.m. RBEG)
// Nullrunde 2026: Besitzschutzregelung § 28a Abs. 5 SGB XII greift
// Quelle: https://www.bundesregierung.de/breg-de/aktuelles/nullrunde-buergergeld-2383676
// ACHTUNG: Ab 01.07.2026 Umbenennung "Bürgergeld" → "Grundsicherungsgeld"
// Quelle: https://www.bundestag.de/dokumente/textarchiv/2026/kw10-de-grundsicherung-1150460
// ---------------------------------------------------------------------------
export const REGELBEDARF = {
  RS1: 563, // Alleinstehend / Alleinerziehend (Nullrunde, rechnerisch wäre 557€)
  RS2: 506, // Paare je Partner
  RS3: 451, // Erwachsene im Haushalt anderer
  RS4: 471, // Jugendliche 14–17
  RS5: 390, // Kinder 6–13
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
// Quelle: https://www.arbeitsagentur.de/presse/2025-53-kindergeld-steigt-ab-januar-2026
// ---------------------------------------------------------------------------
export const KINDERGELD_PRO_MONAT = 259;
export const KINDERFREIBETRAG_JAHR = 9756; // § 32 Abs. 6 EStG

// ---------------------------------------------------------------------------
// Kinderzuschlag (§ 6a BKGG)
// ---------------------------------------------------------------------------
export const KINDERZUSCHLAG_MAX = 297; // EUR/Monat

// ---------------------------------------------------------------------------
// Mindestlohn & Minijob (ab 01.01.2026)
// Quelle: https://www.vdk.de/aktuelles/aktuelle-meldungen/artikel/neue-regelungen-sozialrecht-in-2026-minijob-rente-krankenkasse/
// ---------------------------------------------------------------------------
export const MINDESTLOHN_PRO_STUNDE = 13.90;
export const MINIJOB_GRENZE = 603; // EUR/Monat

// ---------------------------------------------------------------------------
// SGB V — Krankenkasse (2026)
// Quelle: https://www.krankenkassen.de/gesetzliche-krankenkassen/krankenkasse-beitrag/zusatzbeitrag/
// ---------------------------------------------------------------------------
export const GKV_ZUSATZBEITRAG_DURCHSCHNITT = 2.9; // Prozent
export const GKV_VERSICHERUNGSPFLICHTGRENZE = 77400; // EUR/Jahr (6.450€/Monat)
export const KINDERKRANKENGELD_TAGE = 15; // pro Kind, Alleinerziehende: 30

// ---------------------------------------------------------------------------
// SGB VI — Rente (2026)
// Quelle: https://rentenbescheid24.de/rentenerhoehung-2026-ist-amtlich-tabelle-zeigt-wie-stark-die-rente-ab-juli-steigt/
// ---------------------------------------------------------------------------
export const RENTENWERT_AKTUELL = 42.52; // EUR ab 01.07.2026 (+4,24%)
export const RENTENWERT_BIS_JUNI = 40.79; // EUR bis 30.06.2026
// Quelle: https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260305-rentenanpassung-2026.html
export const EM_RENTE_HINZUVERDIENST_VOLL = 20763.75; // EUR/Jahr (volle EM-Rente)
export const EM_RENTE_HINZUVERDIENST_TEIL = 41527.50; // EUR/Jahr (teilweise EM-Rente)

// ---------------------------------------------------------------------------
// SGB XI — Pflege (2026)
// Pflegegeld unverändert gegenüber 2025
// ---------------------------------------------------------------------------
export const PFLEGEGELD = {
  PG2: 347, PG3: 599, PG4: 800, PG5: 990,
} as const;
export const PFLEGE_SACHLEISTUNG = {
  PG2: 796, PG3: 1497, PG4: 1859, PG5: 2299,
} as const;
export const PFLEGE_VERHINDERUNG_KURZZEITPFLEGE_GESAMT = 3539; // § 42a SGB XI

// ---------------------------------------------------------------------------
// SGB IX — Eingliederungshilfe (2026)
// Quelle: https://www.gegen-hartz.de/news/schwerbehinderung-eingliederungshilfe-seit-01-01-2026-hoehere-freibetraege
// ---------------------------------------------------------------------------
export const EH_VERMOEGENSFREIGRENZE = 71190; // EUR (2025: 67.410€)
export const EH_EINKOMMENSFREIBETRAG_REF = 47460; // EUR Referenzwert

// ---------------------------------------------------------------------------
// BEEG — Elterngeld (2026)
// Quelle: https://www.buerger-geld.org/news/finanzen/elterngeld-2026-hoehe-anspruch-und-akutelle-aenderungen-in-diesem-jahr/
// ---------------------------------------------------------------------------
export const ELTERNGELD = {
  min: 300, max: 1800, prozent_min: 65, prozent_max: 67,
  einkommensgrenze_paar: 175000, // EUR (ab 01.01.2026, vorher 200.000€)
  einkommensgrenze_allein: 175000, // EUR (vereinheitlicht)
} as const;

// ---------------------------------------------------------------------------
// SGB III — Beitragsbemessungsgrenze (2026)
// Quelle: https://www.gegen-hartz.de/news/arbeitslosengeld-diese-aenderungen-ab-2026-sind-jetzt-wichtig
// ---------------------------------------------------------------------------
export const ALG_BEITRAGSBEMESSUNGSGRENZE = 101400; // EUR/Jahr (8.450€/Monat)

// ---------------------------------------------------------------------------
// Unterhaltsvorschuss (§ 2 UVG, 2026)
// Quelle: https://www.fokus-sozialrecht.de/mindestunterhalt-und-unterhaltsvorschuss-2026
// Mindestunterhalt (§ 1612a BGB) minus Kindergeld (259€) = UVG-Leistung
// ---------------------------------------------------------------------------
export const MINDESTUNTERHALT = {
  alter_0_5: 486, alter_6_11: 558, alter_12_17: 653,
} as const;
export const UNTERHALTSVORSCHUSS = {
  alter_0_5: 227, alter_6_11: 299, alter_12_17: 394,
} as const;

// ---------------------------------------------------------------------------
// SGB XIV — Soziales Entschädigungsrecht (seit 01.01.2024)
// Quelle: https://www.gesetze-im-internet.de/sgb_14/
// Ersetzt BVG, OEG. Monatliche Entschädigungszahlung nach Schädigungsfolgengrad.
// ---------------------------------------------------------------------------
export const ENTSCHAEDIGUNG_SGB_XIV = {
  /** Monatliche Entschädigungszahlung nach § 83-84 SGB XIV (2026) */
  grad_30: 440,   // EUR/Monat bei Schädigungsfolgengrad 30
  grad_40: 587,   // EUR/Monat bei Schädigungsfolgengrad 40
  grad_50: 733,   // EUR/Monat bei Schädigungsfolgengrad 50
  grad_60: 880,   // EUR/Monat bei Schädigungsfolgengrad 60
  grad_70: 1100,  // EUR/Monat bei Schädigungsfolgengrad 70
  grad_80: 1320,  // EUR/Monat bei Schädigungsfolgengrad 80
  grad_90: 1540,  // EUR/Monat bei Schädigungsfolgengrad 90
  grad_100: 1760, // EUR/Monat bei Schädigungsfolgengrad 100
  /** Schnelle Hilfen: max. Sitzungen Traumaambulanz */
  traumaambulanz_sitzungen: 15,
  /** Abfindung statt monatlicher Zahlung (§ 85 SGB XIV) möglich ab Grad 30 */
  abfindung_moeglich: true,
} as const;

// ---------------------------------------------------------------------------
// Prompt-Textblock für AG02 (und andere Agenten die Kennzahlen brauchen)
// ---------------------------------------------------------------------------
export function kennzahlenPromptBlock(): string {
  const r = REGELBEDARF;
  const e = EINKOMMENSANRECHNUNG;
  const p = PFLEGEGELD;
  const el = ELTERNGELD;
  return [
    `• SGB II Regelbedarfsstufen ${KENNZAHLEN_JAHR} (Nullrunde — Besitzschutz § 28a Abs. 5 SGB XII): RS1=${r.RS1}€, RS2=${r.RS2}€, RS3=${r.RS3}€, RS4=${r.RS4}€, RS5=${r.RS5}€, RS6=${r.RS6}€`,
    `• ACHTUNG: Ab 01.07.2026 wird "Bürgergeld" zu "Grundsicherungsgeld" umbenannt (13. SGB-II-ÄndG). Verschärfungen: Vermittlungsvorrang, Sanktionen bis 30% direkt (Arbeitsverweigerung bis 100%), Karenzzeit entfällt, altersabhängige Vermögensfreibeträge statt pauschal 15.000€. Bescheide vor/nach Stichtag beachten!`,
    `• KdU: Wurde eine konkrete Angemessenheitsgrenze genannt und begründet?`,
    `• Einkommensanrechnung § 11b SGB II: Grundfreibetrag ${e.grundfreibetrag}€, Erwerbstätigenfreibetrag ${e.erwerbstaetig_stufe1.prozent}% von ${e.erwerbstaetig_stufe1.von}–${e.erwerbstaetig_stufe1.bis}€, ${e.erwerbstaetig_stufe2.prozent}% von ${e.erwerbstaetig_stufe2.von}–${e.erwerbstaetig_stufe2.bis}€, ${e.erwerbstaetig_stufe3_ohne_kinder.prozent}% von ${e.erwerbstaetig_stufe3_ohne_kinder.von}–${e.erwerbstaetig_stufe3_ohne_kinder.bis}€ (ohne Kinder) bzw. ${e.erwerbstaetig_stufe3_mit_kindern.von}–${e.erwerbstaetig_stufe3_mit_kindern.bis}€ (mit Kindern)`,
    `• Mindestlohn: ${MINDESTLOHN_PRO_STUNDE}€/Std., Minijob-Grenze: ${MINIJOB_GRENZE}€/Monat — relevant für Freibeträge`,
    `• Kindergeld: ${KINDERGELD_PRO_MONAT}€/Monat (${KENNZAHLEN_JAHR}), Kinderzuschlag max. ${KINDERZUSCHLAG_MAX}€ — wird Kindergeld korrekt als Einkommen des Kindes behandelt?`,
    `• SGB V: Durchschnittlicher Zusatzbeitrag ${GKV_ZUSATZBEITRAG_DURCHSCHNITT}% (Spanne 2,18–4,39%). Versicherungspflichtgrenze: ${GKV_VERSICHERUNGSPFLICHTGRENZE}€/Jahr (6.450€/Monat). Kinderkrankengeld: ${KINDERKRANKENGELD_TAGE} Tage/Kind (Alleinerz.: 30)`,
    `• SGB VI Rente: Aktueller Rentenwert ab 01.07.2026 = ${RENTENWERT_AKTUELL}€ (+4,24%), davor ${RENTENWERT_BIS_JUNI}€. Hinzuverdienst EM-Rente: voll ${EM_RENTE_HINZUVERDIENST_VOLL}€/Jahr, teilweise ${EM_RENTE_HINZUVERDIENST_TEIL}€/Jahr`,
    `• SGB XI Pflegegeld: PG2=${p.PG2}€, PG3=${p.PG3}€, PG4=${p.PG4}€, PG5=${p.PG5}€. Verhinderung+Kurzzeitpflege gesamt: ${PFLEGE_VERHINDERUNG_KURZZEITPFLEGE_GESAMT}€`,
    `• SGB IX Eingliederungshilfe: Vermögensfreigrenze ${EH_VERMOEGENSFREIGRENZE}€ (2025: 67.410€)`,
    `• Elterngeld: ${el.min}–${el.max}€, Einkommensgrenze einheitlich ${el.einkommensgrenze_paar}€ (vorher 200.000€ Paare). Max. 1 Monat Parallelbezug Basiselterngeld`,
    `• Unterhaltsvorschuss (§ 2 UVG = Mindestunterhalt minus Kindergeld): 0–5J=${UNTERHALTSVORSCHUSS.alter_0_5}€ (Mindestunterhalt ${MINDESTUNTERHALT.alter_0_5}€), 6–11J=${UNTERHALTSVORSCHUSS.alter_6_11}€ (${MINDESTUNTERHALT.alter_6_11}€), 12–17J=${UNTERHALTSVORSCHUSS.alter_12_17}€ (${MINDESTUNTERHALT.alter_12_17}€)`,
    `• Überzahlungsberechnung: Ist sie nachvollziehbar und korrekt berechnet?`,
    `• SGB XIV Entschädigung (seit 01.01.2024, ersetzt BVG/OEG): Monatliche Entschädigungszahlung nach Schädigungsfolgengrad: Grad 30=${ENTSCHAEDIGUNG_SGB_XIV.grad_30}€, 50=${ENTSCHAEDIGUNG_SGB_XIV.grad_50}€, 70=${ENTSCHAEDIGUNG_SGB_XIV.grad_70}€, 100=${ENTSCHAEDIGUNG_SGB_XIV.grad_100}€. Schnelle Hilfen (Traumaambulanz max. ${ENTSCHAEDIGUNG_SGB_XIV.traumaambulanz_sitzungen} Sitzungen) ohne Antrag. Übergang BVG/OEG→SGB XIV: Wahlrecht für Altfälle (§§ 152-153 SGB XIV)`,
  ].join("\n");
}
