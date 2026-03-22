/**
 * AG20 — Feedback-Learner (Haiku · freitags via Daily-Hub)
 *
 * Woechentlicher Lernmechanismus:
 * 1. Empfaengt vorberechnete Feedback-Statistiken (aus Cron-Route)
 * 2. Analysiert False-Positive-Muster und Accuracy pro Rechtsgebiet
 * 3. Erstellt GitHub Issue mit konkreten Verbesserungsvorschlaegen
 *
 * Design-Prinzip: Alle DB-Aggregationen im Cron-Handler (TypeScript).
 * Der Agent erzeugt nur den Report + GitHub Issue.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type FeedbackLearnerResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import {
  HAIKU_MODEL,
  extractTokenUsage,
  getAnthropicKey,
  createAnthropicClient,
  mergeTokenUsage,
} from "./utils";
import { TOOL_GITHUB_ACTION, executeGithubAction } from "./tools/github-action";
import { reportInfo } from "@/lib/error-reporter";

// ---------------------------------------------------------------------------
// Tool-Set: Nur GitHub (fuer Issue-Erstellung)
// ---------------------------------------------------------------------------

const TOOLS: Anthropic.Tool[] = [TOOL_GITHUB_ACTION];

// ---------------------------------------------------------------------------
// execute
// ---------------------------------------------------------------------------

async function execute(ctx: AgentContext): Promise<AgentResult<FeedbackLearnerResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  if (!apiKey) {
    return makeSkipResult("Kein ANTHROPIC_API_KEY", start);
  }

  // Prüfe ob überhaupt Feedback-Daten vorhanden
  if (!ctx.documentText || ctx.documentText.includes("KEINE_DATEN")) {
    return makeSkipResult("Keine Feedback-Daten vorhanden", start);
  }

  const anthropic = createAnthropicClient(apiKey);
  let totalTokens = emptyTokenUsage();
  const issueUrls: string[] = [];

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content:
        `Woechentlicher Feedback-Report — ${new Date().toLocaleDateString("de-DE")}.\n\n` +
        `Analysiere die Feedback-Statistiken und erstelle ein GitHub Issue mit Verbesserungsvorschlaegen:\n\n` +
        ctx.documentText,
    },
  ];

  // Tool-Use Loop — max 5 Iterationen
  for (let iteration = 0; iteration < 5; iteration++) {
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 4096,
      system: getSystemPrompt("AG20"),
      tools: TOOLS,
      messages,
    });

    totalTokens = mergeTokenUsage(totalTokens, extractTokenUsage(response));
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      if (block.name === "github_action") {
        const input = block.input as {
          title: string;
          body: string;
          labels?: string[];
        };
        const result = await executeGithubAction(
          input.title,
          input.body,
          input.labels ?? ["feedback", "learning", "automated"],
          "AG20",
        );
        if (result.issue_url) issueUrls.push(result.issue_url);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      } else {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify({ error: `Unbekanntes Tool: ${block.name}` }),
        });
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }

  // Ergebnisse aus ctx.documentText extrahieren
  const { falsePositives, lowAccuracy, feedbackCount } = parseMetricsFromContext(ctx.documentText);

  reportInfo("[AG20] Feedback-Analyse abgeschlossen", {
    feedbackCount,
    falsePositives: falsePositives.length,
    issues: issueUrls.length,
  });

  return {
    agentId: "AG20",
    success: true,
    data: {
      feedback_analysed: feedbackCount,
      false_positives_top: falsePositives,
      low_accuracy_rechtsgebiete: lowAccuracy,
      issues_created: issueUrls,
      summary: `${feedbackCount} Feedbacks analysiert, ${falsePositives.length} False-Positive-Muster, ${issueUrls.length} Issues erstellt`,
    },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

// ---------------------------------------------------------------------------
// Metriken-Extraktion aus vorberechnetem Context
// ---------------------------------------------------------------------------

function parseMetricsFromContext(text: string): {
  falsePositives: FeedbackLearnerResult["false_positives_top"];
  lowAccuracy: FeedbackLearnerResult["low_accuracy_rechtsgebiete"];
  feedbackCount: number;
} {
  const falsePositives: FeedbackLearnerResult["false_positives_top"] = [];
  const lowAccuracy: FeedbackLearnerResult["low_accuracy_rechtsgebiete"] = [];

  // Format: "FEEDBACK_GESAMT: 42"
  const countMatch = text.match(/FEEDBACK_GESAMT:\s*(\d+)/);
  const feedbackCount = countMatch ? parseInt(countMatch[1]) : 0;

  // Format: "FP: BA_003 rate=45.5% count=22"
  const fpMatches = text.matchAll(/FP:\s*(\S+)\s+rate=([\d.]+)%\s+count=(\d+)/g);
  for (const m of fpMatches) {
    falsePositives.push({
      fehler_id: m[1],
      rate: parseFloat(m[2]),
      count: parseInt(m[3]),
    });
  }

  // Format: "LOW_ACC: SGB_II incorrect=35.2% total=50"
  const accMatches = text.matchAll(/LOW_ACC:\s*(\S+)\s+incorrect=([\d.]+)%\s+total=(\d+)/g);
  for (const m of accMatches) {
    lowAccuracy.push({
      rechtsgebiet: m[1],
      incorrect_rate: parseFloat(m[2]),
      total: parseInt(m[3]),
    });
  }

  return { falsePositives, lowAccuracy, feedbackCount };
}

// ---------------------------------------------------------------------------
// Helper: Graceful Skip Result
// ---------------------------------------------------------------------------

function makeSkipResult(reason: string, start: number): AgentResult<FeedbackLearnerResult> {
  return {
    agentId: "AG20",
    success: true,
    data: {
      feedback_analysed: 0,
      false_positives_top: [],
      low_accuracy_rechtsgebiete: [],
      issues_created: [],
      summary: reason,
    },
    tokens: emptyTokenUsage(),
    durationMs: Date.now() - start,
    error: reason,
  };
}

// ---------------------------------------------------------------------------
// Agent Export
// ---------------------------------------------------------------------------

export const ag20FeedbackLearner: Agent<FeedbackLearnerResult> = {
  id: "AG20",
  name: "Feedback-Learner",
  model: () => HAIKU_MODEL,
  execute,
};
