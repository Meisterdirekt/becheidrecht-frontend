/**
 * AG01 — Orchestrator (Sonnet · IMMER)
 * Triage + Routing-Entscheidung: Behörde, Rechtsgebiet, RoutingStufe.
 * Nutzt `klassifiziere_bescheid` Tool. Bekommt detectUrgency() Pre-Filter als Input.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type TriageResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import { SONNET_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient, mergeTokenUsage } from "./utils";

const TOOL_KLASSIFIZIERE: Anthropic.Tool = {
  name: "klassifiziere_bescheid",
  description:
    "Klassifiziert den Bescheid: Behörde, Rechtsgebiet, Datum und Widerspruchsfrist. " +
    "Rufe dieses Tool ZUERST auf, sobald du den Bescheidtyp erkannt hast.",
  input_schema: {
    type: "object" as const,
    properties: {
      behoerde: {
        type: "string",
        description: "Kurzname der ausstellenden Behörde",
      },
      rechtsgebiet: {
        type: "string",
        description: "Anwendbares Gesetz (z.B. 'SGB II', 'SGB V')",
      },
      untergebiet: {
        type: "string",
        description: "Konkreter Leistungsbereich",
      },
      bescheid_datum: {
        type: "string",
        description: "Datum des Bescheids (TT.MM.JJJJ)",
      },
      frist_datum: {
        type: "string",
        description: "Berechnetes Enddatum der Widerspruchsfrist (TT.MM.JJJJ)",
      },
      frist_tage: {
        type: "number",
        description: "Verbleibende Tage bis zum Fristende",
      },
      bg_nummer: {
        type: "string",
        description: "Bedarfsgemeinschaftsnummer oder Aktenzeichen",
      },
    },
    required: ["behoerde", "rechtsgebiet", "untergebiet"],
  },
};

interface KlassifizierungInput {
  behoerde: string;
  rechtsgebiet: string;
  untergebiet: string;
  bescheid_datum?: string;
  frist_datum?: string;
  frist_tage?: number;
  bg_nummer?: string;
}

async function execute(ctx: AgentContext): Promise<AgentResult<TriageResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  const fallback: TriageResult = {
    behoerde: "Unbekannt",
    rechtsgebiet: "Unbekannt",
    untergebiet: "Unbekannt",
    routing_stufe: ctx.routingStufe,
  };

  if (!apiKey) {
    return {
      agentId: "AG01",
      success: false,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "Kein API-Key",
    };
  }

  const anthropic = createAnthropicClient(apiKey);
  let totalTokens = emptyTokenUsage();

  const urgencyHint = ctx.fristTage !== null
    ? `\n\nVORAB-INFORMATION: detectUrgency() hat ${ctx.fristTage} Tage bis Fristablauf erkannt → Routing-Stufe: ${ctx.routingStufe}`
    : `\n\nVORAB-INFORMATION: Keine Frist erkannt → Routing-Stufe: ${ctx.routingStufe}`;

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Klassifiziere diesen Bescheid:${urgencyHint}\n\n${ctx.documentText}`,
    },
  ];

  // Tool-Use Loop (max 3 Iterationen)
  for (let i = 0; i < 3; i++) {
    const response = await anthropic.messages.create({
      model: SONNET_MODEL,
      max_tokens: 1024,
      system: getSystemPrompt("AG01"),
      tools: [TOOL_KLASSIFIZIERE],
      messages,
    });

    const tokens = extractTokenUsage(response);
    totalTokens = mergeTokenUsage(totalTokens, tokens);

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") break;
    if (response.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      if (block.name === "klassifiziere_bescheid") {
        const input = block.input as KlassifizierungInput;
        const result: TriageResult = {
          behoerde: input.behoerde,
          rechtsgebiet: input.rechtsgebiet,
          untergebiet: input.untergebiet,
          bescheid_datum: input.bescheid_datum,
          frist_datum: input.frist_datum,
          frist_tage: input.frist_tage,
          bg_nummer: input.bg_nummer,
          routing_stufe: ctx.routingStufe,
        };

        // Wenn AG01 eine andere Dringlichkeit erkennt: höhere Stufe gewinnt
        if (input.frist_tage !== undefined && input.frist_tage <= 7 && ctx.routingStufe !== "NOTFALL") {
          result.routing_stufe = "NOTFALL";
        } else if (input.frist_tage !== undefined && input.frist_tage <= 14 && ctx.routingStufe === "NORMAL") {
          result.routing_stufe = "HOCH";
        }

        return {
          agentId: "AG01",
          success: true,
          data: result,
          tokens: totalTokens,
          durationMs: Date.now() - start,
        };
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify({ error: "Unbekanntes Tool" }),
      });
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }

  return {
    agentId: "AG01",
    success: false,
    data: fallback,
    tokens: totalTokens,
    durationMs: Date.now() - start,
    error: "Klassifizierung nicht abgeschlossen",
  };
}

export const ag01Orchestrator: Agent<TriageResult> = {
  id: "AG01",
  name: "Orchestrator",
  model: () => SONNET_MODEL,
  execute,
};
