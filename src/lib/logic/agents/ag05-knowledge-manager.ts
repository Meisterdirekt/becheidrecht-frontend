/**
 * AG05 — Wissens-Verwalter (Haiku · async)
 * Fire-and-forget nach Response. Speichert AG04-Urteile in DB.
 * Der EINZIGE Agent mit db_write-Zugriff.
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

interface KnowledgeResult {
  saved: number;
}

const TOOLS: Anthropic.Tool[] = [
  TOOL_DB_READ,
  TOOL_DB_WRITE,
];

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

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      let resultContent = "";

      switch (block.name) {
        case "db_read": {
          const input = block.input as {
            tabelle: string;
            filter?: Record<string, string>;
            limit?: number;
          };
          const result = await executeDbRead(input.tabelle, input.filter, input.limit);
          resultContent = JSON.stringify(result);
          break;
        }

        case "db_write": {
          const input = block.input as {
            tabelle: string;
            daten: Record<string, unknown>;
            aktion: "insert" | "upsert";
          };
          const result = await executeDbWrite(input.tabelle, input.daten, input.aktion);
          if (result.success) savedCount++;
          resultContent = JSON.stringify(result);
          break;
        }

        default:
          resultContent = JSON.stringify({ error: "Unbekanntes Tool" });
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: resultContent,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  console.log(`[AG05] ${savedCount} Urteile gespeichert`);

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
