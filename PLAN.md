# PLAN — 2026-03-16 19:15 UTC

## Trigger
weekly — Wöchentliche Vollprüfung

## Projekt
BescheidRecht Frontend (bescheidrecht-frontend)

## Kontext
Letzter Commit: Agent-System GitHub Workflow hinzugefügt. Davor: CLAUDE.md Korrekturen, Rahmenvertrag-Klauseln, A11y-Fixes, Security-Härtungen. Vollprüfung aller Systembereiche.

## Agent-Ausführung

| Priorität | Agent | Scope | Parallel? | Status |
|---|---|---|---|---|
| 1 | security | gesamtes Projekt | nein — immer zuerst | ⏳ |
| 2 | typeguard | src/**/*.ts, src/**/*.tsx | ja | ⏳ |
| 2 | backend | src/app/api/** | ja | ⏳ |
| 2 | frontend | src/components/**, src/app/**/page.tsx | ja | ⏳ |
| 3 | critic | gesamtes Projekt | nein — braucht vorherige | ⏳ |
| 4 | dep-guard | package.json, package-lock.json | ja | ⏳ |
| 4 | env-guard | .env*, CLAUDE.md, src/**/process.env | ja | ⏳ |
| 4 | supabase-guard | supabase/*, src/lib/supabase/* | ja | ⏳ |
| 4 | vercel-guard | vercel.json, .github/workflows/* | ja | ⏳ |
| 4 | cost-guard | API-Kosten, Vercel, Supabase | ja | ⏳ |
| 4 | incident-guard | /api/health, kritische Endpoints | ja | ⏳ |
| 4 | performance | Bundle, Lighthouse, API-Latenz | ja | ⏳ |
| 4 | seo-guard | Meta-Tags, Sitemap, robots.txt | ja | ⏳ |
| 5 | auditor | MEMORY.md, alle Findings | nein — braucht alle | ⏳ |

## Erwartete Laufzeit
~8-12 Minuten

## Abbruch-Bedingung
Bei BLOCK von security: alle nachfolgenden Agents stoppen.
Bei > 3x KRITISCH in einem Agent: nächste Prioritätsstufe nicht starten.
