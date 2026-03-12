/**
 * Widerspruchs-Assistent API
 *
 * POST /api/assistant
 * Body: { traeger, beschreibung, antworten?, schritt }
 *
 * Schritt 1 ("analyse"): Analysiert Bescheid-Info, stellt Rückfragen
 * Schritt 2 ("erstelle"): Erstellt Musterschreiben basierend auf Antworten
 *
 * Streaming via Server-Sent Events (SSE)
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { getTraegerLabel } from "@/lib/letter-generator";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { assistantLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 90;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAnthropicKey(): string | null {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), "vault", "keys.env"), "utf8");
    const match = content.match(/ANTHROPIC_API_KEY\s*=\s*([^\s\n]+)/);
    if (match?.[1]) return match[1];
  } catch { /* vault fehlt */ }
  return process.env.ANTHROPIC_API_KEY || null;
}

// ---------------------------------------------------------------------------
// Streaming SSE Response Helper
// ---------------------------------------------------------------------------

function createSSEStream(): {
  stream: ReadableStream;
  send: (data: object) => void;
  close: () => void;
} {
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  const encoder = new TextEncoder();

  return {
    stream,
    send(data: object) {
      const chunk = `data: ${JSON.stringify(data)}\n\n`;
      controller.enqueue(encoder.encode(chunk));
    },
    close() {
      try { controller.close(); } catch { /* already closed */ }
    },
  };
}

// ---------------------------------------------------------------------------
// Schritt 1: Analyse + Rückfragen
// ---------------------------------------------------------------------------

async function handleAnalyse(
  traeger: string,
  beschreibung: string,
  send: (data: object) => void,
  close: () => void
) {
  const apiKey = getAnthropicKey();
  if (!apiKey) {
    send({ type: "error", message: "KI nicht verfügbar. ANTHROPIC_API_KEY fehlt." });
    close();
    return;
  }

  const traegerLabel = getTraegerLabel(traeger);

  const anthropic = new Anthropic({ apiKey });

  send({ type: "status", message: "Analysiere Ihre Angaben..." });

  const systemPrompt = `Du bist der Widerspruchs-Assistent von BescheidRecht.
Du hilfst Nutzern dabei, Widersprüche gegen Behördenbescheide zu formulieren.

DEINE AUFGABE (Schritt 1):
Analysiere die Bescheid-Informationen des Nutzers und stelle 2-3 gezielte Rückfragen,
die dir helfen, ein besseres und individuelleres Musterschreiben zu erstellen.

REGELN:
- Stelle maximal 3 Fragen
- Fragen kurz und klar (keine Romane)
- Deutsch, freundlich, verständlich
- Keine Rechtsberatung
- Gib am Ende eine kurze Einschätzung (1-2 Sätze) was du bereits erkannt hast

FORMAT:
Schreibe die Fragen als nummerierte Liste. Danach eine Leerzeile und dann die Einschätzung.`;

  const userMessage = `Behörde: ${traegerLabel}
Situation: ${beschreibung}`;

  send({ type: "status", message: "KI denkt nach..." });

  try {
    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    send({ type: "start" });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        send({ type: "delta", text: chunk.delta.text });
      }
    }

    send({ type: "done", schritt: "analyse" });
  } catch (err) {
    send({ type: "error", message: err instanceof Error ? err.message : "KI-Analyse fehlgeschlagen" });
  }
  close();
}

// ---------------------------------------------------------------------------
// Schritt 2: Musterschreiben erstellen
// ---------------------------------------------------------------------------

async function handleErstelle(
  traeger: string,
  beschreibung: string,
  antworten: string,
  send: (data: object) => void,
  close: () => void
) {
  const apiKey = getAnthropicKey();
  if (!apiKey) {
    send({ type: "error", message: "KI nicht verfügbar. ANTHROPIC_API_KEY fehlt." });
    close();
    return;
  }

  const traegerLabel = getTraegerLabel(traeger);
  const anthropic = new Anthropic({ apiKey });

  send({ type: "status", message: "Erstelle Ihr persönliches Musterschreiben..." });

  const systemPrompt = `Du bist der Widerspruchs-Assistent von BescheidRecht.

DEINE AUFGABE (Schritt 2):
Erstelle ein vollständiges, professionelles Widerspruchsschreiben basierend auf den Angaben des Nutzers.

ANFORDERUNGEN:
- Briefkopf: Platzhalter in [eckigen Klammern] für persönliche Daten
- Anwaltlicher Stil: sachlich, präzise, höflich
- Bezug auf die genannten Probleme
- Vorsichtige Formulierungen ("es erscheinen Unstimmigkeiten...", "ich bitte um Prüfung...")
- KEINE Rechtsberatung, KEINE Drohungen
- KEIN Hinweis dass Text von KI erstellt wurde
- Am Ende: "Keine Rechtsberatung im Sinne des RDG. Dieser Entwurf muss vom Nutzer geprüft werden."

STRUKTUR:
1. Briefkopf (Absender, Empfänger, Datum, Betreff)
2. Widerspruchserklärung
3. Sachverhalt und Begründung
4. Bitte um Überprüfung
5. Grußformel + [Unterschrift]
6. Disclaimer`;

  const userMessage = `Behörde: ${traegerLabel}
Situation: ${beschreibung}
Antworten auf Rückfragen: ${antworten}`;

  send({ type: "start" });

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  let hasRDG = false;
  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      if (chunk.delta.text.includes("RDG")) hasRDG = true;
      send({ type: "delta", text: chunk.delta.text });
    }
  }

  if (!hasRDG) {
    send({
      type: "delta",
      text:
        "\n\n---\n⚠ WICHTIGER HINWEIS: Dieser Entwurf wurde von einer KI erstellt und stellt keine " +
        "Rechtsberatung im Sinne des Rechtsdienstleistungsgesetzes (RDG § 2) dar. Er ersetzt nicht die " +
        "Beratung durch einen zugelassenen Rechtsanwalt oder eine anerkannte Beratungsstelle " +
        "(z.B. VdK, Sozialverband). Vor dem Absenden bitte vollständig prüfen und eigene Angaben ergänzen.\n---",
    });
  }

  send({ type: "done", schritt: "erstelle" });
  close();
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { success } = await assistantLimiter.limit(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte warte kurz und versuche es erneut." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Daten." }, { status: 400 });
  }

  const { traeger, beschreibung, antworten, schritt } = body as {
    traeger: string;
    beschreibung: string;
    antworten?: string;
    schritt: "analyse" | "erstelle";
  };

  if (!traeger || !beschreibung) {
    return NextResponse.json({ error: "traeger und beschreibung sind erforderlich." }, { status: 400 });
  }

  const { stream, send, close } = createSSEStream();

  // Non-blocking execution
  (async () => {
    try {
      if (schritt === "erstelle" && antworten) {
        await handleErstelle(traeger, beschreibung, antworten, send, close);
      } else {
        await handleAnalyse(traeger, beschreibung, send, close);
      }
    } catch (err: unknown) {
      send({ type: "error", message: err instanceof Error ? err.message : "Unbekannter Fehler." });
      close();
    }
  })();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
