import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';
import { ANALYSES_MAP } from '@/lib/plans';

/**
 * POST /api/admin/create-org
 *
 * Erstellt eine neue B2B-Einrichtung und weist den ersten Admin zu.
 * Auth: ADMIN_SECRET Token oder ADMIN_EMAILS (wie grant-subscription).
 *
 * Body:
 *   org_name: string
 *   org_type: string
 *   contact_email: string
 *   admin_email: string          — E-Mail des ersten Admins (muss registriert sein)
 *   subscription_type: string    — b2b_starter | b2b_professional | b2b_enterprise | b2b_corporate
 */

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error ?? 'Kein Admin-Zugang' }, { status: 403 });
  }

  const body = await request.json() as {
    org_name?: string;
    org_type?: string;
    contact_email?: string;
    admin_email?: string;
    subscription_type?: string;
  };

  const { org_name, org_type, contact_email, admin_email, subscription_type } = body;

  if (!org_name || !contact_email || !admin_email || !subscription_type) {
    return NextResponse.json({ error: 'org_name, contact_email, admin_email, subscription_type erforderlich' }, { status: 400 });
  }

  if (!ANALYSES_MAP[subscription_type]) {
    return NextResponse.json({ error: `Ungültiger subscription_type. Erlaubt: ${Object.keys(ANALYSES_MAP).join(', ')}` }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase nicht konfiguriert' }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Admin-User anhand E-Mail finden
  const { data: userSub } = await admin
    .from('user_subscriptions')
    .select('user_id, email')
    .eq('email', admin_email.toLowerCase().trim())
    .maybeSingle();

  if (!userSub) {
    return NextResponse.json({
      error: `User "${admin_email}" nicht gefunden. Der Admin-User muss sich zuerst registrieren.`
    }, { status: 404 });
  }

  const analyses_total = ANALYSES_MAP[subscription_type];

  // Einrichtung anlegen
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: org_name,
      org_type: org_type ?? 'sozialeinrichtung',
      contact_email: contact_email.toLowerCase().trim(),
      subscription_type,
      analyses_total,
      analyses_used: 0,
      activated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 Jahr
    })
    .select('id, name')
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: 'Einrichtung konnte nicht erstellt werden: ' + orgError?.message }, { status: 500 });
  }

  // Admin als erstes Mitglied hinzufügen
  const { error: memberError } = await admin
    .from('organization_members')
    .insert({
      org_id: org.id,
      user_id: userSub.user_id,
      user_email: userSub.email,
      role: 'admin',
    });

  if (memberError) {
    // Rollback: Org löschen
    await admin.from('organizations').delete().eq('id', org.id);
    return NextResponse.json({ error: 'Admin-Mitglied konnte nicht angelegt werden: ' + memberError.message }, { status: 500 });
  }

  // User-Subscription auf b2b aktualisieren (für Kompatibilität mit bestehenden Routes)
  await admin
    .from('user_subscriptions')
    .update({
      subscription_type,
      status: 'active',
      analyses_total: 0,       // Credits kommen aus dem Org-Pool
      analyses_remaining: 0,
      analyses_used: 0,
      payment_method: 'b2b_org',
      purchased_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userSub.user_id);

  return NextResponse.json({
    success: true,
    org_id: org.id,
    org_name: org.name,
    admin_email,
    subscription_type,
    analyses_total,
    message: `Einrichtung "${org.name}" erfolgreich erstellt. Admin: ${admin_email}`,
  });
}
