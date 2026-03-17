import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";
import { reportError } from "@/lib/error-reporter";

function getServiceClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  const key = serviceKey || anonKey;
  if (!url || !key) return null;
  return createClient(url, key, serviceKey ? { auth: { persistSession: false } } : undefined);
}

/** GET /api/admin/demo-requests?status=neu */
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert." },
      { status: 503 }
    );
  }

  const statusFilter = request.nextUrl.searchParams.get("status");

  let query = supabase
    .from("demo_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    await reportError(error, { context: "admin/demo-requests GET" });
    return NextResponse.json(
      { error: "Fehler beim Laden der Demo-Anfragen." },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: data || [] });
}

/** PATCH /api/admin/demo-requests — Status updaten */
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID fehlt." }, { status: 400 });
    }

    const validStatuses = ["neu", "kontaktiert", "konvertiert", "abgelehnt"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Ungültiger Status. Erlaubt: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("demo_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      await reportError(error, { context: "admin/demo-requests PATCH" });
      return NextResponse.json(
        { error: "Status konnte nicht aktualisiert werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    await reportError(e, { context: "admin/demo-requests PATCH" });
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
