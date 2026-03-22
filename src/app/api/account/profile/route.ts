/**
 * Profil-Bearbeitung — Art. 16 DSGVO (Recht auf Berichtigung)
 * PATCH /api/account/profile
 *
 * Erlaubt dem Nutzer, Name und Adresse zu ändern.
 * E-Mail-Änderung läuft über Supabase Auth (Bestätigungs-E-Mail).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { reportError } from "@/lib/error-reporter";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Daten." }, { status: 400 });
  }

  const { first_name, last_name, street, city } = body as {
    first_name?: string;
    last_name?: string;
    street?: string;
    city?: string;
  };

  // Mindestens ein Feld muss angegeben sein
  if (!first_name && !last_name && street === undefined && city === undefined) {
    return NextResponse.json({ error: "Keine Änderungen angegeben." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey);

  // User-Metadata in Supabase Auth updaten
  const metadata: Record<string, string> = {};
  if (first_name?.trim()) metadata.first_name = first_name.trim();
  if (last_name?.trim()) metadata.last_name = last_name.trim();
  if (street !== undefined) metadata.street = (street ?? "").trim();
  if (city !== undefined) metadata.city = (city ?? "").trim();

  try {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: metadata,
    });

    if (error) {
      reportError(new Error(error.message), { context: "account-profile" });
      return NextResponse.json({ error: "Profil konnte nicht aktualisiert werden." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, updated: Object.keys(metadata) });
  } catch (error) {
    reportError(error instanceof Error ? error : new Error(String(error)), { context: "account-profile" });
    return NextResponse.json({ error: "Profil konnte nicht aktualisiert werden." }, { status: 500 });
  }
}
