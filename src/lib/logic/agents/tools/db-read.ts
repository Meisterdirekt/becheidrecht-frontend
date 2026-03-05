/**
 * Tool: db_read
 * Liest aus Supabase-Tabellen: urteile, kennzahlen, behoerdenfehler
 * Graceful Degradation: Falls Tabelle nicht existiert → { available: false, rows: [] }
 */

import { createClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";

export const TOOL_DB_READ: Anthropic.Tool = {
  name: "db_read",
  description:
    "Liest Daten aus der Wissensdatenbank (urteile, kennzahlen, behoerdenfehler). " +
    "Max 100 Zeilen pro Query. Gibt { available: false } zurück wenn Tabelle nicht existiert.",
  input_schema: {
    type: "object" as const,
    properties: {
      tabelle: {
        type: "string",
        enum: ["urteile", "kennzahlen", "behoerdenfehler"],
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

export async function executeDbRead(
  tabelle: string,
  filter?: Record<string, string>,
  limit?: number,
): Promise<{ available: boolean; rows: Record<string, unknown>[] }> {
  const allowed = ["urteile", "kennzahlen", "behoerdenfehler"];
  if (!allowed.includes(tabelle)) {
    return { available: false, rows: [] };
  }

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
      // Tabelle existiert möglicherweise nicht
      console.warn(`[db_read] ${tabelle}: ${error.message}`);
      return { available: false, rows: [] };
    }

    return { available: true, rows: data ?? [] };
  } catch {
    return { available: false, rows: [] };
  }
}
