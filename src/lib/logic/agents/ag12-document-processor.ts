/**
 * AG12 — Dokumenten-Prozessor (Haiku · IMMER)
 * Semantische Strukturerkennung: Rubrum, Begründung, Rechtsbehelfsbelehrung.
 */

import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type DokumentstrukturResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import { HAIKU_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient } from "./utils";

async function execute(ctx: AgentContext): Promise<AgentResult<DokumentstrukturResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  const fallback: DokumentstrukturResult = {
    rubrum: "",
    begruendung: "",
    rechtsbehelfsbelehrung: "",
    volltext: ctx.documentText,
  };

  if (!apiKey) {
    return {
      agentId: "AG12",
      success: true,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
    };
  }

  const anthropic = createAnthropicClient(apiKey);

  // Begrenzen auf 6000 Zeichen für Haiku-Effizienz
  const textPreview = ctx.documentText.slice(0, 6000);

  const response = await anthropic.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1024,
    system: getSystemPrompt("AG12"),
    messages: [
      {
        role: "user",
        content: `Analysiere die Struktur dieses Bescheids:\n\n${textPreview}`,
      },
    ],
  });

  const tokens = extractTokenUsage(response);
  const textContent = response.content.find((b) => b.type === "text");
  const rawText = textContent && textContent.type === "text" ? textContent.text : "";

  try {
    const parsed = JSON.parse(rawText);
    return {
      agentId: "AG12",
      success: true,
      data: {
        rubrum: parsed.rubrum ?? "",
        begruendung: parsed.begruendung ?? "",
        rechtsbehelfsbelehrung: parsed.rechtsbehelfsbelehrung ?? "",
        // Immer den vollen Originaltext — AG12 sieht nur 6000 Zeichen,
        // daher wäre parsed.volltext bei langen Dokumenten abgeschnitten.
        volltext: ctx.documentText,
      },
      tokens,
      durationMs: Date.now() - start,
    };
  } catch {
    return {
      agentId: "AG12",
      success: true,
      data: fallback,
      tokens,
      durationMs: Date.now() - start,
    };
  }
}

export const ag12DocumentProcessor: Agent<DokumentstrukturResult> = {
  id: "AG12",
  name: "Dokumenten-Prozessor",
  model: () => HAIKU_MODEL,
  execute,
};
