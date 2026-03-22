/**
 * Einmal-Script: Generiert Embeddings fuer alle Urteile ohne Embedding.
 * Ausfuehrung: npx tsx scripts/backfill-embeddings.ts
 *
 * Nach Abschluss: IVFFlat-Index im Supabase SQL-Editor erstellen:
 *   CREATE INDEX IF NOT EXISTS urteile_embedding_idx
 *     ON urteile USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// .env.local laden
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// Vault-Fallback
function getKey(name: string): string | null {
  try {
    const vaultPath = path.join(process.cwd(), "vault", "keys.env");
    const content = fs.readFileSync(vaultPath, "utf8");
    const match = content.match(new RegExp(`${name}\\s*=\\s*["']?([^\\s"'\\n]+)`));
    if (match?.[1]) return match[1];
  } catch { /* vault nicht da */ }
  return process.env[name] || null;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = getKey("OPENAI_API_KEY");

  if (!supabaseUrl || !serviceKey) {
    console.error("SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY muessen gesetzt sein.");
    process.exit(1);
  }
  if (!openaiKey) {
    console.error("OPENAI_API_KEY muss gesetzt sein (env oder vault/keys.env).");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const openai = new OpenAI({ apiKey: openaiKey });

  // Urteile ohne Embedding laden
  const { data: urteile, error } = await supabase
    .from("urteile")
    .select("id, gericht, aktenzeichen, leitsatz, rechtsgebiet, stichwort")
    .is("embedding", null)
    .limit(1000);

  if (error) {
    console.error("Fehler beim Laden der Urteile:", error.message);
    process.exit(1);
  }

  if (!urteile || urteile.length === 0) {
    console.log("Keine Urteile ohne Embedding gefunden. Fertig.");
    return;
  }

  console.log(`${urteile.length} Urteile ohne Embedding gefunden. Starte Backfill...`);

  let success = 0;
  let failed = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < urteile.length; i += BATCH_SIZE) {
    const batch = urteile.slice(i, i + BATCH_SIZE);

    const texts = batch.map((u) => {
      const parts = [
        u.gericht ?? "",
        u.aktenzeichen ?? "",
        u.rechtsgebiet ?? "",
        u.leitsatz ?? "",
      ];
      if (Array.isArray(u.stichwort) && u.stichwort.length > 0) {
        parts.push(u.stichwort.join(", "));
      }
      return parts.filter(Boolean).join(" — ").slice(0, 8000);
    });

    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
      });

      for (let j = 0; j < batch.length; j++) {
        const embedding = response.data[j]?.embedding;
        if (!embedding) {
          failed++;
          continue;
        }

        const { error: updateError } = await supabase
          .from("urteile")
          .update({ embedding: JSON.stringify(embedding) })
          .eq("id", batch[j].id);

        if (updateError) {
          console.error(`  Fehler bei ${batch[j].aktenzeichen}:`, updateError.message);
          failed++;
        } else {
          success++;
        }
      }

      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} verarbeitet (${success} ok, ${failed} fehlgeschlagen)`);
    } catch (err) {
      console.error(`  Batch-Fehler:`, err instanceof Error ? err.message : String(err));
      failed += batch.length;
    }

    // Rate-Limit: 100ms Pause zwischen Batches
    if (i + BATCH_SIZE < urteile.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  console.log(`\nBackfill abgeschlossen: ${success} Embeddings generiert, ${failed} fehlgeschlagen.`);
  console.log(`\nNaechster Schritt: IVFFlat-Index im Supabase SQL-Editor erstellen:`);
  console.log(`  CREATE INDEX IF NOT EXISTS urteile_embedding_idx`);
  console.log(`    ON urteile USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);`);
}

main().catch((err) => {
  console.error("Unerwarteter Fehler:", err);
  process.exit(1);
});
