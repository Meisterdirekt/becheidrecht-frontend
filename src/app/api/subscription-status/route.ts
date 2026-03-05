import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription-status
 *
 * Gibt den Subscription-Status des eingeloggten Users zurück
 */
export async function GET(request: NextRequest) {
  try {
    // Supabase Client mit User-Session erstellen
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Authorization Header holen (von Client gesendet)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Not authenticated', subscription_type: 'free', analyses_remaining: 0 },
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
        { error: 'User not found', subscription_type: 'free', analyses_remaining: 0 },
        { status: 401 }
      );
    }

    // Subscription Status aus Datenbank holen
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Testmodus: Nur aktiv wenn DEV_UNLIMITED_ANALYSES=true explizit gesetzt
    const isDevUnlimited = process.env.DEV_UNLIMITED_ANALYSES === 'true';
    if (subError || !subscription) {
      return NextResponse.json({
        user_id: user.id,
        email: user.email,
        subscription_type: isDevUnlimited ? 'dev_test' : 'free',
        status: 'active',
        analyses_total: isDevUnlimited ? 999 : 0,
        analyses_used: 0,
        analyses_remaining: isDevUnlimited ? 999 : 0,
        expires_at: null
      });
    }

    const analysesRemaining = isDevUnlimited ? Math.max(subscription.analyses_remaining, 999) : subscription.analyses_remaining;

    return NextResponse.json({
      user_id: subscription.user_id,
      email: subscription.email,
      subscription_type: isDevUnlimited ? 'dev_test' : subscription.subscription_type,
      status: subscription.status,
      analyses_total: subscription.analyses_total,
      analyses_used: subscription.analyses_used,
      analyses_remaining: analysesRemaining,
      expires_at: subscription.expires_at,
      purchased_at: subscription.purchased_at
    });

  } catch (error: unknown) {
    console.error('Subscription status error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: msg, subscription_type: 'free', analyses_remaining: 0 },
      { status: 500 }
    );
  }
}
