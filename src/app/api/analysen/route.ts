/**
 * Analyse-Historie — Listet alle bisherigen Analysen des Users
 * GET /api/analysen (Auth: Bearer Token)
 *
 * Liest aus analysis_results (RLS: user sieht nur eigene).
 * Sortiert nach created_at DESC, max 100 Eintraege.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Service nicht verfuegbar." }, { status: 503 });
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${user.token}` } },
  });

  const { data, error } = await supabase
    .from("analysis_results")
    .select("id, created_at, behoerde, rechtsgebiet, fehler, frist_datum, dringlichkeit, model_used, token_cost_eur, analyse_meta")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ analysen: data ?? [] });
}
