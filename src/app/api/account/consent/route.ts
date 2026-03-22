/**
 * Consent-Widerruf — Art. 7 Abs. 3 DSGVO
 * PATCH /api/account/consent
 *
 * Setzt consent_given auf false in user_metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { reportInfo } from "@/lib/error-reporter";

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
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { consent_given } = body as { consent_given?: boolean };
  if (typeof consent_given !== "boolean") {
    return NextResponse.json({ error: "consent_given (boolean) erforderlich." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey);

  const metadata: Record<string, unknown> = { consent_given };
  if (consent_given) {
    metadata.consent_timestamp = new Date().toISOString();
  } else {
    metadata.consent_revoked_at = new Date().toISOString();
  }

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: metadata,
  });

  if (error) {
    return NextResponse.json({ error: "Fehler beim Aktualisieren." }, { status: 500 });
  }

  reportInfo(`Consent ${consent_given ? "erteilt" : "widerrufen"}`, {
    context: "account-consent",
  });

  return NextResponse.json({ ok: true, consent_given });
}
