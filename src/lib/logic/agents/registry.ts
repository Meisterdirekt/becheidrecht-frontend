/**
 * Agent Registry — zentrale Verwaltung aller 13 Agenten.
 * Registrierung erfolgt lazy beim ersten Zugriff.
 */

import type { Agent, AgentId } from "./types";

const agents = new Map<AgentId, Agent>();
let initialized = false;

/** Registriert alle 15 Agenten (lazy, einmalig). */
function ensureInitialized(): void {
  if (initialized) return;
  initialized = true;

  // Pflicht-Agenten (laufen IMMER)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag08SecurityGate } = require("./ag08-security-gate");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag12DocumentProcessor } = require("./ag12-document-processor");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag01Orchestrator } = require("./ag01-orchestrator");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag02Analyst } = require("./ag02-analyst");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag07LetterGenerator } = require("./ag07-letter-generator");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag13UserExplainer } = require("./ag13-user-explainer");

  // Standard-Agenten (ab HOCH)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag03Critic } = require("./ag03-critic");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag04Researcher } = require("./ag04-researcher");

  // Hintergrund-Agenten (async)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag05KnowledgeManager } = require("./ag05-knowledge-manager");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag06PromptOptimizer } = require("./ag06-prompt-optimizer");

  // Batch-Agenten (wöchentlicher Cron)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag09FrontendAgent } = require("./ag09-frontend-agent");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag10BackendAgent } = require("./ag10-backend-agent");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag11DevopsAgent } = require("./ag11-devops-agent");

  // Präzedenzfall-Analyzer (DB-only, kein LLM)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag14PraezedenzAnalyzer } = require("./ag14-praezedenz-analyzer");

  // Rechts-Monitor (wöchentlicher Cron, AG15)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag15RechtsMonitor } = require("./ag15-rechts-monitor");

  const allAgents: Agent[] = [
    ag08SecurityGate, ag12DocumentProcessor, ag01Orchestrator,
    ag02Analyst, ag07LetterGenerator, ag13UserExplainer,
    ag03Critic, ag04Researcher,
    ag05KnowledgeManager, ag06PromptOptimizer,
    ag09FrontendAgent, ag10BackendAgent, ag11DevopsAgent,
    ag14PraezedenzAnalyzer,
    ag15RechtsMonitor,
  ];

  for (const agent of allAgents) {
    agents.set(agent.id, agent);
  }

  console.log(`[Registry] ${agents.size} Agenten registriert.`);
}

export function registerAgent(agent: Agent): void {
  agents.set(agent.id, agent);
}

export function getAgent<T = unknown>(id: AgentId): Agent<T> | undefined {
  ensureInitialized();
  return agents.get(id) as Agent<T> | undefined;
}

export function getAllAgents(): Agent[] {
  ensureInitialized();
  return Array.from(agents.values());
}

export function getAgentIds(): AgentId[] {
  ensureInitialized();
  return Array.from(agents.keys());
}
