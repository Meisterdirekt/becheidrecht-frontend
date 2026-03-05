/**
 * Träger (Behörden) und Schreibentypen für den Schreiben-Generator.
 * Schreibentypen sind für alle Träger gleich; ggf. später pro Träger filtern.
 */

export const TRAEGER_OPTIONS = [
  { value: "jobcenter", label: "Jobcenter / Agentur für Arbeit (SGB II/III)" },
  { value: "drv", label: "Deutsche Rentenversicherung" },
  { value: "krankenkasse", label: "Krankenkasse (GKV)" },
  { value: "pflegekasse", label: "Pflegekasse" },
  { value: "sozialhilfe", label: "Sozialhilfe / Grundsicherung (SGB XII)" },
  { value: "familienkasse", label: "Familienkasse (Kindergeld)" },
  { value: "jugendamt", label: "Jugendamt (SGB VIII)" },
  { value: "eingliederungshilfe", label: "Eingliederungshilfe (SGB IX)" },
  { value: "unfallversicherung", label: "Unfallversicherung (SGB VII)" },
  { value: "versorgungsamt", label: "Versorgungsamt (Schwerbehinderung)" },
  { value: "bamf", label: "BAMF / Ausländerbehörde" },
  { value: "bafoeg", label: "BAföG-Amt (Ausbildungsförderung)" },
  { value: "elterngeld", label: "Elterngeldstelle" },
  { value: "wohngeld", label: "Wohngeldstelle" },
  { value: "unterhaltsvorschuss", label: "Unterhaltsvorschuss-Stelle" },
] as const;

export const SCHREIBENTYP_OPTIONS = [
  { value: "widerspruch", label: "Widerspruch gegen Bescheid" },
  { value: "erstantrag", label: "Erstantrag stellen" },
  { value: "aenderungsantrag", label: "Änderungsantrag / Höherstufung (z. B. Pflegegrad)" },
  { value: "untaetigkeit", label: "Untätigkeitsklage androhen" },
  { value: "akteneinsicht", label: "Akteneinsicht beantragen" },
  { value: "fristverlaengerung", label: "Fristverlängerung beantragen" },
  { value: "beschwerde", label: "Beschwerde einlegen" },
] as const;

/** Mapping Träger value -> Präfixe in behoerdenfehler_logik.json (id start) */
export const TRAEGER_TO_PREFIX: Record<string, string[]> = {
  jobcenter: ["BA_", "ALG_"],
  drv: ["DRV_"],
  krankenkasse: ["KK_"],
  pflegekasse: ["PK_"],
  sozialhilfe: ["SH_"],
  familienkasse: ["FK_"],
  jugendamt: ["JA_"],
  eingliederungshilfe: ["EH_"],
  unfallversicherung: ["UV_"],
  versorgungsamt: ["VA_"],
  bamf: ["BAMF_"],
  bafoeg: ["BAF_"],
  elterngeld: ["EG_"],
  wohngeld: ["WG_"],
  unterhaltsvorschuss: ["UVS_"],
};

export function getTraegerLabel(value: string): string {
  return TRAEGER_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getSchreibentypLabel(value: string): string {
  return SCHREIBENTYP_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
