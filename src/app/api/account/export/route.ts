/**
 * Datenexport — Art. 20 DSGVO (Recht auf Datenportabilität)
 * GET /api/account/export
 *
 * Liefert alle gespeicherten Daten des eingeloggten Nutzers als JSON.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { reportError } from "@/lib/error-reporter";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey);

  try {
    // Nutzer-E-Mail für Feedback-Abfrage ermitteln
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id);
    const userEmail = authUser?.email ?? "";

    // Alle Nutzerdaten parallel abfragen
    const [
      { data: profile },
      { data: subscriptions },
      { data: analyses },
      { data: fristen },
      { data: feedback },
      { data: orgMemberships },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_subscriptions").select("*").eq("user_id", user.id),
      supabase.from("analysis_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("user_fristen").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("site_feedback").select("id, created_at, message, rating, name").eq("email", userEmail || "___none___"),
      supabase.from("organization_members").select("organization_id, role, joined_at, user_email").eq("user_id", user.id),
    ]);

    const exportData = {
      export_datum: new Date().toISOString(),
      hinweis: "Dieser Export enthält alle bei BescheidRecht gespeicherten personenbezogenen Daten gemäß Art. 20 DSGVO.",
      profil: profile ?? null,
      abonnements: subscriptions ?? [],
      analysen: analyses ?? [],
      fristen: fristen ?? [],
      feedback: feedback ?? [],
      organisationen: orgMemberships ?? [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="bescheidrecht-datenexport-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    reportError(error instanceof Error ? error : new Error(String(error)), { context: "account-export" });
    return NextResponse.json({ error: "Datenexport fehlgeschlagen." }, { status: 500 });
  }
}
