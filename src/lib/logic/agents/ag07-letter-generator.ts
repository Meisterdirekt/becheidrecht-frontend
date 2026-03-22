/**
 * AG07 — Musterschreiben-Generator (GPT-4o primär, Claude Fallback)
 * Erstellt professionelle Widerspruchsschreiben.
 * Nutzt AG02-Fehler, AG03-Kritik und AG04-Urteile wenn vorhanden.
 * GPT-4o ist schneller und stabiler als Claude bei Overloads.
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type MusterschreibenResult,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import {
  modelForStufe,
  extractTokenUsage,
  getAnthropicKey,
  getOpenAIKey,
  createAnthropicClient,
  mergeTokenUsage,
  extractJsonSafe,
} from "./utils";
import { TOOL_GET_WEISUNGEN, executeGetWeisungen } from "./tools/weisungen";
import { processToolBlocks } from "./tools/process-tool-results";

// ---------------------------------------------------------------------------
// RDG-Disclaimer (wird immer ans Ende angehängt)
// ---------------------------------------------------------------------------

const RDG_DISCLAIMER =
  "\n\n---\n⚠ WICHTIGER HINWEIS: Dieser Entwurf wurde von einer KI erstellt und stellt keine Rechtsberatung " +
  "im Sinne des Rechtsdienstleistungsgesetzes (RDG § 2) dar. Er ersetzt nicht die Beratung durch einen " +
  "zugelassenen Rechtsanwalt oder eine anerkannte Beratungsstelle (z.B. VdK, Sozialverband). " +
  "Vor dem Absenden bitte vollständig prüfen und eigene Angaben ergänzen.\n---";

// ---------------------------------------------------------------------------
// Vorab-Kontext aus Pipeline zusammenbauen (shared zwischen GPT-4o + Claude)
// ---------------------------------------------------------------------------

function buildVorabInfo(ctx: AgentContext): string {
  let vorabInfo = "";

  if (ctx.userContext) {
    vorabInfo += `\n\nHINTERGRUND VOM NUTZER:\n${ctx.userContext}`;
  }

  if (ctx.pipeline.triage) {
    const t = ctx.pipeline.triage;
    vorabInfo += `\nKLASSIFIZIERUNG: ${t.behoerde} | ${t.rechtsgebiet} | ${t.untergebiet}`;
    if (t.frist_datum) vorabInfo += `\nFrist: ${t.frist_datum} (${t.frist_tage ?? "?"} Tage)`;
    if (t.bg_nummer) vorabInfo += `\nAZ/BG-Nr: ${t.bg_nummer}`;
  }

  const ag02HatFehler = ctx.pipeline.analyse &&
    (ctx.pipeline.analyse.fehler.length > 0 || ctx.pipeline.analyse.auffaelligkeiten.length > 0);

  if (ctx.pipeline.analyse) {
    const a = ctx.pipeline.analyse;
    if (a.fehler.length > 0) {
      // Nur Fehlerkatalog-Treffer an AG07 weiterleiten die keine Template-Platzhalter enthalten
      const relevanteFehler = a.fehler.filter(f => {
        const text = (f.musterschreiben_hinweis ?? f.beschreibung).toLowerCase();
        // Platzhalter = generisches Template, nicht fallspezifisch
        if (/\[.*(?:einfügen|einf[uü]gen|angeben|nennen).*\]/.test(text)) return false;
        // Ultra-generische Floskeln
        if (/ich bitte um (?:überprüfung|prüfung|erneute)/.test(text) && text.length < 200) return false;
        if (/entspricht nicht den vorgaben/.test(text) && text.length < 200) return false;
        return true;
      });
      if (relevanteFehler.length > 0) {
        vorabInfo += `\n\nFEHLERKATALOG-TREFFER (${relevanteFehler.length}):\n`;
        vorabInfo += relevanteFehler
          .map((f) => `- [${f.severity}] ${f.titel}: ${f.beschreibung}`)
          .join("\n");
      }
    }
    if (a.auffaelligkeiten.length > 0) {
      vorabInfo += `\n\nAUFFÄLLIGKEITEN:\n${a.auffaelligkeiten.map((a) => `- ${a}`).join("\n")}`;
    }
  }

  if (!ag02HatFehler) {
    vorabInfo += `\n\nWICHTIG — EIGENANALYSE ERFORDERLICH:
AG02 hat KEINE Fehler im Bescheid gefunden. Das bedeutet NICHT, dass der Bescheid fehlerfrei ist.
Du MUSST den Bescheid-Text selbst gründlich auf folgende typische Fehler prüfen:
1. Fehlende oder unzureichende Begründung (§ 35 SGB X)
2. Fehlende Rechtsbehelfsbelehrung (§ 36 SGB X) — macht Widerspruchsfrist 1 Jahr
3. Rechenfehler bei Leistungsberechnung (Regelbedarf, KdU, Mehrbedarf)
4. Fehlende Anhörung vor belastendem Verwaltungsakt (§ 24 SGB X)
5. Falsche Rechtsgrundlage oder veraltete Normen
6. Ermessensfehler (§ 39 SGB I)
7. Formfehler (fehlende Unterschrift, fehlendes Datum)
Jeden gefundenen Fehler als eigenen Begründungsabsatz im Brief verwenden.`;
  }

  if (ctx.pipeline.kritik) {
    const k = ctx.pipeline.kritik;
    vorabInfo += `\n\nKRITIK (AG03):\nErfolgschance: ${k.erfolgschance_prozent}%`;
    if (k.gegenargumente.length > 0) {
      vorabInfo += `\nBehörden-Gegenargumente (im Brief proaktiv entkräften): ${k.gegenargumente.join("; ")}`;
    }
    if (k.schwachstellen.length > 0) {
      vorabInfo += `\nSchwachstellen (im Brief absichern oder Nutzer darauf hinweisen): ${k.schwachstellen.join("; ")}`;
    }
  }

  if (ctx.pipeline.recherche) {
    const r = ctx.pipeline.recherche;
    if (r.urteile.length > 0) {
      vorabInfo += `\n\nRECHERCHE (AG04) — ${r.urteile.length} Urteile:\n`;
      vorabInfo += r.urteile
        .map((u) => `- ${u.gericht} ${u.aktenzeichen} (${u.datum}): ${u.leitsatz}`)
        .join("\n");
    }
  }

  if (ctx.pipeline.praezedenz) {
    const p = ctx.pipeline.praezedenz;
    if (p.aehnliche_faelle > 0) {
      vorabInfo += `\n\nPRÄZEDENZFÄLLE (AG14) — ${p.aehnliche_faelle} ähnliche Fälle:`;
      if (p.erfolgsquote_prozent !== null) {
        vorabInfo += `\nHistorische Erfolgsquote: ${p.erfolgsquote_prozent}%`;
      }
      if (p.haeufigste_fehler.length > 0) {
        vorabInfo += `\nHäufigste Fehler in ähnlichen Fällen: ${p.haeufigste_fehler.join(", ")}`;
        vorabInfo += `\n→ Priorisiere diese Fehler in der Begründung wenn sie auch hier vorhanden sind.`;
      }
    }
  }

  return vorabInfo;
}

// ---------------------------------------------------------------------------
// GPT-4o Engine (primär — schneller, kein 529-Problem)
// ---------------------------------------------------------------------------

async function executeWithOpenAI(
  ctx: AgentContext,
  vorabInfo: string,
): Promise<AgentResult<MusterschreibenResult>> {
  const start = Date.now();
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error("OpenAI-Key fehlt");

  const openai = new OpenAI({ apiKey, defaultHeaders: { "X-No-Store": "true" } });
  const systemPrompt = getSystemPrompt("AG07");

  // Weisungen laden wenn SGB II / SGB III
  let weisungenInfo = "";
  if (ctx.pipeline.triage) {
    const rg = ctx.pipeline.triage.rechtsgebiet?.toLowerCase() ?? "";
    if (rg.includes("sgb ii") || rg.includes("sgb iii") || rg.includes("bürgergeld") || rg.includes("grundsicherungsgeld")) {
      const traeger = rg.includes("sgb iii") ? "arbeitsagentur" : "jobcenter";
      weisungenInfo = await executeGetWeisungen(traeger);
    }
  }

  const userContent = `Erstelle ein Musterschreiben für diesen Bescheid:${vorabInfo}${
    weisungenInfo ? `\n\nWEISUNGEN:\n${weisungenInfo}` : ""
  }\n\nBESCHEID-TEXT:\n${ctx.documentText}

AUSGABEFORMAT (PFLICHT — antworte NUR mit diesem JSON, KEIN anderer Text):
{
  "rubrum": "[Vor- und Nachname]\\n[Straße Hausnummer]\\n[PLZ Ort]\\n\\n[Behörde, vollständiger Name]\\n[Straße Hausnummer]\\n[PLZ Ort]\\n\\n[Ort], den [TT.MM.JJJJ]\\n\\nAktenzeichen: [AZ/BG-Nr. aus Bescheid]\\nBetreff: Widerspruch gegen den Bescheid vom [Datum des Bescheids]",
  "sachverhalt_und_begruendung": "Gegen den Bescheid vom [Datum] erhebe ich hiermit fristgerecht Widerspruch.\\n\\n[Sachverhalt: Was hat die Behörde entschieden? Neutral, 2-4 Sätze.]\\n\\n[Begründungsabsatz 1: 1 Fehler mit § und Gesetz]\\n\\n[Begründungsabsatz 2: nächster Fehler mit § und Gesetz]\\n\\n[Weitere Absätze je nach Fehleranzahl]",
  "forderung": "Ich fordere Sie auf, den Bescheid vom [Datum] aufzuheben und [konkrete Maßnahme, z.B. 'die Leistung in Höhe von [X] € zu gewähren'].",
  "schluss": "Ich bitte um schriftliche Eingangsbestätigung dieses Widerspruchs innerhalb von 2 Wochen.\\n\\nMit freundlichen Grüßen\\n\\n[Unterschrift]\\n[Vor- und Nachname]",
  "auffaelligkeiten": ["Fehler 1", "Fehler 2", ...]
}

WICHTIG zum rubrum:
- Der Briefkopf MUSS wie ein echter Brief formatiert sein — Absender oben, Empfänger darunter, dann Ort/Datum, dann Aktenzeichen und Betreff
- Wenn Behördenname/Adresse/AZ/Datum aus dem Bescheid bekannt sind: einsetzen. Sonst [Platzhalter] verwenden
- Persönliche Daten des Absenders IMMER als [Platzhalter] belassen

ABSOLUT VERBOTEN im Brief-Text:
- KEINE Hinweise, Disclaimer oder Warnungen im Brief (kein '⚠', kein 'HINWEIS', kein 'KI-erstellt', kein 'Rechtsberatung')
- KEIN Meta-Text über den Brief selbst
- Der Brief muss aussehen wie von einem Anwalt geschrieben — rein sachlich, professionell
- "schluss" MUSS mit "Mit freundlichen Grüßen" + [Unterschrift] + [Name] ENDEN — NICHTS danach`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 6144,
    temperature: 0.3,
  });

  const rawText = response.choices[0]?.message?.content ?? "";
  const tokens = {
    input_tokens: response.usage?.prompt_tokens ?? 0,
    output_tokens: response.usage?.completion_tokens ?? 0,
    cache_read_tokens: 0,
    cache_creation_tokens: 0,
  };

  // JSON-Extraktion
  const parsed = extractJsonSafe<{
    rubrum?: string;
    sachverhalt_und_begruendung?: string;
    forderung?: string;
    schluss?: string;
    auffaelligkeiten?: string[];
  }>(rawText, {});

  let musterschreiben = "";
  let auffaelligkeiten: string[] = [];
  let forderung = "";

  // GPT-4o-generierte Disclaimer/Hinweise aus allen Feldern entfernen
  function stripDisclaimer(text: string): string {
    return text
      .replace(/─{5,}[\s\S]*?(?:Rechtsberatung|Rechtsanwalt|Beratungsstelle|BescheidRecht)[\s\S]*?─{5,}/gi, "")
      .replace(/⚠️?\s*(?:HINWEIS|WICHTIGER HINWEIS|Hinweis)[:\s][\s\S]*?(?:Beratungsstelle|Rechtsanwalt|absenden)[\s\S]*?(?:\n\n|\n─|$)/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  if (parsed.rubrum && parsed.sachverhalt_und_begruendung) {
    const cleanRubrum = stripDisclaimer(parsed.rubrum);
    const cleanBody = stripDisclaimer(parsed.sachverhalt_und_begruendung);
    const cleanSchluss = stripDisclaimer(
      parsed.schluss ?? "Ich bitte um schriftliche Eingangsbestätigung dieses Widerspruchs innerhalb von 2 Wochen.\n\nMit freundlichen Grüßen\n\n[Unterschrift]\n[Vor- und Nachname]"
    );
    const cleanForderung = parsed.forderung ? stripDisclaimer(parsed.forderung) : "";

    const forderungAbschnitt = cleanForderung
      ? `\n\n${cleanForderung}`
      : "";

    // Brief: Rubrum → Sachverhalt+Begründung → Forderung → Schluss (mit Unterschrift) → Disclaimer
    musterschreiben = `${cleanRubrum}\n\n${cleanBody}${forderungAbschnitt}\n\n${cleanSchluss}${RDG_DISCLAIMER}`.trim();
    auffaelligkeiten = parsed.auffaelligkeiten ?? [];
    forderung = cleanForderung;
  } else {
    // Fallback: Rohtext bereinigen + Disclaimer anhängen
    musterschreiben = stripDisclaimer(rawText) + RDG_DISCLAIMER;
  }

  console.log(`[AG07] GPT-4o fertig: ${musterschreiben.length} Zeichen, ${auffaelligkeiten.length} Auffälligkeiten`);

  return {
    agentId: "AG07",
    success: musterschreiben.length > 0,
    data: { volltext: musterschreiben, auffaelligkeiten, forderung },
    tokens,
    durationMs: Date.now() - start,
  };
}

// ---------------------------------------------------------------------------
// Claude Engine (Fallback — wenn OpenAI-Key fehlt)
// ---------------------------------------------------------------------------

const TOOL_ERSTELLE_MUSTERSCHREIBEN: Anthropic.Tool = {
  name: "erstelle_musterschreiben",
  description:
    "Erstellt das finale Widerspruchsschreiben. Rufe dieses Tool auf, nachdem du alle " +
    "Auffälligkeiten analysiert hast.",
  input_schema: {
    type: "object" as const,
    properties: {
      rubrum: { type: "string", description: "Briefkopf: Absender, Empfänger, Ort/Datum, Betreff" },
      chronologie: { type: "string", description: "Einleitung + Sachverhalt + Begründung" },
      forderung: { type: "string", description: "Konkreter Forderungssatz (Pflicht!)" },
      schluss: { type: "string", description: "Abschluss: Eingangsbestätigung, Grußformel, [Unterschrift]" },
      auffaelligkeiten: { type: "array", items: { type: "string" }, description: "Liste der identifizierten Auffälligkeiten" },
    },
    required: ["rubrum", "chronologie", "forderung", "schluss", "auffaelligkeiten"],
  },
};

async function executeWithClaude(
  ctx: AgentContext,
  vorabInfo: string,
): Promise<AgentResult<MusterschreibenResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();
  if (!apiKey) throw new Error("Kein Anthropic API-Key");

  const anthropic = createAnthropicClient(apiKey);
  const model = modelForStufe(ctx.routingStufe);
  let totalTokens = emptyTokenUsage();

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `Erstelle ein Musterschreiben für diesen Bescheid:${vorabInfo}\n\nBESCHEID-TEXT:\n${ctx.documentText}` },
  ];

  let musterschreiben = "";
  let auffaelligkeiten: string[] = [];
  let forderung = "";

  const useExtendedThinking = ctx.routingStufe === "NOTFALL";
  const TOOLS: Anthropic.Tool[] = [TOOL_ERSTELLE_MUSTERSCHREIBEN, TOOL_GET_WEISUNGEN];

  for (let i = 0; i < 3; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createParams: any = {
      model,
      max_tokens: useExtendedThinking ? 16000 : 4096,
      system: getSystemPrompt("AG07"),
      tools: TOOLS,
      messages,
    };
    if (useExtendedThinking) {
      createParams.thinking = { type: "enabled", budget_tokens: 10000 };
      if (model.includes("3-7") || model.includes("3-5")) {
        createParams.betas = ["interleaved-thinking-2025-05-14"];
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: Anthropic.Message = await anthropic.messages.create(createParams as any);
    totalTokens = mergeTokenUsage(totalTokens, extractTokenUsage(response));
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      if (!musterschreiben && i < 3) {
        messages.push({
          role: "user",
          content: "Du hast den Brief als Fließtext geschrieben, aber das Tool 'erstelle_musterschreiben' nicht aufgerufen. Rufe es JETZT auf.",
        });
        continue;
      }
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const toolResults = await processToolBlocks(response.content, {
      erstelle_musterschreiben: {
        execute: (input) => {
          const forderungAbschnitt = (input.forderung as string) ? `\n\n${input.forderung as string}` : "";
          musterschreiben = `${input.rubrum as string}\n\n${input.chronologie as string}${forderungAbschnitt}\n\n${input.schluss as string}${RDG_DISCLAIMER}`.trim();
          auffaelligkeiten = input.auffaelligkeiten as string[];
          forderung = input.forderung as string;
          return JSON.stringify({ status: "erstellt", zeichen: musterschreiben.length });
        },
      },
      get_weisungen: { execute: (input) => executeGetWeisungen(input.traeger as string) },
    });
    messages.push({ role: "user", content: toolResults });
  }

  // Fallback: Text-Block wenn kein Tool-Call
  if (!musterschreiben) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant" && Array.isArray(lastMsg.content)) {
      const textBlocks = (lastMsg.content as Anthropic.ContentBlock[]).filter((b) => b.type === "text");
      if (textBlocks.length > 0 && textBlocks[0].type === "text") {
        musterschreiben = textBlocks[0].text;
      }
    }
  }

  console.log(`[AG07] Claude fertig: ${musterschreiben.length} Zeichen, ${auffaelligkeiten.length} Auffälligkeiten`);

  return {
    agentId: "AG07",
    success: musterschreiben.length > 0,
    data: { volltext: musterschreiben, auffaelligkeiten, forderung },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

// ---------------------------------------------------------------------------
// Haupteinstiegspunkt: GPT-4o → Claude Fallback
// ---------------------------------------------------------------------------

async function execute(ctx: AgentContext): Promise<AgentResult<MusterschreibenResult>> {
  const start = Date.now();
  const vorabInfo = buildVorabInfo(ctx);

  const fallback: MusterschreibenResult = { volltext: "", auffaelligkeiten: [], forderung: "" };

  // Primär: GPT-4o (schneller, kein 529-Problem)
  const openaiKey = getOpenAIKey();
  if (openaiKey) {
    try {
      return await executeWithOpenAI(ctx, vorabInfo);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[AG07] GPT-4o fehlgeschlagen (${msg.slice(0, 80)}), Fallback auf Claude`);
    }
  }

  // Fallback: Claude
  const anthropicKey = getAnthropicKey();
  if (anthropicKey) {
    try {
      return await executeWithClaude(ctx, vorabInfo);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[AG07] Claude auch fehlgeschlagen: ${msg}`);
    }
  }

  return {
    agentId: "AG07",
    success: false,
    data: fallback,
    tokens: emptyTokenUsage(),
    durationMs: Date.now() - start,
    error: "Kein API-Key (weder OpenAI noch Anthropic)",
  };
}

export const ag07LetterGenerator: Agent<MusterschreibenResult> = {
  id: "AG07",
  name: "Musterschreiben-Generator",
  model: modelForStufe,
  execute,
};
