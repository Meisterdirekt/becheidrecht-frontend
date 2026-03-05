import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url) return null;
  const key = serviceKey || anonKey;
  if (!key) return null;
  return createClient(url, key);
}

/** GET: Öffentliche Feedback-Liste (für Anzeige auf der Website – ohne E-Mail) */
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ items: [] });
    }
    const { data, error } = await supabase
      .from("site_feedback")
      .select("id, message, rating, name, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("Feedback list error:", error);
      return NextResponse.json({ items: [] });
    }
    const items = (data || []).map((row) => ({
      id: row.id,
      message: row.message,
      rating: row.rating ?? null,
      name: row.name && row.name.trim() ? row.name.trim() : "Anonym",
      created_at: row.created_at,
    }));
    return NextResponse.json({ items });
  } catch (e) {
    console.error("Feedback GET error:", e);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const rating =
      typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
        ? body.rating
        : null;
    const name = typeof body.name === "string" ? body.name.trim() || null : null;
    const email = typeof body.email === "string" ? body.email.trim() || null : null;

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Bitte mindestens 10 Zeichen für Ihre Nachricht eingeben." },
        { status: 400 }
      );
    }
    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Maximal 2000 Zeichen erlaubt." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Feedback derzeit nicht verfügbar. Bitte SUPABASE_URL und Anon-Key (oder Service-Role-Key) in den Einstellungen eintragen." },
        { status: 503 }
      );
    }

    const { error } = await supabase.from("site_feedback").insert({
      message,
      rating,
      name,
      email,
    });

    if (error) {
      console.error("Feedback insert error:", error);
      const msg =
        error.code === "42501" || error.message?.includes("policy")
          ? "Feedback konnte nicht gespeichert werden. In Supabase die Policies aus supabase/feedback_policies.sql ausführen."
          : "Feedback konnte nicht gespeichert werden. Bitte später erneut versuchen.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Feedback API error:", e);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte später erneut versuchen." },
      { status: 500 }
    );
  }
}
