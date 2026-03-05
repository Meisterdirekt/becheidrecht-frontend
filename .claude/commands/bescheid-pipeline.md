# BescheidRecht — Pipeline testen & debuggen

Teste die vollständige 13-Agenten-Pipeline mit einem Beispiel-Bescheid.

## Pipeline-Überblick

```
AG08 (Haiku)  → Security Gate: Prompt-Injection, Jailbreak, PII-Check
AG12 (Haiku)  → Dokumentstruktur: Rubrum, Begründung, Rechtsbehelfsbelehrung
AG01 (Sonnet) → Triage: Behörde, Rechtsgebiet, Frist, Routing
AG02 (S/Opus) → Analyse: Fehlerkatalog (max 8), Weisungen, DB-Urteile
AG04 (Sonnet) → Recherche: BSG/BVerfG via Tavily [nur HOCH/NOTFALL + TAVILY_API_KEY]
AG03 (Sonnet) → Kritik: Gegenargumente, Erfolgschance [nur HOCH/NOTFALL]
AG07 (S/Opus) → Musterschreiben: vollständiger Widerspruchsentwurf
AG13 (Haiku)  → Erklärung: Klartext für Nutzer (B1-Niveau)
--- NACH RESPONSE (fire-and-forget) ---
AG05 (Haiku)  → Wissen: Urteile in DB speichern [wenn AG04 Urteile fand]
AG06 (Sonnet) → Qualität: Pipeline-Analyse bei Problemen [Brief <500Z / 0 Fehler bei HOCH]
```

**Modell-Routing:** NORMAL/HOCH → Sonnet | NOTFALL (<7 Tage / Vollstreckung) → Opus

## Lokaler Test

### 1. Dev-Server starten
```bash
cd /home/henne1990/bescheidrecht-frontend
npm run dev
```

### 2. PDF-Upload via CURL
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -F "file=@/pfad/zum/test-bescheid.pdf"
```

### 3. Pipeline direkt testen (ohne HTTP)
```typescript
// In scripts/test-pipeline.ts:
import { runPipeline } from '../src/lib/logic/agents/orchestrator';
const result = await runPipeline(`
  Jobcenter Musterstadt, 01.03.2026
  Widerspruchsfrist: 28.03.2026
  Bürgergeld-Ablehnung: KdU übersteigt Angemessenheitsgrenze...
`);
console.log(JSON.stringify(result, null, 2));
```
```bash
npx ts-node -r tsconfig-paths/register scripts/test-pipeline.ts
```

## Häufige Debug-Szenarien

### AG02 liefert leere auffaelligkeiten
Prompt am Ende von AG02 prüfen — muss mit JSON-Abschluss enden.
Stichwörter bei `suche_fehlerkatalog` zu generisch? → Konkreter werden.

### AG07 Brief zu kurz (<500 Zeichen)
AG06 analysiert das Problem automatisch und schreibt in `update_protokoll`.
Vorab-Info aus AG02 in `ctx.pipeline.analyse.fehler` prüfen.

### AG04 läuft nicht
Prüfen: Routing-Stufe HOCH oder NOTFALL? `TAVILY_API_KEY` gesetzt?

### Kosten zu hoch
Feld `token_kosten_eur` im Result — jetzt per Modell exakt berechnet.
Haiku-Agenten (AG08/AG12/AG13) sind günstig. Kostenblock liegt bei AG02/AG07 (Opus bei NOTFALL).

## Build & Test
```bash
npx tsc --noEmit && npm run lint && npm run test
```
