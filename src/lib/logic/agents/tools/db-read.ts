/**
 * Tool: db_read
 * Liest aus Supabase-Tabellen: urteile, kennzahlen, behoerdenfehler
 * Graceful Degradation: Falls Tabelle nicht existiert → { available: false, rows: [] }
 *
 * Caching: Wissensdaten (behoerdenfehler, kennzahlen, urteile) werden 5-15 Min
 * im In-Memory-Cache gehalten. analysis_results wird nie gecacht (user-spezifisch).
 */

import { createClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";
import { cached, invalidate, TTL_5MIN, TTL_15MIN } from "@/lib/cache";

export const TOOL_DB_READ: Anthropic.Tool = {
  name: "db_read",
  description:
    "Liest Daten aus der Wissensdatenbank (urteile, kennzahlen, behoerdenfehler, analysis_results). " +
    "Max 100 Zeilen pro Query. Gibt { available: false } zurück wenn Tabelle nicht existiert.",
  input_schema: {
    type: "object" as const,
    properties: {
      tabelle: {
        type: "string",
        enum: ["urteile", "kennzahlen", "behoerdenfehler", "analysis_results"],
        description: "Name der Tabelle",
      },
      filter: {
        type: "object",
        description: "Optionale Filter als Key-Value-Paare (z.B. { rechtsgebiet: 'SGB II' })",
      },
      limit: {
        type: "number",
        description: "Max. Anzahl Ergebnisse (default 20, max 100)",
      },
    },
    required: ["tabelle"],
  },
};

function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

// Wissensdaten-Tabellen die gecacht werden (ändern sich selten)
const CACHED_TABLES: Record<string, number> = {
  behoerdenfehler: TTL_5MIN,
  kennzahlen: TTL_15MIN,
  urteile: TTL_15MIN,
};

export async function executeDbRead(
  tabelle: string,
  filter?: Record<string, string>,
  limit?: number,
): Promise<{ available: boolean; rows: Record<string, unknown>[] }> {
  const allowed = ["urteile", "kennzahlen", "behoerdenfehler", "analysis_results"];
  if (!allowed.includes(tabelle)) {
    return { available: false, rows: [] };
  }

  const ttl = CACHED_TABLES[tabelle];
  const filterKey = filter && Object.keys(filter).length > 0
    ? `:${JSON.stringify(filter)}`
    : "";
  const cacheKey = `db:${tabelle}:${limit ?? 20}${filterKey}`;

  // Wissensdaten aus Cache holen (analysis_results nie cachen — user-spezifisch)
  if (ttl) {
    return cached(cacheKey, ttl, () => fetchFromDb(tabelle, filter, limit));
  }

  return fetchFromDb(tabelle, filter, limit);
}

async function fetchFromDb(
  tabelle: string,
  filter?: Record<string, string>,
  limit?: number,
): Promise<{ available: boolean; rows: Record<string, unknown>[] }> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return { available: false, rows: [] };
  }

  try {
    let query = supabase.from(tabelle).select("*").limit(Math.min(limit ?? 20, 100));

    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.warn(`[db_read] ${tabelle}: ${error.message}`);
      return { available: false, rows: [] };
    }

    return { available: true, rows: data ?? [] };
  } catch {
    return { available: false, rows: [] };
  }
}

/** Cache für eine Wissensdaten-Tabelle invalidieren (nach DB-Write aufrufen). */
export function invalidateTableCache(tabelle: string): void {
  // Alle Cache-Keys für diese Tabelle löschen
  invalidate(`db:${tabelle}:20`);
  invalidate(`db:${tabelle}:30`);
  invalidate(`db:${tabelle}:100`);
}
