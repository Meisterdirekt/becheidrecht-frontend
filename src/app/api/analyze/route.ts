import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/logic/forensic_engine';
import Tesseract from 'tesseract.js';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei empfangen' }, { status: 400 });
    }

    // Wir lesen das Bild direkt auf dem Server!
    const buffer = Buffer.from(await file.arrayBuffer());
    const { data: { text } } = await Tesseract.recognize(buffer, 'deu');

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ error: 'OCR konnte keinen Text lesen' }, { status: 422 });
    }

    const result = await analyzeDocument(text);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("SERVER FEHLER:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
