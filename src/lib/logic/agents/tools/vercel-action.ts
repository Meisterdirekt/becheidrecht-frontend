/**
 * Tool: vercel_action
 * Prüft Vercel Deployment-Status.
 * NUR lesend — kein Schreiben von Env-Variablen (Security!).
 */

import type Anthropic from "@anthropic-ai/sdk";

export const TOOL_VERCEL_ACTION: Anthropic.Tool = {
  name: "vercel_action",
  description:
    "Prüft den Status des aktuellen Vercel-Deployments. Nur lesend.",
  input_schema: {
    type: "object" as const,
    properties: {
      action: {
        type: "string",
        enum: ["status", "latest_deployment"],
        description: "Welche Information abgerufen werden soll",
      },
    },
    required: ["action"],
  },
};

export async function executeVercelAction(
  action: string,
): Promise<{ available: boolean; data?: Record<string, unknown>; error?: string }> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return { available: false, error: "VERCEL_TOKEN fehlt." };
  }

  try {
    if (action === "status" || action === "latest_deployment") {
      const response = await fetch(
        "https://api.vercel.com/v6/deployments?limit=1",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        return { available: false, error: `Vercel API ${response.status}` };
      }

      const result = await response.json();
      const deployment = result.deployments?.[0];
      if (!deployment) {
        return { available: true, data: { message: "Kein Deployment gefunden." } };
      }

      return {
        available: true,
        data: {
          state: deployment.state,
          url: deployment.url,
          created: deployment.created,
          ready: deployment.ready,
        },
      };
    }

    return { available: false, error: `Unbekannte Aktion: ${action}` };
  } catch (err) {
    return {
      available: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
