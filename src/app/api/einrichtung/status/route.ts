import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/einrichtung/status
 *
 * Gibt vollständige Einrichtungs-Informationen zurück:
 * - Einrichtungs-Stammdaten + Analyse-Pool
 * - Mitgliederliste mit per-Member-Nutzung
 * - Offene Einladungen (nur für Admins)
 *
 * Auth: Bearer Token (eingeloggter User muss Mitglied sein)
 */
export async function GET(request: NextRequest) {
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

  // Mitgliedschaft des eingeloggten Users prüfen
  const { data: membership, error: memberError } = await admin
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (memberError || !membership) {
    return NextResponse.json({ error: 'Kein Mitglied einer Einrichtung' }, { status: 404 });
  }

  // Einrichtungs-Stammdaten, Mitglieder und Einladungen parallel laden
  const orgId = membership.org_id;
  const invitePromise = membership.role === 'admin'
    ? admin
        .from('organization_invites')
        .select('id, email, role, expires_at, created_at')
        .eq('org_id', orgId)
        .is('accepted_at', null)
        .order('created_at', { ascending: false })
    : Promise.resolve({ data: null, error: null });

  const [orgResult, membersResult, inviteResult] = await Promise.all([
    admin
      .from('organizations')
      .select('id, name, org_type, subscription_type, analyses_total, analyses_used, contact_email, activated_at, expires_at, created_at')
      .eq('id', orgId)
      .single(),
    admin
      .from('organization_members')
      .select('id, user_id, user_email, role, analyses_used, joined_at')
      .eq('org_id', orgId)
      .order('joined_at', { ascending: true }),
    invitePromise,
  ]);

  const { data: org, error: orgError } = orgResult;
  if (orgError || !org) {
    return NextResponse.json({ error: 'Einrichtung nicht gefunden' }, { status: 404 });
  }

  const members = membersResult.data;
  const invites: unknown[] = inviteResult.data ?? [];

  return NextResponse.json({
    org,
    my_role: membership.role,
    members: members ?? [],
    invites,
    analyses_remaining: Math.max(0, org.analyses_total - org.analyses_used),
  });
}
