/**
 * Tool: vercel_action
 * Vercel API Integration — Deployment-Status, Build-Logs, Projekt-Info.
 * Vollständig lesend — kein Schreiben, kein Auto-Rollback (Security!).
 *
 * Unterstützte Actions:
 *   status              → aktuellstes Deployment (backward compat)
 *   latest_deployment   → aktuellstes Deployment (backward compat)
 *   list_deployments    → letzte N Deployments mit State + Dauer
 *   get_deployment_logs → Build-Logs für eine spezifische Deployment-ID
 *   get_project_info    → Projekt-Metadaten + Domain-Status
 */

import type Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Tool-Definition (für LLM-Tool-Use)
// ---------------------------------------------------------------------------

export const TOOL_VERCEL_ACTION: Anthropic.Tool = {
  name: "vercel_action",
  description:
    "Vercel API — Deployment-Status, Build-Logs und Projekt-Info abrufen. " +
    "Nur lesend. Benötigt VERCEL_TOKEN Umgebungsvariable.",
  input_schema: {
    type: "object" as const,
    properties: {
      action: {
        type: "string",
        enum: [
          "status",
          "latest_deployment",
          "list_deployments",
          "get_deployment_logs",
          "get_project_info",
        ],
        description:
          "Welche Aktion ausgeführt werden soll. " +
          "'list_deployments' → letzte N Deployments. " +
          "'get_deployment_logs' → Build-Logs (deployment_id Pflicht). " +
          "'get_project_info' → Projekt + Domain-Status.",
      },
      deployment_id: {
        type: "string",
        description:
          "Deployment-ID für get_deployment_logs (z.B. 'dpl_abc123'). Pflicht für diese Action.",
      },
      limit: {
        type: "number",
        description: "Anzahl Deployments für list_deployments (1–20, default: 10).",
      },
    },
    required: ["action"],
  },
};

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

type VercelInput =
  | string
  | { action: string; deployment_id?: string; limit?: number };

interface VercelDeployment {
  uid: string;
  state: string;
  url: string;
  created: number;
  ready?: number;
  buildingAt?: number;
  name?: string;
  meta?: { githubCommitMessage?: string };
}

type VercelActionResult = { available: boolean; data?: Record<string, unknown>; error?: string };

// ---------------------------------------------------------------------------
// Haupt-Funktion
// ---------------------------------------------------------------------------

export async function executeVercelAction(
  actionOrInput: VercelInput,
): Promise<VercelActionResult> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return { available: false, error: "VERCEL_TOKEN fehlt." };
  }

  const { action, deployment_id, limit } =
    typeof actionOrInput === "string"
      ? { action: actionOrInput, deployment_id: undefined, limit: undefined }
      : actionOrInput;

  try {
    switch (action) {
      case "status":
      case "latest_deployment":
        return await fetchLatestDeployment(token);

      case "list_deployments":
        return await fetchDeploymentList(token, Math.min(limit ?? 10, 20));

      case "get_deployment_logs":
        if (!deployment_id) {
          return { available: false, error: "deployment_id ist Pflicht für get_deployment_logs." };
        }
        return await fetchDeploymentLogs(token, deployment_id);

      case "get_project_info":
        return await fetchProjectInfo(token);

      default:
        return { available: false, error: `Unbekannte Aktion: ${action}` };
    }
  } catch (err) {
    return {
      available: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Private Helpers
// ---------------------------------------------------------------------------

async function fetchLatestDeployment(token: string): Promise<VercelActionResult> {
  const res = await vercelFetch(token, "/v6/deployments?limit=1");
  if (!res.ok) return { available: false, error: `Vercel API ${res.status}` };

  const result = await res.json();
  const d: VercelDeployment | undefined = result.deployments?.[0];
  if (!d) return { available: true, data: { message: "Kein Deployment gefunden." } };

  return {
    available: true,
    data: {
      uid: d.uid,
      state: d.state,
      url: d.url,
      created: new Date(d.created).toISOString(),
      ready: d.ready ? new Date(d.ready).toISOString() : null,
      duration_seconds: d.ready && d.buildingAt
        ? Math.round((d.ready - d.buildingAt) / 1000)
        : null,
    },
  };
}

async function fetchDeploymentList(token: string, limit: number): Promise<VercelActionResult> {
  const res = await vercelFetch(token, `/v6/deployments?limit=${limit}`);
  if (!res.ok) return { available: false, error: `Vercel API ${res.status}` };

  const result = await res.json();
  const deployments: VercelDeployment[] = result.deployments ?? [];

  const summary = deployments.map((d) => ({
    uid: d.uid,
    state: d.state,
    url: d.url,
    created: new Date(d.created).toISOString(),
    duration_seconds: d.ready && d.buildingAt
      ? Math.round((d.ready - d.buildingAt) / 1000)
      : null,
    commit_message: d.meta?.githubCommitMessage?.slice(0, 80) ?? null,
  }));

  const errorCount = deployments.filter((d) => d.state === "ERROR").length;
  const latestState = deployments[0]?.state ?? "UNKNOWN";

  return {
    available: true,
    data: {
      deployments: summary,
      total_checked: deployments.length,
      error_count: errorCount,
      latest_state: latestState,
      health:
        latestState === "ERROR" ? "critical"
        : errorCount > 1 ? "degraded"
        : "healthy",
    },
  };
}

async function fetchDeploymentLogs(token: string, deploymentId: string): Promise<VercelActionResult> {
  // Build-Events für eine spezifische Deployment-ID
  const res = await vercelFetch(
    token,
    `/v2/deployments/${encodeURIComponent(deploymentId)}/events?direction=backward&limit=50`,
  );
  if (!res.ok) return { available: false, error: `Vercel API ${res.status}: Build-Logs nicht verfügbar` };

  const events = await res.json();
  const logLines: string[] = [];

  if (Array.isArray(events)) {
    for (const event of events) {
      if (event.type === "stdout" || event.type === "stderr" || event.type === "command") {
        const text = event.payload?.text ?? event.text ?? "";
        if (text) logLines.push(`[${event.type}] ${String(text).slice(0, 200)}`);
      }
    }
  }

  // Fehlerindizien extrahieren
  const fullLog = logLines.join("\n");
  const errors = logLines.filter(
    (l) =>
      l.toLowerCase().includes("error") ||
      l.toLowerCase().includes("failed") ||
      l.toLowerCase().includes("cannot find") ||
      l.toLowerCase().includes("module not found"),
  );

  return {
    available: true,
    data: {
      deployment_id: deploymentId,
      total_log_lines: logLines.length,
      error_lines: errors.slice(0, 10),
      log_excerpt: fullLog.slice(0, 2000),
    },
  };
}

async function fetchProjectInfo(token: string): Promise<VercelActionResult> {
  // Projekt-ID aus ENV oder aus Deployments ermitteln
  const projectId =
    process.env.VERCEL_PROJECT_ID ?? "prj_sTaUxNvsERPVeQbfTKl1GntYoxSh";

  const [projectRes, domainsRes] = await Promise.allSettled([
    vercelFetch(token, `/v9/projects/${encodeURIComponent(projectId)}`),
    vercelFetch(token, `/v9/projects/${encodeURIComponent(projectId)}/domains`),
  ]);

  const projectData: Record<string, unknown> = { project_id: projectId };

  if (projectRes.status === "fulfilled" && projectRes.value.ok) {
    const p = await projectRes.value.json();
    projectData.name = p.name;
    projectData.framework = p.framework;
    projectData.node_version = p.nodeVersion;
    projectData.git_repo = p.link?.repo;
  }

  if (domainsRes.status === "fulfilled" && domainsRes.value.ok) {
    const d = await domainsRes.value.json();
    const domains: Array<{ name: string; verified: boolean; redirect?: string }> = d.domains ?? [];
    projectData.domains = domains.map((dom) => ({
      name: dom.name,
      verified: dom.verified,
      redirect: dom.redirect,
    }));
  }

  return { available: true, data: projectData };
}

/** Shared Fetch mit Timeout + Auth */
async function vercelFetch(token: string, path: string): Promise<Response> {
  return fetch(`https://api.vercel.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(12_000),
  });
}
