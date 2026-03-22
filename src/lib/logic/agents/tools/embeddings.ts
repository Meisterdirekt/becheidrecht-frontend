/**
 * Embedding-Utility fuer semantische Suche
 * Nutzt OpenAI text-embedding-3-small (1536 Dimensionen)
 *
 * Graceful Degradation: Ohne OPENAI_API_KEY → null (Fallback auf Keyword-Suche)
 * Kosten: ~$0.00002 pro Embedding (~$0.001 pro Analyse)
 */

import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";

// Vault-Fallback fuer lokale Entwicklung (gleicher Mechanismus wie in utils.ts)
function getOpenAIKey(): string | null {
  // Vault-Fallback
  try {
    const vaultPath = path.join(process.cwd(), "vault", "keys.env");
    const content = fs.readFileSync(vaultPath, "utf8") as string;
    const match = content.match(/OPENAI_API_KEY\s*=\s*["']?([^\s"'\n]+)/);
    if (match?.[1]) return match[1];
  } catch {
    // Vault nicht vorhanden (z.B. auf Vercel)
  }
  return process.env.OPENAI_API_KEY || null;
}

/**
 * Generiert ein Embedding fuer den gegebenen Text.
 * @returns number[] mit 1536 Dimensionen, oder null wenn kein API-Key.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = getOpenAIKey();
  if (!apiKey) return null;

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000), // Max Input-Laenge
    });
    return response.data[0].embedding;
  } catch {
    return null; // Graceful degradation
  }
}

/**
 * Baut den Embedding-Text fuer ein Urteil zusammen.
 * Kombiniert die relevantesten Felder fuer semantische Suche.
 */
export function buildUrteilEmbeddingText(urteil: {
  gericht: string;
  aktenzeichen: string;
  leitsatz: string;
  rechtsgebiet?: string;
  stichwort?: string[];
}): string {
  const parts = [
    urteil.gericht,
    urteil.aktenzeichen,
    urteil.rechtsgebiet ?? "",
    urteil.leitsatz,
  ];
  if (urteil.stichwort?.length) {
    parts.push(urteil.stichwort.join(", "));
  }
  return parts.filter(Boolean).join(" — ");
}

/**
 * Baut den Embedding-Text fuer einen Fehlerkatalog-Eintrag.
 */
export function buildFehlerEmbeddingText(fehler: {
  fehler_id: string;
  titel: string;
  beschreibung?: string;
  rechtsbasis?: string[];
}): string {
  const parts = [
    fehler.fehler_id,
    fehler.titel,
    fehler.beschreibung ?? "",
  ];
  if (fehler.rechtsbasis?.length) {
    parts.push(fehler.rechtsbasis.join(", "));
  }
  return parts.filter(Boolean).join(" — ");
}
