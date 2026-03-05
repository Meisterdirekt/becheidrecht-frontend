/**
 * Tool: suche_fehlerkatalog
 * Migriert aus agent_engine.ts — durchsucht behoerdenfehler_logik.json
 */

import fs from "fs";
import path from "path";
import type { FehlerItem } from "../types";
import type Anthropic from "@anthropic-ai/sdk";

export const TOOL_SUCHE_FEHLERKATALOG: Anthropic.Tool = {
  name: "suche_fehlerkatalog",
  description:
    "Durchsucht den Fehlerkatalog nach typischen Behördenfehlern passend zum analysierten Bescheid. " +
    "Rufe dieses Tool nach der Klassifizierung auf, um relevante Fehlertypen zu finden.",
  input_schema: {
    type: "object" as const,
    properties: {
      stichworten: {
        type: "array",
        items: { type: "string" },
        description:
          "2-6 Schlüsselwörter aus dem Bescheid (z.B. ['Kosten der Unterkunft', 'KdU', 'Angemessenheit'])",
      },
    },
    required: ["stichworten"],
  },
};

export function executeSucheFehlerkatalog(
  prefixes: string[],
  stichworten: string[]
): FehlerItem[] {
  try {
    const filePath = path.join(process.cwd(), "content", "behoerdenfehler_logik.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const all = JSON.parse(raw) as FehlerItem[];

    const byPrefix =
      prefixes.length > 0
        ? all.filter((item) => prefixes.some((p) => item.id.startsWith(p)))
        : all;

    if (stichworten.length === 0) {
      const order: Record<string, number> = { kritisch: 0, wichtig: 1, hinweis: 2 };
      return byPrefix
        .sort(
          (a, b) =>
            (order[a.severity ?? "hinweis"] ?? 2) -
            (order[b.severity ?? "hinweis"] ?? 2)
        )
        .slice(0, 8);
    }

    const severityOrder: Record<string, number> = {
      kritisch: 100,
      wichtig: 50,
      hinweis: 0,
    };

    return byPrefix
      .map((item) => {
        const haystack = [
          item.titel,
          item.beschreibung,
          ...(item.musterschreiben_hinweis ? [item.musterschreiben_hinweis] : []),
          ...(item.rechtsbasis ?? []),
        ]
          .join(" ")
          .toLowerCase();
        const score = stichworten.filter((s) =>
          haystack.includes(s.toLowerCase())
        ).length;
        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort(
        (a, b) =>
          b.score +
          (severityOrder[b.item.severity ?? "hinweis"] ?? 0) -
          (a.score + (severityOrder[a.item.severity ?? "hinweis"] ?? 0))
      )
      .slice(0, 8)
      .map(({ item }) => item);
  } catch {
    return [];
  }
}
