import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import { reportError } from "@/lib/error-reporter";

/**
 * Upload-Route — Datei-Upload (PDF/Bild -> Text)
 * Der eigentliche Upload läuft direkt über /api/analyze (formData).
 * Diese Route ist ein Alias-Endpunkt für zukünftige direkte Upload-Nutzung.
 */
export async function POST(req: NextRequest) {
  try {
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
  } catch (error) {
    reportError(error instanceof Error ? error : new Error(String(error)), { context: "upload" });
    return NextResponse.json({ error: "Upload fehlgeschlagen." }, { status: 500 });
  }
}
