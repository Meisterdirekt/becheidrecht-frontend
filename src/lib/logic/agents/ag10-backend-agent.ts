/**
 * AG10 — Backend-Agent (Haiku · wöchentlicher Batch)
 * Erstellt GitHub Issues für Backend-Verbesserungen.
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

interface BatchResult {
  issues_created: number;
  issue_urls: string[];
}

const TOOLS: Anthropic.Tool[] = [TOOL_GITHUB_ACTION];

async function execute(ctx: AgentContext): Promise<AgentResult<BatchResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  if (!apiKey || !process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return {
      agentId: "AG10",
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
      content: `Analysiere den folgenden Kontext und erstelle GitHub Issues für Backend-Verbesserungen falls nötig:\n\n${ctx.documentText}`,
    },
  ];

  for (let i = 0; i < 4; i++) {
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1024,
      system: getSystemPrompt("AG10"),
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

      if (block.name === "github_action") {
        const input = block.input as { title: string; body: string; labels?: string[] };
        const result = await executeGithubAction(input.title, input.body, input.labels ?? ["backend"]);
        if (result.issue_url) issueUrls.push(result.issue_url);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }

  return {
    agentId: "AG10",
    success: true,
    data: { issues_created: issueUrls.length, issue_urls: issueUrls },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

export const ag10BackendAgent: Agent<BatchResult> = {
  id: "AG10",
  name: "Backend-Agent",
  model: () => HAIKU_MODEL,
  execute,
};
