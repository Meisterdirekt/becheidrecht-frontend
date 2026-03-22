/**
 * AG20 — Feedback-Learner Cron-Endpunkt.
 * Laeuft freitags via Daily-Hub.
 * Auth via ?secret=CRON_SECRET Query-Parameter.
 *
 * Ablauf:
 * 1. Supabase: analysis_feedback + analysis_results der letzten 30 Tage
 * 2. Aggregation pro fehler_id: False-Positive-Rate berechnen (TypeScript)
 * 3. Aggregation pro rechtsgebiet: Incorrect-Rate berechnen (TypeScript)
 * 4. UPSERT in feedback_stats Tabelle
 * 5. Formatierter Report fuer AG20
 * 6. AG20 ausfuehren (Report-Generierung + GitHub Issue)
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeExecute } from "@/lib/logic/agents/utils";
import type { PipelineState } from "@/lib/logic/agents/types";
import { reportError, reportInfo } from "@/lib/error-reporter";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function verifyCronSecret(req: Request): boolean {
  const url = new URL(req.url);
  const authHeader = req.headers?.get?.("authorization") || "";
  const secret = url.searchParams.get("secret") || authHeader.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return secret === expected;
}

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

interface FeedbackRow {
  analysis_id: string;
  feedback_type: "correct" | "partially_correct" | "incorrect";
  fehler_feedback: { index: number; correct: boolean }[] | null;
  created_at: string;
}

interface AnalysisRow {
  id: string;
  rechtsgebiet: string | null;
  fehler: { id?: string; titel?: string }[] | null;
}

interface FehlerStat {
  fehler_id: string;
  false_positive_count: number;
  true_positive_count: number;
  total_count: number;
  rechtsgebiet: string | null;
}

// ---------------------------------------------------------------------------
// Feedback aggregieren
// ---------------------------------------------------------------------------

async function aggregateFeedback(): Promise<{
  fehlerStats: Map<string, FehlerStat>;
  rechtsgebietStats: Map<string, { incorrect: number; total: number }>;
  feedbackCount: number;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const emptyResult = {
    fehlerStats: new Map<string, FehlerStat>(),
    rechtsgebietStats: new Map<string, { incorrect: number; total: number }>(),
    feedbackCount: 0,
  };

  if (!supabaseUrl || !serviceKey) return emptyResult;

  const supabase = createClient(supabaseUrl, serviceKey);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Feedback der letzten 30 Tage laden
  const { data: feedbackData, error: fbError } = await supabase
    .from("analysis_feedback")
    .select("analysis_id, feedback_type, fehler_feedback, created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .limit(500);

  if (fbError || !feedbackData || feedbackData.length === 0) {
    return emptyResult;
  }

  const feedback = feedbackData as FeedbackRow[];

  // 2. Zugehoerige analysis_results laden (fuer fehler-Array mit IDs + rechtsgebiet)
  const analysisIds = [...new Set(feedback.map((f) => f.analysis_id))];
  const { data: analysisData } = await supabase
    .from("analysis_results")
    .select("id, rechtsgebiet, fehler")
    .in("id", analysisIds);

  const analysisMap = new Map<string, AnalysisRow>();
  if (analysisData) {
    for (const row of analysisData as AnalysisRow[]) {
      analysisMap.set(row.id, row);
    }
  }

  // 3. Pro fehler_id aggregieren
  const fehlerStats = new Map<string, FehlerStat>();
  const rechtsgebietStats = new Map<string, { incorrect: number; total: number }>();

  for (const fb of feedback) {
    const analysis = analysisMap.get(fb.analysis_id);
    const rechtsgebiet = analysis?.rechtsgebiet ?? "UNBEKANNT";

    // Rechtsgebiet-Statistik
    const rgStat = rechtsgebietStats.get(rechtsgebiet) ?? { incorrect: 0, total: 0 };
    rgStat.total++;
    if (fb.feedback_type === "incorrect") rgStat.incorrect++;
    rechtsgebietStats.set(rechtsgebiet, rgStat);

    // Fehler-Level-Feedback (fehler_feedback JSONB)
    if (!fb.fehler_feedback || !Array.isArray(fb.fehler_feedback)) continue;
    if (!analysis?.fehler || !Array.isArray(analysis.fehler)) continue;

    for (const item of fb.fehler_feedback) {
      if (typeof item.index !== "number") continue;

      const fehler = analysis.fehler[item.index];
      if (!fehler?.id) continue;

      const fehlerId = fehler.id;
      const stat = fehlerStats.get(fehlerId) ?? {
        fehler_id: fehlerId,
        false_positive_count: 0,
        true_positive_count: 0,
        total_count: 0,
        rechtsgebiet,
      };

      stat.total_count++;
      if (item.correct) {
        stat.true_positive_count++;
      } else {
        stat.false_positive_count++;
      }
      fehlerStats.set(fehlerId, stat);
    }
  }

  return { fehlerStats, rechtsgebietStats, feedbackCount: feedback.length };
}

// ---------------------------------------------------------------------------
// feedback_stats Tabelle aktualisieren
// ---------------------------------------------------------------------------

async function upsertFeedbackStats(stats: Map<string, FehlerStat>): Promise<number> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey || stats.size === 0) return 0;

  const supabase = createClient(supabaseUrl, serviceKey);
  let upserted = 0;

  for (const stat of stats.values()) {
    const fpRate = stat.total_count > 0
      ? Math.round((stat.false_positive_count / stat.total_count) * 10000) / 100
      : 0;
    const tpRate = stat.total_count > 0
      ? Math.round((stat.true_positive_count / stat.total_count) * 10000) / 100
      : 0;

    const { error } = await supabase
      .from("feedback_stats")
      .upsert(
        {
          fehler_id: stat.fehler_id,
          false_positive_count: stat.false_positive_count,
          true_positive_count: stat.true_positive_count,
          total_count: stat.total_count,
          false_positive_rate: fpRate,
          true_positive_rate: tpRate,
          rechtsgebiet: stat.rechtsgebiet,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "fehler_id" },
      );

    if (!error) upserted++;
  }

  return upserted;
}

// ---------------------------------------------------------------------------
// Metriken-Report formatieren (fuer AG20)
// ---------------------------------------------------------------------------

function formatFeedbackReport(
  fehlerStats: Map<string, FehlerStat>,
  rechtsgebietStats: Map<string, { incorrect: number; total: number }>,
  feedbackCount: number,
): string {
  if (feedbackCount === 0) return "KEINE_DATEN";

  const lines: string[] = [
    `FEEDBACK_GESAMT: ${feedbackCount}`,
    `FEHLER_IDS_MIT_FEEDBACK: ${fehlerStats.size}`,
    `RECHTSGEBIETE_MIT_FEEDBACK: ${rechtsgebietStats.size}`,
    ``,
  ];

  // Top False Positives (sortiert nach Rate, min 2 Bewertungen)
  const fpSorted = [...fehlerStats.values()]
    .filter((s) => s.total_count >= 2)
    .map((s) => ({
      ...s,
      rate: s.total_count > 0 ? (s.false_positive_count / s.total_count) * 100 : 0,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 20);

  if (fpSorted.length > 0) {
    lines.push(`FALSE POSITIVES (Top ${fpSorted.length}):`);
    for (const fp of fpSorted) {
      lines.push(`FP: ${fp.fehler_id} rate=${fp.rate.toFixed(1)}% count=${fp.total_count} rechtsgebiet=${fp.rechtsgebiet ?? "?"}`);
    }
    lines.push(``);
  }

  // Top True Positives (haeufig bestaetigte Fehler, min 2 Bewertungen)
  const tpSorted = [...fehlerStats.values()]
    .filter((s) => s.total_count >= 2 && s.true_positive_count > 0)
    .map((s) => ({
      ...s,
      rate: s.total_count > 0 ? (s.true_positive_count / s.total_count) * 100 : 0,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 20);

  if (tpSorted.length > 0) {
    lines.push(`TRUE POSITIVES (Top ${tpSorted.length}):`);
    for (const tp of tpSorted) {
      lines.push(`TP: ${tp.fehler_id} rate=${tp.rate.toFixed(1)}% count=${tp.total_count} rechtsgebiet=${tp.rechtsgebiet ?? "?"}`);
    }
    lines.push(``);
  }

  // Rechtsgebiete mit niedrigster Accuracy
  const rgSorted = [...rechtsgebietStats.entries()]
    .filter(([, s]) => s.total >= 3)
    .map(([rg, s]) => ({
      rechtsgebiet: rg,
      incorrect_rate: s.total > 0 ? (s.incorrect / s.total) * 100 : 0,
      total: s.total,
    }))
    .sort((a, b) => b.incorrect_rate - a.incorrect_rate);

  if (rgSorted.length > 0) {
    lines.push(`ACCURACY PRO RECHTSGEBIET:`);
    for (const rg of rgSorted) {
      lines.push(`LOW_ACC: ${rg.rechtsgebiet} incorrect=${rg.incorrect_rate.toFixed(1)}% total=${rg.total}`);
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// GET Handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  reportInfo("[Feedback-Learner] AG20 Cron gestartet");

  try {
    // 1. Feedback aggregieren (TypeScript — kein LLM)
    const { fehlerStats, rechtsgebietStats, feedbackCount } = await aggregateFeedback();

    // 2. feedback_stats Tabelle aktualisieren
    const upserted = await upsertFeedbackStats(fehlerStats);

    // 3. Report formatieren
    const report = formatFeedbackReport(fehlerStats, rechtsgebietStats, feedbackCount);

    // 4. Wenn keine Daten → kein Agent-Aufruf noetig
    if (feedbackCount === 0) {
      reportInfo("[Feedback-Learner] Keine Feedback-Daten vorhanden");
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        agent: "AG20",
        feedback_count: 0,
        message: "Keine Feedback-Daten der letzten 30 Tage",
      });
    }

    // 5. AG20 ausfuehren
    const pipeline: PipelineState = {};
    const ctx = {
      documentText: report,
      routingStufe: "NORMAL" as const,
      fristTage: null,
      pipeline,
    };

    const { ag20FeedbackLearner } = await import(
      "@/lib/logic/agents/ag20-feedback-learner"
    );
    const result = await safeExecute(
      "AG20",
      () => ag20FeedbackLearner.execute(ctx),
      {
        feedback_analysed: feedbackCount,
        false_positives_top: [],
        low_accuracy_rechtsgebiete: [],
        issues_created: [],
        summary: "Fehler beim Ausfuehren von AG20",
      },
    );

    reportInfo("[Feedback-Learner] AG20 abgeschlossen", {
      feedbackCount,
      upserted,
      issues: result.data.issues_created.length,
    });

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      agent: "AG20",
      feedback_count: feedbackCount,
      fehler_ids_tracked: fehlerStats.size,
      stats_upserted: upserted,
      false_positives_top: result.data.false_positives_top.slice(0, 5),
      issues_created: result.data.issues_created,
      duration_ms: result.durationMs,
      error: result.error,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await reportError(err, { context: "[Feedback-Learner] AG20 Fehler" });
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
