/**
 * Tool: db_write
 * Schreibt in Supabase — NUR für AG05 (Wissens-Verwalter).
 * Jeder Schreibvorgang wird automatisch im update_protokoll geloggt (Audit-Trail).
 */

import { createClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";
import { invalidateTableCache } from "./db-read";

export const TOOL_DB_WRITE: Anthropic.Tool = {
  name: "db_write",
  description:
    "Schreibt Daten in die Wissensdatenbank (urteile, kennzahlen, behoerdenfehler). " +
    "NUR für AG05 (Wissens-Verwalter). Automatischer Audit-Trail.",
  input_schema: {
    type: "object" as const,
    properties: {
      tabelle: {
        type: "string",
        enum: ["urteile", "kennzahlen", "behoerdenfehler"],
        description: "Ziel-Tabelle",
      },
      daten: {
        type: "object",
        description: "Die zu schreibenden Daten",
      },
      aktion: {
        type: "string",
        enum: ["insert", "upsert"],
        description: "insert = neuer Eintrag, upsert = aktualisieren falls vorhanden",
      },
    },
    required: ["tabelle", "daten", "aktion"],
  },
};

function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

export async function executeDbWrite(
  tabelle: string,
  daten: Record<string, unknown>,
  aktion: "insert" | "upsert",
): Promise<{ success: boolean; error?: string }> {
  const allowed = ["urteile", "kennzahlen", "behoerdenfehler"];
  if (!allowed.includes(tabelle)) {
    return { success: false, error: `Tabelle '${tabelle}' nicht erlaubt.` };
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return { success: false, error: "Supabase Service-Client nicht verfügbar." };
  }

  try {
    // Audit-Trail: Schreibvorgang protokollieren (nicht blockierend)
    try {
      const { error: auditError } = await supabase.from("update_protokoll").insert({
        tabelle,
        aktion,
        daten: JSON.stringify(daten),
        agent: "AG05",
        zeitpunkt: new Date().toISOString(),
      });
      if (auditError) {
        console.warn(`[db_write] Audit-Trail Fehler: ${auditError.message}`);
      }
    } catch (auditErr) {
      console.warn(`[db_write] Audit-Trail nicht verfügbar:`, auditErr);
    }

    if (aktion === "upsert") {
      const { error } = await supabase.from(tabelle).upsert(daten);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from(tabelle).insert(daten);
      if (error) return { success: false, error: error.message };
    }

    // Cache invalidieren nach erfolgreichem Write
    invalidateTableCache(tabelle);

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
