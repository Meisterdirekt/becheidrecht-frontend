import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';
import { reportError } from '@/lib/error-reporter';
import { ANALYSES_MAP, computeExpiresAt } from '@/lib/plans';

/**
 * POST /api/admin/grant-subscription
 *
 * Admin-Route: User manuell ein Abo zuweisen
 * Geschützt durch Admin-Token (ADMIN_SECRET) und Supabase-Auth
 */

export async function POST(request: NextRequest) {
  try {
    // Admin-Authentifizierung prüfen
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Zugriff verweigert' },
        { status: 403 }
      );
    }

    const { email, subscription_type } = await request.json();

    if (!email || !subscription_type) {
      return NextResponse.json(
        { error: 'Email and subscription_type required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase Service-Key fehlt — Admin-Operationen nicht möglich.' },
        { status: 500 }
      );
    }

    // Service Role Client (für Admin-Aktionen — kein Fallback auf Anon-Key)
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      { auth: { persistSession: false } }
    );

    // User anhand E-Mail finden
    const { data: users, error: userError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (userError || !users || users.length === 0) {
      return NextResponse.json(
        { error: `User mit E-Mail "${email}" nicht gefunden. User muss sich zuerst registrieren!` },
        { status: 404 }
      );
    }

    const userId = users[0].user_id;

    const analyses = ANALYSES_MAP[subscription_type] || 0;

    if (analyses === 0) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      );
    }

    const expiresAt = computeExpiresAt(subscription_type);

    // Subscription aktualisieren
    const { data: updated, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        subscription_type,
        status: 'active',
        analyses_total: analyses,
        analyses_remaining: analyses,
        analyses_used: 0,
        order_id: `MANUAL_${Date.now()}`,
        payment_method: 'manual',
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      await reportError(updateError, { context: 'admin/grant-subscription', userId });
      return NextResponse.json(
        { error: 'Failed to grant subscription: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user_id: updated.user_id,
      email: updated.email,
      subscription_type: updated.subscription_type,
      analyses_remaining: updated.analyses_remaining,
      expires_at: updated.expires_at
    });

  } catch (error: unknown) {
    await reportError(error, { context: 'admin/grant-subscription' });
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
