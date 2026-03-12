/**
 * AG07 — Musterschreiben-Generator (Sonnet/Opus · IMMER)
 * Erstellt professionelle Widerspruchsschreiben.
 * Nutzt AG02-Fehler, AG03-Kritik und AG04-Urteile wenn vorhanden.
 */

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
  createAnthropicClient,
  mergeTokenUsage,
} from "./utils";
import { TOOL_GET_WEISUNGEN, executeGetWeisungen } from "./tools/weisungen";
import { processToolBlocks } from "./tools/process-tool-results";

const TOOL_ERSTELLE_MUSTERSCHREIBEN: Anthropic.Tool = {
  name: "erstelle_musterschreiben",
  description:
    "Erstellt das finale Widerspruchsschreiben. Rufe dieses Tool auf, nachdem du alle " +
    "Auffälligkeiten analysiert hast.",
  input_schema: {
    type: "object" as const,
    properties: {
      rubrum: {
        type: "string",
        description: "Briefkopf: Absender, Empfänger, Ort/Datum, Betreff",
      },
      chronologie: {
        type: "string",
        description: "Einleitung + Sachverhalt + Begründung",
      },
      forderung: {
        type: "string",
        description: "Konkreter Forderungssatz (Pflicht!)",
      },
      schluss: {
        type: "string",
        description: "Abschluss: Eingangsbestätigung, Grußformel, [Unterschrift]",
      },
      auffaelligkeiten: {
        type: "array",
        items: { type: "string" },
        description: "Liste der identifizierten Auffälligkeiten",
      },
    },
    required: ["rubrum", "chronologie", "forderung", "schluss", "auffaelligkeiten"],
  },
};

const TOOLS: Anthropic.Tool[] = [
  TOOL_ERSTELLE_MUSTERSCHREIBEN,
  TOOL_GET_WEISUNGEN,
];

async function execute(ctx: AgentContext): Promise<AgentResult<MusterschreibenResult>> {
  const start = Date.now();
  const apiKey = getAnthropicKey();

  const fallback: MusterschreibenResult = {
    volltext: "",
    auffaelligkeiten: [],
    forderung: "",
  };

  if (!apiKey) {
    return {
      agentId: "AG07",
      success: false,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "Kein API-Key",
    };
  }

  const anthropic = createAnthropicClient(apiKey);
  const model = modelForStufe(ctx.routingStufe);
  let totalTokens = emptyTokenUsage();

  // Kontext aus vorherigen Agenten zusammenbauen
  let vorabInfo = "";

  if (ctx.pipeline.triage) {
    const t = ctx.pipeline.triage;
    vorabInfo += `\nKLASSIFIZIERUNG: ${t.behoerde} | ${t.rechtsgebiet} | ${t.untergebiet}`;
    if (t.frist_datum) vorabInfo += `\nFrist: ${t.frist_datum} (${t.frist_tage ?? "?"} Tage)`;
    if (t.bg_nummer) vorabInfo += `\nAZ/BG-Nr: ${t.bg_nummer}`;
  }

  if (ctx.pipeline.analyse) {
    const a = ctx.pipeline.analyse;
    if (a.fehler.length > 0) {
      vorabInfo += `\n\nFEHLERKATALOG-TREFFER (${a.fehler.length}):\n`;
      vorabInfo += a.fehler
        .map((f) => `- [${f.severity}] ${f.titel}: ${f.musterschreiben_hinweis ?? f.beschreibung}`)
        .join("\n");
    }
    if (a.auffaelligkeiten.length > 0) {
      vorabInfo += `\n\nAUFFÄLLIGKEITEN:\n${a.auffaelligkeiten.map((a) => `- ${a}`).join("\n")}`;
    }
  }

  if (ctx.pipeline.kritik) {
    const k = ctx.pipeline.kritik;
    vorabInfo += `\n\nKRITIK (AG03):\nErfolgschance: ${k.erfolgschance_prozent}%`;
    if (k.schwachstellen.length > 0) {
      vorabInfo += `\nSchwachstellen: ${k.schwachstellen.join("; ")}`;
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

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Erstelle ein Musterschreiben für diesen Bescheid:${vorabInfo}\n\nBESCHEID-TEXT:\n${ctx.documentText}`,
    },
  ];

  let musterschreiben = "";
  let auffaelligkeiten: string[] = [];
  let forderung = "";

  // Extended Thinking für NOTFALL — maximale Briefqualität bei life-critical Fällen
  const useExtendedThinking = ctx.routingStufe === "NOTFALL";

  // Tool-Use Loop
  for (let i = 0; i < 6; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createParams: any = {
      model,
      max_tokens: useExtendedThinking ? 20000 : 6144,
      system: getSystemPrompt("AG07"),
      tools: TOOLS,
      messages,
    };
    if (useExtendedThinking) {
      createParams.thinking = { type: "enabled", budget_tokens: 10000 };
      // interleaved-thinking-2025-05-14 gilt nur für Claude 3.7 Sonnet.
      // Claude 4 Modelle (opus-4-x, sonnet-4-x) unterstützen thinking nativ ohne Beta-Header.
      if (model.includes("3-7") || model.includes("3-5")) {
        createParams.betas = ["interleaved-thinking-2025-05-14"];
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: Anthropic.Message = await anthropic.messages.create(createParams as any);

    const tokens = extractTokenUsage(response);
    totalTokens = mergeTokenUsage(totalTokens, tokens);

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      // Retry: Wenn kein Tool-Call kam und noch Iterationen übrig → erzwingen
      if (!musterschreiben && i < 4) {
        messages.push({
          role: "user",
          content:
            "Du hast den Brief als Fließtext geschrieben, aber das Tool 'erstelle_musterschreiben' nicht aufgerufen. " +
            "Rufe es JETZT auf mit den Abschnitten: rubrum, chronologie, forderung, schluss, auffaelligkeiten.",
        });
        continue;
      }
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const toolResults = await processToolBlocks(response.content, {
      erstelle_musterschreiben: {
        execute: (input) => {
          const disclaimer =
            "\n\n---\n⚠ WICHTIGER HINWEIS: Dieser Entwurf wurde von einer KI erstellt und stellt keine Rechtsberatung " +
            "im Sinne des Rechtsdienstleistungsgesetzes (RDG § 2) dar. Er ersetzt nicht die Beratung durch einen " +
            "zugelassenen Rechtsanwalt oder eine anerkannte Beratungsstelle (z.B. VdK, Sozialverband). " +
            "Vor dem Absenden bitte vollständig prüfen und eigene Angaben ergänzen.\n---";

          const forderungAbschnitt = (input.forderung as string)
            ? `\n\nFORDERUNG:\n${input.forderung as string}`
            : "";

          musterschreiben =
            `${input.rubrum as string}\n\n${input.chronologie as string}${forderungAbschnitt}\n\n${input.schluss as string}${disclaimer}`.trim();
          auffaelligkeiten = input.auffaelligkeiten as string[];
          forderung = input.forderung as string;

          return JSON.stringify({
            status: "erstellt",
            zeichen: musterschreiben.length,
          });
        },
      },
      get_weisungen: {
        execute: (input) => executeGetWeisungen(input.traeger as string),
      },
    });

    messages.push({ role: "user", content: toolResults });
  }

  // Fallback: Text-Block wenn kein Tool-Call
  if (!musterschreiben) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant" && Array.isArray(lastMsg.content)) {
      const textBlocks = (lastMsg.content as Anthropic.ContentBlock[]).filter(
        (b) => b.type === "text"
      );
      if (textBlocks.length > 0 && textBlocks[0].type === "text") {
        musterschreiben = textBlocks[0].text;
      }
    }
  }

  return {
    agentId: "AG07",
    success: musterschreiben.length > 0,
    data: {
      volltext: musterschreiben,
      auffaelligkeiten,
      forderung,
    },
    tokens: totalTokens,
    durationMs: Date.now() - start,
  };
}

export const ag07LetterGenerator: Agent<MusterschreibenResult> = {
  id: "AG07",
  name: "Musterschreiben-Generator",
  model: modelForStufe,
  execute,
};
