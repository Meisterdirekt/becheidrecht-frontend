import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/supabase/auth';

/**
 * POST /api/einrichtung/invite
 * Erstellt eine neue Einladung (nur für Org-Admins).
 * Body: { email: string, role: 'admin' | 'berater' }
 *
 * DELETE /api/einrichtung/invite
 * Widerruft eine offene Einladung (nur für Org-Admins).
 * Body: { invite_id: string }
 */

function makeAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthenticatedUser(request);
  if (!authUser) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });

  const admin = makeAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase nicht konfiguriert' }, { status: 500 });

  // Admin-Mitgliedschaft prüfen
  const { data: raw } = await admin
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', authUser.id)
    .maybeSingle();
  const membership = raw as { org_id: string; role: string } | null;
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Nur Einrichtungs-Admins können Einladungen erstellen' }, { status: 403 });
  }

  const body = await request.json() as { email?: string; role?: string };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = body.role === 'admin' ? 'admin' : 'berater';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Ungültige E-Mail-Adresse' }, { status: 400 });
  }

  // Ist diese Person bereits Mitglied?
  const { data: existingRaw } = await admin
    .from('organization_members')
    .select('id')
    .eq('org_id', membership.org_id)
    .eq('user_email', email)
    .maybeSingle();
  if (existingRaw) {
    return NextResponse.json({ error: 'Diese Person ist bereits Mitglied Ihrer Einrichtung' }, { status: 409 });
  }

  // Bestehende offene Einladung überschreiben (idempotent)
  await admin
    .from('organization_invites')
    .delete()
    .eq('org_id', membership.org_id)
    .eq('email', email)
    .is('accepted_at', null);

  const { data: inviteRaw, error } = await admin
    .from('organization_invites')
    .insert({ org_id: membership.org_id, email, role, invited_by: authUser.id })
    .select('id, token, email, role, expires_at')
    .single();
  const invite = inviteRaw as { id: string; token: string; email: string; role: string; expires_at: string } | null;

  if (error || !invite) {
    return NextResponse.json({ error: 'Einladung konnte nicht erstellt werden' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    invite_id: invite.id,
    token: invite.token,
    email: invite.email,
    role: invite.role,
    expires_at: invite.expires_at,
  });
}

export async function DELETE(request: NextRequest) {
  const authUser = await getAuthenticatedUser(request);
  if (!authUser) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });

  const admin = makeAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase nicht konfiguriert' }, { status: 500 });

  const { data: raw } = await admin
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', authUser.id)
    .maybeSingle();
  const membership = raw as { org_id: string; role: string } | null;
  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Nur Einrichtungs-Admins können Einladungen widerrufen' }, { status: 403 });
  }

  const body = await request.json() as { invite_id?: string };
  if (!body.invite_id) return NextResponse.json({ error: 'invite_id fehlt' }, { status: 400 });

  const { error } = await admin
    .from('organization_invites')
    .delete()
    .eq('id', body.invite_id)
    .eq('org_id', membership.org_id);

  if (error) return NextResponse.json({ error: 'Einladung konnte nicht widerrufen werden' }, { status: 500 });

  return NextResponse.json({ success: true });
}
