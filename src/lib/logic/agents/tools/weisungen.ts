/**
 * Tool: get_weisungen
 * Migriert aus agent_engine.ts — lädt BA-Weisungen und andere Träger-Weisungen.
 * Unterstützt alle Träger via flexibles Key-Matching.
 */

import fs from "fs";
import path from "path";
import type Anthropic from "@anthropic-ai/sdk";

export const TOOL_GET_WEISUNGEN: Anthropic.Tool = {
  name: "get_weisungen",
  description:
    "Gibt aktuelle Fachliche Weisungen für den Bescheid-Träger zurück. " +
    "Aufrufen wenn bekannt ist um welchen Träger es sich handelt (SGB II/III, DRV, etc.).",
  input_schema: {
    type: "object" as const,
    properties: {
      traeger: {
        type: "string",
        description:
          "Träger-Schlüssel: 'jobcenter', 'arbeitsagentur', 'drv', 'krankenkasse', " +
          "'pflegekasse', 'sozialhilfe', 'familienkasse', 'jugendamt', 'eingliederungshilfe', " +
          "'unfallversicherung', 'versorgungsamt', 'bamf', 'bafoeg', 'elterngeld', 'wohngeld'",
      },
    },
    required: ["traeger"],
  },
};

// Mapping: Träger-Schlüssel → mögliche JSON-Keys (wird der Reihe nach versucht)
const TRAEGER_TO_JSON_KEYS: Record<string, string[]> = {
  jobcenter: ["bundesagentur_fuer_arbeit", "jobcenter", "sgb_ii", "sgb2"],
  arbeitsagentur: ["bundesagentur_fuer_arbeit", "arbeitsagentur", "sgb_iii", "sgb3"],
  drv: ["deutsche_rentenversicherung", "drv", "rentenversicherung", "sgb_vi", "sgb6"],
  krankenkasse: ["gesetzliche_krankenversicherung", "krankenkasse", "gkv", "sgb_v", "sgb5"],
  pflegekasse: ["pflegekasse", "pflegeversicherung", "sgb_xi", "sgb11"],
  sozialhilfe: ["sozialamt", "sozialhilfe", "sgb_xii", "sgb12"],
  familienkasse: ["familienkasse", "kindergeld", "bzkg"],
  jugendamt: ["jugendamt", "jugendhilfe", "sgb_viii", "sgb8"],
  eingliederungshilfe: ["eingliederungshilfe", "sgb_ix_teil2", "sgb9"],
  unfallversicherung: ["unfallversicherung", "berufsgenossenschaft", "sgb_vii", "sgb7"],
  versorgungsamt: ["versorgungsamt", "schwerbehinderung", "versorgung"],
  bamf: ["bamf", "bundesamt_fuer_migration", "asyl"],
  bafoeg: ["bafoeg", "ausbildungsfoerderung", "studierendenwerk"],
  elterngeld: ["elterngeld", "elterngeldstelle", "beeg"],
  wohngeld: ["wohngeld", "wohngeldstelle"],
  unterhaltsvorschuss: ["unterhaltsvorschuss", "uvg", "jugendamt"],
};

interface WeisungEntry {
  thema?: string;
  gueltig_ab?: string;
  [key: string]: unknown;
}

export function executeGetWeisungen(traeger: string): string {
  try {
    const filePath = path.join(process.cwd(), "content", "weisungen_2025_2026.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as Record<string, Record<string, WeisungEntry>>;

    const possibleKeys = TRAEGER_TO_JSON_KEYS[traeger] ?? [traeger];

    for (const key of possibleKeys) {
      const section = data[key];
      if (!section || typeof section !== "object") continue;

      const entries = Object.entries(section)
        .filter(([k]) => !k.startsWith("_meta"))
        .slice(0, 8)
        .map(([id, w]) => `Weisung ${id}: ${w.thema ?? ""} (gültig ab ${w.gueltig_ab ?? "–"})`)
        .join("\n");

      if (entries.trim()) return entries;
    }

    return "Keine spezifischen Weisungen für diesen Träger in der Datenbasis verfügbar.";
  } catch {
    return "Weisungsdaten nicht verfügbar.";
  }
}
