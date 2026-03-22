/**
 * Daten-Retention — Automatische Löschung alter Daten (DSGVO Art. 5 Abs. 1e)
 * GET /api/cron/data-retention?secret=CRON_SECRET
 *
 * Läuft täglich 04:00 UTC via Vercel Cron.
 * - analysis_results: 90 Tage
 * - user_fristen (erledigt/abgelaufen): 90 Tage
 * - user_fristen (offen/eingereicht): 365 Tage
 * - demo_requests (kontaktiert/konvertiert/abgelehnt): 180 Tage
 * - site_feedback: E-Mail nach 90 Tagen nullen
 * - organization_invites (abgelaufen): sofort
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reportError, reportInfo } from "@/lib/error-reporter";

export const runtime = "nodejs";
export const maxDuration = 30;

const RETENTION_DAYS = 90;
const RETENTION_DAYS_LONG = 365;
const RETENTION_DAYS_LEADS = 180;

function verifySecret(req: Request): boolean {
  const url = new URL(req.url);
  const authHeader = req.headers?.get?.("authorization") || "";
  const secret = url.searchParams.get("secret") || authHeader.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  return !!expected && secret === expected;
}

export async function GET(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey);
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const cutoffLong = new Date(Date.now() - RETENTION_DAYS_LONG * 24 * 60 * 60 * 1000).toISOString();
  const cutoffLeads = new Date(Date.now() - RETENTION_DAYS_LEADS * 24 * 60 * 60 * 1000).toISOString();

  const results: { table: string; deleted: number; error?: string }[] = [];

  // analysis_results älter als 90 Tage löschen
  const { data: arData, error: arError } = await supabase
    .from("analysis_results")
    .delete()
    .lt("created_at", cutoff)
    .select("id");

  results.push({
    table: "analysis_results",
    deleted: arData?.length ?? 0,
    ...(arError && { error: arError.message }),
  });

  // user_fristen mit Status "erledigt" oder "abgelaufen" älter als 90 Tage
  const { data: fData, error: fError } = await supabase
    .from("user_fristen")
    .delete()
    .lt("created_at", cutoff)
    .in("status", ["erledigt", "abgelaufen"])
    .select("id");

  results.push({
    table: "user_fristen (erledigt/abgelaufen)",
    deleted: fData?.length ?? 0,
    ...(fError && { error: fError.message }),
  });

  // user_fristen mit Status "offen"/"eingereicht" älter als 365 Tage
  const { data: fOpenData, error: fOpenError } = await supabase
    .from("user_fristen")
    .delete()
    .lt("created_at", cutoffLong)
    .in("status", ["offen", "eingereicht"])
    .select("id");

  results.push({
    table: "user_fristen (offen/eingereicht >365d)",
    deleted: fOpenData?.length ?? 0,
    ...(fOpenError && { error: fOpenError.message }),
  });

  // demo_requests älter als 180 Tage (nur abgeschlossene Leads — Status "neu" behalten)
  const { data: drData, error: drError } = await supabase
    .from("demo_requests")
    .delete()
    .lt("created_at", cutoffLeads)
    .in("status", ["kontaktiert", "konvertiert", "abgelehnt"])
    .select("id");

  results.push({
    table: "demo_requests (>180d)",
    deleted: drData?.length ?? 0,
    ...(drError && { error: drError.message }),
  });

  // site_feedback: E-Mail-Adressen nach 90 Tagen nullen (Feedback bleibt für Verbesserungen)
  const { data: sfData, error: sfError } = await supabase
    .from("site_feedback")
    .update({ email: null })
    .lt("created_at", cutoff)
    .not("email", "is", null)
    .select("id");

  results.push({
    table: "site_feedback (E-Mail genullt >90d)",
    deleted: sfData?.length ?? 0,
    ...(sfError && { error: sfError.message }),
  });

  // organization_invites: abgelaufene Einladungen löschen
  const { data: oiData, error: oiError } = await supabase
    .from("organization_invites")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .select("id");

  results.push({
    table: "organization_invites (abgelaufen)",
    deleted: oiData?.length ?? 0,
    ...(oiError && { error: oiError.message }),
  });

  const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
  const hasErrors = results.some((r) => r.error);

  if (hasErrors) {
    await reportError(new Error(`Data-Retention Fehler: ${JSON.stringify(results)}`), {
      critical: false,
      context: "data-retention-cron",
    }).catch(() => {});
  }

  if (totalDeleted > 0) {
    reportInfo(`Data-Retention: ${totalDeleted} Datensätze gelöscht (Cutoff: ${cutoff})`, {
      context: "data-retention-cron",
    });
  }

  return NextResponse.json({
    ok: !hasErrors,
    retention_days: RETENTION_DAYS,
    cutoff,
    results,
  });
}
