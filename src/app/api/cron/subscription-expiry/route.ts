/**
 * Subscription Expiry — Automatische Abo-Deaktivierung
 * GET /api/cron/subscription-expiry?secret=CRON_SECRET
 *
 * Laeuft taeglich via Daily Hub.
 * Setzt abgelaufene Abos auf status='expired'.
 * Sendet Ablauf-Warnungen per Email (7, 3, 1 Tag vorher).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reportError, reportInfo } from "@/lib/error-reporter";

export const runtime = "nodejs";
export const maxDuration = 30;

function verifySecret(req: Request): boolean {
  const url = new URL(req.url);
  const authHeader = req.headers?.get?.("authorization") || "";
  const secret =
    url.searchParams.get("secret") || authHeader.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  return !!expected && secret === expected;
}

const WARNING_DAYS = [7, 3, 1] as const;

function buildExpiryWarningHtml(tage: number, planLabel: string): string {
  const farbe = tage <= 1 ? "#ef4444" : tage <= 3 ? "#f59e0b" : "#0ea5e9";
  const tageText = tage === 1 ? "morgen" : `in ${tage} Tagen`;

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:${farbe};padding:16px 24px;border-radius:12px 12px 0 0">
        <h2 style="color:white;margin:0;font-size:18px">
          Ihr Abonnement laeuft ${tageText} ab
        </h2>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:14px">
          Ihr ${planLabel}-Abonnement bei BescheidRecht laeuft ${tageText} ab.
        </p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px 24px">
        <p style="color:#374151;font-size:15px;line-height:1.6">
          Nach Ablauf koennen Sie keine neuen Analysen mehr durchfuehren.
          Ihre bestehenden Ergebnisse und Fristen bleiben erhalten.
        </p>
        <div style="margin-top:20px;text-align:center">
          <a href="https://www.bescheidrecht.de/b2b" style="display:inline-block;background:${farbe};color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Abonnement erneuern
          </a>
        </div>
        <p style="color:#9ca3af;font-size:11px;margin-top:20px;text-align:center">
          Diese E-Mail wurde automatisch von BescheidRecht versendet.
        </p>
      </div>
    </div>
  `;
}

export async function GET(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  let expired_count = 0;
  let warned = 0;
  let errors = 0;

  // ── 1. Abgelaufene Abos deaktivieren ────────────────────────────────
  try {
    const { data: expired, error: expError } = await supabase
      .from("user_subscriptions")
      .select("user_id, email, subscription_type, expires_at")
      .eq("status", "active")
      .not("expires_at", "is", null)
      .lt("expires_at", new Date().toISOString());

    if (expError) {
      await reportError(new Error(`subscription-expiry: ${expError.message}`), { context: "subscription-expiry" });
      errors++;
    } else if (expired && expired.length > 0) {
      const userIds = expired.map((e: { user_id: string }) => e.user_id);
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({ status: "expired", analyses_remaining: 0, updated_at: new Date().toISOString() })
        .in("user_id", userIds);

      if (updateError) {
        await reportError(new Error(`subscription-expiry update: ${updateError.message}`), { context: "subscription-expiry" });
        errors++;
      } else {
        expired_count = expired.length;
        reportInfo(`[SubscriptionExpiry] ${expired_count} Abos deaktiviert`, {
          users: expired.map((e: { email: string }) => e.email?.replace(/(.{2}).*@/, "$1***@")).join(", "),
        });
      }
    }
  } catch (err) {
    await reportError(err instanceof Error ? err : new Error(String(err)), { context: "subscription-expiry/suspend" });
    errors++;
  }

  // ── 2. Ablauf-Warnungen per Email ───────────────────────────────────
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);
      const fromAddr = process.env.RESEND_FROM_EMAIL || "BescheidRecht <onboarding@resend.dev>";
      const { PLAN_CONFIG } = await import("@/lib/plans");

      for (const days of WARNING_DAYS) {
        const target = new Date();
        target.setUTCHours(0, 0, 0, 0);
        target.setUTCDate(target.getUTCDate() + days);
        const targetStart = target.toISOString();
        const targetEnd = new Date(target.getTime() + 86_400_000).toISOString();

        const { data: expiring } = await supabase
          .from("user_subscriptions")
          .select("user_id, email, subscription_type, expires_at")
          .eq("status", "active")
          .gte("expires_at", targetStart)
          .lt("expires_at", targetEnd);

        if (!expiring || expiring.length === 0) continue;

        for (const sub of expiring) {
          const typedSub = sub as { user_id: string; email: string; subscription_type: string };
          if (!typedSub.email) continue;

          const planLabel = PLAN_CONFIG[typedSub.subscription_type]?.label || typedSub.subscription_type;

          try {
            await resend.emails.send({
              from: fromAddr,
              to: typedSub.email,
              subject:
                days === 1
                  ? "Ihr BescheidRecht-Abo laeuft morgen ab!"
                  : `Ihr BescheidRecht-Abo laeuft in ${days} Tagen ab`,
              html: buildExpiryWarningHtml(days, planLabel),
            });
            warned++;
          } catch (err) {
            errors++;
            reportError(
              err instanceof Error ? err : new Error(String(err)),
              { critical: false, context: "subscription-expiry/email", userId: typedSub.user_id }
            ).catch(() => {});
          }
        }
      }
    } catch (err) {
      await reportError(err instanceof Error ? err : new Error(String(err)), { context: "subscription-expiry/email-init" });
      errors++;
    }
  }

  reportInfo(`[SubscriptionExpiry] Fertig: ${expired_count} expired, ${warned} gewarnt, ${errors} Fehler`);

  return NextResponse.json({
    ok: errors === 0,
    expired_count,
    warned,
    errors,
  });
}
