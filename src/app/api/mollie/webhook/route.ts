/**
 * POST /api/mollie/webhook
 *
 * Mollie Payment Webhook Handler.
 * Wird von Mollie bei Statusänderungen (paid, failed, expired, etc.) aufgerufen.
 *
 * ─────────────────────────────────────────────────────────────────
 * SETUP in Mollie Dashboard:
 *   Settings → Website Profiles → [Dein Profil] → Webhook URL
 *   URL: https://bescheidrecht.de/api/mollie/webhook
 *
 * BEIM ERSTELLEN EINER ZAHLUNG (via Mollie API) folgende metadata mitsenden:
 *   metadata: {
 *     product_key: "single" | "basic" | "standard" | "pro",
 *     buyer_email: "nutzer@beispiel.de"
 *   }
 * ─────────────────────────────────────────────────────────────────
 * ENV-Variablen (in .env.local UND Vercel Dashboard setzen):
 *   MOLLIE_API_KEY = live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *                   (für Tests: test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { reportInfo } from '@/lib/error-reporter';

export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// Produkt-Mapping (muss mit den metadata.product_key-Werten beim Payment-Create übereinstimmen)
// ---------------------------------------------------------------------------

interface ProductConfig {
  type: string;
  analyses: number;
  /** 0 = Einzel-Kauf ohne Ablaufdatum, >0 = Anzahl Monate */
  months: number;
}

const PRODUCT_CONFIGS: Record<string, ProductConfig> = {
  single:   { type: 'single',   analyses: 1,  months: 0 },
  basic:    { type: 'basic',    analyses: 5,  months: 1 },
  standard: { type: 'standard', analyses: 15, months: 1 },
  pro:      { type: 'pro',      analyses: 50, months: 1 },
};

// ---------------------------------------------------------------------------
// Mollie Payment-Objekt (relevante Felder)
// ---------------------------------------------------------------------------

interface MolliePayment {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  description: string;
  metadata: {
    product_key?: string;
    buyer_email?: string;
  };
}

async function fetchMolliePayment(paymentId: string): Promise<MolliePayment> {
  const apiKey = process.env.MOLLIE_API_KEY ?? '';
  const res = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`Mollie API Fehler: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<MolliePayment>;
}

// ---------------------------------------------------------------------------
// Haupt-Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const apiKey = process.env.MOLLIE_API_KEY ?? '';
  if (!apiKey) {
    console.error('[Mollie] MOLLIE_API_KEY nicht gesetzt!');
    return NextResponse.json({ error: 'Webhook nicht konfiguriert.' }, { status: 500 });
  }

  // Mollie sendet: id=payment_xxx als application/x-www-form-urlencoded
  let paymentId: string;
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    paymentId = params.get('id') ?? '';
  } catch {
    return NextResponse.json({ error: 'Ungültige Webhook-Daten.' }, { status: 400 });
  }

  if (!paymentId) {
    return NextResponse.json({ error: 'Payment-ID fehlt.' }, { status: 400 });
  }

  // Zahlung von Mollie abrufen — das ist gleichzeitig die Verifikation
  let payment: MolliePayment;
  try {
    payment = await fetchMolliePayment(paymentId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Mollie-Fehler';
    console.error('[Mollie] Zahlungsabfrage fehlgeschlagen:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  reportInfo('[Mollie] Webhook empfangen', { paymentId, status: payment.status });

  // Nur bei erfolgreicher Zahlung handeln
  if (payment.status !== 'paid') {
    return NextResponse.json({ received: true });
  }

  const buyerEmail = payment.metadata?.buyer_email ?? '';
  const productKey = payment.metadata?.product_key ?? '';

  if (!buyerEmail || !productKey) {
    console.warn(`[Mollie] Fehlende Metadaten: email=${buyerEmail} product=${productKey}`);
    return NextResponse.json({ received: true, note: 'Fehlende Metadaten im Mollie-Payment.' });
  }

  const product = PRODUCT_CONFIGS[productKey];
  if (!product) {
    console.warn(`[Mollie] Unbekannter product_key: ${productKey}`);
    return NextResponse.json({ received: true, note: 'Unbekannter Produktschlüssel.' });
  }

  // ─── Supabase Admin-Client ─────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!supabaseUrl || !serviceKey) {
    console.error('[Mollie] Supabase nicht konfiguriert.');
    return NextResponse.json({ error: 'DB nicht konfiguriert.' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // User suchen
  const { data: rows } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('email', buyerEmail.toLowerCase().trim())
    .limit(1);

  if (!rows || rows.length === 0) {
    console.warn(
      `[Mollie] User nicht gefunden: ${buyerEmail} | Payment: ${paymentId}\n` +
      '→ Manuell freischalten sobald User sich registriert hat.'
    );
    return NextResponse.json({ received: true, status: 'pending_registration' });
  }

  const userId = (rows[0] as { user_id: string }).user_id;

  // Idempotenz: Prüfen ob diese paymentId bereits verarbeitet wurde
  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('order_id')
    .eq('user_id', userId)
    .eq('order_id', paymentId)
    .limit(1);

  if (existing && existing.length > 0) {
    reportInfo('[Mollie] Bereits verarbeitet — übersprungen', { paymentId });
    return NextResponse.json({ received: true, status: 'already_processed' });
  }

  const expiresAt = product.months > 0
    ? new Date(Date.now() + product.months * 30 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  await supabase
    .from('user_subscriptions')
    .update({
      subscription_type: product.type,
      status: 'active',
      analyses_total: product.analyses,
      analyses_remaining: product.analyses,
      analyses_used: 0,
      order_id: paymentId,
      payment_method: 'mollie',
      purchased_at: new Date().toISOString(),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  reportInfo('[Mollie] Abo aktiviert', { email: buyerEmail.replace(/(.{2}).*@/, "$1***@"), product: product.type, analyses: product.analyses });
  return NextResponse.json({ received: true, status: 'activated' });
}
