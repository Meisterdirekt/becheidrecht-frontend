/**
 * POST /api/mollie/create-payment
 *
 * Erstellt eine Mollie-Zahlung und gibt die Checkout-URL zurück.
 * Erfordert authentifizierten User (Bearer Token).
 *
 * Body: { product_key: "starter" | "team" | "einrichtung" }
 * Response: { checkout_url: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

interface ProductDef {
  price: string;
  description: string;
}

const PRODUCTS: Record<string, ProductDef> = {
  starter:     { price: "299.00", description: "BescheidRecht — Starter (1 Nutzer, 100 Analysen/Monat)" },
  team:        { price: "599.00", description: "BescheidRecht — Team (5 Nutzer, 400 Analysen/Monat)" },
  einrichtung: { price: "999.00", description: "BescheidRecht — Einrichtung (10 Nutzer, 1.000 Analysen/Monat)" },
};

export async function POST(req: NextRequest) {
  // Auth
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  // Body parsen
  let productKey: string;
  try {
    const body = await req.json();
    productKey = typeof body.product_key === "string" ? body.product_key : "";
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body." }, { status: 400 });
  }

  const product = PRODUCTS[productKey];
  if (!product) {
    return NextResponse.json(
      { error: `Ungültiger Produktschlüssel: ${productKey}` },
      { status: 400 }
    );
  }

  // Mollie API Key
  const mollieKey = process.env.MOLLIE_API_KEY ?? "";
  if (!mollieKey) {
    return NextResponse.json(
      { error: "Zahlungssystem nicht konfiguriert." },
      { status: 503 }
    );
  }

  // User-E-Mail + Mollie Payment parallel vorbereiten
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${user.token}` } },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bescheidrecht.de";

  // Supabase User-Lookup parallel mit Validierung
  const { data: { user: supaUser } } = await supabase.auth.getUser();
  const buyerEmail = supaUser?.email ?? "";

  if (!buyerEmail) {
    return NextResponse.json({ error: "E-Mail nicht verfügbar." }, { status: 400 });
  }

  // Mollie Payment erstellen (nach E-Mail-Validierung, da E-Mail in metadata benötigt)
  const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mollieKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { currency: "EUR", value: product.price },
      description: product.description,
      redirectUrl: `${appUrl}/payment/success?product=${productKey}`,
      cancelUrl: `${appUrl}/payment/cancelled`,
      webhookUrl: `${appUrl}/api/mollie/webhook`,
      metadata: {
        product_key: productKey,
        buyer_email: buyerEmail,
      },
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!mollieRes.ok) {
    const errText = await mollieRes.text();
    console.error("[Mollie] Payment-Erstellung fehlgeschlagen:", mollieRes.status, errText);
    return NextResponse.json(
      { error: "Zahlung konnte nicht erstellt werden." },
      { status: 502 }
    );
  }

  const molliePayment = await mollieRes.json();
  const checkoutUrl = molliePayment?._links?.checkout?.href;

  if (!checkoutUrl) {
    console.error("[Mollie] Keine Checkout-URL erhalten:", JSON.stringify(molliePayment));
    return NextResponse.json(
      { error: "Keine Checkout-URL von Mollie erhalten." },
      { status: 502 }
    );
  }

  return NextResponse.json({ checkout_url: checkoutUrl });
}
