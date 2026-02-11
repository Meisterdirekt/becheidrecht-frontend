import { NextResponse } from 'next/server';

/**
 * Liefert die Supabase-Config zur Laufzeit (aus Server-Env).
 * So funktioniert Auth auch, wenn NEXT_PUBLIC_ beim Build nicht gesetzt war.
 */
export async function GET() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  if (!url || !anonKey) {
    return NextResponse.json(
      {
        configured: false,
        error: 'Supabase URL oder Anon Key fehlt in den Umgebungsvariablen.',
        debug: {
          hasUrl: !!url,
          hasAnonKey: !!anonKey,
          hint: 'In Vercel: Settings → Environment Variables. SUPABASE_URL und SUPABASE_ANON_KEY für Production setzen. Danach Seite neu laden (kein Redeploy nötig).',
        },
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    configured: true,
    url,
    anonKey,
  });
}
