import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";
import { ANALYSES_MAP, computeExpiresAt } from "@/lib/plans";

/**
 * POST /api/admin/create-customer
 *
 * Erstellt einen neuen Kunden komplett vom Admin aus:
 * 1. Auth-User anlegen (Supabase Admin API)
 * 2. Trigger erstellt automatisch user_subscriptions (free)
 * 3. Abo auf gewählten Typ upgraden
 * 4. Einladungs-E-Mail wird automatisch gesendet (Passwort setzen)
 *
 * Body: { first_name, last_name, email, subscription_type }
 */

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error ?? "Kein Admin-Zugang" }, { status: 403 });
  }

  const body = await request.json();
  const { first_name, last_name, email, subscription_type } = body as {
    first_name?: string;
    last_name?: string;
    email?: string;
    subscription_type?: string;
  };

  if (!email?.trim() || !subscription_type) {
    return NextResponse.json(
      { error: "E-Mail und Abo-Typ sind Pflichtfelder." },
      { status: 400 },
    );
  }

  const analyses = ANALYSES_MAP[subscription_type];
  if (!analyses) {
    return NextResponse.json(
      {
        error: `Ungültiger Abo-Typ. Erlaubt: ${Object.keys(ANALYSES_MAP).join(", ")}`,
      },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert" },
      { status: 500 },
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const cleanEmail = email.toLowerCase().trim();

  // Prüfen ob User bereits existiert
  const { data: existing } = await admin
    .from("user_subscriptions")
    .select("user_id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: `Ein Account mit "${cleanEmail}" existiert bereits. Nutze stattdessen "User freischalten".`,
      },
      { status: 409 },
    );
  }

  // 1. Auth-User erstellen + Einladungs-E-Mail senden
  const { data: inviteData, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(cleanEmail, {
      data: {
        first_name: first_name?.trim() || "",
        last_name: last_name?.trim() || "",
      },
    });

  if (inviteError || !inviteData?.user) {
    const msg = inviteError?.message ?? "User konnte nicht erstellt werden.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const userId = inviteData.user.id;

  // 2. Warten bis der Trigger die user_subscriptions-Zeile erstellt hat
  //    (passiert synchron im DB-Trigger, sollte sofort da sein)
  let retries = 0;
  let subExists = false;
  while (retries < 5 && !subExists) {
    const { data } = await admin
      .from("user_subscriptions")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      subExists = true;
    } else {
      retries++;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  if (!subExists) {
    // Trigger hat nicht gefeuert — manuell anlegen
    await admin.from("user_subscriptions").insert({
      user_id: userId,
      email: cleanEmail,
      subscription_type: "free",
      status: "active",
      analyses_total: 0,
      analyses_used: 0,
      analyses_remaining: 0,
    });
  }

  // 3. Abo upgraden
  const expiresAt = computeExpiresAt(subscription_type);

  const { error: updateError } = await admin
    .from("user_subscriptions")
    .update({
      subscription_type,
      status: "active",
      analyses_total: analyses,
      analyses_remaining: analyses,
      analyses_used: 0,
      order_id: `ADMIN_${Date.now()}`,
      payment_method: "admin_created",
      purchased_at: new Date().toISOString(),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    return NextResponse.json(
      { error: "Account erstellt, aber Abo konnte nicht gesetzt werden: " + updateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    user_id: userId,
    email: cleanEmail,
    name: [first_name?.trim(), last_name?.trim()].filter(Boolean).join(" ") || cleanEmail,
    subscription_type,
    analyses,
    expires_at: expiresAt,
    message: `Account "${cleanEmail}" erstellt. Einladungs-E-Mail wurde gesendet.`,
  });
}
