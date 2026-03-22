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
 *     product_key: "starter" | "team" | "einrichtung",
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
import { reportInfo, reportError, reportWarning } from '@/lib/error-reporter';
import { mollieWebhookLimiter } from '@/lib/rate-limit';
import { PLAN_CONFIG, computeExpiresAt } from '@/lib/plans';

export const runtime = 'nodejs';
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// Produkt-Mapping: Mollie product_key → subscription_type aus PLAN_CONFIG
// Analysen-Zahlen + Laufzeiten kommen aus der Single Source of Truth (plans.ts)
// ---------------------------------------------------------------------------

const PRODUCT_KEY_TO_PLAN: Record<string, string> = {
  starter:     'b2b_starter',
  team:        'b2b_professional',
  einrichtung: 'b2b_enterprise',
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
    signal: AbortSignal.timeout(5000),
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
  // Rate-Limiting gegen Webhook-Flooding
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { success: rateLimitOk } = await mollieWebhookLimiter.limit(ip);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const apiKey = process.env.MOLLIE_API_KEY ?? '';
  if (!apiKey) {
    await reportError('MOLLIE_API_KEY nicht gesetzt', { context: 'mollie/webhook' });
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
    await reportError(msg, { context: 'mollie/webhook', paymentId });
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
    await reportWarning(`Fehlende Metadaten: email=${buyerEmail.replace(/(.{2}).*@/, "$1***@")} product=${productKey}`, { context: 'mollie/webhook', paymentId });
    return NextResponse.json({ received: true, note: 'Fehlende Metadaten im Mollie-Payment.' });
  }

  const subscriptionType = PRODUCT_KEY_TO_PLAN[productKey];
  const planConfig = subscriptionType ? PLAN_CONFIG[subscriptionType] : undefined;
  if (!subscriptionType || !planConfig) {
    await reportWarning(`Unbekannter product_key: ${productKey}`, { context: 'mollie/webhook', paymentId });
    return NextResponse.json({ received: true, note: 'Unbekannter Produktschlüssel.' });
  }

  // ─── Supabase Admin-Client ─────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!supabaseUrl || !serviceKey) {
    await reportError('Supabase nicht konfiguriert', { context: 'mollie/webhook' });
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
    await reportWarning(
      `User nicht gefunden: ${buyerEmail.replace(/(.{2}).*@/, "$1***@")} — manuell freischalten nach Registrierung`,
      { context: 'mollie/webhook', paymentId }
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

  const expiresAt = computeExpiresAt(subscriptionType);

  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      subscription_type: subscriptionType,
      status: 'active',
      analyses_total: planConfig.analyses,
      analyses_remaining: planConfig.analyses,
      analyses_used: 0,
      order_id: paymentId,
      payment_method: 'mollie',
      purchased_at: new Date().toISOString(),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) {
    await reportError(`Abo-Update fehlgeschlagen: ${updateError.message}`, { context: 'mollie/webhook', paymentId, userId });
    return NextResponse.json({ error: 'Abo-Aktivierung fehlgeschlagen.' }, { status: 500 });
  }

  reportInfo('[Mollie] Abo aktiviert', { email: buyerEmail.replace(/(.{2}).*@/, "$1***@"), product: subscriptionType, analyses: planConfig.analyses });
  return NextResponse.json({ received: true, status: 'activated' });
}
