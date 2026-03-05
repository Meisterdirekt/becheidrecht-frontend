/**
 * Tool: fetch_url
 * Lädt HTML-Seiten von Whitelist-Domains und extrahiert Text.
 * Max 10.000 Zeichen Output.
 */

import type Anthropic from "@anthropic-ai/sdk";
import { LEGAL_DOMAIN_WHITELIST, MAX_FETCH_CHARS } from "./constants";

export const TOOL_FETCH_URL: Anthropic.Tool = {
  name: "fetch_url",
  description:
    "Lädt den Volltext einer URL von Whitelist-Domains (bundessozialgericht.de etc.). " +
    "HTML wird in bereinigten Text umgewandelt. Max 10.000 Zeichen.",
  input_schema: {
    type: "object" as const,
    properties: {
      url: {
        type: "string",
        description: "Die URL zum Abrufen (muss auf einer Whitelist-Domain liegen)",
      },
    },
    required: ["url"],
  },
};

function isDomainAllowed(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return LEGAL_DOMAIN_WHITELIST.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function executeFetchUrl(
  url: string,
): Promise<{ available: boolean; text: string; error?: string }> {
  if (!isDomainAllowed(url)) {
    return { available: false, text: "", error: "Domain nicht auf Whitelist." };
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "BescheidRecht/1.0 (legal-research-bot)" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return { available: false, text: "", error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    const text = htmlToText(html).slice(0, MAX_FETCH_CHARS);

    return { available: true, text };
  } catch (err) {
    return {
      available: false,
      text: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
