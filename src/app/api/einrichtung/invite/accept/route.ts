import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/supabase/auth';

/**
 * GET /api/einrichtung/invite/accept?token=xxx
 * Öffentlich: Gibt Einladungs-Info zurück (Org-Name, Rolle).
 * Wird vom Invite-Accept-Page verwendet, bevor der User eingeloggt ist.
 *
 * POST /api/einrichtung/invite/accept
 * Auth erforderlich: Nimmt Einladung an, legt organization_members-Eintrag an.
 * Body: { token: string }
 */

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Token fehlt' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase nicht konfiguriert' }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: invite } = await admin
    .from('organization_invites')
    .select('id, email, role, expires_at, accepted_at, organizations(id, name, org_type)')
    .eq('token', token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: 'Ungültiger oder abgelaufener Einladungslink' }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json({ error: 'Diese Einladung wurde bereits angenommen' }, { status: 410 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Diese Einladung ist abgelaufen' }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    invite_id: invite.id,
    email: invite.email,
    role: invite.role,
    expires_at: invite.expires_at,
    org: invite.organizations,
  });
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthenticatedUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Nicht authentifiziert — bitte zuerst einloggen' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase nicht konfiguriert' }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // User-E-Mail aus Auth holen
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${authUser.token}` } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'Benutzer-E-Mail nicht ermittelbar' }, { status: 400 });
  }

  const body = await request.json() as { token?: string };
  if (!body.token) {
    return NextResponse.json({ error: 'Token fehlt' }, { status: 400 });
  }

  // Einladung laden + validieren
  const { data: invite } = await admin
    .from('organization_invites')
    .select('id, email, role, expires_at, accepted_at, org_id, invited_by')
    .eq('token', body.token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: 'Ungültiger Einladungslink' }, { status: 404 });
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'Einladung bereits angenommen' }, { status: 410 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Einladung abgelaufen' }, { status: 410 });
  }

  // Ist der User bereits Mitglied dieser Einrichtung?
  const { data: existingMember } = await admin
    .from('organization_members')
    .select('id')
    .eq('org_id', invite.org_id)
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (existingMember) {
    return NextResponse.json({ error: 'Sie sind bereits Mitglied dieser Einrichtung' }, { status: 409 });
  }

  // Mitglied anlegen
  const { error: insertError } = await admin
    .from('organization_members')
    .insert({
      org_id: invite.org_id,
      user_id: authUser.id,
      user_email: user.email,
      role: invite.role,
      invited_by: invite.invited_by,
    });

  if (insertError) {
    return NextResponse.json({ error: 'Beitritt fehlgeschlagen: ' + insertError.message }, { status: 500 });
  }

  // Einladung als angenommen markieren
  await admin
    .from('organization_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  return NextResponse.json({ success: true, org_id: invite.org_id });
}
