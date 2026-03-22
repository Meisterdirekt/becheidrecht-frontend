/**
 * AG08 — Security Gate (Haiku · IMMER ZUERST)
 * Prüft Input auf Prompt-Injection, Jailbreak, PII-Lecks.
 * Komplementär zum bestehenden Pseudonymizer.
 */

import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type SecurityResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import { HAIKU_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient } from "./utils";

/**
 * Freitext-Analyse: Wenn Haiku kein JSON liefert, prüfe die Antwort auf klare Ablehnungssignale.
 * Nur ablehnen wenn Haiku eindeutig "abgelehnt" / "nicht freigegeben" signalisiert.
 */
function analyzeRawResponse(text: string): SecurityResult {
  const lower = text.toLowerCase();
  const rejectSignals = ["freigabe.*false", "abgelehnt", "nicht freigegeben", "injection erkannt", "jailbreak erkannt", "blockiert"];
  const isRejected = rejectSignals.some((s) => new RegExp(s, "i").test(lower));

  if (isRejected) {
    return { freigabe: false, grund: text.slice(0, 150) };
  }
  // Haiku hat geantwortet aber kein klares Ablehnungssignal → freigeben
  return { freigabe: true };
}

/**
 * Lokaler Vorab-Check: Erkennt offensichtliche Prompt-Injection ohne API-Call.
 * Nur als Fallback wenn die API nicht erreichbar ist.
 */
function localSecurityCheck(text: string): SecurityResult {
  const lower = text.toLowerCase();

  // Prompt-Injection-Muster
  const injectionPatterns = [
    /ignore\s+(previous|all|your)\s+instructions/i,
    /vergiss\s+(deine|alle)\s+anweisungen/i,
    /you\s+are\s+now\s+/i,
    /du\s+bist\s+jetzt\s+/i,
    /\[inst\]/i,
    /<\|im_start\|>/i,
    /###\s*human\s*###/i,
    /<<sys>>/i,
    /forget\s+your\s+system\s+prompt/i,
    /new\s+instructions\s*:/i,
    /override\s*:/i,
    /dan\s+mode/i,
    /developer\s+mode/i,
    /jailbreak/i,
    /without\s+restrictions/i,
    /ohne\s+einschr[aä]nkungen/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(lower)) {
      return { freigabe: false, grund: "Prompt-Injection erkannt (lokaler Check)" };
    }
  }

  // Dokumenten-Plausibilität
  if (text.trim().length < 30) {
    return { freigabe: false, grund: "Text zu kurz für einen Bescheid" };
  }

  // Reiner Code
  if (/^\s*(function|const|let|var|import|<html|<script|if\s*\()/m.test(text) && !/bescheid|antrag|leistung|amt|behörde/i.test(text)) {
    return { freigabe: false, grund: "Input scheint Code zu sein, kein Bescheid" };
  }

  return { freigabe: true };
}

async function execute(ctx: AgentContext): Promise<AgentResult<SecurityResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  const textPreview = ctx.documentText.slice(0, 2000);

  if (!apiKey) {
    // Kein API-Key → lokaler Check als Fallback (besser als gar kein Check)
    const localResult = localSecurityCheck(textPreview);
    return {
      agentId: "AG08",
      success: true,
      data: localResult,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
    };
  }

  let response;
  try {
    const anthropic = createAnthropicClient(apiKey);
    response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 256,
      system: getSystemPrompt("AG08"),
      messages: [
        {
          role: "user",
          content: `Prüfe diesen Input:\n\n${textPreview}`,
        },
      ],
    });
  } catch (err) {
    // API-Fehler → lokaler Check als Fallback
    const localResult = localSecurityCheck(textPreview);
    return {
      agentId: "AG08",
      success: true,
      data: localResult,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: `API-Fehler, lokaler Fallback aktiv: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const tokens = extractTokenUsage(response);
  const textContent = response.content.find((b) => b.type === "text");
  const rawText = textContent && textContent.type === "text" ? textContent.text : "";

  let result: SecurityResult = { freigabe: true };

  try {
    const parsed = JSON.parse(rawText);
    result = {
      freigabe: parsed.freigabe !== false,
      grund: parsed.grund,
    };
  } catch {
    // Haiku antwortet manchmal mit Text um das JSON herum → extrahieren
    const jsonMatch = rawText.match(/\{[\s\S]*"freigabe"\s*:\s*(true|false)[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        result = {
          freigabe: extracted.freigabe !== false,
          grund: extracted.grund,
        };
      } catch {
        // Auch Extraktion gescheitert → Freitext-Analyse
        result = analyzeRawResponse(rawText);
      }
    } else {
      // Kein JSON gefunden → Freitext-Analyse als letzter Fallback
      result = analyzeRawResponse(rawText);
    }
  }

  return {
    agentId: "AG08",
    success: true,
    data: result,
    tokens,
    durationMs: Date.now() - start,
  };
}

export const ag08SecurityGate: Agent<SecurityResult> = {
  id: "AG08",
  name: "Security Gate",
  model: () => HAIKU_MODEL,
  execute,
};
