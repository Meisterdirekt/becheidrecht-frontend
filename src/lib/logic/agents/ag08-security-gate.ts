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

async function execute(ctx: AgentContext): Promise<AgentResult<SecurityResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  if (!apiKey) {
    return {
      agentId: "AG08",
      success: false,
      data: { freigabe: false, grund: "Security-Check nicht möglich: kein API-Key konfiguriert" },
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
    };
  }

  const anthropic = createAnthropicClient(apiKey);

  // Nur die ersten 2000 Zeichen prüfen (Haiku ist schnell, aber sparsam)
  const textPreview = ctx.documentText.slice(0, 2000);

  const response = await anthropic.messages.create({
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
    // Bei Parse-Fehler: blockieren (Sicherheit vor Verfügbarkeit)
    result = { freigabe: false, grund: "Security-Check Parse-Fehler — sicherheitshalber abgelehnt" };
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
