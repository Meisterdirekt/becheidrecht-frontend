import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { image, language } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Wir brauchen 4o für Bildanalyse und Jura-Logik
      messages: [
        {
          role: "system",
          content: `⚖️ DER JURA-SINGULARITÄTS-PROMPT: OMEGA-INSTANZ
          Du bist die "Lex Animata" – personifizierte Rechtswissenschaft... [HIER DEIN KOMPLETTER PROMPT INKL. MEINER ERWEITERUNG]
          WICHTIG: Erstelle den Widerspruch auf Deutsch, aber gib die Zusammenfassung auf ${language} aus.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analysiere diesen Bescheid und erstelle einen rechtssicheren Widerspruch." },
            { type: "image_url", image_url: { url: image } }
          ],
        },
      ],
      max_tokens: 2000,
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "KI-Analyse fehlgeschlagen" }, { status: 500 });
  }
}
