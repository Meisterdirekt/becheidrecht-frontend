import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const FALLBACK_OMEGA_PROMPT = 'Du bist die KI-Kerninstanz von BescheidRecht. Analysiere den Bescheid sachlich, erkenne Behördenart und Rechtsgebiet, nenne mögliche Unstimmigkeiten nur als Hinweise, erstelle ein Musterschreiben (Widerspruch/Anfrage). Keine Rechtsberatung.';
const FALLBACK_ERROR_CATALOG = '[]';

function getOpenAIKey(): string | null {
  try {
    const vaultPath = (file: string) => path.join(process.cwd(), 'vault', file);
    const envContent = fs.readFileSync(vaultPath('keys.env'), 'utf8');
    // Explizit nach OPENAI_API_KEY= suchen (nicht einfach erstes sk-... — das könnte Anthropic-Key sein)
    const match = envContent.match(/OPENAI_API_KEY\s*=\s*["']?([^\s"'\n]+)/);
    if (match?.[1]) return match[1];
  } catch {
    // Vault nicht vorhanden (z. B. auf Vercel)
  }
  return process.env.OPENAI_API_KEY || null;
}

function loadPromptAndCatalog(): { omegaPrompt: string; errorCatalog: string } {
  try {
    const vaultPath = (file: string) => path.join(process.cwd(), 'vault', file);
    const omegaPrompt = fs.readFileSync(vaultPath('omega_prompt.txt'), 'utf8');
    const errorCatalog = fs.readFileSync(vaultPath('error_catalog.json'), 'utf8');
    return { omegaPrompt, errorCatalog };
  } catch {
    return { omegaPrompt: FALLBACK_OMEGA_PROMPT, errorCatalog: FALLBACK_ERROR_CATALOG };
  }
}

/** Lädt Behördenfehler-Logik (Weisungsabweichungen) aus content/ – für KI-Kontext. */
function loadBehoerdenfehlerLogik(): string {
  try {
    const p = path.join(process.cwd(), 'content', 'behoerdenfehler_logik.json');
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '[]';
  }
}

/** Lädt Fachliche Weisungen BA (Weisungsnummern, Gültigkeit, Themen) aus content/ – für KI-Kontext. */
function loadWeisungenBA(): string {
  try {
    const p = path.join(process.cwd(), 'content', 'weisungen_2025_2026.json');
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '{}';
  }
}

/** Entfernt die Prompt-Anweisung am Ende des Musterschreibens (darf nicht im Schreiben stehen). */
function stripInstructionFromMusterschreiben(text: string): string {
  if (!text || typeof text !== 'string') return text;
  const out = text.trim();
  // Satz "Es dürfen nach diesen Zeilen KEINE weiteren Sätze mehr folgen." (mit/ohne Punkt davor) am Ende entfernen
  const re = /\s*\.?\s*Es dürfen nach diesen Zeilen KEINE weiteren Sätze mehr folgen\.?\s*$/i;
  return out.replace(re, '').trim();
}

export async function runForensicAnalysis(documentText: string) {
  try {
    const openAiKey = getOpenAIKey();
    if (!openAiKey) return { musterschreiben: "OpenAI-Key fehlt. Bitte OPENAI_API_KEY in den Umgebungsvariablen (z. B. Vercel) setzen.", fehler: [] };
    const openai = new OpenAI({ apiKey: openAiKey });
    const { omegaPrompt, errorCatalog } = loadPromptAndCatalog();
    const behoerdenLogik = loadBehoerdenfehlerLogik();
    const weisungenBA = loadWeisungenBA();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${omegaPrompt}

Katalog bekannter Fehler (als Kontext, nicht kopieren):
${errorCatalog}

Fachliche Weisungen BA (Nummer, Gültigkeit, Thema – für Jobcenter/SGB II, SGB III; prüfe, ob Bescheid davon abweicht):
${weisungenBA}

Behördenfehler-Logik / Weisungsabweichungen (alle Träger; prüfe, ob Bescheid davon abweicht):
${behoerdenLogik}

ANWEISUNG FÜR DIE AUSGABE (WICHTIG – KEINE RECHTSBERATUNG):
- Analysiere ausschließlich den Inhalt des Bescheids.
- Erkenne zunächst, um welche Art von Bescheid es sich handelt (z. B. Jobcenter/SGB II, Krankenkasse/SGB V, Rentenversicherung/SGB VI o. Ä.) und richte Wortwahl und Bezugnahmen auf Normen daran aus.
- Beschreibe mögliche Auffälligkeiten und typische Fehler nur als technische, unverbindliche Hinweise.
- Triff KEINE rechtlich verbindlichen Bewertungen und gib KEINE individuellen Handlungsempfehlungen.
- Vermeide Formulierungen wie „dies stellt einen materiellen Fehler dar“, „verstößt gegen § …“, „rechtswidrig“, „rechtskonform“, „fehlerhafte Vermögensanrechnung“, „ich fordere Sie auf“, „ich sehe mich gezwungen, rechtliche Schritte einzuleiten“ oder vergleichbare rechtliche Wertungen und Drohungen.
- Verwende stattdessen vorsichtige Formulierungen wie „es könnte sein, dass …“, „es erscheinen Unstimmigkeiten bei …“, „ich bitte um Überprüfung …“, „unter Berücksichtigung der gesetzlichen Vorgaben“.
- Formuliere sprachlich klar, strukturiert und fachlich präzise (behörden- bzw. anwaltlicher Stil), jedoch höflich und ohne Drohungen.
- Du darfst Rechtsnormen (z. B. §-Angaben) und Begriffe aus dem jeweiligen Rechtsgebiet benennen, soweit sie im Bescheid oder im Fehlerkatalog vorkommen, aber du sollst keine endgültige Aussage wie „rechtswidrig“ oder „Rechtsverstoß“ treffen.
- Mache insgesamt deutlich, dass es sich um eine rechtlich unverbindliche Einschätzung handelt, die eine Rechtsberatung NICHT ersetzt.
- Erstelle ein Musterschreiben als Formulierungsvorschlag, nicht als rechtsverbindliche Empfehlung.
- Erwähne im Musterschreiben an keiner Stelle, dass der Text von einer KI, einem Tool oder einer automatisierten Vorprüfung stammt. Keine Sätze wie „Diese Einwendungen stützen sich auf eine automatisierte Vorprüfung …“ oder sinngleiche Formulierungen.

DU MUSST IMMER GENAU DIESES JSON-SCHEMA LIEFERN (ohne zusätzlichen Text, ohne Markdown, ohne Erläuterungen). Versuche, soweit möglich, Bescheiddatum, betroffenen Zeitraum und BG-Nummer aus dem Bescheidstext herzuleiten und die Platzhalter damit zu füllen. Wenn dir dies nicht sicher möglich ist, lasse die Platzhalter in eckigen Klammern stehen. Das Feld "zuordnung" ist PFLICHT: Ordne jedes Schreiben genau einer Behördenart und einem Rechtsgebiet zu.
{
  "zuordnung": {
    "behoerde": "Kurzbezeichnung der Behörde (z. B. Jobcenter, Krankenkasse, Pflegekasse, Sozialamt, DRV, Arbeitsagentur, Unfallversicherung, Versorgungsamt)",
    "rechtsgebiet": "Zuständiges Gesetz (z. B. SGB II, SGB III, SGB V, SGB VI, SGB VII, SGB IX, SGB XI, SGB XII, Versorgungsrecht/GdB)",
    "untergebiet": "Konkreter Leistungsbereich (z. B. Bürgergeld/KdU, Krankengeld, Pflegegrad, Grundsicherung, Erwerbsminderungsrente, ALG I)"
  },
  "analyse": {
    "materiell": [
      "Konkrete Beschreibung einer möglichen Unstimmigkeit oder eines typischen Fehlers in ganzen Sätzen, klar als Hinweis formuliert (z. B. \"Es könnte sein, dass ...\").",
      "Weiterer Hinweis auf eine mögliche Unstimmigkeit ..."
    ]
  },
  "musterschreiben": {
    "rubrum": "[Vorname Nachname]\\n[Straße Hausnummer]\\n[PLZ Ort]\\n\\nAn:\\nJobcenter [Bezeichnung]\\n[Anschrift]\\n[PLZ Ort]\\n\\n[Ort], den [Datum]\\n\\nBetreff: Widerspruch gegen den Bescheid vom [Bescheiddatum], BG-Nr.: [Bedarfsgemeinschaftsnummer]",
    "chronologie": "Ein einleitender Absatz, der den Sachverhalt geordnet darstellt (Bescheiddatum, betroffener Zeitraum, betroffene Leistungsart) und ausdrücklich enthält, dass fristgerecht Widerspruch gegen den Bescheid eingelegt wird (z. B. \"hiermit lege ich fristgerecht Widerspruch gegen den Bescheid vom ... ein\"). Danach folgen 1–2 weitere Absätze, in denen die wesentlichen, von der KI erkannten Auffälligkeiten und Unstimmigkeiten in einem präzisen, sachlich-juristischen Stil beschrieben werden (z. B. Bezug auf Berechnungsgrundlagen, Angemessenheit von Kosten, Bezug zu im Bescheid genannten Normen). Richte dich dabei nach dem Thema des Bescheids: bei Jobcenter-Bescheiden z. B. Fokus auf KdU und § 22 SGB II, bei Krankenkassen-Bescheiden z. B. auf Leistungsansprüche nach SGB V usw. Verwende vorsichtige Formulierungen (\"es könnte\", \"es erscheint\"), keine endgültigen rechtlichen Bewertungen wie \"rechtswidrig\" oder \"rechtskonform\". Achte darauf, dass zwischen diesen Absätzen jeweils eine Leerzeile eingefügt wird, damit der Text optisch in sinnvolle Blöcke gegliedert ist.",
    "schluss": "Ein eigener Absatz mit einer höflichen, aber bestimmten Bitte um erneute Prüfung des Bescheids, um Überprüfung und ggf. Anpassung der Berechnung im Rahmen der gesetzlichen Vorgaben sowie um Übersendung einer nachvollziehbaren Aufstellung der zugrunde gelegten Werte. Verwende eine klare, behördentaugliche Sprache (z. B. \"Ich bitte um\", \"Ich ersuche um\", \"Ich gehe davon aus, dass\"). Füge danach eine Leerzeile ein und danach NUR die Grußformel und [Unterschrift] – keine weiteren Sätze oder Anweisungen nach der Unterschrift."
  }
}

Wenn du zu einzelnen Feldern keine inhaltlichen Angaben machen kannst, lasse das Feld NICHT weg, sondern gib einen sinnvollen Platzhalter-Text zurück (z. B. \"Keine spezifischen Auffälligkeiten identifiziert.\").

Füge KEINE weiteren Felder hinzu und schreibe KEINE erläuternden Texte außerhalb dieses JSON-Objekts.`
        },
        { role: "user", content: `Hier ist der Bescheid-Inhalt:\n\n${documentText}` }
      ],
      max_tokens: 3500,
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content || "{}";
    
    try {
      // Entferne eventuelle Markdown-Tags (```json)
      const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      const zuordnung = parsed.zuordnung;
      return {
        zuordnung: zuordnung ? {
          behoerde: zuordnung.behoerde || "–",
          rechtsgebiet: zuordnung.rechtsgebiet || "–",
          untergebiet: zuordnung.untergebiet || "–"
        } : undefined,
        fehler: parsed.analyse?.materiell || parsed.analyse?.typische_fehler || ["Analyse abgeschlossen"],
        musterschreiben: stripInstructionFromMusterschreiben(
          typeof parsed.musterschreiben === 'object'
            ? `${parsed.musterschreiben.rubrum}\n\n${parsed.musterschreiben.chronologie}\n\n${parsed.musterschreiben.schluss}`
            : parsed.musterschreiben
        )
      };
    } catch {
      // Fallback, falls die KI kein JSON geschickt hat
      return { 
        musterschreiben: rawContent, 
        fehler: ["KI-Antwort konnte nicht als JSON verarbeitet werden."] 
      };
    }
  } catch (error: unknown) {
    return { musterschreiben: "Engine-Fehler: " + (error instanceof Error ? error.message : String(error)), fehler: [] };
  }
}
