/**
 * Account-Löschung — Art. 17 DSGVO (Recht auf Löschung)
 * DELETE /api/account/delete
 *
 * Löscht alle Nutzerdaten und den Supabase-Auth-Account.
 * Erfordert Bestätigung via Body: { confirm: true }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { reportInfo } from "@/lib/error-reporter";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
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

  if (body.confirm !== true) {
    return NextResponse.json({ error: "Bitte bestätigen Sie die Löschung mit { confirm: true }." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey);
  const deletions: { table: string; ok: boolean; error?: string }[] = [];

  // Nutzer-Daten aus allen Tabellen löschen (Reihenfolge beachten wg. FK)
  const tables = [
    "analysis_results",
    "user_fristen",
    "user_subscriptions",
    "usage_counters",
    "organization_members",
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    deletions.push({ table, ok: !error, ...(error && { error: error.message }) });
  }

  // Profil löschen (PK = id, nicht user_id)
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", user.id);
  deletions.push({ table: "profiles", ok: !profileError, ...(profileError && { error: profileError.message }) });

  // Auth-User löschen (endgültig)
  const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
  deletions.push({ table: "auth.users", ok: !authError, ...(authError && { error: authError.message }) });

  const hasErrors = deletions.some((d) => !d.ok);

  reportInfo(`Account-Löschung ${hasErrors ? "teilweise fehlgeschlagen" : "erfolgreich"}`, {
    context: "account-delete",
    tables: deletions.map((d) => `${d.table}:${d.ok ? "ok" : d.error}`).join(", "),
  });

  if (hasErrors) {
    return NextResponse.json({
      error: "Einige Daten konnten nicht gelöscht werden. Bitte kontaktieren Sie datenschutz@bescheidrecht.de.",
      details: deletions.filter((d) => !d.ok),
    }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Ihr Konto und alle Daten wurden gelöscht." });
}
