/**
 * Pipeline-Orchestrator
 *
 * Steuert die Reihenfolge aller Agenten:
 * AG08 → AG12 → AG01 → [AG02 ║ AG04] → AG03 → [AG07 ║ AG14] → AG13
 * + async: AG05, AG06
 *
 * Parallelismus via Promise.allSettled(), Graceful Degradation via safeExecute().
 * Per-Modell-Kostenverfolgung für exakte Token-Kostenberechnung.
 */

import {
  type AgentContext,
  type AgentAnalysisResult,
  type PipelineState,
  type RoutingStufe,
  type TokenUsage,
  type AnalyseResult,
  type RechercheResult,
  type KritikResult,
  emptyTokenUsage,
  mergeTokenUsage,
} from "./types";
import {
  detectUrgency,
  estimateCost,
  isBudgetExceeded,
  safeExecute,
  SONNET_MODEL,
  HAIKU_MODEL,
  OPUS_MODEL,
  modelForStufe,
} from "./utils";
import { AG06_COST_TRIGGER_EUR } from "./tools/constants";
import { reportInfo } from "@/lib/error-reporter";
import { ag08SecurityGate } from "./ag08-security-gate";
import { ag12DocumentProcessor } from "./ag12-document-processor";
import { ag01Orchestrator } from "./ag01-orchestrator";
import { ag02Analyst } from "./ag02-analyst";
import { ag03Critic } from "./ag03-critic";
import { ag04Researcher } from "./ag04-researcher";
import { ag07LetterGenerator } from "./ag07-letter-generator";
import { ag13UserExplainer } from "./ag13-user-explainer";
import { ag14PraezedenzAnalyzer } from "./ag14-praezedenz-analyzer";

// ---------------------------------------------------------------------------
// Hintergrund-Agenten (fire-and-forget nach Response)
// ---------------------------------------------------------------------------

async function runBackgroundAgents(ctx: AgentContext) {
  try {
    const { ag05KnowledgeManager } = await import("./ag05-knowledge-manager");
    await safeExecute("AG05", () => ag05KnowledgeManager.execute(ctx), { saved: 0 });
  } catch (err) {
    console.warn("[Orchestrator] AG05 Hintergrund-Fehler:", err);
  }
}

async function runPromptOptimizer(
  ctx: AgentContext,
  briefLength: number,
  fehlerCount: number,
  totalCost: number
) {
  const shouldRun =
    briefLength < 500 ||
    (fehlerCount === 0 && (ctx.routingStufe === "HOCH" || ctx.routingStufe === "NOTFALL")) ||
    totalCost > AG06_COST_TRIGGER_EUR;

  if (!shouldRun) return;

  try {
    const { ag06PromptOptimizer } = await import("./ag06-prompt-optimizer");
    await safeExecute("AG06", () => ag06PromptOptimizer.execute(ctx), { vorschlaege: [] });
  } catch (err) {
    console.warn("[Orchestrator] AG06 Hintergrund-Fehler:", err);
  }
}

// ---------------------------------------------------------------------------
// Exakte Kostenberechnung: Jeder Agent mit seinem tatsächlichen Modell
// ---------------------------------------------------------------------------

function computeAccurateCost(
  agentCosts: Array<{ tokens: TokenUsage; model: string }>
): number {
  const raw = agentCosts.reduce(
    (sum, { tokens, model }) => sum + estimateCost(tokens, model),
    0
  );
  return Math.round(raw * 10000) / 10000;
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export type ProgressCallback = (phase: string, detail?: string) => void;

export async function runPipeline(
  documentText: string,
  onProgress?: ProgressCallback
): Promise<AgentAnalysisResult> {
  reportInfo("[Orchestrator] Pipeline gestartet");

  // --- Phase 0: Urgency-Detection (kostenlos) ---
  const urgency = detectUrgency(documentText);
  let routingStufe: RoutingStufe = urgency.stufe;

  const pipeline: PipelineState = {};
  let totalTokens: TokenUsage = emptyTokenUsage();
  const agentenAktiv: string[] = [];
  const agentenDetails: Record<string, { success: boolean; durationMs: number; error?: string }> = {};

  // Per-Modell-Kostenverfolgung für exakte Berechnung
  const agentCosts: Array<{ tokens: TokenUsage; model: string }> = [];

  const baseCtx: AgentContext = {
    documentText,
    routingStufe,
    fristTage: urgency.tage,
    pipeline,
  };

  reportInfo("[Orchestrator] Vorab-Routing", { routingStufe, tage: urgency.tage ?? null });
  onProgress?.("init", `Routing: ${routingStufe}`);

  // --- Phase 1: AG08 Security Gate + AG12 Dokumentstruktur PARALLEL ---
  // Beide sind vollständig unabhängig voneinander → parallele Ausführung spart ~50% Latenz
  reportInfo("[Orchestrator] Phase 1: AG08 + AG12 parallel");
  const [securitySettled, dokSettled] = await Promise.allSettled([
    safeExecute(
      "AG08",
      () => ag08SecurityGate.execute(baseCtx),
      { freigabe: true }
    ),
    safeExecute(
      "AG12",
      () => ag12DocumentProcessor.execute(baseCtx),
      { rubrum: "", begruendung: "", rechtsbehelfsbelehrung: "", volltext: documentText }
    ),
  ]);

  const securityResult = securitySettled.status === "fulfilled"
    ? securitySettled.value
    : { agentId: "AG08" as const, success: false, data: { freigabe: true }, tokens: emptyTokenUsage(), durationMs: 0, error: "AG08 rejected" };

  const dokResult = dokSettled.status === "fulfilled"
    ? dokSettled.value
    : { agentId: "AG12" as const, success: false, data: { rubrum: "", begruendung: "", rechtsbehelfsbelehrung: "", volltext: documentText }, tokens: emptyTokenUsage(), durationMs: 0, error: "AG12 rejected" };

  agentenAktiv.push("AG08");
  agentenDetails["AG08"] = { success: securityResult.success, durationMs: securityResult.durationMs, error: securityResult.error };
  totalTokens = mergeTokenUsage(totalTokens, securityResult.tokens);
  agentCosts.push({ tokens: securityResult.tokens, model: HAIKU_MODEL });
  pipeline.security = securityResult.data;

  onProgress?.("security", "Sicherheitspr\u00fcfung abgeschlossen");

  if (!securityResult.data.freigabe) {
    reportInfo("[Orchestrator] AG08: Freigabe verweigert", { grund: securityResult.data.grund ?? null });
    return {
      fehler: ["Sicherheitsprüfung: " + (securityResult.data.grund ?? "Input abgelehnt")],
      musterschreiben: "Die Sicherheitsprüfung hat den Input abgelehnt. Bitte laden Sie einen gültigen Behördenbescheid hoch.",
      routing_stufe: routingStufe,
      agenten_aktiv: agentenAktiv,
      security_check: securityResult.data,
      agenten_details: agentenDetails,
      model_used: HAIKU_MODEL,
    };
  }

  agentenAktiv.push("AG12");
  agentenDetails["AG12"] = { success: dokResult.success, durationMs: dokResult.durationMs, error: dokResult.error };
  totalTokens = mergeTokenUsage(totalTokens, dokResult.tokens);
  agentCosts.push({ tokens: dokResult.tokens, model: HAIKU_MODEL });
  pipeline.dokumentstruktur = dokResult.data;

  // --- Phase 3: AG01 Triage ---
  const triageResult = await safeExecute(
    "AG01",
    () => ag01Orchestrator.execute({ ...baseCtx, pipeline }),
    {
      behoerde: "Unbekannt",
      rechtsgebiet: "Unbekannt",
      untergebiet: "Unbekannt",
      routing_stufe: routingStufe,
    }
  );
  agentenAktiv.push("AG01");
  agentenDetails["AG01"] = { success: triageResult.success, durationMs: triageResult.durationMs, error: triageResult.error };
  totalTokens = mergeTokenUsage(totalTokens, triageResult.tokens);
  agentCosts.push({ tokens: triageResult.tokens, model: SONNET_MODEL });
  pipeline.triage = triageResult.data;

  onProgress?.("triage", `${triageResult.data.rechtsgebiet} — ${triageResult.data.behoerde}`);

  // AG01 kann Routing-Stufe korrigieren
  if (triageResult.data.routing_stufe !== routingStufe) {
    reportInfo("[Orchestrator] AG01 korrigiert Routing", { vorher: routingStufe, nachher: triageResult.data.routing_stufe });
    routingStufe = triageResult.data.routing_stufe;
    baseCtx.routingStufe = routingStufe;
  }

  // Routing-Stufe ist jetzt final — für AG02/AG07 wird das korrekte Modell genutzt
  const adaptiveModel = modelForStufe(routingStufe);

  // --- Phase 4: AG02 + AG04 immer parallel ---
  // AG04 läuft jetzt für ALLE Routing-Stufen:
  // NORMAL → DB-only (kostenlos), HOCH/NOTFALL → Web-Search (wenn Tavily vorhanden)
  const ctxForAnalysis: AgentContext = { ...baseCtx, pipeline };

  reportInfo("[Orchestrator] Phase 4: AG02 + AG04 parallel", { routingStufe });
  const [analyseSettled, rechercheSettled] = await Promise.allSettled([
    safeExecute<AnalyseResult>(
      "AG02",
      () => ag02Analyst.execute(ctxForAnalysis),
      { fehler: [], auffaelligkeiten: [] }
    ),
    safeExecute<RechercheResult>(
      "AG04",
      () => ag04Researcher.execute(ctxForAnalysis),
      { urteile: [], quellen: [] }
    ),
  ]);

  const analyseResult = analyseSettled.status === "fulfilled" ? analyseSettled.value : null;
  const rechercheResult = rechercheSettled.status === "fulfilled" ? rechercheSettled.value : null;

  if (analyseResult) {
    agentenAktiv.push("AG02");
    agentenDetails["AG02"] = { success: analyseResult.success, durationMs: analyseResult.durationMs, error: analyseResult.error };
    totalTokens = mergeTokenUsage(totalTokens, analyseResult.tokens);
    agentCosts.push({ tokens: analyseResult.tokens, model: adaptiveModel });
    pipeline.analyse = analyseResult.data;
  }

  if (rechercheResult) {
    agentenAktiv.push("AG04");
    agentenDetails["AG04"] = { success: rechercheResult.success, durationMs: rechercheResult.durationMs, error: rechercheResult.error };
    totalTokens = mergeTokenUsage(totalTokens, rechercheResult.tokens);
    // AG04 für NORMAL ist DB-only (kein Modell-Call) — keine Kosten
    agentCosts.push({ tokens: rechercheResult.tokens, model: SONNET_MODEL });
    pipeline.recherche = rechercheResult.data;
  }

  onProgress?.("analyse", `${analyseResult?.data.fehler.length ?? 0} Fehler, ${rechercheResult?.data.urteile.length ?? 0} Urteile`);

  // Budget-Check vor AG03 (läuft jetzt für HOCH + NOTFALL)
  if (routingStufe === "HOCH" || routingStufe === "NOTFALL") {
    if (!isBudgetExceeded(totalTokens)) {
      const kritikResult = await safeExecute<KritikResult>(
        "AG03",
        () => ag03Critic.execute({ ...baseCtx, pipeline }),
        { gegenargumente: [], erfolgschance_prozent: 50, schwachstellen: [] }
      );
      agentenAktiv.push("AG03");
      agentenDetails["AG03"] = { success: kritikResult.success, durationMs: kritikResult.durationMs, error: kritikResult.error };
      totalTokens = mergeTokenUsage(totalTokens, kritikResult.tokens);
      agentCosts.push({ tokens: kritikResult.tokens, model: adaptiveModel });
      pipeline.kritik = kritikResult.data;
    } else {
      console.warn("[Orchestrator] Budget überschritten — AG03 übersprungen");
    }
  }

  // --- Phase 5: AG07 Musterschreiben + AG14 Präzedenzfall-Analyse PARALLEL ---
  // AG14 braucht AG01 (triage) aber nicht AG07 — läuft parallel zum Brief
  reportInfo("[Orchestrator] Phase 5: AG07 + AG14 parallel");
  const [letterSettled, praezedenzSettled] = await Promise.allSettled([
    safeExecute(
      "AG07",
      () => ag07LetterGenerator.execute({ ...baseCtx, pipeline }),
      { volltext: "", auffaelligkeiten: [], forderung: "" }
    ),
    safeExecute(
      "AG14",
      () => ag14PraezedenzAnalyzer.execute({ ...baseCtx, pipeline }),
      { aehnliche_faelle: 0, erfolgsquote_prozent: null, haeufigste_fehler: [], hinweis: "" }
    ),
  ]);

  const letterResult = letterSettled.status === "fulfilled"
    ? letterSettled.value
    : { agentId: "AG07" as const, success: false, data: { volltext: "", auffaelligkeiten: [], forderung: "" }, tokens: emptyTokenUsage(), durationMs: 0, error: "AG07 rejected" };

  const praezedenzResult = praezedenzSettled.status === "fulfilled"
    ? praezedenzSettled.value
    : null;

  agentenAktiv.push("AG07");
  agentenDetails["AG07"] = { success: letterResult.success, durationMs: letterResult.durationMs, error: letterResult.error };
  totalTokens = mergeTokenUsage(totalTokens, letterResult.tokens);
  agentCosts.push({ tokens: letterResult.tokens, model: adaptiveModel });
  pipeline.musterschreiben = letterResult.data;

  if (praezedenzResult) {
    agentenAktiv.push("AG14");
    agentenDetails["AG14"] = { success: praezedenzResult.success, durationMs: praezedenzResult.durationMs, error: praezedenzResult.error };
    pipeline.praezedenz = praezedenzResult.data;
    // AG14 hat keine Token-Kosten (reine DB-Aggregation)
  }

  onProgress?.("brief", "Musterschreiben erstellt");

  // --- Phase 6: AG13 Nutzer-Erklärer ---
  const explainerResult = await safeExecute(
    "AG13",
    () => ag13UserExplainer.execute({ ...baseCtx, pipeline }),
    { klartext: "" }
  );
  agentenAktiv.push("AG13");
  agentenDetails["AG13"] = { success: explainerResult.success, durationMs: explainerResult.durationMs, error: explainerResult.error };
  totalTokens = mergeTokenUsage(totalTokens, explainerResult.tokens);
  agentCosts.push({ tokens: explainerResult.tokens, model: HAIKU_MODEL });
  pipeline.erklaerung = explainerResult.data;

  onProgress?.("done", "Analyse abgeschlossen");

  // --- Exakte Kosten berechnen (Haiku/Sonnet/Opus separat) ---
  const tokenKostenEur = computeAccurateCost(agentCosts);

  reportInfo("[Orchestrator] Fertig", {
    agenten: agentenAktiv.join(","),
    tokens: totalTokens.input_tokens + totalTokens.output_tokens,
    cache_reads: totalTokens.cache_read_tokens,
    kosten_eur: tokenKostenEur,
    modell: adaptiveModel,
  });

  // --- Ergebnis aufbauen (rückwärtskompatibel) ---
  const analyseData = pipeline.analyse;
  const fehlerListe =
    letterResult.data.auffaelligkeiten.length > 0
      ? letterResult.data.auffaelligkeiten
      : analyseData && analyseData.auffaelligkeiten.length > 0
      ? analyseData.auffaelligkeiten
      : analyseData && analyseData.fehler.length > 0
      ? analyseData.fehler.map((f) => f.musterschreiben_hinweis ?? f.titel)
      : ["Analyse abgeschlossen. Keine spezifischen Auffälligkeiten identifiziert."];

  // Fristdatum ISO-Format
  let fristDatumIso: string | undefined;
  if (pipeline.triage?.frist_datum) {
    const match = pipeline.triage.frist_datum.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (match) {
      fristDatumIso = `${match[3]}-${match[2]}-${match[1]}`;
    }
  }

  // --- Hintergrund-Agenten (fire-and-forget) ---
  if (pipeline.recherche && pipeline.recherche.urteile.length > 0) {
    runBackgroundAgents({ ...baseCtx, pipeline }).catch(() => {});
  }

  runPromptOptimizer(
    { ...baseCtx, pipeline },
    letterResult.data.volltext.length,
    analyseData?.fehler.length ?? 0,
    tokenKostenEur
  ).catch(() => {});

  return {
    zuordnung: pipeline.triage
      ? {
          behoerde: pipeline.triage.behoerde,
          rechtsgebiet: pipeline.triage.rechtsgebiet,
          untergebiet: pipeline.triage.untergebiet,
        }
      : undefined,
    fehler: fehlerListe,
    musterschreiben:
      letterResult.data.volltext ||
      "Das Musterschreiben konnte nicht erstellt werden. Bitte erneut versuchen.",
    frist_datum: fristDatumIso,
    frist_tage: pipeline.triage?.frist_tage,
    routing_stufe: routingStufe,
    agenten_aktiv: agentenAktiv,
    token_kosten_eur: tokenKostenEur,
    model_used: routingStufe === "NOTFALL" ? OPUS_MODEL : SONNET_MODEL,
    // Neue Felder
    kritik: pipeline.kritik,
    recherche: pipeline.recherche,
    erklaerung: pipeline.erklaerung?.klartext,
    security_check: pipeline.security,
    dokumentstruktur: pipeline.dokumentstruktur,
    agenten_details: agentenDetails,
    praezedenz: pipeline.praezedenz,
  };
}
