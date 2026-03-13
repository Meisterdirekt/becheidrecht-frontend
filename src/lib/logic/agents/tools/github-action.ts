/**
 * Tool: github_action
 * Erstellt GitHub Issues via REST API.
 * Benötigt GITHUB_TOKEN + GITHUB_REPO (optional, graceful skip).
 */

import type Anthropic from "@anthropic-ai/sdk";
import { closeStaleIssues } from "./github-issues";

export const TOOL_GITHUB_ACTION: Anthropic.Tool = {
  name: "github_action",
  description:
    "Erstellt ein GitHub Issue im Projekt-Repository. " +
    "Benötigt GITHUB_TOKEN und GITHUB_REPO Umgebungsvariablen.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: {
        type: "string",
        description: "Issue-Titel (kurz und prägnant)",
      },
      body: {
        type: "string",
        description: "Issue-Beschreibung (Markdown)",
      },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Labels (z.B. ['frontend', 'enhancement'])",
      },
    },
    required: ["title", "body"],
  },
};

export async function executeGithubAction(
  title: string,
  body: string,
  labels?: string[],
  agentPrefix?: string,
): Promise<{ available: boolean; issue_url?: string; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return { available: false, error: "GITHUB_TOKEN oder GITHUB_REPO fehlt." };
  }

  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) {
    return { available: false, error: "GITHUB_REPO Format muss 'owner/repo' sein." };
  }

  // Alte Issues schließen wenn agentPrefix angegeben
  if (agentPrefix && labels) {
    await closeStaleIssues(labels, agentPrefix, 1);
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          title,
          body: `${body}\n\n---\n_Erstellt von BescheidRecht Agent-System_`,
          labels: labels ?? [],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { available: false, error: `GitHub API ${response.status}: ${error}` };
    }

    const data = await response.json();
    return { available: true, issue_url: data.html_url };
  } catch (err) {
    return {
      available: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
