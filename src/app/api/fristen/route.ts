import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fristenLimiter } from "@/lib/rate-limit";
import { reportError } from "@/lib/error-reporter";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Supabase Client mit User-JWT (kein Service Role Key nötig)
// RLS-Policy stellt sicher dass Nutzer nur eigene Daten sehen
// ---------------------------------------------------------------------------

function getUserClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

async function getTokenAndUser(req: NextRequest): Promise<{ token: string; userId: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const supabase = getUserClient(token);
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { token, userId: user.id };
}

// ---------------------------------------------------------------------------
// GET /api/fristen — Alle Fristen des Users
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const auth = await getTokenAndUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { success } = await fristenLimiter.limit(auth.userId);
  if (!success) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte kurz warten." }, { status: 429 });
  }

  const supabase = getUserClient(auth.token);
  if (!supabase) {
    return NextResponse.json({ error: "Datenbank nicht konfiguriert." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("user_fristen")
    .select("id, behoerde, rechtsgebiet, untergebiet, bescheid_datum, frist_datum, status, notizen, created_at, analyse_meta")
    .order("frist_datum", { ascending: true, nullsFirst: false });

  if (error) {
    await reportError(error, { context: "fristen/GET" });
    if (error.code === "42P01") {
      // Tabelle existiert noch nicht
      return NextResponse.json({ fristen: [], hinweis: "Tabelle noch nicht angelegt." });
    }
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 });
  }

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const fristen = (data ?? []).map((f) => {
    let tage_verbleibend: number | null = null;
    if (f.frist_datum) {
      const fristDate = new Date(f.frist_datum);
      fristDate.setHours(0, 0, 0, 0);
      tage_verbleibend = Math.ceil((fristDate.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24));
    }

    let status = f.status;
    if (tage_verbleibend !== null && tage_verbleibend < 0 && status === "offen") {
      status = "abgelaufen";
    }

    return { ...f, status, tage_verbleibend };
  });

  return NextResponse.json({ fristen });
}

// ---------------------------------------------------------------------------
// POST /api/fristen — Neue Frist anlegen
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const auth = await getTokenAndUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { success: rateLimitOk } = await fristenLimiter.limit(auth.userId);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte kurz warten." }, { status: 429 });
  }

  const supabase = getUserClient(auth.token);
  if (!supabase) {
    return NextResponse.json({ error: "Datenbank nicht konfiguriert." }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Daten." }, { status: 400 });
  }

  const { behoerde, rechtsgebiet, untergebiet, bescheid_datum, frist_datum, notizen, musterschreiben } = body as {
    behoerde?: string; rechtsgebiet?: string; untergebiet?: string;
    bescheid_datum?: string; frist_datum?: string; notizen?: string; musterschreiben?: string;
  };

  if (!frist_datum) {
    return NextResponse.json({ error: "frist_datum ist erforderlich." }, { status: 400 });
  }

  // Datum-Validierung
  const fristDate = new Date(frist_datum);
  if (Number.isNaN(fristDate.getTime())) {
    return NextResponse.json({ error: "Ungültiges Frist-Datum." }, { status: 400 });
  }
  if (bescheid_datum) {
    const bescheidDate = new Date(bescheid_datum);
    if (Number.isNaN(bescheidDate.getTime())) {
      return NextResponse.json({ error: "Ungültiges Bescheid-Datum." }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("user_fristen")
    .insert({
      user_id: auth.userId,
      behoerde: behoerde ?? null,
      rechtsgebiet: rechtsgebiet ?? null,
      untergebiet: untergebiet ?? null,
      bescheid_datum: bescheid_datum ?? null,
      frist_datum,
      status: "offen",
      notizen: notizen ?? null,
      musterschreiben: musterschreiben ?? null,
    })
    .select("id")
    .single();

  if (error) {
    await reportError(error, { context: "fristen/POST" });
    return NextResponse.json({ error: "Fehler beim Speichern." }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}

// ---------------------------------------------------------------------------
// DELETE /api/fristen — Einzelne Frist löschen (Art. 17 DSGVO)
// ---------------------------------------------------------------------------

export async function DELETE(req: NextRequest) {
  const auth = await getTokenAndUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { success: rateLimitOk } = await fristenLimiter.limit(auth.userId);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte kurz warten." }, { status: 429 });
  }

  const supabase = getUserClient(auth.token);
  if (!supabase) {
    return NextResponse.json({ error: "Datenbank nicht konfiguriert." }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Daten." }, { status: 400 });
  }

  const { id } = body as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
  }

  // RLS stellt sicher dass nur eigene Einträge gelöscht werden
  const { error } = await supabase.from("user_fristen").delete().eq("id", id);

  if (error) {
    await reportError(error, { context: "fristen/DELETE" });
    return NextResponse.json({ error: "Fehler beim Löschen." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ---------------------------------------------------------------------------
// PATCH /api/fristen — Status oder Notiz updaten
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  const auth = await getTokenAndUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { success: rateLimitOk } = await fristenLimiter.limit(auth.userId);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte kurz warten." }, { status: 429 });
  }

  const supabase = getUserClient(auth.token);
  if (!supabase) {
    return NextResponse.json({ error: "Datenbank nicht konfiguriert." }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Daten." }, { status: 400 });
  }

  const { id, status, notizen } = body as { id?: string; status?: string; notizen?: string };

  if (!id) {
    return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
  }

  const VALID_STATUSES = ["offen", "eingereicht", "erledigt", "abgelaufen"];
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (notizen !== undefined) updates.notizen = notizen;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nichts zu aktualisieren." }, { status: 400 });
  }

  // RLS stellt sicher dass nur eigene Einträge geändert werden
  const { error } = await supabase
    .from("user_fristen")
    .update(updates)
    .eq("id", id);

  if (error) {
    await reportError(error, { context: "fristen/PATCH" });
    return NextResponse.json({ error: "Fehler beim Aktualisieren." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
