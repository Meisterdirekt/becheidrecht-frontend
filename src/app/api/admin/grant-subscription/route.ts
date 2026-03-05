import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/grant-subscription
 *
 * Admin-Route: User manuell ein Abo zuweisen
 * Geschützt durch Admin-Token (ADMIN_SECRET) und Supabase-Auth
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; error?: string }> {
  // Methode 1: ADMIN_SECRET Token im Header
  const adminSecret = process.env.ADMIN_SECRET;
  const adminToken = request.headers.get('x-admin-token');
  if (adminSecret && adminToken === adminSecret) {
    return { authorized: true };
  }

  // Methode 2: Eingeloggter User muss in ADMIN_EMAILS stehen
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, error: 'Nicht authentifiziert. Admin-Zugang erforderlich.' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return { authorized: false, error: 'Supabase nicht konfiguriert.' };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) {
    return { authorized: false, error: 'Ungültiger Token.' };
  }

  if (ADMIN_EMAILS.length === 0) {
    return { authorized: false, error: 'Keine Admin-E-Mails konfiguriert. Bitte ADMIN_EMAILS in Umgebungsvariablen setzen.' };
  }

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return { authorized: false, error: 'Kein Admin-Zugang. Ihre E-Mail ist nicht berechtigt.' };
  }

  return { authorized: true };
}

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
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Service Role Client (für Admin-Aktionen)
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey || anonKey,
      serviceRoleKey ? { auth: { persistSession: false } } : undefined
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

    // Anzahl Analysen je nach Typ
    const analysisMap: Record<string, number> = {
      'single': 1,
      'basic': 5,
      'standard': 15,
      'pro': 50,
      'business': 120,
      'b2b_starter': 300,
      'b2b_professional': 1000,
      'b2b_enterprise': 2500,
      'b2b_corporate': 6000,
    };

    const analyses = analysisMap[subscription_type] || 0;

    if (analyses === 0) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      );
    }

    // Ablaufdatum berechnen
    let expiresAt: string | null = null;
    if (subscription_type !== 'single') {
      // Abos laufen nach 1 Monat bzw. 1 Jahr ab
      const isYearly = subscription_type.startsWith('b2b_');
      const months = isYearly ? 12 : 1;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + months);
      expiresAt = expiryDate.toISOString();
    }

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
      console.error('Update error:', updateError);
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
    console.error('Grant subscription error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
