/**
 * Tool: suche_fehlerkatalog
 * Migriert aus agent_engine.ts — durchsucht behoerdenfehler_logik.json
 */

import fs from "fs";
import path from "path";
import type { FehlerItem } from "../types";
import type Anthropic from "@anthropic-ai/sdk";
import { executeDbRead } from "./db-read";

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

/**
 * Erweiterte Version: Statische JSON + dynamische DB-Einträge (von AG15 hinzugefügt).
 * Statische Einträge haben Vorrang bei id-Kollisionen.
 */
export async function executeSucheFehlerkatalogMitDb(
  prefixes: string[],
  stichworten: string[]
): Promise<FehlerItem[]> {
  // Statische Einträge (core, immer verfügbar)
  const staticFehler = executeSucheFehlerkatalog(prefixes, stichworten);
  const staticIds = new Set(staticFehler.map(f => f.id));

  try {
    // Dynamische Einträge aus DB (von AG15 hinzugefügt)
    const dbResult = await executeDbRead("behoerdenfehler", {}, 30);
    if (!dbResult.available || dbResult.rows.length === 0) return staticFehler;

    const dbFehler: FehlerItem[] = dbResult.rows
      .filter(r => !staticIds.has(String(r.fehler_id ?? "")))
      .map(r => ({
        id: String(r.fehler_id ?? ""),
        titel: String(r.titel ?? ""),
        beschreibung: String(r.beschreibung ?? ""),
        rechtsbasis: Array.isArray(r.rechtsbasis) ? r.rechtsbasis.map(String) : [],
        severity: (r.severity as FehlerItem["severity"]) ?? "hinweis",
        musterschreiben_hinweis: r.musterschreiben_hinweis ? String(r.musterschreiben_hinweis) : undefined,
      }))
      .filter(f => f.id && f.titel);

    // Stichwort-Filter auf DB-Einträge anwenden
    const lowerStichworte = stichworten.map(s => s.toLowerCase());
    const filteredDbFehler = stichworten.length > 0
      ? dbFehler.filter(f => {
          const haystack = [f.titel, f.beschreibung, ...(f.rechtsbasis ?? []), ...(f.prueflogik?.suchbegriffe ?? [])].join(" ").toLowerCase();
          return lowerStichworte.some(s => haystack.includes(s));
        })
      : dbFehler.slice(0, 5);

    // Merge: statische zuerst, dann dynamische — max 10 gesamt
    return [...staticFehler, ...filteredDbFehler].slice(0, 10);
  } catch {
    return staticFehler;
  }
}

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

    const scored = byPrefix
      .map((item) => {
        const haystack = [
          item.titel,
          item.beschreibung,
          ...(item.musterschreiben_hinweis ? [item.musterschreiben_hinweis] : []),
          ...(item.rechtsbasis ?? []),
          ...(item.prueflogik?.suchbegriffe ?? []),
        ]
          .join(" ")
          .toLowerCase();
        const score = stichworten.filter((s) =>
          haystack.includes(s.toLowerCase())
        ).length;
        // Bonus: Prüfe ob Suchbegriffe des Fehlers im Input vorkommen (bidirektional)
        const reverseScore = (item.prueflogik?.suchbegriffe ?? []).filter((sb) =>
          stichworten.some((s) => s.toLowerCase().includes(sb.toLowerCase()) || sb.toLowerCase().includes(s.toLowerCase()))
        ).length;
        return { item, score: score + reverseScore };
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

    // Fallback: Bei 0 Stichwort-Treffern → Top-Fehler nach Severity liefern
    if (scored.length === 0 && byPrefix.length > 0) {
      console.warn("[Fehlerkatalog] 0 Stichwort-Treffer, Fallback auf Top-Severity");
      const order: Record<string, number> = { kritisch: 0, wichtig: 1, hinweis: 2 };
      return byPrefix
        .sort((a, b) => (order[a.severity ?? "hinweis"] ?? 2) - (order[b.severity ?? "hinweis"] ?? 2))
        .slice(0, 5);
    }

    return scored;
  } catch (err) {
    console.error("[Fehlerkatalog] JSON-Laden fehlgeschlagen:", err instanceof Error ? err.message : err);
    return [];
  }
}
