/**
 * AG17 — Agent-Auditor (Haiku · mittwochs 05:00 UTC)
 *
 * Wöchentlicher Qualitäts-Flywheel für das gesamte Agenten-System:
 * 1. Empfängt vorberechnete Metriken (aus Cron-Route, kein DB-Call hier)
 * 2. Erkennt Anomalien: Erfolgsraten, Latenzen, Kosten, Fehlermuster
 * 3. Bewertet Pipeline-Gesundheit systemweit
 * 4. Erstellt IMMER ein wöchentliches GitHub Audit-Issue (auch wenn gesund)
 *
 * Design-Prinzip: Alle DB-Abfragen im Cron-Handler (TypeScript, kein LLM).
 * Der Agent empfängt fertige Metriken und erzeugt nur den Report.
 * = maximale Qualität bei minimalen Token-Kosten.
 *
 * Benötigt: ANTHROPIC_API_KEY, GITHUB_TOKEN + GITHUB_REPO (für Issue)
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type AgentAuditResult,
  type AnomalyItem,
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

// ---------------------------------------------------------------------------
// Tool-Set: Nur GitHub (für Issue-Erstellung)
// ---------------------------------------------------------------------------

const TOOLS: Anthropic.Tool[] = [TOOL_GITHUB_ACTION];

// ---------------------------------------------------------------------------
// execute
// ---------------------------------------------------------------------------

async function execute(ctx: AgentContext): Promise<AgentResult<AgentAuditResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  if (!apiKey) {
    return makeSkipResult("Kein ANTHROPIC_API_KEY", start);
  }

  const anthropic = createAnthropicClient(apiKey);
  let totalTokens = emptyTokenUsage();
  const issueUrls: string[] = [];

  // ctx.documentText enthält den vollständig formatierten Metriken-Report
  // vom Cron-Handler — kein weiterer DB-Zugriff nötig
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content:
        `Wöchentlicher Agent-Audit — ${new Date().toLocaleDateString("de-DE")}.\n\n` +
        `Bitte analysiere die folgenden Metriken und erstelle das wöchentliche GitHub Audit-Issue:\n\n` +
        ctx.documentText,
    },
  ];

  // Tool-Use Loop — max 5 Iterationen (Report-Generierung + 1 Issue)
  for (let iteration = 0; iteration < 5; iteration++) {
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 4096,
      system: getSystemPrompt("AG17"),
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
          input.labels ?? ["monitoring", "agents"],
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

  // Finalen Report-Text extrahieren
  const finalText = messages
    .filter((m) => m.role === "assistant")
    .flatMap((m): string[] => {
      if (typeof m.content === "string") return [m.content];
      if (!Array.isArray(m.content)) return [];
      return m.content
        .filter(
          (b): b is Anthropic.TextBlock =>
            b !== null &&
            typeof b === "object" &&
            "type" in b &&
            (b as Anthropic.TextBlock).type === "text",
        )
        .map((b) => b.text);
    })
    .join("\n");

  // Anomalien aus ctx.documentText extrahieren (vom Cron vorberechnet)
  const anomalies = extractAnomaliesFromContext(ctx.documentText);

  // Analyses-Zahl aus ctx.documentText extrahieren
  const analysesMatch = ctx.documentText.match(/ANALYSEN_GESAMT:\s*(\d+)/);
  const analysesChecked = analysesMatch ? parseInt(analysesMatch[1]) : 0;

  // Health-Status aus Anomalien + LLM-Output ableiten
  const hasCritical =
    anomalies.some((a) => a.severity === "critical") ||
    finalText.toLowerCase().includes("🔴") ||
    finalText.toLowerCase().includes("kritisch");
  const hasWarnings = anomalies.some((a) => a.severity === "warning");

  const health: AgentAuditResult["health_status"] = hasCritical
    ? "critical"
    : hasWarnings
    ? "degraded"
    : "healthy";

  console.log(
    `[AG17] Audit abgeschlossen — Health: ${health}, Anomalien: ${anomalies.length}, Issue: ${issueUrls[0] ?? "keins"}`,
  );

  return {
    agentId: "AG17",
    success: true,
    data: {
      analyses_checked: analysesChecked,
      agents_audited: 18,
      anomalies,
      issues_created: issueUrls,
      health_status: health,
      report: finalText.slice(0, 1000),
    },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

// ---------------------------------------------------------------------------
// Anomalie-Extraktion aus vorberechneten Metriken-Context
// ---------------------------------------------------------------------------

function extractAnomaliesFromContext(contextText: string): AnomalyItem[] {
  const anomalies: AnomalyItem[] = [];

  // Format im Context: "KRITISCH: AG02 success_rate=72% (Schwelle: 80%)"
  const criticalMatches = contextText.matchAll(
    /KRITISCH:\s*(AG\d+)\s+(\w+)=([\d.]+)/g,
  );
  for (const m of criticalMatches) {
    anomalies.push({
      agent_id: m[1],
      type: m[2] as AnomalyItem["type"],
      severity: "critical",
      value: parseFloat(m[3]),
      threshold: 80,
      message: `${m[1]}: ${m[2]}=${m[3]} unter kritischem Schwellwert`,
    });
  }

  // Format im Context: "WARNUNG: AG04 avg_duration_ms=9200"
  const warningMatches = contextText.matchAll(
    /WARNUNG:\s*(AG\d+)\s+(\w+)=([\d.]+)/g,
  );
  for (const m of warningMatches) {
    anomalies.push({
      agent_id: m[1],
      type: m[2] as AnomalyItem["type"],
      severity: "warning",
      value: parseFloat(m[3]),
      threshold: 90,
      message: `${m[1]}: ${m[2]}=${m[3]} im Warnbereich`,
    });
  }

  return anomalies;
}

// ---------------------------------------------------------------------------
// Helper: Graceful Skip Result
// ---------------------------------------------------------------------------

function makeSkipResult(reason: string, start: number): AgentResult<AgentAuditResult> {
  return {
    agentId: "AG17",
    success: true,
    data: {
      analyses_checked: 0,
      agents_audited: 0,
      anomalies: [],
      issues_created: [],
      health_status: "healthy",
      report: reason,
    },
    tokens: emptyTokenUsage(),
    durationMs: Date.now() - start,
    error: reason,
  };
}

// ---------------------------------------------------------------------------
// Agent Export
// ---------------------------------------------------------------------------

export const ag17AgentAuditor: Agent<AgentAuditResult> = {
  id: "AG17",
  name: "Agent-Auditor",
  model: () => HAIKU_MODEL,
  execute,
};
