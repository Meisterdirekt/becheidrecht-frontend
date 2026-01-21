import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "API Key fehlt" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const { text } = await req.json();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Rechtsanwalt Modus." },
        { role: "user", content: text }
      ],
    });
    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (e) {
    return NextResponse.json({ error: "Fehler bei der Analyse" }, { status: 500 });
  }
}
