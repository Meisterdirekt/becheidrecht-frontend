import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runForensicAnalysis } from '@/lib/logic/engine';
import PDFParser from 'pdf2json';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

/** Prüft Supabase Auth (Bearer Token). Gibt User oder null zurück. */
async function getAuthenticatedUser(req: Request): Promise<{ id: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!url || !anonKey) return null;

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id };
}

function getOpenAIKey(): string | null {
  try {
    const vaultPath = (file: string) => path.join(process.cwd(), 'vault', file);
    const envContent = fs.readFileSync(vaultPath('keys.env'), 'utf8');
    const key = envContent.match(/sk-[a-zA-Z0-9_-]+/)?.[0];
    if (key) return key;
  } catch {
    // Vault nicht vorhanden (z. B. auf Vercel)
  }
  return process.env.OPENAI_API_KEY || null;
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(errData?.parserError || new Error('Fehler beim PDF-Parsing.'));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      } catch (e) {
        reject(e);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

async function extractTextFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error('OpenAI Key fehlt.');
  }

  const openai = new OpenAI({ apiKey });
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Du bist ein OCR-Tool. Extrahiere den vollständigen Text des Bescheids. Gib NUR den reinen Text zurück, ohne Erklärungen.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Bitte extrahiere den gesamten Text aus diesem Schreiben.',
          },
          {
            type: 'image_url',
            image_url: { url: dataUrl },
          },
        ] as any,
      },
    ],
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content?.trim() ?? '';
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht angemeldet. Bitte zuerst einloggen.' },
        { status: 401 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Datei fehlt.' }, { status: 400 });
    }

    const uploadedFile = file as File;
    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Datei zu groß. Maximal 10 MB (PDF oder Bild).' },
        { status: 400 }
      );
    }

    const bytes = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = uploadedFile.type || 'application/octet-stream';

    let extractedText = '';

    if (mimeType === 'application/pdf') {
      extractedText = await extractTextFromPdf(buffer);
    } else if (mimeType.startsWith('image/')) {
      try {
        extractedText = await extractTextFromImage(buffer, mimeType);
      } catch (imgErr: any) {
        console.error('Bild-OCR Fehler:', imgErr);
        const msg = imgErr?.message?.includes('Key') || imgErr?.message?.includes('key')
          ? 'Bildanalyse ist derzeit nicht verfügbar. Bitte PDF hochladen oder später erneut versuchen.'
          : 'Text aus dem Bild konnte nicht gelesen werden. Bitte Foto erneut aufnehmen (gut beleuchtet, leserlich) oder PDF verwenden.';
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: 'Nur PDF- oder Bilddateien (z. B. Foto des Bescheids) werden unterstützt.' },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        {
          musterschreiben:
            'Die Datei scheint leer zu sein oder enthält keinen lesbaren Text. Text konnte nicht extrahiert werden.',
          fehler: [],
        },
        { status: 200 }
      );
    }

    const result = await runForensicAnalysis(extractedText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analyze API Fehler:', error);
    return NextResponse.json(
      { error: error.message || 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
