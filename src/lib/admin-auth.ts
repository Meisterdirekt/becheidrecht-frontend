import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Prüft Admin-Berechtigung per ADMIN_SECRET Header oder ADMIN_EMAILS.
 *
 * Verwendung:
 *   const auth = await verifyAdmin(req);
 *   if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });
 */
export async function verifyAdmin(
  request: Request
): Promise<{ authorized: boolean; error?: string }> {
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
  if (!url || !anonKey) {
    return { authorized: false, error: 'Supabase nicht konfiguriert.' };
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) {
    return { authorized: false, error: 'Ungültiger Token.' };
  }

  if (ADMIN_EMAILS.length === 0) {
    return { authorized: false, error: 'Keine Admin-E-Mails konfiguriert. ADMIN_EMAILS in Umgebungsvariablen setzen.' };
  }

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return { authorized: false, error: 'Kein Admin-Zugang. Ihre E-Mail ist nicht berechtigt.' };
  }

  return { authorized: true };
}
