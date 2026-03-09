/**
 * AG16 — Vercel-Ops-Agent (Haiku · täglich 06:00 UTC)
 *
 * Vollautomatisches Deployment-Monitoring:
 * 1. Letzte 10 Deployments prüfen (State, Dauer, Fehler)
 * 2. Build-Logs für ERROR-Deployments analysieren (Root Cause)
 * 3. Projekt-Info + Domain-Status prüfen
 * 4. Bei kritischen Befunden: GitHub Issue erstellen
 * 5. Niemals Auto-Rollback — nur warnen + dokumentieren
 *
 * Benötigt: VERCEL_TOKEN, ANTHROPIC_API_KEY
 * Optional:  GITHUB_TOKEN + GITHUB_REPO (für Issue-Erstellung)
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type VercelMonitorResult,
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
import { TOOL_VERCEL_ACTION, executeVercelAction } from "./tools/vercel-action";

// ---------------------------------------------------------------------------
// Tool-Set: Vercel (read-only) + GitHub (issue creation)
// ---------------------------------------------------------------------------

const TOOLS: Anthropic.Tool[] = [TOOL_VERCEL_ACTION, TOOL_GITHUB_ACTION];

// ---------------------------------------------------------------------------
// execute
// ---------------------------------------------------------------------------

async function execute(ctx: AgentContext): Promise<AgentResult<VercelMonitorResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  if (!apiKey) {
    return makeSkipResult("Kein ANTHROPIC_API_KEY", start);
  }

  if (!process.env.VERCEL_TOKEN) {
    return makeSkipResult("VERCEL_TOKEN fehlt — Vercel-Monitoring übersprungen", start);
  }

  const anthropic = createAnthropicClient(apiKey);
  let totalTokens = emptyTokenUsage();
  const issueUrls: string[] = [];

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: ctx.documentText,
    },
  ];

  // Tool-Use Loop — max 10 Iterationen (Haiku ist schnell + günstig)
  for (let iteration = 0; iteration < 10; iteration++) {
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 2048,
      system: getSystemPrompt("AG16"),
      tools: TOOLS,
      messages,
    });

    totalTokens = mergeTokenUsage(totalTokens, extractTokenUsage(response));
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      let resultContent = "";

      switch (block.name) {
        case "vercel_action": {
          const input = block.input as {
            action: string;
            deployment_id?: string;
            limit?: number;
          };
          const result = await executeVercelAction(input);
          resultContent = JSON.stringify(result);
          break;
        }

        case "github_action": {
          const input = block.input as {
            title: string;
            body: string;
            labels?: string[];
          };
          const result = await executeGithubAction(
            input.title,
            input.body,
            input.labels ?? ["devops", "critical"],
          );
          if (result.issue_url) issueUrls.push(result.issue_url);
          resultContent = JSON.stringify(result);
          break;
        }

        default:
          resultContent = JSON.stringify({ error: `Unbekanntes Tool: ${block.name}` });
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: resultContent,
      });
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }

  // Finalen Text extrahieren
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

  // Health-Status aus finalem Text und Issue-Ergebnis ableiten
  const lower = finalText.toLowerCase();
  const health: VercelMonitorResult["health_status"] = issueUrls.length > 0
    ? (lower.includes("critical") || lower.includes("kritisch") ? "critical" : "degraded")
    : "healthy";

  // ERROR-Count aus Tool-Results schätzen
  const errorMatches = messages
    .map((m) => JSON.stringify(m.content))
    .join("")
    .match(/"state"\s*:\s*"ERROR"/g);
  const failedDeployments = errorMatches?.length ?? 0;

  // Fehlende Env-Vars aus ctx extrahieren (werden vom Cron gesetzt)
  const missingVarsMatch = ctx.documentText.match(/FEHLENDE REQUIRED-VARS:\s*([^\n]+)/);
  const envVarsMissing = missingVarsMatch
    ? missingVarsMatch[1].split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  console.log(
    `[AG16] Abgeschlossen — Health: ${health}, Issues: ${issueUrls.length}, Fehler: ${failedDeployments}`,
  );

  return {
    agentId: "AG16",
    success: true,
    data: {
      deployments_checked: 10,
      failed_deployments: failedDeployments,
      env_vars_missing: envVarsMissing,
      issues_created: issueUrls,
      health_status: health,
      summary: finalText.slice(0, 600),
    },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

// ---------------------------------------------------------------------------
// Helper: Graceful Skip Result
// ---------------------------------------------------------------------------

function makeSkipResult(reason: string, start: number): AgentResult<VercelMonitorResult> {
  return {
    agentId: "AG16",
    success: true,
    data: {
      deployments_checked: 0,
      failed_deployments: 0,
      env_vars_missing: [],
      issues_created: [],
      health_status: "healthy",
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

export const ag16VercelAgent: Agent<VercelMonitorResult> = {
  id: "AG16",
  name: "Vercel-Ops-Agent",
  model: () => HAIKU_MODEL,
  execute,
};
