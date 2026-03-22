/**
 * AG14 — Präzedenzfall-Analyzer (kein LLM · immer)
 *
 * Fragt die `analysis_results` Tabelle nach historischen Fällen mit
 * gleichem Rechtsgebiet + Behörde ab. Gibt Erfolgsquoten und häufige
 * Fehlermuster zurück — ohne API-Call, ohne Kosten.
 *
 * Output geht in pipeline.praezedenz → AG07 und AG13 nutzen es.
 */

import {
  type Agent,
  type AgentContext,
  type AgentResult,
  type PraezedenzResult,
  emptyTokenUsage,
} from "./types";
import { executeDbRead } from "./tools/db-read";
import { isValidRechtsgebiet, normalizeSgb, SGB_TO_RECHTSGEBIET } from "../constants/rechtsgebiete";

async function execute(ctx: AgentContext): Promise<AgentResult<PraezedenzResult>> {
  const start = Date.now();

  const fallback: PraezedenzResult = {
    aehnliche_faelle: 0,
    erfolgsquote_prozent: null,
    haeufigste_fehler: [],
    hinweis: "",
  };

  // AG01 liefert SGB-Notation ("SGB II"), wir brauchen Kürzel ("BA")
  const rawRechtsgebiet = ctx.pipeline.triage?.rechtsgebiet;
  const rechtsgebiet = rawRechtsgebiet
    ? (isValidRechtsgebiet(rawRechtsgebiet)
        ? rawRechtsgebiet
        : SGB_TO_RECHTSGEBIET[normalizeSgb(rawRechtsgebiet)] ?? null)
    : null;
  const behoerde = ctx.pipeline.triage?.behoerde;

  // Multi-Rechtsgebiet: Weitere Rechtsgebiete in Kürzel auflösen
  const weitereRg = ctx.pipeline.triage?.weitere_rechtsgebiete ?? [];
  const weitereKuerzel: string[] = [];
  for (const sgb of weitereRg) {
    const normalized = normalizeSgb(sgb);
    const code = SGB_TO_RECHTSGEBIET[normalized];
    if (code && code !== rechtsgebiet) weitereKuerzel.push(code);
  }

  if (!rechtsgebiet) {
    return {
      agentId: "AG14",
      success: true,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: "Rechtsgebiet unbekannt — Präzedenzanalyse übersprungen",
    };
  }

  try {
    // Lade historische Analyseergebnisse für Haupt-Rechtsgebiet
    const dbResult = await executeDbRead(
      "analysis_results",
      { rechtsgebiet },
      50
    );

    // Multi-Rechtsgebiet: Auch Ergebnisse der weiteren Rechtsgebiete laden
    const allRows = [...(dbResult.available ? dbResult.rows : [])];
    for (const rg of weitereKuerzel) {
      const extraResult = await executeDbRead("analysis_results", { rechtsgebiet: rg }, 20);
      if (extraResult.available && extraResult.rows.length > 0) {
        allRows.push(...extraResult.rows);
      }
    }

    if (allRows.length === 0) {
      return {
        agentId: "AG14",
        success: true,
        data: { ...fallback, hinweis: `Noch keine Daten für ${rechtsgebiet}` },
        tokens: emptyTokenUsage(),
        durationMs: Date.now() - start,
      };
    }

    const rawResults = allRows;

    // Filtern: Gleiche Behörde bevorzugen (aber auch allgemeine Daten nutzen)
    const behoerdeNormalized = (behoerde ?? "").toLowerCase();
    const gleicheBehoerde = behoerdeNormalized
      ? rawResults.filter((r) =>
          String(r.behoerde ?? "").toLowerCase().includes(behoerdeNormalized.split(" ")[0])
        )
      : [];

    const relevantResults = gleicheBehoerde.length >= 3 ? gleicheBehoerde : rawResults;
    const aehnliche_faelle = relevantResults.length;

    // Erfolgsquote aus `analyse_meta.erfolgschance` berechnen
    const chancen: number[] = [];
    for (const r of relevantResults) {
      const meta = r.analyse_meta as Record<string, unknown> | null;
      const erfolgschance = meta?.erfolgschance;
      if (typeof erfolgschance === "number" && erfolgschance >= 0 && erfolgschance <= 100) {
        chancen.push(erfolgschance);
      }
    }

    const erfolgsquote_prozent =
      chancen.length > 0
        ? Math.round(chancen.reduce((s, c) => s + c, 0) / chancen.length)
        : null;

    // Häufigste Fehler aggregieren
    const fehlerZaehler = new Map<string, number>();
    for (const r of relevantResults) {
      const fehlerArr = r.fehler as string[] | null;
      if (Array.isArray(fehlerArr)) {
        for (const f of fehlerArr.slice(0, 3)) {
          if (typeof f === "string" && f.length > 0) {
            // Normalisieren: ersten 60 Zeichen als Key
            const key = f.slice(0, 60).trim();
            fehlerZaehler.set(key, (fehlerZaehler.get(key) ?? 0) + 1);
          }
        }
      }
    }

    const haeufigste_fehler = [...fehlerZaehler.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([fehler]) => fehler);

    // Kontextueller Hinweis
    let hinweis = "";
    // Hinweis-Text ohne Prozentzahlen — § 2 RDG verbietet konkrete Erfolgsaussagen gegenüber Nutzern.
    // erfolgsquote_prozent bleibt intern verfügbar (AG07 Schwerpunktsetzung), wird aber nie dem Nutzer angezeigt.
    if (aehnliche_faelle >= 5 && erfolgsquote_prozent !== null) {
      if (erfolgsquote_prozent >= 65) {
        hinweis = `In ${aehnliche_faelle} ähnlichen Fällen war ein Widerspruch häufig erfolgreich.`;
      } else if (erfolgsquote_prozent >= 40) {
        hinweis = `In ${aehnliche_faelle} ähnlichen Fällen hatte ein Widerspruch teils Erfolg.`;
      } else {
        hinweis = `In ${aehnliche_faelle} ähnlichen Fällen war die Ausgangslage schwierig.`;
      }
    } else if (aehnliche_faelle > 0) {
      hinweis = `${aehnliche_faelle} ähnliche Fälle in der Datenbank (noch zu wenig für statistisch sichere Aussage).`;
    }

    return {
      agentId: "AG14",
      success: true,
      data: {
        aehnliche_faelle,
        erfolgsquote_prozent,
        haeufigste_fehler,
        hinweis,
      },
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      confidence: aehnliche_faelle >= 10 ? 0.85 : aehnliche_faelle >= 3 ? 0.6 : 0.3,
    };
  } catch (err) {
    return {
      agentId: "AG14",
      success: false,
      data: fallback,
      tokens: emptyTokenUsage(),
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : "DB-Abfrage fehlgeschlagen",
    };
  }
}

export const ag14PraezedenzAnalyzer: Agent<PraezedenzResult> = {
  id: "AG14",
  name: "Präzedenzfall-Analyzer",
  model: () => "",
  execute,
};
