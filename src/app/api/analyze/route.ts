import { NextResponse } from 'next/server';
import { runForensicAnalysis } from '@/lib/logic/engine';
import PDFParser from 'pdf2json';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function getOpenAIKeyFromVault(): string | null {
  try {
    const vaultPath = (file: string) => path.join(process.cwd(), 'vault', file);
    const envContent = fs.readFileSync(vaultPath('keys.env'), 'utf8');
    return envContent.match(/sk-[a-zA-Z0-9_-]+/)?.[0] ?? null;
  } catch {
    return null;
  }
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
  const apiKey = getOpenAIKeyFromVault();
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
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Datei fehlt' }, { status: 400 });
    }

    const uploadedFile = file as any;

    const bytes = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = uploadedFile.type || 'application/octet-stream';

    let extractedText = '';

    if (mimeType === 'application/pdf') {
      extractedText = await extractTextFromPdf(buffer);
    } else if (mimeType.startsWith('image/')) {
      extractedText = await extractTextFromImage(buffer, mimeType);
    } else {
      return NextResponse.json(
        { error: 'Nur PDF- oder Bilddateien werden unterstützt.' },
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
