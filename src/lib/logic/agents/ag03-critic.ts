/**
 * AG03 — Kritiker (Sonnet · ab HOCH)
 * Hinterfragt AG02-Analyse, sucht Gegenargumente, bewertet Erfolgschance.
 * Läuft NACH AG02 + AG04.
 */

import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type KritikResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import { SONNET_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient } from "./utils";

async function execute(ctx: AgentContext): Promise<AgentResult<KritikResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  const fallback: KritikResult = {
    gegenargumente: [],
    erfolgschance_prozent: 50,
    schwachstellen: [],
  };

  if (!apiKey) {
    return {
      agentId: "AG03",
      success: false,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "Kein API-Key",
    };
  }

  const anthropic = createAnthropicClient(apiKey);

  // Kontext aus AG02 + AG04
  let kontext = "";

  if (ctx.pipeline.triage) {
    kontext += `Behörde: ${ctx.pipeline.triage.behoerde}, Rechtsgebiet: ${ctx.pipeline.triage.rechtsgebiet}\n\n`;
  }

  if (ctx.pipeline.analyse) {
    const a = ctx.pipeline.analyse;
    kontext += `ANALYSE (AG02):\nFehler: ${a.fehler.length}\n`;
    if (a.auffaelligkeiten.length > 0) {
      kontext += `Auffälligkeiten:\n${a.auffaelligkeiten.map((x) => `- ${x}`).join("\n")}\n`;
    }
    if (a.fehler.length > 0) {
      kontext += `Fehlerkatalog-Treffer:\n${a.fehler.map((f) => `- [${f.severity}] ${f.titel}`).join("\n")}\n`;
    }
  }

  if (ctx.pipeline.recherche) {
    const r = ctx.pipeline.recherche;
    if (r.urteile.length > 0) {
      kontext += `\nRECHERCHE (AG04):\n${r.urteile.map((u) => `- ${u.gericht} ${u.aktenzeichen}: ${u.leitsatz}`).join("\n")}\n`;
    }
  }

  kontext += `\nBescheid (Auszug):\n${ctx.documentText.slice(0, 3000)}`;

  const response = await anthropic.messages.create({
    model: SONNET_MODEL,
    max_tokens: 1024,
    system: getSystemPrompt("AG03"),
    messages: [
      {
        role: "user",
        content: `Bewerte diese Widerspruchs-Analyse kritisch:\n\n${kontext}`,
      },
    ],
  });

  const tokens = extractTokenUsage(response);
  const textContent = response.content.find((b) => b.type === "text");
  const rawText = textContent && textContent.type === "text" ? textContent.text : "";

  try {
    const parsed = JSON.parse(rawText);
    return {
      agentId: "AG03",
      success: true,
      data: {
        gegenargumente: parsed.gegenargumente ?? [],
        erfolgschance_prozent: parsed.erfolgschance_prozent ?? 50,
        schwachstellen: parsed.schwachstellen ?? [],
      },
      tokens,
      durationMs: Date.now() - start,
    };
  } catch {
    return {
      agentId: "AG03",
      success: true,
      data: fallback,
      tokens,
      durationMs: Date.now() - start,
      error: "JSON-Parse fehlgeschlagen",
    };
  }
}

export const ag03Critic: Agent<KritikResult> = {
  id: "AG03",
  name: "Kritiker",
  model: () => SONNET_MODEL,
  execute,
};
