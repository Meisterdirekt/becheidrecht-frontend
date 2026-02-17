import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { TRAEGER_TO_PREFIX, getTraegerLabel, getSchreibentypLabel } from "@/lib/letter-generator";

export const runtime = "nodejs";
export const maxDuration = 60;

interface BehoerdenLogikItem {
  id: string;
  titel: string;
  beschreibung: string;
  rechtsbasis?: string[];
  musterschreiben_hinweis?: string;
  severity?: string;
}

async function getAuthenticatedUser(req: NextRequest): Promise<{ id: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) return null;
  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id };
}

async function getSubscriptionRemaining(userId: string): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return 0;
  const supabase = createClient(url, serviceKey);
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("analyses_remaining")
    .eq("user_id", userId)
    .single();
  if (error || !data) return 0;
  return data.analyses_remaining ?? 0;
}

function loadBehoerdenLogik(prefixes: string[]): BehoerdenLogikItem[] {
  try {
    const filePath = path.join(process.cwd(), "content", "behoerdenfehler_logik.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const arr = JSON.parse(raw) as BehoerdenLogikItem[];
    return arr.filter((item) => prefixes.some((p) => item.id.startsWith(p)));
  } catch {
    return [];
  }
}

const SYSTEM_PROMPT = `Du bist ein professionelles deutsches Behördenschreiben-Tool.
Erstelle einen strukturierten Schreiben-Entwurf als Vorlage.

PFLICHT-STRUKTUR:
1. Betreff mit Aktenzeichen
2. Bezug auf Bescheid vom [Datum]
3. Sachverhalt klar und sachlich
4. Rechtliche Grundlage (korrekte Paragraphen SGB I-XII, VwVfG)
5. Konkrete Forderung
6. Frist setzen (bei Widerspruch: 1 Monat ab Bescheiddatum)
7. Grußformel

TON: sachlich, bestimmt, professionell – keine Emotionen
WICHTIG: Kein Ersatz für Rechtsberatung (§ 2 RDG)
Aktenzeichen immer beim ersten Bezug nennen.
Niemals "rechtssicher" verwenden.

Antworte NUR mit dem fertigen Schreiben (Fließtext ab Anrede), ohne Einleitung oder Erklärung.`;

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet. Bitte zuerst anmelden." }, { status: 401 });
    }

    const remaining = await getSubscriptionRemaining(user.id);
    if (remaining <= 0) {
      return NextResponse.json(
        { error: "Keine Analysen mehr verfügbar. Bitte Abo oder Einzelanalyse erwerben." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      behoerde,
      schreibentyp,
      stichpunkte,
      aktenzeichen: aktenzeichenBody,
      bescheiddatum: bescheiddatumBody,
    } = body as {
      behoerde?: string;
      schreibentyp?: string;
      stichpunkte?: string;
      aktenzeichen?: string;
      bescheiddatum?: string;
    };

    if (!behoerde?.trim() || !schreibentyp?.trim() || typeof stichpunkte !== "string") {
      return NextResponse.json(
        { error: "Bitte Behörde, Schreibentyp und Stichpunkte angeben." },
        { status: 400 }
      );
    }
    const aktenzeichen = typeof aktenzeichenBody === "string" ? aktenzeichenBody.trim() : "";
    const bescheiddatum = typeof bescheiddatumBody === "string" ? bescheiddatumBody.trim() : "";
    if (aktenzeichen.length < 4) {
      return NextResponse.json(
        { error: "Bitte Aktenzeichen eingeben – steht oben auf Ihrem Bescheid." },
        { status: 400 }
      );
    }
    if (!bescheiddatum) {
      return NextResponse.json(
        { error: "Bitte Datum des Bescheids eingeben." },
        { status: 400 }
      );
    }
    const bescheiddatumDate = new Date(bescheiddatum);
    if (Number.isNaN(bescheiddatumDate.getTime())) {
      return NextResponse.json(
        { error: "Bitte gültiges Datum des Bescheids eingeben." },
        { status: 400 }
      );
    }

    const stichpunkteTrim = stichpunkte.trim();
    if (stichpunkteTrim.length < 20) {
      return NextResponse.json(
        { error: "Bitte mindestens 20 Zeichen zu Ihrer Situation eingeben." },
        { status: 400 }
      );
    }
    if (stichpunkteTrim.length > 500) {
      return NextResponse.json(
        { error: "Maximal 500 Zeichen erlaubt." },
        { status: 400 }
      );
    }

    const prefixes = TRAEGER_TO_PREFIX[behoerde];
    const kontextItems = prefixes ? loadBehoerdenLogik(prefixes) : [];
    const kontextText =
      kontextItems.length > 0
        ? kontextItems
          .slice(0, 15)
          .map(
            (i) =>
              `- ${i.titel}: ${i.beschreibung} (${(i.rechtsbasis || []).join(", ")}). ${i.musterschreiben_hinweis || ""}`
          )
          .join("\n")
        : "Allgemeine Verfahrensrechte SGB I, SGB X (Begründung, Rechtsbehelfsbelehrung, Fristen).";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Schreiben-Generierung ist derzeit nicht konfiguriert." },
        { status: 503 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const behoerdeLabel = getTraegerLabel(behoerde);
    const typLabel = getSchreibentypLabel(schreibentyp);

    const userMessage = `Behörde: ${behoerdeLabel}
Schreibentyp: ${typLabel}
Aktenzeichen: ${aktenzeichen}
Bescheiddatum: ${bescheiddatum}

Situation:
${stichpunkteTrim}

Kontext (Rechtsgrundlagen und typische Fehler für diese Behörde – zur Orientierung, nicht 1:1 übernehmen):
${kontextText}

Erstelle nun das fertige Schreiben gemäß der Systemanweisung.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const letter = textBlock && "text" in textBlock ? (textBlock.text as string).trim() : "";

    if (!letter) {
      return NextResponse.json(
        { error: "Schreiben konnte nicht erstellt werden. Bitte erneut versuchen." },
        { status: 500 }
      );
    }

    return NextResponse.json({ letter });
  } catch (e) {
    console.error("generate-letter error:", e);
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: message.includes("rate") ? "Zu viele Anfragen. Bitte kurz warten." : "Ein Fehler ist aufgetreten. Bitte erneut versuchen." },
      { status: 500 }
    );
  }
}
