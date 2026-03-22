/**
 * AG02 — Analyst (Sonnet/Opus · Tiefenanalyse)
 * Durchsucht Fehlerkatalog, Weisungen und DB nach Auffälligkeiten.
 * Bei NOTFALL → Opus, sonst Sonnet.
 */

import Anthropic from "@anthropic-ai/sdk";
import { TRAEGER_TO_PREFIX } from "@/lib/letter-generator";
import { normalizeSgb, SGB_TO_RECHTSGEBIET, RECHTSGEBIET_TRAEGER } from "../constants/rechtsgebiete";
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
  extractJsonSafe,
} from "./utils";
import { TOOL_SUCHE_FEHLERKATALOG, executeSucheFehlerkatalogMitDb } from "./tools/fehlerkatalog";
import { TOOL_GET_WEISUNGEN, executeGetWeisungen } from "./tools/weisungen";
import { TOOL_DB_READ, executeDbRead } from "./tools/db-read";
import { processToolBlocks } from "./tools/process-tool-results";

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

  const weitereRg = ctx.pipeline.triage?.weitere_rechtsgebiete;
  const weitereInfo = weitereRg?.length
    ? `\nWeitere Rechtsgebiete: ${weitereRg.join(", ")}`
    : "";

  const triageInfo = ctx.pipeline.triage
    ? `\n\nKLASSIFIZIERUNG (AG01):\nBehörde: ${ctx.pipeline.triage.behoerde}\nRechtsgebiet: ${ctx.pipeline.triage.rechtsgebiet}${weitereInfo}\nUntergebiet: ${ctx.pipeline.triage.untergebiet}\nRouting: ${ctx.pipeline.triage.routing_stufe}`
    : "";

  const nutzerKontext = ctx.userContext
    ? `\n\nHINTERGRUND VOM NUTZER:\n${ctx.userContext}`
    : "";

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Analysiere diesen Bescheid auf Fehler:${triageInfo}${nutzerKontext}\n\n${ctx.documentText}`,
    },
  ];

  // Primärer Träger-Key aus Behördenname (null wenn unerkannt)
  const traegerKey = ctx.pipeline.triage
    ? detectTraegerKey(ctx.pipeline.triage.behoerde)
    : null;

  // Multi-Rechtsgebiet: Auch Prefixes der weiteren Rechtsgebiete sammeln
  const allTraegerKeys = new Set<string>(traegerKey ? [traegerKey] : []);
  if (weitereRg) {
    for (const sgb of weitereRg) {
      const normalized = normalizeSgb(sgb);
      const rgCode = SGB_TO_RECHTSGEBIET[normalized];
      if (rgCode) {
        const tKey = RECHTSGEBIET_TRAEGER[rgCode];
        if (tKey) allTraegerKeys.add(tKey);
      }
    }
  }

  const gefundeneIds = new Set<string>();
  const gefundeneFehler: AnalyseResult["fehler"] = [];
  let auffaelligkeiten: string[] = [];
  let katalogToolCalled = false;

  // Extended Thinking für NOTFALL — maximale Analysetiefe bei life-critical Fällen
  const useExtendedThinking = ctx.routingStufe === "NOTFALL";

  // Tool-Use Loop (max 3 Iterationen — jede braucht ~15-25s API-Call)
  for (let i = 0; i < 3; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createParams: any = {
      model,
      max_tokens: useExtendedThinking ? 16000 : 2048,
      system: getSystemPrompt("AG02"),
      tools: TOOLS,
      messages,
    };
    if (useExtendedThinking) {
      createParams.thinking = { type: "enabled", budget_tokens: 8000 };
      // interleaved-thinking-2025-05-14 gilt nur für Claude 3.7 Sonnet.
      // Claude 4 Modelle (opus-4-x, sonnet-4-x) unterstützen thinking nativ ohne Beta-Header.
      if (model.includes("3-7") || model.includes("3-5")) {
        createParams.betas = ["interleaved-thinking-2025-05-14"];
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: Anthropic.Message = await anthropic.messages.create(createParams as any);

    const tokens = extractTokenUsage(response);
    totalTokens = mergeTokenUsage(totalTokens, tokens);

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      // Auffälligkeiten aus dem letzten Text-Block extrahieren (mit Fallback)
      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        const parsed = extractJsonSafe<{ auffaelligkeiten?: string[] }>(
          textBlock.text,
          {}
        );
        if (Array.isArray(parsed.auffaelligkeiten)) {
          auffaelligkeiten = parsed.auffaelligkeiten;
        }
      }

      // Retry nur wenn das Tool NIE aufgerufen wurde (LLM hat Tool-Call übersprungen).
      // Wenn das Tool aufgerufen wurde und 0 Treffer liefert, ist das ein valides Ergebnis
      // — nicht jeder Bescheid hat Fehler. Aggressives Retry erzwingt sonst False Positives.
      if (!katalogToolCalled && i < 2) {
        messages.push({ role: "user", content:
          "Du hast suche_fehlerkatalog noch nicht aufgerufen. " +
          "Rufe JETZT suche_fehlerkatalog auf mit 4-6 PRÄZISEN Stichwörtern aus dem Bescheid " +
          "(konkrete Paragraphen und Leistungsarten die im Text vorkommen). " +
          "Gib auch auffaelligkeiten als JSON zurück."
        });
        continue;
      }
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const toolResults = await processToolBlocks(response.content, {
      suche_fehlerkatalog: {
        execute: async (input) => {
          katalogToolCalled = true;
          // Prefixes aller relevanten Träger sammeln (Haupt + weitere Rechtsgebiete)
          const prefixes: string[] = [];
          for (const tKey of allTraegerKeys) {
            const tp = TRAEGER_TO_PREFIX[tKey];
            if (tp) prefixes.push(...tp);
          }
          const fehler = await executeSucheFehlerkatalogMitDb(prefixes, input.stichworten as string[]);
          for (const f of fehler) {
            if (!gefundeneIds.has(f.id)) {
              gefundeneIds.add(f.id);
              gefundeneFehler.push(f);
            }
          }
          return JSON.stringify(
            fehler.map((f) => ({
              id: f.id,
              titel: f.titel,
              severity: f.severity,
              musterschreiben_hinweis: f.musterschreiben_hinweis,
              rechtsbasis: f.rechtsbasis,
            }))
          );
        },
      },
      get_weisungen: {
        execute: (input) => executeGetWeisungen(input.traeger as string),
      },
      db_read: {
        execute: async (input) => {
          const dbResult = await executeDbRead(
            input.tabelle as string,
            input.filter as Record<string, string> | undefined,
            input.limit as number | undefined,
          );
          return JSON.stringify(dbResult);
        },
      },
    });

    messages.push({ role: "user", content: toolResults });
  }

  const confidence = gefundeneFehler.length > 0 ? 0.9 : auffaelligkeiten.length > 0 ? 0.7 : 0.5;

  if (gefundeneFehler.length === 0 && auffaelligkeiten.length === 0) {
    console.warn("[AG02] WARNUNG: Keine Fehler und keine Auffälligkeiten gefunden", {
      iterationen: "loop beendet",
      traegerKey,
      rechtsgebiet: ctx.pipeline.triage?.rechtsgebiet ?? "unbekannt",
    });
  } else {
    console.info(`[AG02] Ergebnis: ${gefundeneFehler.length} Fehlerkatalog-Treffer, ${auffaelligkeiten.length} Auffälligkeiten`);
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
    confidence,
  };
}

export const ag02Analyst: Agent<AnalyseResult> = {
  id: "AG02",
  name: "Analyst",
  model: modelForStufe,
  execute,
};
