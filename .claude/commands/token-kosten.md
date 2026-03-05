# BescheidRecht — Token-Kosten Analyse

Analysiere die aktuelle KI-Konfiguration in `/home/henne1990/bescheidrecht-frontend` und berechne die erwarteten Token-Kosten.

Lies folgende Dateien:
- `src/lib/logic/agent_engine.ts` — aktuell verwendete Modelle + Prompts
- `src/app/api/assistant/route.ts` — Modelle für Assistent
- `content/behoerdenfehler_logik.json` — Größe des Fehlerkatalogs
- `content/weisungen_2025_2026.json` — Größe der Weisungen

Erstelle dann eine Kosten-Übersicht:

## Aktuelle Modell-Konfiguration
- Welche Modelle werden wo eingesetzt?
- Wird Prompt-Caching genutzt? (ja/nein)

## Geschätzte Kosten pro Analyse
Basierend auf AGENTS.md Preisstruktur:
- Haiku 4.5: $0.25/MTok Input, $1.25/MTok Output
- Sonnet 4.6: $3/MTok Input, $15/MTok Output
- Opus 4.6: $15/MTok Input, $75/MTok Output

Schätze: Input-Token (System-Prompt + Dokument ~3000 Token) + Output (~1500 Token)

## Optimierungspotenzial
Liste konkrete Code-Änderungen mit geschätzter Ersparnis in % und $.
Priorität: Prompt-Caching als erste Maßnahme (spart 60-80% auf System-Prompts).

Zeige am Ende: Kosten heute vs. Kosten nach Optimierung.
