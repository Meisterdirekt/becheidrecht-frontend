import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/auth';

/**
 * Upload-Route — Datei-Upload (PDF/Bild -> Text)
 * Der eigentliche Upload läuft direkt über /api/analyze (formData).
 * Diese Route ist ein Alias-Endpunkt für zukünftige direkte Upload-Nutzung.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Nicht angemeldet." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { error: "Direkter Upload nicht implementiert. Nutze /api/analyze mit formData." },
    { status: 501 }
  );
}
