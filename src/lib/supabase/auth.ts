import { createClient } from '@supabase/supabase-js';

/**
 * Prüft Supabase Auth (Bearer Token).
 * Gibt User-ID und Token zurück, oder null wenn nicht authentifiziert.
 *
 * Verwendung:
 *   const user = await getAuthenticatedUser(req);
 *   if (!user) return NextResponse.json({ error: '...' }, { status: 401 });
 */
export async function getAuthenticatedUser(
  req: Request
): Promise<{ id: string; token: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!url || !anonKey) return null;

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  return { id: user.id, token };
}
