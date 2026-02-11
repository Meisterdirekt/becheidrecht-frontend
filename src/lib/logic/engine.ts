import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export async function runForensicAnalysis(documentText: string) {
  try {
    const vaultPath = (file: string) => path.join(process.cwd(), 'vault', file);
    const omegaPrompt = fs.readFileSync(vaultPath('omega_prompt.txt'), 'utf8');
    const errorCatalog = fs.readFileSync(vaultPath('error_catalog.json'), 'utf8');
    const envContent = fs.readFileSync(vaultPath('keys.env'), 'utf8');
    const openAiKey = envContent.match(/sk-[a-zA-Z0-9_-]+/)?.[0];

    if (!openAiKey) return { musterschreiben: "Key fehlt." };
    const openai = new OpenAI({ apiKey: openAiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${omegaPrompt}

Katalog bekannter Fehler (als Kontext, nicht kopieren):
${errorCatalog}

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
    "schluss": "Ein eigener Absatz mit einer höflichen, aber bestimmten Bitte um erneute Prüfung des Bescheids, um Überprüfung und ggf. Anpassung der Berechnung im Rahmen der gesetzlichen Vorgaben sowie um Übersendung einer nachvollziehbaren Aufstellung der zugrunde gelegten Werte. Verwende eine klare, behördentaugliche Sprache (z. B. \"Ich bitte um\", \"Ich ersuche um\", \"Ich gehe davon aus, dass\"). Füge danach eine Leerzeile ein und DANACH ZWINGEND die Grußformel und die Unterschrift als letzte Zeilen:\\n\\nMit freundlichen Grüßen\\n[Unterschrift]. Es dürfen nach diesen Zeilen KEINE weiteren Sätze mehr folgen."
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
        musterschreiben: typeof parsed.musterschreiben === 'object' 
          ? `${parsed.musterschreiben.rubrum}\n\n${parsed.musterschreiben.chronologie}\n\n${parsed.musterschreiben.schluss}`
          : parsed.musterschreiben
      };
    } catch (e) {
      // Fallback, falls die KI kein JSON geschickt hat
      return { 
        musterschreiben: rawContent, 
        fehler: ["KI-Antwort konnte nicht als JSON verarbeitet werden."] 
      };
    }
  } catch (error: any) {
    return { musterschreiben: "Engine-Fehler: " + error.message, fehler: [] };
  }
}
