import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du bist ein erfahrener Rechtsanwalt für Verwaltungsrecht." },
        { role: "user", content: `Analysiere folgenden Bescheid: ${text}` }
      ],
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (err: any) {
    console.error("Fehler bei der Analyse:", err);
    return NextResponse.json({ error: "Analyse fehlgeschlagen" }, { status: 500 });
  }
}
