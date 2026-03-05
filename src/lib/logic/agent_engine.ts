/**
 * Agent Engine — Dünner Wrapper über den Multi-Agent-Orchestrator.
 *
 * Rückwärtskompatibel: Signatur `runAgentAnalysis(documentText)` bleibt identisch.
 * Intern delegiert an agents/orchestrator.ts (13-Agenten-Pipeline).
 *
 * Legacy: Die vollständige alte Single-Loop-Engine liegt in der Git-History.
 */

import { runPipeline } from "./agents/orchestrator";

// Re-export Types für bestehende Consumer
export type { AgentAnalysisResult, RoutingStufe } from "./agents/types";

/**
 * Haupteinstiegspunkt für die Bescheid-Analyse.
 * Führt die Multi-Agent-Pipeline aus:
 * AG08 → AG12 → AG01 → [AG02 ║ AG04] → AG03 → AG07 → AG13
 */
export async function runAgentAnalysis(
  documentText: string
): Promise<import("./agents/types").AgentAnalysisResult> {
  return runPipeline(documentText);
}
