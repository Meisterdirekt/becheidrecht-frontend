/**
 * AG01 — Orchestrator (Sonnet · IMMER)
 * Triage + Routing-Entscheidung: Behörde, Rechtsgebiet, RoutingStufe.
 * Nutzt `klassifiziere_bescheid` Tool. Bekommt detectUrgency() Pre-Filter als Input.
 *
 * Robustheit:
 * - Retry-Nudge wenn Modell Text statt Tool-Call liefert
 * - Text-Fallback-Extraktion wenn Tool nicht aufgerufen wird
 * - Haiku → Sonnet Escalation bei "Unbekannt"
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type TriageResult,
  type TokenUsage,
  emptyTokenUsage,
} from "./types";
import { getSystemPrompt } from "./prompts";
import { HAIKU_MODEL, SONNET_MODEL, extractTokenUsage, getAnthropicKey, createAnthropicClient, mergeTokenUsage } from "./utils";
import { SGB_SIGNAL_WORDS, SGB_TO_RECHTSGEBIET, RECHTSGEBIET_TRAEGER } from "../constants/rechtsgebiete";

const TOOL_KLASSIFIZIERE: Anthropic.Tool = {
  name: "klassifiziere_bescheid",
  description:
    "Klassifiziert den Bescheid: Behörde, Rechtsgebiet, Datum und Widerspruchsfrist. " +
    "Rufe dieses Tool ZUERST auf, sobald du den Bescheidtyp erkannt hast. " +
    "Bei rechtsgebietsübergreifenden Bescheiden: Hauptrechtsgebiet in 'rechtsgebiet', " +
    "weitere in 'weitere_rechtsgebiete' (z.B. Bürgergeld+Krankengeld → rechtsgebiet='SGB II', weitere=['SGB V']).",
  input_schema: {
    type: "object" as const,
    properties: {
      behoerde: {
        type: "string",
        description: "Kurzname der ausstellenden Behörde",
      },
      rechtsgebiet: {
        type: "string",
        description: "Hauptsächlich anwendbares Gesetz (z.B. 'SGB II', 'SGB V')",
      },
      weitere_rechtsgebiete: {
        type: "array",
        items: { type: "string" },
        description: "Weitere betroffene Rechtsgebiete (nur wenn Bescheid mehrere berührt). Leer lassen bei Einzel-Rechtsgebiet.",
      },
      untergebiet: {
        type: "string",
        description: "Konkreter Leistungsbereich",
      },
      bescheid_datum: {
        type: "string",
        description: "Datum des Bescheids (TT.MM.JJJJ)",
      },
      frist_datum: {
        type: "string",
        description: "Berechnetes Enddatum der Widerspruchsfrist (TT.MM.JJJJ)",
      },
      frist_tage: {
        type: "number",
        description: "Verbleibende Tage bis zum Fristende",
      },
      bg_nummer: {
        type: "string",
        description: "Bedarfsgemeinschaftsnummer oder Aktenzeichen",
      },
    },
    required: ["behoerde", "rechtsgebiet", "untergebiet"],
  },
};

interface KlassifizierungInput {
  behoerde: string;
  rechtsgebiet: string;
  weitere_rechtsgebiete?: string[];
  untergebiet: string;
  bescheid_datum?: string;
  frist_datum?: string;
  frist_tage?: number;
  bg_nummer?: string;
}

// ---------------------------------------------------------------------------
// Text-Fallback: Behörde + Rechtsgebiet aus Freitext extrahieren
// Greift wenn das Modell Text statt Tool-Call liefert.
// ---------------------------------------------------------------------------

function extractBehoerdeFromText(text: string): string {
  const lower = text.toLowerCase();
  // Bekannte Behörden-Patterns (häufigste zuerst)
  const patterns: [RegExp, string][] = [
    [/jobcenter\s+[\w\-äöüß]+/i, ""],
    [/agentur\s+für\s+arbeit\s+[\w\-äöüß]+/i, ""],
    [/deutsche\s+rentenversicherung\s*[\w\-äöüß]*/i, ""],
    [/familienkasse\s*[\w\-äöüß]*/i, ""],
    [/pflegekasse|pflegeversicherung/i, ""],
    [/krankenkasse|aok|barmer|techniker\s+krankenkasse|dak|bkk|ikk|knappschaft/i, ""],
    [/sozialamt|amt\s+für\s+soziales/i, ""],
    [/jugendamt/i, ""],
    [/bamf|bundesamt\s+für\s+migration/i, ""],
    [/versorgungsamt/i, ""],
    [/wohngeld(?:stelle|behörde|amt)/i, ""],
    [/elterngeldstelle/i, ""],
    [/unterhaltsvorschuss(?:kasse|stelle)/i, ""],
  ];
  for (const [pattern] of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  // Heuristik: "Behörde: XYZ" im Text
  const behoerdeMatch = text.match(/Beh[öo]rde[:\s]+([^\n,]{3,50})/i);
  if (behoerdeMatch) return behoerdeMatch[1].trim();
  // Prüfe auch die Signalwörter
  for (const [key, keywords] of Object.entries(SGB_SIGNAL_WORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        const rgCode = SGB_TO_RECHTSGEBIET[key];
        if (rgCode) {
          const traeger = RECHTSGEBIET_TRAEGER[rgCode];
          if (traeger) return traeger.charAt(0).toUpperCase() + traeger.slice(1);
        }
      }
    }
  }
  return "Unbekannt";
}

function extractRechtsgebietFromText(text: string): string {
  const lower = text.toLowerCase();
  // Direkte SGB-Nennung (z.B. "SGB II", "SGB V")
  const sgbMatch = text.match(/SGB\s+(I{1,3}|IV|V|VI{0,2}|VII|VIII|IX|X|XI{0,2}|XII)/i);
  if (sgbMatch) return `SGB ${sgbMatch[1].toUpperCase()}`;
  // Signalwort-basierte Erkennung
  for (const [sgbKey, keywords] of Object.entries(SGB_SIGNAL_WORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return sgbKey.replace("_", " ");
      }
    }
  }
  return "Unbekannt";
}

function extractUntergebietFromText(text: string): string {
  const lower = text.toLowerCase();
  // Häufige Untergebiete
  const patterns: [RegExp, string][] = [
    [/kosten\s+der\s+unterkunft|kdu/i, "Kosten der Unterkunft (KdU)"],
    [/regelbedarfsstufe|regelbedarf/i, "Regelbedarf"],
    [/bürgergeld|grundsicherungsgeld/i, "Bürgergeld"],
    [/krankengeld/i, "Krankengeld"],
    [/erwerbsminderungsrente|erwerbsminderung/i, "Erwerbsminderungsrente"],
    [/pflegegrad/i, "Pflegegrad"],
    [/kindergeld/i, "Kindergeld"],
    [/wohngeld/i, "Wohngeld"],
    [/sanktion|leistungsminderung/i, "Sanktion/Leistungsminderung"],
    [/aufhebung|rücknahme/i, "Aufhebung/Rücknahme"],
    [/erstattung|überzahlung/i, "Erstattung"],
  ];
  for (const [pattern, label] of patterns) {
    if (pattern.test(lower)) return label;
  }
  return "Allgemein";
}

/**
 * Führt die Klassifizierung mit einem bestimmten Modell durch.
 * Gibt TriageResult zurück oder null wenn Klassifizierung fehlschlägt.
 *
 * Robustheit-Maßnahmen:
 * 1. Retry-Nudge wenn das Modell Text statt Tool-Call liefert (wie AG02)
 * 2. Text-Fallback-Extraktion als letzter Ausweg
 * 3. max_tokens erhöht für lange Bescheide
 */
async function runClassification(
  ctx: AgentContext,
  anthropic: Anthropic,
  model: string,
): Promise<{ result: TriageResult; tokens: TokenUsage } | null> {
  let totalTokens = emptyTokenUsage();

  const urgencyHint = ctx.fristTage !== null
    ? `\n\nVORAB-INFORMATION: detectUrgency() hat ${ctx.fristTage} Tage bis Fristablauf erkannt → Routing-Stufe: ${ctx.routingStufe}`
    : `\n\nVORAB-INFORMATION: Keine Frist erkannt → Routing-Stufe: ${ctx.routingStufe}`;

  const nutzerKontext = ctx.userContext
    ? `\n\nHINTERGRUND VOM NUTZER:\n${ctx.userContext}`
    : "";

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Klassifiziere diesen Bescheid:${urgencyHint}${nutzerKontext}\n\n${ctx.documentText}`,
    },
  ];

  let toolCalled = false;
  let lastTextResponse = "";

  for (let i = 0; i < 3; i++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: getSystemPrompt("AG01"),
      tools: [TOOL_KLASSIFIZIERE],
      messages,
    });

    const tokens = extractTokenUsage(response);
    totalTokens = mergeTokenUsage(totalTokens, tokens);

    messages.push({ role: "assistant", content: response.content });

    // Letzte Textantwort merken für Fallback-Extraktion
    const textBlock = response.content.find((b) => b.type === "text");
    if (textBlock && textBlock.type === "text") {
      lastTextResponse = textBlock.text;
    }

    if (response.stop_reason === "end_turn") {
      // Modell hat Text geliefert statt Tool-Call → Retry-Nudge (wie AG02)
      if (!toolCalled && i < 2) {
        messages.push({
          role: "user",
          content:
            "Du hast klassifiziere_bescheid noch nicht aufgerufen. " +
            "Rufe JETZT das Tool klassifiziere_bescheid auf. " +
            "Pflichtfelder: behoerde (konkreter Name), rechtsgebiet (z.B. 'SGB II'), untergebiet. " +
            "Auch wenn du unsicher bist — gib deine beste Einschätzung ab.",
        });
        continue;
      }
      break;
    }
    if (response.stop_reason === "max_tokens") {
      // Token-Limit erreicht → Retry mit kürzerem Prompt-Nudge
      if (!toolCalled && i < 2) {
        messages.push({
          role: "user",
          content: "Rufe jetzt klassifiziere_bescheid auf. Pflicht: behoerde, rechtsgebiet, untergebiet.",
        });
        continue;
      }
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      if (block.name === "klassifiziere_bescheid") {
        toolCalled = true;
        const input = block.input as KlassifizierungInput;
        const result: TriageResult = {
          behoerde: input.behoerde,
          rechtsgebiet: input.rechtsgebiet,
          untergebiet: input.untergebiet,
          weitere_rechtsgebiete: input.weitere_rechtsgebiete?.length
            ? input.weitere_rechtsgebiete
            : undefined,
          bescheid_datum: input.bescheid_datum,
          frist_datum: input.frist_datum,
          frist_tage: input.frist_tage,
          bg_nummer: input.bg_nummer,
          routing_stufe: ctx.routingStufe,
        };

        if (input.frist_tage !== undefined && input.frist_tage <= 7 && ctx.routingStufe !== "NOTFALL") {
          result.routing_stufe = "NOTFALL";
        } else if (input.frist_tage !== undefined && input.frist_tage <= 14 && ctx.routingStufe === "NORMAL") {
          result.routing_stufe = "HOCH";
        }

        return { result, tokens: totalTokens };
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify({ error: "Unbekanntes Tool" }),
      });
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }

  // Text-Fallback: Wenn das Tool nie aufgerufen wurde,
  // versuche Behörde/Rechtsgebiet aus der Textantwort ODER dem Dokument zu extrahieren
  const sourceText = lastTextResponse || ctx.documentText;
  const fbBehoerde = extractBehoerdeFromText(sourceText);
  const fbRechtsgebiet = extractRechtsgebietFromText(sourceText);

  if (fbBehoerde !== "Unbekannt" || fbRechtsgebiet !== "Unbekannt") {
    console.warn(`[AG01] Text-Fallback aktiv: behoerde="${fbBehoerde}", rechtsgebiet="${fbRechtsgebiet}"`);
    return {
      result: {
        behoerde: fbBehoerde,
        rechtsgebiet: fbRechtsgebiet,
        untergebiet: extractUntergebietFromText(sourceText),
        routing_stufe: ctx.routingStufe,
      },
      tokens: totalTokens,
    };
  }

  return null;
}

async function execute(ctx: AgentContext): Promise<AgentResult<TriageResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  const fallback: TriageResult = {
    behoerde: "Unbekannt",
    rechtsgebiet: "Unbekannt",
    untergebiet: "Unbekannt",
    routing_stufe: ctx.routingStufe,
  };

  if (!apiKey) {
    return {
      agentId: "AG01",
      success: false,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "Kein API-Key",
    };
  }

  const anthropic = createAnthropicClient(apiKey);
  let totalTokens = emptyTokenUsage();

  // Versuch 1: Haiku (schnell, günstig)
  const haikuResult = await runClassification(ctx, anthropic, HAIKU_MODEL);
  if (haikuResult) {
    totalTokens = mergeTokenUsage(totalTokens, haikuResult.tokens);

    // Prüfe ob Haiku eine echte Klassifizierung geliefert hat
    const isUnbekannt =
      haikuResult.result.behoerde === "Unbekannt" ||
      haikuResult.result.rechtsgebiet === "Unbekannt";

    if (!isUnbekannt) {
      return {
        agentId: "AG01",
        success: true,
        data: haikuResult.result,
        tokens: totalTokens,
        durationMs: Date.now() - start,
      };
    }

    // Haiku hat "Unbekannt" geliefert → Fallback auf Sonnet
    console.warn("[AG01] Haiku-Klassifizierung gescheitert (Unbekannt) → Sonnet-Fallback");
  }

  // Versuch 2: Sonnet (stärker, teurer) — nur wenn Haiku versagt hat
  const sonnetResult = await runClassification(ctx, anthropic, SONNET_MODEL);
  if (sonnetResult) {
    totalTokens = mergeTokenUsage(totalTokens, sonnetResult.tokens);
    console.info("[AG01] Sonnet-Fallback erfolgreich:", sonnetResult.result.behoerde, sonnetResult.result.rechtsgebiet);
    return {
      agentId: "AG01",
      success: true,
      data: sonnetResult.result,
      tokens: totalTokens,
      durationMs: Date.now() - start,
    };
  }

  return {
    agentId: "AG01",
    success: false,
    data: fallback,
    tokens: totalTokens,
    durationMs: Date.now() - start,
    error: "Klassifizierung nicht abgeschlossen (Haiku + Sonnet gescheitert)",
  };
}

export const ag01Orchestrator: Agent<TriageResult> = {
  id: "AG01",
  name: "Orchestrator",
  model: () => HAIKU_MODEL,
  execute,
};
