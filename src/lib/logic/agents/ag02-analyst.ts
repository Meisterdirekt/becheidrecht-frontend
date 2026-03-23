/**
 * AG02 — Analyst (Sonnet/Opus · Tiefenanalyse)
 * Durchsucht Fehlerkatalog, Weisungen und DB nach Auffälligkeiten.
 * Bei NOTFALL → Opus, sonst Sonnet.
 *
 * Lernmechanismus: Liest feedback_stats (von AG20) und warnt bei
 * bekannten False Positives im Prompt.
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

// ---------------------------------------------------------------------------
// Feedback-Signale aus Nutzerfeedback (AG20 → feedback_stats)
// Zwei Richtungen: False Positives (Vorsicht) + True Positives (bestaetigt)
// ---------------------------------------------------------------------------

async function loadFeedbackSignals(): Promise<string> {
  try {
    const result = await executeDbRead("feedback_stats", undefined, 30);
    if (!result.available || result.rows.length === 0) return "";

    const parts: string[] = [];

    // 1. False Positives — Fehler die haeufig NICHT zutrafen
    const fpSignals = result.rows
      .filter(
        (r) =>
          (r.false_positive_rate as number) >= 30 &&
          (r.total_count as number) >= 3,
      )
      .sort(
        (a, b) =>
          (b.false_positive_rate as number) - (a.false_positive_rate as number),
      )
      .slice(0, 10);

    if (fpSignals.length > 0) {
      const fpLines = fpSignals.map(
        (s) =>
          `- ${s.fehler_id} (${Math.round(s.false_positive_rate as number)}% false positive, n=${s.total_count})`,
      );
      parts.push(
        `BEKANNTE FALSE POSITIVES (aus Nutzerfeedback):\n` +
        `Diese Fehler-IDs wurden haeufig als nicht zutreffend markiert. ` +
        `Pruefe besonders kritisch ob sie WIRKLICH auf diesen Bescheid zutreffen:\n` +
        fpLines.join("\n"),
      );
    }

    // 2. True Positives — Fehler die haeufig BESTAETIGT wurden
    const tpSignals = result.rows
      .filter(
        (r) =>
          (r.true_positive_rate as number) >= 60 &&
          (r.total_count as number) >= 3,
      )
      .sort(
        (a, b) =>
          (b.true_positive_rate as number) - (a.true_positive_rate as number),
      )
      .slice(0, 10);

    if (tpSignals.length > 0) {
      const tpLines = tpSignals.map(
        (s) =>
          `- ${s.fehler_id} (${Math.round(s.true_positive_rate as number)}% bestaetigt, n=${s.total_count})`,
      );
      parts.push(
        `HAEUFIG BESTAETIGTE FEHLER (aus Nutzerfeedback):\n` +
        `Diese Fehler-IDs wurden von Nutzern ueberdurchschnittlich oft als korrekt bestaetigt. ` +
        `Pruefe gezielt ob sie auch auf diesen Bescheid zutreffen:\n` +
        tpLines.join("\n"),
      );
    }

    return parts.length > 0 ? "\n\n" + parts.join("\n\n") : "";
  } catch {
    return ""; // Graceful degradation
  }
}

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

  // Feedback-Signale laden: False Positives (Vorsicht) + True Positives (bestaetigt)
  const feedbackSignals = await loadFeedbackSignals();

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Analysiere diesen Bescheid auf Fehler:${triageInfo}${nutzerKontext}${feedbackSignals}\n\n${ctx.documentText.slice(0, 12000)}`,
    },
  ];

  // Primärer Träger-Key aus Behördenname (null wenn unerkannt)
  let traegerKey = ctx.pipeline.triage
    ? detectTraegerKey(ctx.pipeline.triage.behoerde)
    : null;

  // Fallback: Wenn AG01 "Unbekannt" lieferte, versuche Träger direkt aus Dokumenttext zu erkennen
  if (!traegerKey && ctx.pipeline.triage?.behoerde === "Unbekannt") {
    traegerKey = detectTraegerKey(ctx.documentText.slice(0, 3000));
    if (traegerKey) {
      console.info(`[AG02] Träger-Fallback aus Dokumenttext: ${traegerKey}`);
    }
  }

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
