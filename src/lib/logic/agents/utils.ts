/**
 * Shared Utilities für das Multi-Agent-System.
 * Migriert aus agent_engine.ts + neue Hilfsfunktionen.
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { type RoutingStufe, type TokenUsage, type AgentResult, type AgentId, emptyTokenUsage, mergeTokenUsage } from "./types";
import { BUDGET_LIMIT_EUR } from "./tools/constants";

// Re-export für bequemen Import aus ./utils
export { emptyTokenUsage, mergeTokenUsage };

// ---------------------------------------------------------------------------
// API Key
// ---------------------------------------------------------------------------

export function getAnthropicKey(): string | null {
  try {
    const vaultPath = path.join(process.cwd(), "vault", "keys.env");
    const content = fs.readFileSync(vaultPath, "utf8");
    const match = content.match(/ANTHROPIC_API_KEY\s*=\s*([^\s\n]+)/);
    if (match?.[1]) return match[1];
  } catch {
    // Vault nicht vorhanden
  }
  return process.env.ANTHROPIC_API_KEY || null;
}

/** Erstellt einen Anthropic-Client (singleton-artig pro Analyse) */
export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}

// ---------------------------------------------------------------------------
// Modell-Routing
// ---------------------------------------------------------------------------

export function modelForStufe(stufe: RoutingStufe): string {
  if (stufe === "NOTFALL") return "claude-opus-4-6";
  return "claude-sonnet-4-6";
}

export const HAIKU_MODEL = "claude-haiku-4-5-20251001";
export const SONNET_MODEL = "claude-sonnet-4-6";
export const OPUS_MODEL = "claude-opus-4-6";

// ---------------------------------------------------------------------------
// Urgency Detection (kostenlos, kein API-Call)
// ---------------------------------------------------------------------------

export function detectUrgency(text: string): { stufe: RoutingStufe; tage: number | null } {
  const lower = text.toLowerCase();

  const notfallKeywords = [
    "vollstreckung", "pfändung", "sofortige vollziehung",
    "haftandrohung", "zwangsvollstreckung", "kontopfändung",
  ];
  if (notfallKeywords.some((kw) => lower.includes(kw))) {
    return { stufe: "NOTFALL", tage: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const datePattern = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g;
  let match: RegExpExecArray | null;
  let minDays: number | null = null;

  while ((match = datePattern.exec(text)) !== null) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const year = parseInt(match[3]);

    if (year < 2024 || year > 2035) continue;

    const date = new Date(year, month, day);
    const daysLeft = Math.floor(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft >= 0 && daysLeft <= 60) {
      if (minDays === null || daysLeft < minDays) {
        minDays = daysLeft;
      }
    }
  }

  if (minDays !== null) {
    if (minDays <= 7) return { stufe: "NOTFALL", tage: minDays };
    if (minDays <= 14) return { stufe: "HOCH", tage: minDays };
  }

  return { stufe: "NORMAL", tage: minDays };
}

// ---------------------------------------------------------------------------
// Träger-Erkennung
// ---------------------------------------------------------------------------

export function detectTraegerKey(behoerde: string): string {
  const lower = behoerde.toLowerCase();

  if (
    lower.includes("jobcenter") || lower.includes("bürgergeld") ||
    lower.includes("bürgergeldbescheid") || lower.includes("sgb ii") ||
    lower.includes("grundsicherung für arbeitsuchende")
  ) return "jobcenter";

  if (
    lower.includes("arbeitsagentur") || lower.includes("agentur für arbeit") ||
    lower.includes("bundesagentur für arbeit") ||
    lower.includes("alg i") || lower.includes("arbeitslosengeld i") ||
    lower.includes("sgb iii")
  ) return "jobcenter";

  if (
    lower.includes("rentenversicherung") || lower.includes("drv") ||
    lower.includes("deutsche renten") || lower.includes("sgb vi") ||
    lower.includes("rentenbescheid")
  ) return "drv";

  if (
    lower.includes("pflegekasse") || lower.includes("pflegegrad") ||
    lower.includes("sgb xi") || lower.includes("pflegeversicherung")
  ) return "pflegekasse";

  if (
    lower.includes("krankenkasse") || lower.includes("krankenversicherung") ||
    lower.includes("sgb v") || lower.includes("krankengeld") ||
    lower.includes("aok") || lower.includes("barmer") ||
    lower.includes(" tk ") || lower.includes("techniker krankenkasse") ||
    lower.includes("dak") || lower.includes("bkk") ||
    lower.includes("ikk") || lower.includes("knappschaft") ||
    lower.includes("gkv")
  ) return "krankenkasse";

  if (
    lower.includes("sozialhilfe") || lower.includes("sozialamt") ||
    lower.includes("grundsicherung im alter") || lower.includes("sgb xii") ||
    lower.includes("hilfe zum lebensunterhalt")
  ) return "sozialhilfe";

  if (
    lower.includes("familienkasse") || lower.includes("kindergeld") ||
    lower.includes("kinderzuschlag") || lower.includes("elterngeld")
  ) return "familienkasse";

  if (
    lower.includes("jugendamt") || lower.includes("jugendhilfe") ||
    lower.includes("sgb viii") || lower.includes("hilfe zur erziehung") ||
    lower.includes("unterhaltsvorschuss")
  ) return "jugendamt";

  if (
    lower.includes("eingliederungshilfe") || lower.includes("sgb ix") ||
    lower.includes("teilhabe") || lower.includes("persönliches budget")
  ) return "eingliederungshilfe";

  if (
    lower.includes("unfallversicherung") || lower.includes("berufsgenossenschaft") ||
    lower.includes("unfallkasse") || lower.includes("sgb vii") ||
    lower.includes("verletztengeld") || lower.includes("arbeitsunfall")
  ) return "unfallversicherung";

  if (
    lower.includes("versorgungsamt") || lower.includes("schwerbehinderung") ||
    lower.includes("grad der behinderung") || lower.includes("gdb") ||
    lower.includes("merkzeichen") || lower.includes("sgb ix feststellung")
  ) return "versorgungsamt";

  if (
    lower.includes("bamf") || lower.includes("bundesamt für migration") ||
    lower.includes("ausländerbehörde") || lower.includes("auslaenderbehörde") ||
    lower.includes("aufenthaltserlaubnis") || lower.includes("asyl") ||
    lower.includes("aufenthaltsstatus")
  ) return "bamf";

  if (
    lower.includes("bafög") || lower.includes("ausbildungsförderung") ||
    lower.includes("studierendenwerk") || lower.includes("studentenwerk")
  ) return "bafoeg";

  if (
    lower.includes("elterngeld") || lower.includes("elterngeldstelle") ||
    lower.includes("elterngeld plus") || lower.includes("beeg")
  ) return "elterngeld";

  if (
    lower.includes("wohngeld") || lower.includes("wohngeldstelle") ||
    lower.includes("wohngeldbescheid")
  ) return "wohngeld";

  if (
    lower.includes("unterhaltsvorschuss") || lower.includes("uvg") ||
    lower.includes("unterhaltsvorschussgesetz")
  ) return "unterhaltsvorschuss";

  return "jobcenter";
}

// ---------------------------------------------------------------------------
// Kosten-Schätzung
// ---------------------------------------------------------------------------

const PRICING: Record<string, { input: number; output: number; cacheRead: number }> = {
  "claude-opus-4-6":           { input: 15,   output: 75,   cacheRead: 1.5 },
  "claude-sonnet-4-6":         { input: 3,    output: 15,   cacheRead: 0.3 },
  "claude-haiku-4-5-20251001": { input: 0.25, output: 1.25, cacheRead: 0.03 },
};

export function estimateCost(tokens: TokenUsage, model: string): number {
  const p = PRICING[model] ?? PRICING["claude-sonnet-4-6"];
  const usd =
    (tokens.input_tokens / 1_000_000) * p.input +
    (tokens.output_tokens / 1_000_000) * p.output +
    (tokens.cache_read_tokens / 1_000_000) * p.cacheRead +
    (tokens.cache_creation_tokens / 1_000_000) * p.input * 1.25; // Cache-Write: 1.25× Input-Preis
  return Math.round(usd * 0.92 * 10000) / 10000;
}

export function estimateTotalCost(allTokens: TokenUsage[]): number {
  // Vereinfachte Berechnung: nimmt Sonnet als Default
  return allTokens.reduce((sum, t) => sum + estimateCost(t, SONNET_MODEL), 0);
}

// ---------------------------------------------------------------------------
// Safe Execute Wrapper
// ---------------------------------------------------------------------------

export async function safeExecute<T>(
  agentId: AgentId,
  fn: () => Promise<AgentResult<T>>,
  fallbackData: T,
): Promise<AgentResult<T>> {
  const start = Date.now();
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[${agentId}] Fehler: ${message}`);
    return {
      agentId,
      success: false,
      data: fallbackData,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: message,
    };
  }
}

// ---------------------------------------------------------------------------
// Token-Extraktion aus Anthropic-Response
// ---------------------------------------------------------------------------

export function extractTokenUsage(response: Anthropic.Message): TokenUsage {
  const usage = response.usage as Anthropic.Usage & {
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
  return {
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
    cache_read_tokens: usage.cache_read_input_tokens ?? 0,
    cache_creation_tokens: usage.cache_creation_input_tokens ?? 0,
  };
}

/** Kosten-Budget-Check: Gibt true zurück wenn Budget überschritten */
export function isBudgetExceeded(totalTokens: TokenUsage, maxEur: number = BUDGET_LIMIT_EUR): boolean {
  // Konservative Schätzung mit Sonnet-Preisen
  return estimateCost(totalTokens, SONNET_MODEL) > maxEur;
}

// ---------------------------------------------------------------------------
// Robuste JSON-Extraktion (kein stiller Datenverlust bei Parse-Fehler)
// ---------------------------------------------------------------------------

/**
 * Versucht JSON aus einem Text zu extrahieren.
 * Strategie 1: Direktes JSON.parse(text)
 * Strategie 2: Regex-Extraktion des ersten {...} Blocks
 * Fallback: gibt fallback zurück — nie Exception
 */
export function extractJsonSafe<T>(text: string, fallback: T): T {
  // Strategie 1: Direktes Parse
  try {
    return JSON.parse(text) as T;
  } catch {
    // weiter
  }

  // Strategie 2: Ersten JSON-Block per Regex extrahieren
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      // weiter
    }
  }

  return fallback;
}
