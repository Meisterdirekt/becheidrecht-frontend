/**
 * AG04 — Rechts-Rechercheur (Sonnet · ab HOCH)
 * Sucht aktuelle BSG-Urteile via web_search + fetch_url.
 * Parallel mit AG02 ausführbar via Promise.allSettled().
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type RechercheResult,
  type UrteilItem,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import { SONNET_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient, mergeTokenUsage } from "./utils";
import { TOOL_WEB_SEARCH, executeWebSearch } from "./tools/web-search";
import { TOOL_FETCH_URL, executeFetchUrl } from "./tools/fetch-url";
import { TOOL_DB_READ, executeDbRead } from "./tools/db-read";

const TOOLS: Anthropic.Tool[] = [
  TOOL_WEB_SEARCH,
  TOOL_FETCH_URL,
  TOOL_DB_READ,
];

async function execute(ctx: AgentContext): Promise<AgentResult<RechercheResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  const fallback: RechercheResult = { urteile: [], quellen: [] };

  if (!apiKey) {
    return {
      agentId: "AG04",
      success: false,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "Kein API-Key",
    };
  }

  // Prüfe ob Tavily verfügbar ist
  if (!process.env.TAVILY_API_KEY) {
    return {
      agentId: "AG04",
      success: true,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "TAVILY_API_KEY fehlt — Recherche übersprungen",
    };
  }

  const anthropic = createAnthropicClient(apiKey);
  let totalTokens = emptyTokenUsage();

  let kontext = "";
  if (ctx.pipeline.triage) {
    const t = ctx.pipeline.triage;
    kontext += `Rechtsgebiet: ${t.rechtsgebiet}, Untergebiet: ${t.untergebiet}, Behörde: ${t.behoerde}`;
  }

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Suche relevante BSG/BVerfG-Urteile für diesen Fall:\n\n${kontext}\n\nBescheid (Auszug):\n${ctx.documentText.slice(0, 3000)}`,
    },
  ];

  const urteile: UrteilItem[] = [];
  const quellen: string[] = [];

  // Tool-Use Loop
  for (let i = 0; i < 6; i++) {
    const response = await anthropic.messages.create({
      model: SONNET_MODEL,
      max_tokens: 2048,
      system: getSystemPrompt("AG04"),
      tools: TOOLS,
      messages,
    });

    const tokens = extractTokenUsage(response);
    totalTokens = mergeTokenUsage(totalTokens, tokens);

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      // Versuche Urteile aus letztem Text-Block zu extrahieren
      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        try {
          const parsed = JSON.parse(textBlock.text);
          if (Array.isArray(parsed.urteile)) {
            for (const u of parsed.urteile) {
              urteile.push({
                gericht: u.gericht ?? "",
                aktenzeichen: u.aktenzeichen ?? "",
                datum: u.datum ?? "",
                leitsatz: u.leitsatz ?? "",
                relevanz: u.relevanz ?? "",
                url: u.url,
              });
            }
          }
        } catch {
          // Kein JSON — kein Problem
        }
      }
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      let resultContent = "";

      switch (block.name) {
        case "web_search": {
          const input = block.input as { query: string; max_results?: number };
          const searchResult = await executeWebSearch(input.query, input.max_results);
          for (const r of searchResult.results) {
            quellen.push(r.url);
          }
          resultContent = JSON.stringify(searchResult);
          break;
        }

        case "fetch_url": {
          const input = block.input as { url: string };
          const fetchResult = await executeFetchUrl(input.url);
          resultContent = JSON.stringify(fetchResult);
          break;
        }

        case "db_read": {
          const input = block.input as {
            tabelle: string;
            filter?: Record<string, string>;
            limit?: number;
          };
          const dbResult = await executeDbRead(input.tabelle, input.filter, input.limit);
          resultContent = JSON.stringify(dbResult);
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

  return {
    agentId: "AG04",
    success: true,
    data: { urteile, quellen },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

export const ag04Researcher: Agent<RechercheResult> = {
  id: "AG04",
  name: "Rechts-Rechercheur",
  model: () => SONNET_MODEL,
  execute,
};
