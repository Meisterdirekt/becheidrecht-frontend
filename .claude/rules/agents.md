---
description: Regeln fuer Agent-Entwicklung — Pipeline-Schutz, Interface-Vertrag, Testing
globs: src/lib/logic/agents/**/*.ts
---

# Agent-Regeln

1. **Pipeline-Reihenfolge ist fix** — AG08 → AG12 → AG01 → [AG02 ‖ AG04] → AG03 → [AG07 ‖ AG14] → AG13. Reihenfolge NICHT aendern ohne explizite Freigabe.

2. **Agent-Interface einhalten** — Jeder Agent muss das Interface aus `types.ts` implementieren. Rueckgabe-Typ nie aendern — Downstream-Agenten haengen davon ab.

3. **orchestrator.ts ist Sperrgebiet** — Aenderungen am Orchestrator nur mit expliziter Freigabe. Er steuert die gesamte Analyse-Pipeline.

4. **Prompts in prompts.ts** — System-Prompts gehoeren nach `prompts.ts`, nicht inline in den Agent-Dateien.

5. **Kosten beachten** — AG01 nutzt Haiku (guenstig). AG07 nutzt Sonnet/Opus je nach Dringlichkeit. Modell-Routing nicht ohne Grund aendern.

6. **Error-Reporter** — Fehler ueber `reportError`/`reportInfo` aus `@/lib/error-reporter` loggen, nicht `console.log`.

7. **Cron-Agenten (AG15-AG19)** — Laufen unabhaengig via Vercel Cron. Erstellen GitHub Issues bei Findings. Shared Utility: `tools/github-issues.ts`.
