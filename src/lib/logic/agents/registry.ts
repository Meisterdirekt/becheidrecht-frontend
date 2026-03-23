/**
 * Agent Registry — zentrale Verwaltung aller 19 LLM-Agenten (AG01–AG18, AG20).
 * AG19 (Design-Guardian) hat kein Agent-Interface — reine statische Analyse, nur via Cron.
 * Registrierung erfolgt lazy beim ersten Zugriff.
 */

import type { Agent, AgentId } from "./types";
import { reportInfo } from "@/lib/error-reporter";

const agents = new Map<AgentId, Agent>();
let initialized = false;

/** Registriert alle 19 LLM-Agenten (lazy, einmalig). AG19 = kein Agent-Interface. */
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

  // Rechts-Monitor (monatlicher Cron, AG15)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag15RechtsMonitor } = require("./ag15-rechts-monitor");

  // Vercel-Ops-Agent (täglich 06:00 UTC, AG16)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag16VercelAgent } = require("./ag16-vercel-agent");

  // Agent-Auditor (mittwochs 05:00 UTC, AG17)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag17AgentAuditor } = require("./ag17-agent-auditor");

  // Content-Auditor (15. des Monats 01:00 UTC, AG18)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag18ContentAuditor } = require("./ag18-content-auditor");

  // Feedback-Learner (Freitag via Daily-Hub, AG20)
  // AG19 (Design-Guardian) hat kein Agent-Interface — reine statische Analyse
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ag20FeedbackLearner } = require("./ag20-feedback-learner");

  const allAgents: Agent[] = [
    ag08SecurityGate, ag12DocumentProcessor, ag01Orchestrator,
    ag02Analyst, ag07LetterGenerator, ag13UserExplainer,
    ag03Critic, ag04Researcher,
    ag05KnowledgeManager, ag06PromptOptimizer,
    ag09FrontendAgent, ag10BackendAgent, ag11DevopsAgent,
    ag14PraezedenzAnalyzer,
    ag15RechtsMonitor,
    ag16VercelAgent,
    ag17AgentAuditor,
    ag18ContentAuditor,
    ag20FeedbackLearner,
  ];

  for (const agent of allAgents) {
    agents.set(agent.id, agent);
  }

  reportInfo("[Registry] Agenten registriert", { anzahl: agents.size });
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
