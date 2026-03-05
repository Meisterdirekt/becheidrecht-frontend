/**
 * AG11 — DevOps-Agent (Haiku · wöchentlicher Batch)
 * Erstellt GitHub Issues für Infrastruktur-Verbesserungen.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import { HAIKU_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient, mergeTokenUsage } from "./utils";
import { TOOL_GITHUB_ACTION, executeGithubAction } from "./tools/github-action";
import { TOOL_VERCEL_ACTION, executeVercelAction } from "./tools/vercel-action";

interface BatchResult {
  issues_created: number;
  issue_urls: string[];
}

const TOOLS: Anthropic.Tool[] = [TOOL_GITHUB_ACTION, TOOL_VERCEL_ACTION];

async function execute(ctx: AgentContext): Promise<AgentResult<BatchResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  if (!apiKey || !process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return {
      agentId: "AG11",
      success: true,
      data: { issues_created: 0, issue_urls: [] },
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: !apiKey ? "Kein API-Key" : "GITHUB_TOKEN oder GITHUB_REPO fehlt",
    };
  }

  const anthropic = createAnthropicClient(apiKey);
  let totalTokens = emptyTokenUsage();
  const issueUrls: string[] = [];

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Prüfe den Infrastruktur-Status und erstelle GitHub Issues für DevOps-Verbesserungen falls nötig:\n\n${ctx.documentText}`,
    },
  ];

  for (let i = 0; i < 4; i++) {
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1024,
      system: getSystemPrompt("AG11"),
      tools: TOOLS,
      messages,
    });

    const tokens = extractTokenUsage(response);
    totalTokens = mergeTokenUsage(totalTokens, tokens);
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn" || response.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      let resultContent = "";

      switch (block.name) {
        case "github_action": {
          const input = block.input as { title: string; body: string; labels?: string[] };
          const result = await executeGithubAction(input.title, input.body, input.labels ?? ["devops"]);
          if (result.issue_url) issueUrls.push(result.issue_url);
          resultContent = JSON.stringify(result);
          break;
        }

        case "vercel_action": {
          const input = block.input as { action: string };
          const result = await executeVercelAction(input.action);
          resultContent = JSON.stringify(result);
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

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }

  return {
    agentId: "AG11",
    success: true,
    data: { issues_created: issueUrls.length, issue_urls: issueUrls },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

export const ag11DevopsAgent: Agent<BatchResult> = {
  id: "AG11",
  name: "DevOps-Agent",
  model: () => HAIKU_MODEL,
  execute,
};
