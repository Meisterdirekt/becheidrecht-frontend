/**
 * AG04 — Rechts-Rechercheur (Sonnet · ab HOCH)
 * Sucht aktuelle BSG-Urteile via web_search + fetch_url.
 * Parallel mit AG02 ausführbar via Promise.allSettled().
 *
 * Lernmechanismus: NORMAL-Routing nutzt pgvector Semantic Search
 * mit Fallback auf Keyword-Suche.
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
import { SONNET_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient, mergeTokenUsage, extractJsonSafe } from "./utils";
import { TOOL_WEB_SEARCH, executeWebSearch } from "./tools/web-search";
import { TOOL_FETCH_URL, executeFetchUrl } from "./tools/fetch-url";
import { TOOL_DB_READ, executeDbRead } from "./tools/db-read";
import { processToolBlocks } from "./tools/process-tool-results";
import { generateEmbedding } from "./tools/embeddings";
import { createClient } from "@supabase/supabase-js";

const TOOLS: Anthropic.Tool[] = [
  TOOL_WEB_SEARCH,
  TOOL_FETCH_URL,
  TOOL_DB_READ,
];

// ---------------------------------------------------------------------------
// Vector Similarity Search (pgvector + OpenAI Embeddings)
// ---------------------------------------------------------------------------

async function vectorSearchUrteile(
  bescheidText: string,
  rechtsgebiet: string,
  limit: number,
): Promise<UrteilItem[]> {
  try {
    // Embedding fuer den Bescheid-Text generieren
    const embedding = await generateEmbedding(bescheidText.slice(0, 2000));
    if (!embedding) return [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    if (!supabaseUrl || !serviceKey) return [];

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.rpc("match_urteile", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: 0.3,
      match_count: limit,
      filter_rechtsgebiet: rechtsgebiet,
    });

    if (error || !data || data.length === 0) return [];

    return (data as {
      gericht: string;
      aktenzeichen: string;
      entscheidungsdatum: string | null;
      leitsatz: string;
      volltext_url: string | null;
      rechtsgebiet: string;
      similarity: number;
    }[]).map((u) => ({
      gericht: u.gericht ?? "",
      aktenzeichen: u.aktenzeichen ?? "",
      datum: u.entscheidungsdatum ?? "",
      leitsatz: u.leitsatz ?? "",
      relevanz: `Semantische Suche — ${rechtsgebiet} (${Math.round(u.similarity * 100)}% Relevanz)`,
      url: u.volltext_url ?? undefined,
    }));
  } catch {
    return []; // Graceful fallback auf Keyword-Suche
  }
}

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

  // NORMAL-Routing: Vector Search mit Keyword-Fallback (kein LLM, kein Tavily noetig)
  if (ctx.routingStufe === "NORMAL") {
    const rechtsgebiet = ctx.pipeline.triage?.rechtsgebiet;
    if (rechtsgebiet && rechtsgebiet !== "Unbekannt") {
      // Versuche semantische Suche (wenn pgvector + OpenAI Key vorhanden)
      const vectorResults = await vectorSearchUrteile(ctx.documentText, rechtsgebiet, 5);

      if (vectorResults.length > 0) {
        return {
          agentId: "AG04",
          success: true,
          data: { urteile: vectorResults, quellen: [] },
          tokens: emptyTokenUsage(),
          durationMs: Date.now() - start,
        };
      }

      // Fallback: Keyword-Suche (wie bisher)
      const dbResult = await executeDbRead("urteile", { rechtsgebiet }, 5);
      const urteile: UrteilItem[] = dbResult.rows.map((u) => ({
        gericht: String(u.gericht ?? ""),
        aktenzeichen: String(u.aktenzeichen ?? ""),
        datum: String(u.entscheidungsdatum ?? u.datum ?? ""),
        leitsatz: String(u.leitsatz ?? ""),
        relevanz: `Aus Wissensdatenbank — ${rechtsgebiet}`,
        url: u.volltext_url ? String(u.volltext_url) : undefined,
      }));
      return {
        agentId: "AG04",
        success: true,
        data: { urteile, quellen: [] },
        tokens: emptyTokenUsage(),
        durationMs: Date.now() - start,
      };
    }
    return {
      agentId: "AG04",
      success: true,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "NORMAL-Routing ohne Rechtsgebiet — DB-Suche übersprungen",
    };
  }

  // HOCH/NOTFALL: Prüfe ob Tavily verfügbar ist
  if (!process.env.TAVILY_API_KEY) {
    return {
      agentId: "AG04",
      success: true,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "TAVILY_API_KEY fehlt — Web-Recherche übersprungen",
    };
  }

  const anthropic = createAnthropicClient(apiKey);
  let totalTokens = emptyTokenUsage();

  let kontext = "";
  if (ctx.pipeline.triage) {
    const t = ctx.pipeline.triage;
    kontext += `Rechtsgebiet: ${t.rechtsgebiet}, Untergebiet: ${t.untergebiet}, Behörde: ${t.behoerde}`;
  }

  if (ctx.userContext) {
    kontext += `\n\nHINTERGRUND VOM NUTZER:\n${ctx.userContext}`;
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
      max_tokens: 3072,
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
        const parsed = extractJsonSafe<{ urteile?: UrteilItem[] }>(textBlock.text, {});
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
      }
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const toolResults = await processToolBlocks(response.content, {
      web_search: {
        execute: async (input) => {
          const searchResult = await executeWebSearch(input.query as string, input.max_results as number | undefined);
          for (const r of searchResult.results) {
            quellen.push(r.url);
          }
          return JSON.stringify(searchResult);
        },
      },
      fetch_url: {
        execute: async (input) => {
          const fetchResult = await executeFetchUrl(input.url as string);
          return JSON.stringify(fetchResult);
        },
      },
      db_read: {
        execute: async (input) => {
          const dbResult = await executeDbRead(
            input.tabelle as string,
            input.filter as Record<string, string> | undefined,
            input.limit as number | undefined,
          );
          return JSON.stringify(dbResult);
        },
      },
    });

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
