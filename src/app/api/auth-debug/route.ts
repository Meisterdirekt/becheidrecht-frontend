import { NextResponse } from 'next/server';

/**
 * Diagnose für Auth: Prüft, ob Server-Env für Supabase gesetzt ist.
 * Aufruf: GET /api/auth-debug (nur für Fehlersuche).
 */
export async function GET() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  const urlPrefix = url ? url.replace(/^https?:\/\//, '').slice(0, 50) : '';

  return NextResponse.json({
    configured: !!(url && anonKey),
    hasUrl: !!url,
    hasAnonKey: !!anonKey,
    urlPrefix: urlPrefix || '(leer)',
    envSources: {
      hasNextPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasNextPublicKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    },
    hint: 'Middleware und auth-config nutzen beide SUPABASE_* bzw. NEXT_PUBLIC_*. Alle vier Variablen sollten auf denselben Supabase-Projektwert zeigen.',
  });
}
