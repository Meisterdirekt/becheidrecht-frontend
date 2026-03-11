import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runAgentAnalysis, type AgentAnalysisResult } from '@/lib/logic/agent_engine';
import { runForensicAnalysis } from '@/lib/logic/engine';
import { pseudonymizeText, depseudonymizeText } from '@/lib/privacy/pseudonymizer';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import { getAnthropicKey } from '@/lib/logic/agents/utils';
import { analyzeLimiter, analyzeAnonLimiter } from '@/lib/rate-limit';
import { reportError, reportInfo } from '@/lib/error-reporter';
import PDFParser from 'pdf2json';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 300;

function getOpenAIKey(): string | null {
  try {
    const vaultPath = (file: string) => path.join(process.cwd(), 'vault', file);
    const envContent = fs.readFileSync(vaultPath('keys.env'), 'utf8');
    const key = envContent.match(/OPENAI_API_KEY\s*=\s*([^\s\n]+)/)?.[1];
    if (key) return key;
  } catch {
    // Vault nicht vorhanden (z. B. auf Vercel)
  }
  return process.env.OPENAI_API_KEY || null;
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParser = new (PDFParser as any)(null, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 * Lokale OCR via Tesseract.js — Bilder verlassen NICHT den Server.
 * DSGVO-konform: keine personenbezogenen Daten an externe APIs.
 */
async function extractTextFromImageLocal(buffer: Buffer): Promise<string> {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('deu', 1, {
      logger: () => {}, // Kein Logging
    });
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text.trim();
  } catch {
    return '';
  }
}

/**
 * OpenAI OCR — NUR als letzter Fallback wenn Tesseract versagt.
 * Nutzer wird in der UI informiert (privacy-notice in der Antwort).
 * Bild enthält zu diesem Zeitpunkt noch PII — daher nur wenn unbedingt nötig.
 */
async function extractTextFromImageOpenAI(buffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI Key fehlt.');

  const openai = new OpenAI({ apiKey });
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Du bist ein OCR-Tool. Extrahiere den vollständigen Text des Bescheids. Gib NUR den reinen Text zurück, ohne Erklärungen.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Bitte extrahiere den gesamten Text aus diesem Schreiben.' },
          { type: 'image_url', image_url: { url: dataUrl } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any,
      },
    ],
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * Haupt-OCR für Bilder:
 * 1. Tesseract.js lokal (DSGVO-konform, kein Datentransfer)
 * 2. Fallback OpenAI wenn Tesseract < 50 Zeichen liefert
 */
async function extractTextFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  reportInfo('[OCR] Starte lokale Texterkennung (Tesseract)');
  const localText = await extractTextFromImageLocal(buffer);

  if (localText.length >= 50) {
    reportInfo('[OCR] Tesseract erfolgreich', { zeichen: localText.length });
    return localText;
  }

  // Lokale OCR hat versagt — OpenAI als Fallback (mit Logging für Audit)
  console.warn('[OCR] Tesseract unzureichend, Fallback auf OpenAI Vision (Datentransfer!)');
  try {
    const openAiText = await extractTextFromImageOpenAI(buffer, mimeType);
    reportInfo('[OCR] OpenAI Vision', { zeichen: openAiText.length });
    return openAiText;
  } catch {
    if (localText.length > 0) return localText; // Lieber schlechtes Ergebnis als keins
    throw new Error('Texterkennung fehlgeschlagen. Bitte PDF hochladen oder Foto in besserer Qualität aufnehmen.');
  }
}

export async function POST(req: Request) {
  try {
    // Auth ist optional — eingeloggte User haben mehr Features, anonyme 1 Demo-Analyse
    const user = await getAuthenticatedUser(req);

    if (user) {
      const { success } = await analyzeLimiter.limit(user.id);
      if (!success) {
        return NextResponse.json(
          { error: 'Zu viele Anfragen. Du hast bereits 5 Analysen in den letzten 15 Minuten durchgeführt. Bitte kurz warten.' },
          { status: 429 }
        );
      }
    } else {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'anon';
      const { success } = await analyzeAnonLimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: 'Sie haben heute bereits eine kostenlose Demo-Analyse genutzt. Registrieren Sie sich kostenlos für unbegrenzte Analysen.' },
          { status: 429 }
        );
      }
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
      } catch (imgErr: unknown) {
        console.error('Bild-OCR Fehler:', imgErr);
        const imgMsg = imgErr instanceof Error ? imgErr.message : '';
        const msg = imgMsg.includes('Key') || imgMsg.includes('key')
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

    const { pseudonymized, map } = pseudonymizeText(extractedText);

    reportInfo('[Privacy] Erkannte sensible Daten', {
      namen: map.name.length,
      adressen: map.address.length,
      geburtsdaten: map.birthdate.length,
      bankkonten: map.bankAccount.length,
      steuerIds: map.taxId.length,
      svNummern: map.socialSecurityNumber.length,
      emails: map.email.length,
      telefon: map.phone.length,
      bic: map.bic.length,
    });

    // 13-Agenten-Pipeline (Claude) — primäre Engine
    // Fallback auf Legacy-GPT-4o wenn ANTHROPIC_API_KEY fehlt (wird intern in den Agenten geprüft)
    const anthropicAvailable = !!getAnthropicKey();
    let result: AgentAnalysisResult;

    if (anthropicAvailable) {
      reportInfo('[Analyze] 13-Agenten-Pipeline (Claude) gestartet');
      result = await runAgentAnalysis(pseudonymized);
    } else {
      console.warn('[Analyze] ANTHROPIC_API_KEY fehlt — Fallback auf Legacy GPT-4o Engine');
      const legacyResult = await runForensicAnalysis(pseudonymized);
      result = { routing_stufe: 'NORMAL', agenten_aktiv: ['gpt4o-legacy'], ...legacyResult };
    }

    result = {
      ...result,
      fehler: Array.isArray(result.fehler)
        ? result.fehler.map((f: string) => depseudonymizeText(String(f), map))
        : result.fehler,
      musterschreiben: depseudonymizeText(result.musterschreiben || '', map),
    };

    // Qualitäts-Alert: AG03 Erfolgschance unter 35% → Sentry + GitHub Issue
    const erfolgschance = result.kritik?.erfolgschance_prozent;
    if (erfolgschance !== undefined && erfolgschance < 35) {
      reportError(
        new Error(`Schlechte KI-Qualität: AG03 Erfolgschance nur ${erfolgschance}%`),
        {
          critical: true,
          agent: 'AG03',
          erfolgschance,
          rechtsgebiet: result.zuordnung?.rechtsgebiet ?? 'unbekannt',
          routing_stufe: result.routing_stufe ?? 'unbekannt',
          user_id: user?.id ?? 'anon',
        }
      ).catch(() => {}); // fire-and-forget, darf Hauptergebnis nicht blockieren
    }

    // Supabase User-Client — nur für eingeloggte User
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    const supabaseUser =
      user && supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${user.token}` } },
          })
        : null;

    // Auto-Save Frist in Supabase (kein Service-Key nötig, nutzt User-JWT)
    if (result.frist_datum && supabaseUser) {
      try {
        await supabaseUser.from('user_fristen').insert({
          user_id: user!.id,
          behoerde: result.zuordnung?.behoerde ?? null,
          rechtsgebiet: result.zuordnung?.rechtsgebiet ?? null,
          untergebiet: result.zuordnung?.untergebiet ?? null,
          frist_datum: result.frist_datum,
          status: 'offen',
          musterschreiben: result.musterschreiben,
          analyse_meta: {
            frist_tage: result.frist_tage,
            auffaelligkeiten: result.fehler?.slice(0, 3),
            routing_stufe: result.routing_stufe,
            token_kosten_eur: result.token_kosten_eur,
            agenten_aktiv: result.agenten_aktiv,
            erfolgschance: result.kritik?.erfolgschance_prozent,
          },
        });
        reportInfo('[Fristen] Frist auto-gespeichert', { frist_datum: result.frist_datum });
      } catch (fristErr) {
        // Frist-Save-Fehler darf Hauptergebnis nicht blockieren
        console.warn('[Fristen] Auto-Save fehlgeschlagen:', fristErr);
      }
    }

    // Kosten-Monitoring: persistiere Token-Kosten in analysis_results
    if (result.token_kosten_eur !== undefined && supabaseUser) {
      try {
        await supabaseUser.from('analysis_results').insert({
          user_id: user!.id,
          session_id: null,
          behoerde: result.zuordnung?.behoerde ?? null,
          rechtsgebiet: result.zuordnung?.rechtsgebiet ?? null,
          fehler: result.fehler ?? [],
          frist_datum: result.frist_datum ?? null,
          dringlichkeit: result.routing_stufe ?? null,
          model_used: result.model_used ?? (result.routing_stufe === 'NOTFALL' ? 'claude-opus-4-6' : 'claude-sonnet-4-6'),
          token_cost_eur: result.token_kosten_eur,
        });
        reportInfo('[Monitoring] Token-Kosten gespeichert', { kosten_eur: result.token_kosten_eur });
      } catch {
        // Silent fail — Monitoring darf Hauptergebnis nicht blockieren
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Analyze API Fehler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
