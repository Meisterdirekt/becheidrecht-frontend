import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/use-analysis
 *
 * Reduziert den Analyse-Counter um 1
 * Wird nach jedem erfolgreichen Upload/Analyse aufgerufen
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Authorization Header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Supabase Client mit User Token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // User abrufen
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Service Role Client für Update (RLS bypass)
    const supabaseAdmin = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase;

    // ── Org-Pool prüfen (B2B) ──────────────────────────────────────────────
    // Ist der User Mitglied einer Einrichtung? Dann aus dem gemeinsamen Pool abbuchen.
    if (serviceRoleKey) {
      const { data: membership } = await supabaseAdmin
        .from('organization_members')
        .select('org_id, analyses_used')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership?.org_id) {
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('analyses_total, analyses_used')
          .eq('id', membership.org_id)
          .single();

        if (!org) {
          return NextResponse.json({ error: 'Einrichtung nicht gefunden' }, { status: 404 });
        }

        const remaining = org.analyses_total - org.analyses_used;

        if (remaining <= 0) {
          return NextResponse.json(
            { error: 'Analyse-Kontingent Ihrer Einrichtung erschöpft. Bitte den Einrichtungs-Admin kontaktieren.', analyses_remaining: 0 },
            { status: 403 }
          );
        }

        // Org-Pool abbuchen
        await supabaseAdmin
          .from('organizations')
          .update({ analyses_used: org.analyses_used + 1 })
          .eq('id', membership.org_id);

        // Per-Member-Counter erhöhen
        await supabaseAdmin
          .from('organization_members')
          .update({ analyses_used: (membership.analyses_used ?? 0) + 1 })
          .eq('org_id', membership.org_id)
          .eq('user_id', user.id);

        return NextResponse.json({
          success: true,
          analyses_remaining: remaining - 1,
          analyses_used: org.analyses_used + 1,
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
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    if (!isDevUnlimited && subscription.analyses_remaining <= 0) {
      return NextResponse.json(
        {
          error: 'No analyses remaining',
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

    // Counter reduzieren
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        analyses_used: subscription.analyses_used + 1,
        analyses_remaining: subscription.analyses_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
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
    console.error('Use analysis error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
