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
import { HAIKU_MODEL, modelForStufe, extractTokenUsage, getAnthropicKey, createAnthropicClient, extractJsonSafe } from "./utils";

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
  // Haiku für NORMAL/HOCH — spart Tokens und vermeidet Rate-Limits
  // Nur NOTFALL nutzt Sonnet/Opus für maximale Kritik-Tiefe
  const model = ctx.routingStufe === "NOTFALL" ? modelForStufe(ctx.routingStufe) : HAIKU_MODEL;

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

  if (ctx.userContext) {
    kontext += `\n\nHINTERGRUND VOM NUTZER:\n${ctx.userContext}`;
  }

  kontext += `\nBescheid (Auszug):\n${ctx.documentText.slice(0, 2000)}`;

  const response = await anthropic.messages.create({
    model,
    max_tokens: 2048,
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

  const parsed = extractJsonSafe<{
    gegenargumente?: string[];
    erfolgschance_prozent?: number;
    schwachstellen?: string[];
  }>(rawText, {});

  const erfolgschance = parsed.erfolgschance_prozent ?? 50;
  const confidence = Math.min(1, Math.max(0, erfolgschance / 100));

  return {
    agentId: "AG03",
    success: true,
    data: {
      gegenargumente: parsed.gegenargumente ?? fallback.gegenargumente,
      erfolgschance_prozent: erfolgschance,
      schwachstellen: parsed.schwachstellen ?? fallback.schwachstellen,
    },
    tokens,
    durationMs: Date.now() - start,
    confidence,
  };
}

export const ag03Critic: Agent<KritikResult> = {
  id: "AG03",
  name: "Kritiker",
  model: modelForStufe,
  execute,
};
