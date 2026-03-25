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

/** Liest einen Key aus vault/keys.env (lokal) oder process.env (Vercel) */
function getVaultKey(keyName: string): string | null {
  try {
    const vaultPath = path.join(process.cwd(), "vault", "keys.env");
    const content = fs.readFileSync(vaultPath, "utf8");
    const match = content.match(new RegExp(`${keyName}\\s*=\\s*["']?([^\\s"'\\n]+)`));
    if (match?.[1]) return match[1];
  } catch {
    // Vault nicht vorhanden (z.B. auf Vercel)
  }
  return process.env[keyName] || null;
}

export function getAnthropicKey(): string | null {
  return getVaultKey("ANTHROPIC_API_KEY");
}

export function getOpenAIKey(): string | null {
  return getVaultKey("OPENAI_API_KEY");
}

/** Erstellt einen Anthropic-Client — SDK-Retry für transiente Fehler (529), safeExecute für Agent-Level-Retry */
export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    maxRetries: 2,
  });
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

/**
 * Berechnet Ostersonntag für ein Jahr nach dem Gaußschen Algorithmus.
 * Quelle: https://de.wikipedia.org/wiki/Gau%C3%9Fsche_Osterformel
 */
function osterSonntag(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-based
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/**
 * Bundeseinheitliche Feiertage für ein Jahr.
 * 9 gesetzliche Feiertage die in allen 16 Bundesländern gelten.
 * Quellen:
 * - Art. 139 WRV i.V.m. Art. 140 GG (Sonntagsschutz)
 * - Feiertagsgesetze der Länder (bundeseinheitlich: diese 9)
 * - https://www.bmi.bund.de/DE/themen/verfassung/staatliche-symbole/nationale-feiertage/nationale-feiertage-node.html
 */
function bundesFeiertage(year: number): Set<string> {
  const feiertage = new Set<string>();
  const fmt = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  // Feste Feiertage
  feiertage.add(fmt(new Date(year, 0, 1)));   // Neujahr
  feiertage.add(fmt(new Date(year, 4, 1)));   // Tag der Arbeit
  feiertage.add(fmt(new Date(year, 9, 3)));   // Tag der Deutschen Einheit
  feiertage.add(fmt(new Date(year, 11, 25))); // 1. Weihnachtstag
  feiertage.add(fmt(new Date(year, 11, 26))); // 2. Weihnachtstag

  // Bewegliche Feiertage (abhängig von Ostern)
  const ostern = osterSonntag(year);
  const osterMs = ostern.getTime();
  const tag = 24 * 60 * 60 * 1000;

  feiertage.add(fmt(new Date(osterMs - 2 * tag)));  // Karfreitag (-2)
  feiertage.add(fmt(new Date(osterMs + 1 * tag)));  // Ostermontag (+1)
  feiertage.add(fmt(new Date(osterMs + 39 * tag))); // Christi Himmelfahrt (+39)
  feiertage.add(fmt(new Date(osterMs + 50 * tag))); // Pfingstmontag (+50)

  return feiertage;
}

/**
 * § 193 BGB: Fällt das Fristende auf Sa/So/Feiertag → nächster Werktag.
 * Gibt das korrigierte Datum zurück.
 * Quelle: § 193 BGB (https://www.gesetze-im-internet.de/bgb/__193.html)
 */
export function fristende193BGB(date: Date): Date {
  const result = new Date(date);
  const feiertageSet = bundesFeiertage(result.getFullYear());
  // Auch Feiertage des Folgejahres laden (für Silvester-Randfälle)
  const feiertageNext = bundesFeiertage(result.getFullYear() + 1);
  const combined = new Set([...feiertageSet, ...feiertageNext]);

  const fmt = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const tag = 24 * 60 * 60 * 1000;

  // Max 10 Tage verschieben (Sicherheitsgrenze gegen Endlosschleifen)
  for (let i = 0; i < 10; i++) {
    const dow = result.getDay(); // 0=So, 6=Sa
    if (dow !== 0 && dow !== 6 && !combined.has(fmt(result))) {
      break;
    }
    result.setTime(result.getTime() + tag);
  }

  return result;
}

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

    const rawDate = new Date(year, month, day);

    // § 193 BGB: Fristende auf Sa/So/Feiertag → nächster Werktag
    const adjustedDate = fristende193BGB(rawDate);

    const daysLeft = Math.floor(
      (adjustedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
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

/**
 * Träger-Keywords: traegerKey → Suchbegriffe (lowercase).
 * Single Source of Truth für detectTraegerKey().
 */
const TRAEGER_KEYWORDS: [string, string[]][] = [
  ["jobcenter", ["jobcenter", "bürgergeld", "bürgergeldbescheid", "grundsicherungsgeld", "sgb ii", "grundsicherung für arbeitsuchende"]],
  ["arbeitsagentur", ["arbeitsagentur", "agentur für arbeit", "bundesagentur für arbeit", "alg i", "arbeitslosengeld i", "sgb iii"]],
  ["drv", ["rentenversicherung", "drv", "deutsche renten", "sgb vi", "rentenbescheid"]],
  ["pflegekasse", ["pflegekasse", "pflegegrad", "sgb xi", "pflegeversicherung"]],
  ["krankenkasse", ["krankenkasse", "krankenversicherung", "sgb v", "krankengeld", "aok", "barmer", " tk ", "techniker krankenkasse", "dak", "bkk", "ikk", "knappschaft", "gkv"]],
  ["sozialhilfe", ["sozialhilfe", "sozialamt", "grundsicherung im alter", "sgb xii", "hilfe zum lebensunterhalt"]],
  ["familienkasse", ["familienkasse", "kindergeld", "kinderzuschlag"]],
  ["jugendamt", ["jugendamt", "jugendhilfe", "sgb viii", "hilfe zur erziehung"]],
  ["eingliederungshilfe", ["eingliederungshilfe", "sgb ix", "teilhabe", "persönliches budget"]],
  ["unfallversicherung", ["unfallversicherung", "berufsgenossenschaft", "unfallkasse", "sgb vii", "verletztengeld", "arbeitsunfall"]],
  ["versorgungsamt", ["versorgungsamt", "schwerbehinderung", "grad der behinderung", "gdb", "merkzeichen", "sgb ix feststellung"]],
  ["bamf", ["bamf", "bundesamt für migration", "ausländerbehörde", "auslaenderbehörde", "aufenthaltserlaubnis", "asyl", "aufenthaltsstatus"]],
  ["bafoeg", ["bafög", "ausbildungsförderung", "studierendenwerk", "studentenwerk"]],
  ["elterngeld", ["elterngeld", "elterngeldstelle", "elterngeld plus", "beeg"]],
  ["wohngeld", ["wohngeld", "wohngeldstelle", "wohngeldbescheid"]],
  ["unterhaltsvorschuss", ["unterhaltsvorschuss", "uvg", "unterhaltsvorschussgesetz"]],
];

export function detectTraegerKey(behoerde: string): string | null {
  const lower = behoerde.toLowerCase();
  for (const [key, keywords] of TRAEGER_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return key;
  }
  return null;
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

export const RETRYABLE_PATTERNS = ["overloaded", "529", "rate_limit", "529 Overloaded"];

export function isRetryableError(msg: string): boolean {
  return RETRYABLE_PATTERNS.some((p) => msg.includes(p));
}

/** Klassifiziert einen API-Fehler in eine nutzerfreundliche Meldung */
export function classifyApiError(errorMsg: string): string {
  if (errorMsg.includes("credit balance is too low")) {
    return "Die KI-Analyse ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.";
  }
  if (errorMsg.includes("rate_limit")) {
    return "Zu viele Anfragen — bitte warten Sie einen Moment und versuchen es erneut.";
  }
  if (errorMsg.includes("overloaded") || errorMsg.includes("529")) {
    return "Der KI-Dienst ist aktuell überlastet. Bitte versuchen Sie es in wenigen Minuten erneut.";
  }
  return "Die Analyse konnte nicht durchgeführt werden. Bitte versuchen Sie es später erneut.";
}

/** Per-Agent Timeout: AG07/AG02 brauchen mehr Zeit für Tool-Use-Loops + Rate-Limit-Retries */
const AGENT_TIMEOUT_MS: Partial<Record<AgentId, number>> = {
  AG07: 120_000,
  AG02: 120_000,
  AG03: 90_000,
  AG13: 45_000,
};
const DEFAULT_TIMEOUT_MS = 45_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} Timeout nach ${ms}ms`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export async function safeExecute<T>(
  agentId: AgentId,
  fn: () => Promise<AgentResult<T>>,
  fallbackData: T,
  maxRetries = 2,
): Promise<AgentResult<T>> {
  const start = Date.now();
  let lastError = "";
  const timeoutMs = AGENT_TIMEOUT_MS[agentId] ?? DEFAULT_TIMEOUT_MS;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(fn(), timeoutMs, agentId);
      // Agent returned success: false mit retryable error → retry
      if (!result.success && result.error && isRetryableError(result.error) && attempt < maxRetries) {
        lastError = result.error;
        const delay = Math.min(2000 * Math.pow(2, attempt), 6000);
        console.warn(`[${agentId}] Retry ${attempt + 1}/${maxRetries} nach ${delay}ms (${result.error.slice(0, 80)})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastError = message;
      if (isRetryableError(message) && attempt < maxRetries) {
        const delay = Math.min(2000 * Math.pow(2, attempt), 6000);
        console.warn(`[${agentId}] Retry ${attempt + 1}/${maxRetries} nach ${delay}ms (${message.slice(0, 80)})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      console.error(`[${agentId}] Fehler: ${message}`);
    }
  }

  return {
    agentId,
    success: false,
    data: fallbackData,
    tokens: emptyTokenUsage(),
    durationMs: Date.now() - start,
    error: lastError,
  };
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
