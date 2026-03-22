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

// ---------------------------------------------------------------------------
// Email bei Zahlungsfehler
// ---------------------------------------------------------------------------

function buildPaymentFailedHtml(productKey: string, status: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#ef4444;padding:16px 24px;border-radius:12px 12px 0 0">
        <h2 style="color:white;margin:0;font-size:18px">
          Zahlung nicht erfolgreich
        </h2>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:14px">
          Ihr Zahlungsversuch bei BescheidRecht konnte nicht abgeschlossen werden.
        </p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px 24px">
        <p style="color:#374151;font-size:15px;line-height:1.6">
          Leider konnte Ihre Zahlung fuer das Produkt <strong>${productKey}</strong>
          nicht verarbeitet werden (Status: ${status}).
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6">
          Moegliche Ursachen: unzureichende Deckung, abgelaufene Karte oder
          Abbruch waehrend des Bezahlvorgangs.
        </p>
        <div style="margin-top:20px;text-align:center">
          <a href="https://www.bescheidrecht.de/b2b" style="display:inline-block;background:#0f172a;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Erneut versuchen
          </a>
        </div>
        <p style="color:#9ca3af;font-size:11px;margin-top:20px;text-align:center">
          Bei Fragen antworten Sie auf diese E-Mail oder kontaktieren Sie info@bescheidrecht.de
        </p>
      </div>
    </div>
  `;
}

async function sendPaymentFailedEmail(email: string, productKey: string, status: string): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || !email) return;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);
    const fromAddr = process.env.RESEND_FROM_EMAIL || 'BescheidRecht <onboarding@resend.dev>';

    await resend.emails.send({
      from: fromAddr,
      to: email,
      subject: 'BescheidRecht — Zahlung nicht erfolgreich',
      html: buildPaymentFailedHtml(productKey, status),
    });

    reportInfo('[Mollie] Zahlungsfehler-Email versendet', {
      email: email.replace(/(.{2}).*@/, '$1***@'),
      status,
    });
  } catch (err) {
    reportError(err instanceof Error ? err : new Error(String(err)), {
      context: 'mollie/webhook/failure-email',
      critical: false,
    }).catch(() => {});
  }
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

  // Bei fehlgeschlagener Zahlung: User benachrichtigen
  if (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'canceled') {
    const failEmail = payment.metadata?.buyer_email ?? '';
    const failProduct = payment.metadata?.product_key ?? 'unbekannt';

    reportInfo('[Mollie] Zahlung fehlgeschlagen', {
      paymentId,
      status: payment.status,
      email: failEmail.replace(/(.{2}).*@/, '$1***@'),
    });

    if (failEmail) {
      await sendPaymentFailedEmail(failEmail, failProduct, payment.status);
    }

    return NextResponse.json({ received: true, status: payment.status });
  }

  // Nur bei erfolgreicher Zahlung Abo aktivieren
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
    // Admin per Email benachrichtigen — Zahlung eingegangen aber User nicht registriert
    await reportError(
      new Error(`Mollie: Zahlung eingegangen, User nicht registriert — manuell freischalten!`),
      { context: 'mollie/webhook', paymentId, critical: true, email: buyerEmail.replace(/(.{2}).*@/, "$1***@"), product: productKey }
    );

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) ?? [];
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && adminEmails.length > 0) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        const fromAddr = process.env.RESEND_FROM_EMAIL || 'BescheidRecht <onboarding@resend.dev>';
        await resend.emails.send({
          from: fromAddr,
          to: adminEmails,
          subject: `AKTION NOETIG: Mollie-Zahlung ohne Account (${paymentId})`,
          html: `<p>Zahlung <strong>${paymentId}</strong> eingegangen fuer <strong>${buyerEmail.replace(/(.{2}).*@/, "$1***@")}</strong> (Produkt: ${productKey}), aber kein Account gefunden.</p><p>Bitte Kunden manuell anlegen und Abo freischalten.</p>`,
        });
      } catch {
        // Email-Versand ist best-effort
      }
    }

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

  // ─── B2B-Org automatisch anlegen (wenn B2B-Plan und noch keine Org) ──────
  if (subscriptionType.startsWith('b2b_')) {
    try {
      // Prüfe ob User bereits in einer Org ist
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('org_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingMember) {
        // Neue Org anlegen
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: `Einrichtung (${buyerEmail.split('@')[1] ?? 'Neu'})`,
            org_type: 'sozialeinrichtung',
            contact_email: buyerEmail.toLowerCase().trim(),
            subscription_type: subscriptionType,
            analyses_total: planConfig.analyses,
            analyses_used: 0,
            activated_at: new Date().toISOString(),
            expires_at: expiresAt,
          })
          .select('id')
          .single();

        if (org && !orgError) {
          // User als Admin der Org hinzufuegen
          await supabase
            .from('organization_members')
            .insert({
              org_id: org.id,
              user_id: userId,
              user_email: buyerEmail.toLowerCase().trim(),
              role: 'admin',
            });

          // User-Subscription auf Org-Pool umstellen (Credits kommen aus Org)
          await supabase
            .from('user_subscriptions')
            .update({
              analyses_total: 0,
              analyses_remaining: 0,
              analyses_used: 0,
              payment_method: 'mollie_b2b',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          reportInfo('[Mollie] B2B-Org automatisch erstellt', { orgId: org.id, email: buyerEmail.replace(/(.{2}).*@/, "$1***@") });
        } else if (orgError) {
          await reportError(`B2B-Org-Erstellung fehlgeschlagen: ${orgError.message}`, { context: 'mollie/webhook/org', paymentId, userId });
        }
      }
    } catch (err) {
      // Org-Erstellung ist best-effort — Abo wurde bereits aktiviert
      await reportError(err instanceof Error ? err : new Error(String(err)), { context: 'mollie/webhook/org', paymentId });
    }
  }

  return NextResponse.json({ received: true, status: 'activated' });
}
