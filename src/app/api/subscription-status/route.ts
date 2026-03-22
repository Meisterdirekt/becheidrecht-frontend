import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import { reportError } from '@/lib/error-reporter';
import { subscriptionStatusLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription-status
 *
 * Gibt den Subscription-Status des eingeloggten Users zurück.
 * E-Mail wird NICHT im Response exponiert (PII-Schutz).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht angemeldet.', subscription_type: 'free', analyses_remaining: 0 },
        { status: 401 }
      );
    }

    const { success: rateLimitOk } = await subscriptionStatusLimiter.limit(user.id);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte kurz warten.' },
        { status: 429 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

    // ── Org-Pool prüfen (B2B) ──────────────────────────────────────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    if (serviceRoleKey && supabaseUrl) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
      const { data: rawMembership } = await supabaseAdmin
        .from('organization_members')
        .select('org_id, role, analyses_used, organizations(id, name, org_type, subscription_type, analyses_total, analyses_used, expires_at)')
        .eq('user_id', user.id)
        .maybeSingle();
      const membership = rawMembership as {
        org_id: string; role: string; analyses_used: number;
        organizations: { id: string; name: string; org_type: string; subscription_type: string; analyses_total: number; analyses_used: number; expires_at: string | null; } | null;
      } | null;

      if (membership?.org_id) {
        const org = membership.organizations;
        if (org) {
          // Org-Ablauf prüfen
          const orgExpired = org.expires_at && new Date(org.expires_at) < new Date();
          return NextResponse.json({
            user_id: user.id,
            subscription_type: org.subscription_type,
            status: orgExpired ? 'expired' : 'active',
            analyses_total: org.analyses_total,
            analyses_used: org.analyses_used,
            analyses_remaining: orgExpired ? 0 : Math.max(0, org.analyses_total - org.analyses_used),
            expires_at: org.expires_at,
            org_id: membership.org_id,
            org_name: org.name,
            org_role: membership.role,
            member_analyses_used: membership.analyses_used ?? 0,
          });
        }
      }
    }
    // ── Ende Org-Pool ──────────────────────────────────────────────────────

    // User-Client für RLS-konforme Queries
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${user.token}` } },
    });

    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const isDevUnlimited = process.env.DEV_UNLIMITED_ANALYSES === 'true';
    if (subError || !subscription) {
      return NextResponse.json({
        user_id: user.id,
        subscription_type: isDevUnlimited ? 'dev_test' : 'free',
        status: 'active',
        analyses_total: isDevUnlimited ? 999 : 0,
        analyses_used: 0,
        analyses_remaining: isDevUnlimited ? 999 : 0,
        expires_at: null
      });
    }

    // Ablauf prüfen: expires_at in der Vergangenheit → expired
    const isExpired = !isDevUnlimited
      && subscription.expires_at
      && new Date(subscription.expires_at) < new Date();
    const effectiveStatus = isExpired ? 'expired' : subscription.status;
    const analysesRemaining = isDevUnlimited
      ? Math.max(subscription.analyses_remaining, 999)
      : isExpired ? 0 : subscription.analyses_remaining;

    return NextResponse.json({
      user_id: subscription.user_id,
      subscription_type: isDevUnlimited ? 'dev_test' : subscription.subscription_type,
      status: effectiveStatus,
      analyses_total: subscription.analyses_total,
      analyses_used: subscription.analyses_used,
      analyses_remaining: analysesRemaining,
      expires_at: subscription.expires_at,
      purchased_at: subscription.purchased_at
    });

  } catch (error: unknown) {
    await reportError(error, { context: 'subscription-status' });
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.', subscription_type: 'free', analyses_remaining: 0 },
      { status: 500 }
    );
  }
}
