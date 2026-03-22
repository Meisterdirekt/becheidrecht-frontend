/**
 * AG05 — Wissens-Verwalter (Haiku · async)
 * Fire-and-forget nach Response. Speichert AG04-Urteile in DB.
 * Der EINZIGE Agent mit db_write-Zugriff.
 *
 * Lernmechanismus: Generiert Embeddings (OpenAI text-embedding-3-small)
 * fuer neue Urteile, damit AG04 Semantic Search nutzen kann.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import { HAIKU_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient, mergeTokenUsage } from "./utils";
import { TOOL_DB_READ, executeDbRead } from "./tools/db-read";
import { TOOL_DB_WRITE, executeDbWrite } from "./tools/db-write";
import { generateEmbedding, buildUrteilEmbeddingText } from "./tools/embeddings";
import { reportInfo } from "@/lib/error-reporter";
import { processToolBlocks } from "./tools/process-tool-results";
import { createClient } from "@supabase/supabase-js";

interface KnowledgeResult {
  saved: number;
}

const TOOLS: Anthropic.Tool[] = [
  TOOL_DB_READ,
  TOOL_DB_WRITE,
];

// ---------------------------------------------------------------------------
// Embedding generieren und in DB speichern (fire-and-forget)
// ---------------------------------------------------------------------------

async function generateAndStoreEmbedding(daten: Record<string, unknown>): Promise<void> {
  const aktenzeichen = daten.aktenzeichen as string | undefined;
  if (!aktenzeichen) return;

  const embeddingText = buildUrteilEmbeddingText({
    gericht: (daten.gericht as string) ?? "",
    aktenzeichen,
    leitsatz: (daten.leitsatz as string) ?? "",
    rechtsgebiet: daten.rechtsgebiet as string | undefined,
    stichwort: daten.stichwort as string[] | undefined,
  });

  const embedding = await generateEmbedding(embeddingText);
  if (!embedding) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey) return;

  const supabase = createClient(supabaseUrl, serviceKey);
  await supabase
    .from("urteile")
    .update({ embedding: JSON.stringify(embedding) })
    .eq("aktenzeichen", aktenzeichen);
}

async function execute(ctx: AgentContext): Promise<AgentResult<KnowledgeResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  if (!apiKey) {
    return {
      agentId: "AG05",
      success: false,
      data: { saved: 0 },
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "Kein API-Key",
    };
  }

  // Nur laufen wenn AG04 Urteile gefunden hat
  const urteile = ctx.pipeline.recherche?.urteile ?? [];
  if (urteile.length === 0) {
    return {
      agentId: "AG05",
      success: true,
      data: { saved: 0 },
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
    };
  }

  const anthropic = createAnthropicClient(apiKey);
  let totalTokens = emptyTokenUsage();
  let savedCount = 0;

  const urteileListe = urteile
    .map((u) => `${u.gericht} ${u.aktenzeichen} (${u.datum}): ${u.leitsatz}`)
    .join("\n");

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Prüfe ob diese Urteile bereits in der DB vorhanden sind und speichere neue:\n\n${urteileListe}`,
    },
  ];

  // Tool-Use Loop (max 4 Iterationen)
  for (let i = 0; i < 4; i++) {
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 512,
      system: getSystemPrompt("AG05"),
      tools: TOOLS,
      messages,
    });

    const tokens = extractTokenUsage(response);
    totalTokens = mergeTokenUsage(totalTokens, tokens);

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") break;
    if (response.stop_reason !== "tool_use") break;

    const toolResults = await processToolBlocks(response.content, {
      db_read: {
        execute: async (input) => {
          const result = await executeDbRead(
            input.tabelle as string,
            input.filter as Record<string, string> | undefined,
            input.limit as number | undefined,
          );
          return JSON.stringify(result);
        },
      },
      db_write: {
        execute: async (input) => {
          const result = await executeDbWrite(
            input.tabelle as string,
            input.daten as Record<string, unknown>,
            input.aktion as "insert" | "upsert",
          );
          if (result.success) {
            savedCount++;
            // Embedding generieren fuer neue Urteile (fire-and-forget)
            if (input.tabelle === "urteile") {
              generateAndStoreEmbedding(input.daten as Record<string, unknown>).catch(() => {});
            }
          }
          return JSON.stringify(result);
        },
      },
    });

    messages.push({ role: "user", content: toolResults });
  }

  reportInfo("[AG05] Urteile gespeichert", { savedCount });

  return {
    agentId: "AG05",
    success: true,
    data: { saved: savedCount },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

export const ag05KnowledgeManager: Agent<KnowledgeResult> = {
  id: "AG05",
  name: "Wissens-Verwalter",
  model: () => HAIKU_MODEL,
  execute,
};
