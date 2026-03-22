import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import { reportError } from '@/lib/error-reporter';
import { useAnalysisLimiter } from '@/lib/rate-limit';

/**
 * POST /api/use-analysis
 *
 * Reduziert den Analyse-Counter um 1
 * Wird nach jedem erfolgreichen Upload/Analyse aufgerufen
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht angemeldet.' },
        { status: 401 }
      );
    }

    const { success: rateLimitOk } = await useAnalysisLimiter.limit(user.id);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte kurz warten.' },
        { status: 429 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Datenbank nicht konfiguriert.' },
        { status: 500 }
      );
    }

    // User-Client für RLS-konforme Queries
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${user.token}` } },
    });

    // Service Role Client für Admin-Operationen (RLS bypass)
    const supabaseAdmin = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
      : supabase;

    // ── Org-Pool prüfen (B2B) ──────────────────────────────────────────────
    if (serviceRoleKey) {
      const { data: membership } = await supabaseAdmin
        .from('organization_members')
        .select('org_id, analyses_used')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership?.org_id) {
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('analyses_total, analyses_used, expires_at')
          .eq('id', membership.org_id)
          .single();

        if (!org) {
          return NextResponse.json({ error: 'Einrichtung nicht gefunden' }, { status: 404 });
        }

        // Org-Ablauf prüfen
        if (org.expires_at && new Date(org.expires_at) < new Date()) {
          return NextResponse.json(
            { error: 'Das Abonnement Ihrer Einrichtung ist abgelaufen. Bitte den Einrichtungs-Admin kontaktieren.', analyses_remaining: 0 },
            { status: 403 }
          );
        }

        const remaining = org.analyses_total - org.analyses_used;

        if (remaining <= 0) {
          return NextResponse.json(
            { error: 'Analyse-Kontingent Ihrer Einrichtung erschöpft. Bitte den Einrichtungs-Admin kontaktieren.', analyses_remaining: 0 },
            { status: 403 }
          );
        }

        // Atomares Org-Pool-Decrement: .gt() verhindert Race Condition (wie beim Individual-Pfad)
        const { data: orgUpdated, error: orgUpdateError } = await supabaseAdmin
          .from('organizations')
          .update({ analyses_used: org.analyses_used + 1 })
          .eq('id', membership.org_id)
          .lt('analyses_used', org.analyses_total)
          .select('analyses_used, analyses_total')
          .single();

        if (orgUpdateError || !orgUpdated) {
          // Race Condition: Zwischen Read und Write hat ein anderer Request das Kontingent erschöpft
          return NextResponse.json(
            { error: 'Analyse-Kontingent Ihrer Einrichtung erschöpft.', analyses_remaining: 0 },
            { status: 403 }
          );
        }

        // Per-Member-Counter (best-effort, nicht kritisch)
        await supabaseAdmin
          .from('organization_members')
          .update({ analyses_used: (membership.analyses_used ?? 0) + 1 })
          .eq('org_id', membership.org_id)
          .eq('user_id', user.id);

        return NextResponse.json({
          success: true,
          analyses_remaining: orgUpdated.analyses_total - orgUpdated.analyses_used,
          analyses_used: orgUpdated.analyses_used,
          subscription_type: 'b2b_pool',
        });
      }
    }
    // ── Ende Org-Pool ──────────────────────────────────────────────────────

    // Subscription holen
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Testmodus: Nur aktiv wenn DEV_UNLIMITED_ANALYSES=true explizit gesetzt
    const isDevUnlimited = process.env.DEV_UNLIMITED_ANALYSES === 'true';

    if (subError || !subscription) {
      if (isDevUnlimited) {
        return NextResponse.json({
          success: true,
          analyses_remaining: 999,
          analyses_used: 0,
          subscription_type: 'dev_test'
        });
      }
      return NextResponse.json(
        { error: 'Kein Abonnement gefunden.' },
        { status: 404 }
      );
    }

    // Ablauf prüfen: expires_at in der Vergangenheit → kein Zugang
    if (!isDevUnlimited && subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Ihr Abonnement ist abgelaufen.', analyses_remaining: 0, subscription_type: subscription.subscription_type },
        { status: 403 }
      );
    }

    if (!isDevUnlimited && subscription.analyses_remaining <= 0) {
      return NextResponse.json(
        {
          error: 'Keine Analysen mehr verfügbar.',
          analyses_remaining: 0,
          subscription_type: subscription.subscription_type
        },
        { status: 403 }
      );
    }

    if (isDevUnlimited) {
      return NextResponse.json({
        success: true,
        analyses_remaining: 999,
        analyses_used: subscription.analyses_used,
        subscription_type: 'dev_test'
      });
    }

    // Counter atomar reduzieren — .gt('analyses_remaining', 0) verhindert Race Condition
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        analyses_used: subscription.analyses_used + 1,
        analyses_remaining: subscription.analyses_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .gt('analyses_remaining', 0)
      .select()
      .single();

    if (updateError) {
      await reportError(updateError, { context: 'use-analysis/update', userId: user.id });
      return NextResponse.json(
        { error: 'Abo-Aktualisierung fehlgeschlagen.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analyses_remaining: updated.analyses_remaining,
      analyses_used: updated.analyses_used,
      subscription_type: updated.subscription_type
    });

  } catch (error: unknown) {
    await reportError(error, { context: 'use-analysis' });
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
