/**
 * AG02 — Analyst (Sonnet/Opus · Tiefenanalyse)
 * Durchsucht Fehlerkatalog, Weisungen und DB nach Auffälligkeiten.
 * Bei NOTFALL → Opus, sonst Sonnet.
 */

import Anthropic from "@anthropic-ai/sdk";
import { TRAEGER_TO_PREFIX } from "@/lib/letter-generator";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type AnalyseResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import {
  modelForStufe,
  extractTokenUsage,
  getAnthropicKey,
  createAnthropicClient,
  detectTraegerKey,
  mergeTokenUsage,
} from "./utils";
import { TOOL_SUCHE_FEHLERKATALOG, executeSucheFehlerkatalog } from "./tools/fehlerkatalog";
import { TOOL_GET_WEISUNGEN, executeGetWeisungen } from "./tools/weisungen";
import { TOOL_DB_READ, executeDbRead } from "./tools/db-read";

const TOOLS: Anthropic.Tool[] = [
  TOOL_SUCHE_FEHLERKATALOG,
  TOOL_GET_WEISUNGEN,
  TOOL_DB_READ,
];

async function execute(ctx: AgentContext): Promise<AgentResult<AnalyseResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  const fallback: AnalyseResult = { fehler: [], auffaelligkeiten: [] };

  if (!apiKey) {
    return {
      agentId: "AG02",
      success: false,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "Kein API-Key",
    };
  }

  const anthropic = createAnthropicClient(apiKey);
  const model = modelForStufe(ctx.routingStufe);
  let totalTokens = emptyTokenUsage();

  const triageInfo = ctx.pipeline.triage
    ? `\n\nKLASSIFIZIERUNG (AG01):\nBehörde: ${ctx.pipeline.triage.behoerde}\nRechtsgebiet: ${ctx.pipeline.triage.rechtsgebiet}\nUntergebiet: ${ctx.pipeline.triage.untergebiet}\nRouting: ${ctx.pipeline.triage.routing_stufe}`
    : "";

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Analysiere diesen Bescheid auf Fehler:${triageInfo}\n\n${ctx.documentText}`,
    },
  ];

  const traegerKey = ctx.pipeline.triage
    ? detectTraegerKey(ctx.pipeline.triage.behoerde)
    : "jobcenter";

  let gefundeneFehler: AnalyseResult["fehler"] = [];
  let auffaelligkeiten: string[] = [];

  // Tool-Use Loop
  for (let i = 0; i < 6; i++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: getSystemPrompt("AG02"),
      tools: TOOLS,
      messages,
    });

    const tokens = extractTokenUsage(response);
    totalTokens = mergeTokenUsage(totalTokens, tokens);

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      // Versuche Auffälligkeiten aus dem letzten Text-Block zu extrahieren
      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        try {
          const parsed = JSON.parse(textBlock.text);
          if (Array.isArray(parsed.auffaelligkeiten)) {
            auffaelligkeiten = parsed.auffaelligkeiten;
          }
        } catch {
          // Text ist kein JSON — kein Problem
        }
      }
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      let resultContent = "";

      switch (block.name) {
        case "suche_fehlerkatalog": {
          const input = block.input as { stichworten: string[] };
          const prefixes = TRAEGER_TO_PREFIX[traegerKey] ?? [];
          const fehler = executeSucheFehlerkatalog(prefixes, input.stichworten);
          gefundeneFehler = fehler;
          resultContent = JSON.stringify(
            fehler.map((f) => ({
              id: f.id,
              titel: f.titel,
              severity: f.severity,
              musterschreiben_hinweis: f.musterschreiben_hinweis,
              rechtsbasis: f.rechtsbasis,
            }))
          );
          break;
        }

        case "get_weisungen": {
          const input = block.input as { traeger: string };
          resultContent = executeGetWeisungen(input.traeger);
          break;
        }

        case "db_read": {
          const input = block.input as {
            tabelle: string;
            filter?: Record<string, string>;
            limit?: number;
          };
          const dbResult = await executeDbRead(input.tabelle, input.filter, input.limit);
          resultContent = JSON.stringify(dbResult);
          break;
        }

        default:
          resultContent = JSON.stringify({ error: "Unbekanntes Tool" });
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: resultContent,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  return {
    agentId: "AG02",
    success: true,
    data: {
      fehler: gefundeneFehler,
      auffaelligkeiten,
    },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

export const ag02Analyst: Agent<AnalyseResult> = {
  id: "AG02",
  name: "Analyst",
  model: modelForStufe,
  execute,
};
