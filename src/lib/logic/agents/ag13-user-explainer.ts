/**
 * AG13 — Nutzer-Erklärer (Haiku · IMMER)
 * Juristendeutsch → Klartext, max 3 Sätze.
 */

import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type ErklaerungResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import { HAIKU_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient } from "./utils";

async function execute(ctx: AgentContext): Promise<AgentResult<ErklaerungResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  const fallback: ErklaerungResult = { klartext: "" };

  if (!apiKey) {
    return {
      agentId: "AG13",
      success: true,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
    };
  }

  const anthropic = createAnthropicClient(apiKey);

  // Kontext aus Pipeline zusammenbauen
  let kontext = "";

  if (ctx.pipeline.triage) {
    const t = ctx.pipeline.triage;
    kontext += `Behörde: ${t.behoerde}, Rechtsgebiet: ${t.rechtsgebiet}`;
    if (t.frist_tage !== undefined) kontext += `, Frist: ${t.frist_tage} Tage`;
  }

  if (ctx.pipeline.analyse) {
    const { fehler, auffaelligkeiten } = ctx.pipeline.analyse;
    kontext += `\nGefundene Fehler: ${fehler.length}, Auffälligkeiten: ${auffaelligkeiten.length}`;
    if (fehler.length > 0) {
      kontext += `\nHauptfehler:\n${fehler
        .slice(0, 3)
        .map((f) => `- [${f.severity ?? "hinweis"}] ${f.titel}`)
        .join("\n")}`;
    }
    if (auffaelligkeiten.length > 0) {
      kontext += `\nWichtigste Auffälligkeit: ${auffaelligkeiten[0]}`;
    }
  }

  if (ctx.pipeline.kritik) {
    kontext += `\nErfolgschance: ${ctx.pipeline.kritik.erfolgschance_prozent}%`;
  }

  if (ctx.pipeline.musterschreiben?.forderung) {
    kontext += `\nKernforderung: ${ctx.pipeline.musterschreiben.forderung}`;
  }

  const response = await anthropic.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 256,
    system: getSystemPrompt("AG13"),
    messages: [
      {
        role: "user",
        content: `Erkläre dem Nutzer in einfacher Sprache was er tun soll:\n\n${kontext}`,
      },
    ],
  });

  const tokens = extractTokenUsage(response);
  const textContent = response.content.find((b) => b.type === "text");
  const klartext = textContent && textContent.type === "text" ? textContent.text.trim() : "";

  return {
    agentId: "AG13",
    success: true,
    data: { klartext },
    tokens,
    durationMs: Date.now() - start,
  };
}

export const ag13UserExplainer: Agent<ErklaerungResult> = {
  id: "AG13",
  name: "Nutzer-Erklärer",
  model: () => HAIKU_MODEL,
  execute,
};
