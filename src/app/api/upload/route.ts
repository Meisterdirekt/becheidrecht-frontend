import { NextResponse } from 'next/server';

/**
 * Upload-Route — Datei-Upload (PDF/Bild → Text)
 * Der eigentliche Upload läuft direkt über /api/analyze (formData).
 * Diese Route ist ein Alias-Endpunkt für zukünftige direkte Upload-Nutzung.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Direkter Upload nicht implementiert. Nutze /api/analyze mit formData." },
    { status: 501 }
  );
}
