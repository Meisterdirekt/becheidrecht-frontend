import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/supabase/auth';

/**
 * PATCH /api/einrichtung/members
 * Ändert die Rolle eines Mitglieds (nur Admin).
 * Body: { user_id: string, role: 'admin' | 'berater' }
 *
 * DELETE /api/einrichtung/members
 * Entfernt ein Mitglied aus der Einrichtung (nur Admin).
 * Body: { user_id: string }
 */

async function getAdminOrg(authId: string, adminClient: ReturnType<typeof createClient<Record<string, unknown>>>) {
  const { data } = await adminClient
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', authId)
    .maybeSingle() as { data: { org_id: string; role: string } | null };
  if (!data || data.role !== 'admin') return null;
  return data.org_id;
}

export async function PATCH(request: NextRequest) {
  const authUser = await getAuthenticatedUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase nicht konfiguriert' }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const orgId = await getAdminOrg(authUser.id, admin);
  if (!orgId) {
    return NextResponse.json({ error: 'Nur Einrichtungs-Admins dürfen Rollen ändern' }, { status: 403 });
  }

  const body = await request.json() as { user_id?: string; role?: string };
  if (!body.user_id || !['admin', 'berater'].includes(body.role ?? '')) {
    return NextResponse.json({ error: 'user_id und role (admin|berater) erforderlich' }, { status: 400 });
  }

  // Schutzmechanismus: Admin darf sich nicht selbst degradieren, wenn er der letzte Admin ist
  if (body.user_id === authUser.id && body.role === 'berater') {
    const { count } = await admin
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('role', 'admin');
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: 'Einrichtung muss mindestens einen Admin haben' }, { status: 409 });
    }
  }

  const { error } = await admin
    .from('organization_members')
    .update({ role: body.role })
    .eq('org_id', orgId)
    .eq('user_id', body.user_id);

  if (error) {
    return NextResponse.json({ error: 'Rolle konnte nicht geändert werden' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const authUser = await getAuthenticatedUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase nicht konfiguriert' }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const orgId = await getAdminOrg(authUser.id, admin);
  if (!orgId) {
    return NextResponse.json({ error: 'Nur Einrichtungs-Admins dürfen Mitglieder entfernen' }, { status: 403 });
  }

  const body = await request.json() as { user_id?: string };
  if (!body.user_id) {
    return NextResponse.json({ error: 'user_id erforderlich' }, { status: 400 });
  }

  // Letzten Admin schützen
  const { data: targetMember } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', body.user_id)
    .maybeSingle();

  if (targetMember?.role === 'admin') {
    const { count } = await admin
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('role', 'admin');
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: 'Der letzte Admin kann nicht entfernt werden' }, { status: 409 });
    }
  }

  const { error } = await admin
    .from('organization_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', body.user_id);

  if (error) {
    return NextResponse.json({ error: 'Mitglied konnte nicht entfernt werden' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
