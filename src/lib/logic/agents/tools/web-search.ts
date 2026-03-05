/**
 * Tool: web_search
 * Tavily API für Rechts-Recherche (AG04).
 * Domain-Whitelist: Nur offizielle Rechtsquellen.
 * Graceful Degradation: Falls TAVILY_API_KEY fehlt → { available: false }
 */

import type Anthropic from "@anthropic-ai/sdk";
import { LEGAL_DOMAIN_WHITELIST, MAX_SEARCH_CONTENT_CHARS } from "./constants";

export const TOOL_WEB_SEARCH: Anthropic.Tool = {
  name: "web_search",
  description:
    "Sucht aktuelle BSG/BVerfG-Urteile und Rechtsinformationen im Internet. " +
    "Nur auf Whitelist-Domains (bundessozialgericht.de, gesetze-im-internet.de, etc.). " +
    "Max 10 Ergebnisse.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "Suchbegriff (z.B. 'BSG Urteil KdU Angemessenheit 2025')",
      },
      max_results: {
        type: "number",
        description: "Max. Ergebnisse (default 5, max 10)",
      },
    },
    required: ["query"],
  },
};

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export async function executeWebSearch(
  query: string,
  maxResults?: number,
): Promise<{ available: boolean; results: TavilyResult[] }> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return { available: false, results: [] };
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: Math.min(maxResults ?? 5, 10),
        include_domains: LEGAL_DOMAIN_WHITELIST,
        search_depth: "advanced",
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[web_search] Tavily API error: ${response.status}`);
      return { available: false, results: [] };
    }

    const data = await response.json();
    const results: TavilyResult[] = (data.results ?? []).map(
      (r: { title?: string; url?: string; content?: string; score?: number }) => ({
        title: r.title ?? "",
        url: r.url ?? "",
        content: (r.content ?? "").slice(0, MAX_SEARCH_CONTENT_CHARS),
        score: r.score ?? 0,
      })
    );

    return { available: true, results };
  } catch (err) {
    console.warn(`[web_search] Fehler: ${err instanceof Error ? err.message : String(err)}`);
    return { available: false, results: [] };
  }
}
