import { NextResponse } from 'next/server';

/**
 * Diagnose für Auth: Prüft, ob Server-Env für Supabase gesetzt ist.
 * Nur in Entwicklung verfügbar - in Production deaktiviert.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  return NextResponse.json({
    configured: !!(url && anonKey),
    hasUrl: !!url,
    hasAnonKey: !!anonKey,
    hint: 'Nur in Entwicklung sichtbar.',
  });
}
