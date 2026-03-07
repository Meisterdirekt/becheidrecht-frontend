/**
 * AG06 — Qualitäts-Analyst (Sonnet · async, selten)
 * Analysiert Qualität der Agent-Ergebnisse und schlägt Verbesserungen vor.
 * Läuft nur bei Problemen: Brief <500 Zeichen, 0 Fehler bei HOCH/NOTFALL, Kosten >€0.50.
 * Speichert Vorschläge in update_protokoll (Audit-Trail) für spätere Auswertung.
 */

import { createClient } from "@supabase/supabase-js";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
// Downgrade von Opus auf Sonnet — AG06 analysiert nur Zahlen/Text, braucht kein Opus
import { SONNET_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient, extractJsonSafe } from "./utils";

interface OptimierungResult {
  vorschlaege: string[];
}

async function execute(ctx: AgentContext): Promise<AgentResult<OptimierungResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  if (!apiKey) {
    return {
      agentId: "AG06",
      success: false,
      data: { vorschlaege: [] },
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "Kein API-Key",
    };
  }

  const anthropic = createAnthropicClient(apiKey);

  // Zusammenfassung der Pipeline-Ergebnisse
  let kontext = `Routing-Stufe: ${ctx.routingStufe}\n`;

  if (ctx.pipeline.analyse) {
    kontext += `AG02 Fehler: ${ctx.pipeline.analyse.fehler.length}\n`;
    kontext += `AG02 Auffälligkeiten: ${ctx.pipeline.analyse.auffaelligkeiten.length}\n`;
  }

  if (ctx.pipeline.musterschreiben) {
    kontext += `AG07 Brief-Länge: ${ctx.pipeline.musterschreiben.volltext.length} Zeichen\n`;
  }

  if (ctx.pipeline.kritik) {
    kontext += `AG03 Erfolgschance: ${ctx.pipeline.kritik.erfolgschance_prozent}%\n`;
  }

  if (ctx.pipeline.triage) {
    kontext += `Rechtsgebiet: ${ctx.pipeline.triage.rechtsgebiet}\nBehörde: ${ctx.pipeline.triage.behoerde}\n`;
  }

  const response = await anthropic.messages.create({
    model: SONNET_MODEL,
    max_tokens: 1024,
    system: getSystemPrompt("AG06"),
    messages: [
      {
        role: "user",
        content: `Analysiere die Qualität dieser Pipeline-Ergebnisse:\n\n${kontext}`,
      },
    ],
  });

  const tokens = extractTokenUsage(response);
  const textContent = response.content.find((b) => b.type === "text");
  const rawText = textContent && textContent.type === "text" ? textContent.text : "";

  let vorschlaege: string[] = [];

  const analyseParsed = extractJsonSafe<{ vorschlaege?: string[]; suggestions?: string[]; problem_agent?: string; ursache?: string; prioritaet?: string }>(rawText, {});
  if (Array.isArray(analyseParsed.vorschlaege)) {
    vorschlaege = analyseParsed.vorschlaege;
  } else if (Array.isArray(analyseParsed.suggestions)) {
    vorschlaege = analyseParsed.suggestions;
  } else if (rawText.length > 10) {
    vorschlaege = [rawText.slice(0, 500)];
  }

  // Vorschläge in update_protokoll persistieren — nicht nur console.log
  if (vorschlaege.length > 0) {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
      if (url && serviceKey) {
        const supabase = createClient(url, serviceKey);
        await supabase.from("update_protokoll").insert({
          agent_id: "AG06",
          tabelle: "prompt_optimierung",
          operation: "QUALITAETS_ANALYSE",
          notiz: JSON.stringify({
            routing_stufe: ctx.routingStufe,
            problem_agent: analyseParsed.problem_agent ?? "unbekannt",
            ursache: analyseParsed.ursache ?? "",
            prioritaet: analyseParsed.prioritaet ?? "normal",
            vorschlaege,
          }),
        });
      }
    } catch {
      // DB nicht verfügbar — kein Problem, kein Crash
    }
  }

  console.log(`[AG06] ${vorschlaege.length} Optimierungs-Vorschläge (in update_protokoll gespeichert)`);

  return {
    agentId: "AG06",
    success: true,
    data: { vorschlaege },
    tokens,
    durationMs: Date.now() - start,
  };
}

export const ag06PromptOptimizer: Agent<OptimierungResult> = {
  id: "AG06",
  name: "Qualitäts-Analyst",
  model: () => SONNET_MODEL,
  execute,
};
