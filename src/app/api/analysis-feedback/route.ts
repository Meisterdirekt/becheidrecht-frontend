import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { analysisFeedbackLimiter } from "@/lib/rate-limit";
import { reportError } from "@/lib/error-reporter";

const VALID_TYPES = ["correct", "partially_correct", "incorrect"] as const;
const MAX_CORRECTION_LENGTH = 1000;

function getUserClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

// GET /api/analysis-feedback?analysis_id=...
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const analysisId = req.nextUrl.searchParams.get("analysis_id");
  if (!analysisId) return NextResponse.json({ error: "analysis_id fehlt." }, { status: 400 });

  try {
    const supabase = getUserClient(user.token);
    const { data, error } = await supabase
      .from("analysis_feedback")
      .select("id, feedback_type, correction_text, fehler_feedback, created_at")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ feedback: data });
  } catch (err) {
    reportError(err instanceof Error ? err : new Error(String(err)), { context: "analysis_feedback_get" }).catch(() => {});
    return NextResponse.json({ error: "Feedback konnte nicht geladen werden." }, { status: 500 });
  }
}

// POST /api/analysis-feedback
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { success } = await analysisFeedbackLimiter.limit(user.id);
  if (!success) return NextResponse.json({ error: "Zu viele Anfragen. Bitte spaeter erneut versuchen." }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungueltiger Request-Body." }, { status: 400 });
  }

  const analysisId = typeof body.analysis_id === "string" ? body.analysis_id.trim() : "";
  const feedbackType = typeof body.feedback_type === "string" ? body.feedback_type : "";
  const correctionText = typeof body.correction_text === "string" ? body.correction_text.trim().slice(0, MAX_CORRECTION_LENGTH) : null;
  const fehlerFeedback = Array.isArray(body.fehler_feedback) ? body.fehler_feedback : [];

  if (!analysisId) return NextResponse.json({ error: "analysis_id fehlt." }, { status: 400 });
  if (!VALID_TYPES.includes(feedbackType as typeof VALID_TYPES[number])) {
    return NextResponse.json({ error: "feedback_type muss 'correct', 'partially_correct' oder 'incorrect' sein." }, { status: 400 });
  }

  try {
    const supabase = getUserClient(user.token);

    // Pruefen ob die Analyse dem User gehoert
    const { data: analysis, error: checkErr } = await supabase
      .from("analysis_results")
      .select("id")
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkErr) throw checkErr;
    if (!analysis) return NextResponse.json({ error: "Analyse nicht gefunden." }, { status: 404 });

    // UPSERT: Erstellen oder aktualisieren
    const { data, error } = await supabase
      .from("analysis_feedback")
      .upsert(
        {
          analysis_id: analysisId,
          user_id: user.id,
          feedback_type: feedbackType,
          correction_text: correctionText || null,
          fehler_feedback: fehlerFeedback,
        },
        { onConflict: "analysis_id,user_id" }
      )
      .select("id, feedback_type, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, feedback: data });
  } catch (err) {
    reportError(err instanceof Error ? err : new Error(String(err)), { context: "analysis_feedback_post" }).catch(() => {});
    return NextResponse.json({ error: "Feedback konnte nicht gespeichert werden." }, { status: 500 });
  }
}
