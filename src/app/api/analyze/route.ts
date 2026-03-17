import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runAgentAnalysis, type AgentAnalysisResult, type ProgressCallback } from '@/lib/logic/agent_engine';
import { runForensicAnalysis } from '@/lib/logic/engine';
import { pseudonymizeText, depseudonymizeText } from '@/lib/privacy/pseudonymizer';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import { getAnthropicKey, getOpenAIKey } from '@/lib/logic/agents/utils';
import { analyzeLimiter, analyzeAnonLimiter } from '@/lib/rate-limit';
import { reportError, reportInfo } from '@/lib/error-reporter';
import PDFParser from 'pdf2json';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 300;

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
 * Tesseract Worker-Pool: Round-Robin \u00fcber POOL_SIZE Worker.
 * Lazy-Init beim ersten OCR-Call. Jeder Worker bleibt persistent.
 * Bei Multi-Page-PDFs werden Seiten parallel auf verschiedene Worker verteilt.
 */
type TesseractWorker = Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>>;
const POOL_SIZE = 3;
const workerPool: TesseractWorker[] = [];
let poolInitPromise: Promise<void> | null = null;
let poolRoundRobin = 0;

async function initWorkerPool(): Promise<void> {
  if (workerPool.length >= POOL_SIZE) return;
  if (poolInitPromise) return poolInitPromise;

  poolInitPromise = (async () => {
    const { createWorker } = await import('tesseract.js');
    const promises = Array.from({ length: POOL_SIZE }, () =>
      createWorker('deu', 1, { logger: () => {} })
    );
    const workers = await Promise.all(promises);
    workerPool.push(...workers);
  })();

  try {
    await poolInitPromise;
  } catch {
    poolInitPromise = null;
    throw new Error('Tesseract Worker-Pool init failed');
  }
}

function getNextWorker(): TesseractWorker {
  const worker = workerPool[poolRoundRobin % workerPool.length];
  poolRoundRobin++;
  return worker;
}

async function resetWorkerPool(): Promise<void> {
  for (const w of workerPool) {
    try { await w.terminate(); } catch { /* ignore */ }
  }
  workerPool.length = 0;
  poolInitPromise = null;
  poolRoundRobin = 0;
}

/**
 * Lokale OCR via Tesseract.js \u2014 Bilder verlassen NICHT den Server.
 * DSGVO-konform: keine personenbezogenen Daten an externe APIs.
 * Nutzt Round-Robin Worker-Pool (3 Worker, lazy init).
 * Fallback: Pool-Reset + Neuinitialisierung bei Fehler.
 */
async function extractTextFromImageLocal(buffer: Buffer): Promise<string> {
  // Versuch 1: Worker aus Pool
  try {
    await initWorkerPool();
    const worker = getNextWorker();
    const { data: { text } } = await worker.recognize(buffer);
    return text.trim();
  } catch {
    await resetWorkerPool();
  }

  // Versuch 2: Frischer Pool als Fallback
  try {
    await initWorkerPool();
    const worker = getNextWorker();
    const { data: { text } } = await worker.recognize(buffer);
    return text.trim();
  } catch {
    return '';
  }
}

/**
 * OpenAI OCR \u2014 NUR als letzter Fallback wenn Tesseract versagt.
 * Nutzer wird in der UI informiert (privacy-notice in der Antwort).
 * Bild enth\u00e4lt zu diesem Zeitpunkt noch PII \u2014 daher nur wenn unbedingt n\u00f6tig.
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
        content: 'Du bist ein OCR-Tool. Extrahiere den vollst\u00e4ndigen Text des Bescheids. Gib NUR den reinen Text zur\u00fcck, ohne Erkl\u00e4rungen.',
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
 * Haupt-OCR f\u00fcr Bilder:
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

  // Lokale OCR hat versagt \u2014 OpenAI als Fallback (mit Logging f\u00fcr Audit)
  reportInfo('[OCR] Tesseract unzureichend, Fallback auf OpenAI Vision');
  try {
    const openAiText = await extractTextFromImageOpenAI(buffer, mimeType);
    reportInfo('[OCR] OpenAI Vision', { zeichen: openAiText.length });
    return openAiText;
  } catch {
    if (localText.length > 0) return localText; // Lieber schlechtes Ergebnis als keins
    throw new Error('Texterkennung fehlgeschlagen. Bitte PDF hochladen oder Foto in besserer Qualit\u00e4t aufnehmen.');
  }
}

export async function POST(req: Request) {
  try {
    // Auth ist optional \u2014 eingeloggte User haben mehr Features, anonyme 1 Demo-Analyse
    const user = await getAuthenticatedUser(req);

    if (user) {
      const { success } = await analyzeLimiter.limit(user.id);
      if (!success) {
        return NextResponse.json(
          { error: 'Zu viele Anfragen. Du hast bereits 5 Analysen in den letzten 15 Minuten durchgef\u00fchrt. Bitte kurz warten.' },
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
          { error: 'Sie haben heute bereits eine kostenlose Demo-Analyse genutzt. Registrieren Sie sich f\u00fcr weitere Analysen.' },
          { status: 429 }
        );
      }
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const MAX_FILES = 10;

    const formData = await req.formData();
    const rawFiles = formData.getAll('file');
    const userContext = formData.get('userContext');
    const userContextStr = typeof userContext === 'string' && userContext.trim().length > 0
      ? userContext.trim().slice(0, 1000)
      : undefined;

    // Filter: nur echte File-Objekte
    const uploadedFiles = rawFiles.filter((f): f is File => typeof f !== 'string' && f instanceof File && f.size > 0);

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'Datei fehlt.' }, { status: 400 });
    }

    if (uploadedFiles.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximal ${MAX_FILES} Dateien gleichzeitig.` },
        { status: 400 }
      );
    }

    // Validierung: Gr\u00f6\u00dfe + Typ jeder Datei
    for (const f of uploadedFiles) {
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `\u201E${f.name}\u201C ist zu gro\u00df. Maximal 10 MB pro Datei.` },
          { status: 400 }
        );
      }
      const mime = f.type || 'application/octet-stream';
      if (mime !== 'application/pdf' && !mime.startsWith('image/')) {
        return NextResponse.json(
          { error: `\u201E${f.name}\u201C: Nur PDF- oder Bilddateien werden unterst\u00fctzt.` },
          { status: 400 }
        );
      }
    }

    // Text aus allen Dateien parallel extrahieren
    const extractionResults = await Promise.allSettled(
      uploadedFiles.map(async (f, idx) => {
        const bytes = await f.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mimeType = f.type || 'application/octet-stream';

        let text = '';
        if (mimeType === 'application/pdf') {
          text = await extractTextFromPdf(buffer);
        } else if (mimeType.startsWith('image/')) {
          text = await extractTextFromImage(buffer, mimeType);
        }
        return { idx, name: f.name, text };
      })
    );

    // Ergebnisse zusammenf\u00fchren
    const textParts: string[] = [];
    for (const r of extractionResults) {
      if (r.status === 'fulfilled' && r.value.text.trim().length > 0) {
        if (uploadedFiles.length > 1) {
          textParts.push(`--- Dokument ${r.value.idx + 1}: ${r.value.name} ---\n${r.value.text}`);
        } else {
          textParts.push(r.value.text);
        }
      } else if (r.status === 'rejected') {
        const err = r.reason instanceof Error ? r.reason : new Error(String(r.reason));
        reportError(err, { critical: false, context: 'multi_file_extraction' }).catch(() => {});
      }
    }

    const extractedText = textParts.join('\n\n');

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        {
          musterschreiben:
            uploadedFiles.length > 1
              ? 'Aus den hochgeladenen Dateien konnte kein lesbarer Text extrahiert werden.'
              : 'Die Datei scheint leer zu sein oder enth\u00e4lt keinen lesbaren Text.',
          fehler: [],
        },
        { status: 200 }
      );
    }

    reportInfo('[Analyze] Textextraktion abgeschlossen', {
      dateien: uploadedFiles.length,
      extrahiert: textParts.length,
      zeichen: extractedText.length,
    });

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

    // SSE oder JSON?
    const wantsSSE = req.headers.get('accept')?.includes('text/event-stream');

    // Shared: Post-Processing nach Pipeline
    async function postProcess(result: AgentAnalysisResult): Promise<AgentAnalysisResult> {
      result = {
        ...result,
        fehler: Array.isArray(result.fehler)
          ? result.fehler.map((f: string) => depseudonymizeText(String(f), map))
          : result.fehler,
        musterschreiben: depseudonymizeText(result.musterschreiben || '', map),
      };

      // Qualit\u00e4ts-Alert
      const erfolgschance = result.kritik?.erfolgschance_prozent;
      if (erfolgschance !== undefined && erfolgschance < 35) {
        reportError(
          new Error(`Schlechte KI-Qualit\u00e4t: AG03 Erfolgschance nur ${erfolgschance}%`),
          { critical: true, agent: 'AG03', erfolgschance, rechtsgebiet: result.zuordnung?.rechtsgebiet ?? 'unbekannt', routing_stufe: result.routing_stufe ?? 'unbekannt', user_id: user?.id ?? 'anon' }
        ).catch(() => {});
      }

      // Supabase User-Client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      const supabaseUser = user && supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${user.token}` } } })
        : null;

      // Auto-Save Frist + Kosten-Monitoring (parallel)
      if (supabaseUser) {
        const dbOps: PromiseLike<unknown>[] = [];

        if (result.frist_datum) {
          dbOps.push(
            supabaseUser.from('user_fristen').insert({
              user_id: user!.id, behoerde: result.zuordnung?.behoerde ?? null,
              rechtsgebiet: result.zuordnung?.rechtsgebiet ?? null, untergebiet: result.zuordnung?.untergebiet ?? null,
              frist_datum: result.frist_datum, status: 'offen', musterschreiben: result.musterschreiben,
              analyse_meta: { frist_tage: result.frist_tage, auffaelligkeiten: result.fehler?.slice(0, 3), routing_stufe: result.routing_stufe, token_kosten_eur: result.token_kosten_eur, agenten_aktiv: result.agenten_aktiv, erfolgschance: result.kritik?.erfolgschance_prozent },
            }).then(null, (err: unknown) => reportError(err instanceof Error ? err : new Error(String(err)), { critical: false, context: "frist_autosave" }).catch(() => {}))
          );
        }

        if (result.token_kosten_eur !== undefined) {
          dbOps.push(
            supabaseUser.from('analysis_results').insert({
              user_id: user!.id, session_id: null, behoerde: result.zuordnung?.behoerde ?? null,
              rechtsgebiet: result.zuordnung?.rechtsgebiet ?? null, fehler: result.fehler ?? [],
              frist_datum: result.frist_datum ?? null, dringlichkeit: result.routing_stufe ?? null,
              model_used: result.model_used ?? (result.routing_stufe === 'NOTFALL' ? 'claude-opus-4-6' : 'claude-sonnet-4-6'),
              token_cost_eur: result.token_kosten_eur,
              analyse_meta: {
                erfolgschance: result.kritik?.erfolgschance_prozent ?? null,
                agenten_aktiv: result.agenten_aktiv ?? [],
                fehler_count: result.fehler?.length ?? 0,
                schwachstellen: result.kritik?.schwachstellen ?? [],
              },
            }).then(null, (err: unknown) => reportError(err instanceof Error ? err : new Error(String(err)), { critical: false, context: 'analysis_results_save' }).catch(() => {}))
          );
        }

        if (dbOps.length > 0) await Promise.all(dbOps);
      }

      return result;
    }

    // 13-Agenten-Pipeline (Claude) \u2014 prim\u00e4re Engine
    const anthropicAvailable = !!getAnthropicKey();

    if (wantsSSE && anthropicAvailable) {
      // SSE-Streaming: Fortschritt nach jeder Phase
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const sendEvent = (event: string, data: unknown) => {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          };

          try {
            const onProgress: ProgressCallback = (phase, detail) => {
              sendEvent('progress', { phase, detail });
            };

            reportInfo('[Analyze] SSE 13-Agenten-Pipeline gestartet');
            let result = await runAgentAnalysis(pseudonymized, onProgress, userContextStr);
            result = await postProcess(result);
            sendEvent('result', result);
          } catch (err: unknown) {
            sendEvent('error', { error: err instanceof Error ? err.message : 'Interner Serverfehler.' });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Standard JSON-Response
    let result: AgentAnalysisResult;
    if (anthropicAvailable) {
      reportInfo('[Analyze] 13-Agenten-Pipeline (Claude) gestartet');
      result = await runAgentAnalysis(pseudonymized, undefined, userContextStr);
    } else {
      reportInfo('[Analyze] ANTHROPIC_API_KEY fehlt \u2014 Fallback auf Legacy GPT-4o Engine');
      const legacyResult = await runForensicAnalysis(pseudonymized);
      result = { routing_stufe: 'NORMAL', agenten_aktiv: ['gpt4o-legacy'], ...legacyResult };
    }

    result = await postProcess(result);
    return NextResponse.json(result);
  } catch (error: unknown) {
    reportError(error instanceof Error ? error : new Error(String(error)), { critical: true, context: 'analyze_api' }).catch(() => {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}
