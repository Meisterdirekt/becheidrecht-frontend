# BescheidRecht — Agent Performance Review

Analysiere den aktuellen Zustand der 13-Agenten-Pipeline und identifiziere Verbesserungspotenzial.

## Status der Pipeline (vollständig implementiert)

Lies den aktuellen Stand:
- `src/lib/logic/agents/orchestrator.ts` — Pipeline-Flow: AG08 → AG12 → AG01 → [AG02 ║ AG04] → AG03 → AG07 → AG13
- `src/lib/logic/agents/prompts.ts` — Alle 13 System-Prompts
- `src/lib/logic/agents/utils.ts` — Modell-Routing + Kosten

**Bereits aktiv:** Prompt-Caching (ephemeral), Routing (NORMAL/HOCH/NOTFALL), per-Modell-Kostenberechnung.

## Was prüfen

### 1. Qualitätsprobleme aus update_protokoll lesen
AG06 schreibt Qualitätsanalysen in die DB:
```sql
SELECT * FROM update_protokoll WHERE agent_id = 'AG06' ORDER BY created_at DESC LIMIT 10;
```
Welche Agenten haben gehäuft Probleme? Was sind die Ursachen?

### 2. AG02 Auffälligkeiten-Rate prüfen
Wie oft ist `auffaelligkeiten` leer vs. gefüllt?
```sql
SELECT
  COUNT(*) FILTER (WHERE analyse_meta->>'auffaelligkeiten' = '[]') AS leer,
  COUNT(*) FILTER (WHERE analyse_meta->>'auffaelligkeiten' != '[]') AS gefuellt
FROM user_fristen;
```

### 3. Token-Kosten-Analyse
```sql
SELECT
  dringlichkeit,
  AVG(token_cost_eur) AS avg_kosten,
  MAX(token_cost_eur) AS max_kosten,
  COUNT(*) AS analysen
FROM analysis_results
GROUP BY dringlichkeit;
```

### 4. Fehlerkatalog-Abdeckung prüfen
```bash
cd /home/henne1990/bescheidrecht-frontend
node -e "
  const d = require('./content/behoerdenfehler_logik.json');
  const g = {};
  d.forEach(x => { const p = x.id.split('_')[0]; g[p] = (g[p]||0)+1; });
  console.log('Fehler pro Träger:', g);
  console.log('Gesamt:', d.length);
"
```

### 5. Wissensdatenbank-Status
```bash
npx ts-node -r tsconfig-paths/register scripts/setup-wissensdatenbank.ts
```

## Validierung nach Änderungen
```bash
npx tsc --noEmit && npm run lint && npm run test
```
