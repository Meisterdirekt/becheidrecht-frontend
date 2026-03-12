/**
 * Daten-Retention — Automatische Löschung alter Analysedaten
 * GET /api/cron/data-retention?secret=CRON_SECRET
 *
 * Läuft täglich 04:00 UTC via Vercel Cron.
 * Löscht analysis_results und user_fristen älter als 90 Tage.
 * DSGVO-Compliance: Datenschutzerklärung garantiert max. 90 Tage Speicherung.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reportError, reportInfo } from "@/lib/error-reporter";

export const runtime = "nodejs";
export const maxDuration = 30;

const RETENTION_DAYS = 90;

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
