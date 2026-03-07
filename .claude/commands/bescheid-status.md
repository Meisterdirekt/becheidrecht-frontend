# BescheidRecht — Vollständiger Projektstatus

Der komplette Systemcheck für BescheidRecht. Alles auf einen Blick: Code, Infrastruktur, KI-Pipeline, Business-Metriken. Ein Befehl — voller Überblick.

Projekt: `/home/henne1990/bescheidrecht-frontend`

---

## PARALLEL AUSFÜHREN

### 1. CODE-QUALITÄT
```bash
cd /home/henne1990/bescheidrecht-frontend

# TypeScript
npx tsc --noEmit 2>&1 | tail -5

# Lint
npm run lint 2>&1 | tail -5

# Tests
npm run test 2>&1 | tail -10
```

### 2. GIT-STATUS
```bash
cd /home/henne1990/bescheidrecht-frontend
git log --oneline -5
git status --short
git diff --stat HEAD~1 HEAD 2>/dev/null | tail -5
```

### 3. KRITISCHE DATEIEN
```bash
cd /home/henne1990/bescheidrecht-frontend
for file in \
  "src/lib/logic/agent_engine.ts" \
  "src/lib/logic/agents/orchestrator.ts" \
  "src/app/api/analyze/route.ts" \
  "src/app/api/assistant/route.ts" \
  "src/app/api/fristen/route.ts" \
  "src/app/api/mollie/webhook/route.ts" \
  "content/behoerdenfehler_logik.json" \
  "content/weisungen_2025_2026.json" \
  "supabase/wissensdatenbank.sql"; do
  [ -f "$file" ] && echo "✅ $file" || echo "❌ FEHLT: $file"
done
```

### 4. AGENT-PIPELINE STATUS
```bash
cd /home/henne1990/bescheidrecht-frontend
# Wie viele Agenten implementiert?
ls src/lib/logic/agents/ag*.ts 2>/dev/null | wc -l
ls src/lib/logic/agents/ 2>/dev/null

# Fehlerkatalog-Größe
node -e "const d=require('./content/behoerdenfehler_logik.json'); console.log('Fehlertypen:', d.length)" 2>/dev/null
```

### 5. ENV-VARS
```bash
cd /home/henne1990/bescheidrecht-frontend
for key in ANTHROPIC_API_KEY OPENAI_API_KEY NEXT_PUBLIC_SUPABASE_URL \
           NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY \
           CRON_SECRET MOLLIE_API_KEY TAVILY_API_KEY VERCEL_TOKEN; do
  grep -q "^${key}=" .env.local 2>/dev/null && echo "✅ $key" || echo "❌ $key"
done
```

### 6. PACKAGE-VERSIONEN
```bash
cd /home/henne1990/bescheidrecht-frontend
node -e "
const p=require('./package.json');
const deps={...p.dependencies,...p.devDependencies};
['@anthropic-ai/sdk','@supabase/supabase-js','next','react'].forEach(k=>{
  console.log(k+':', deps[k]||'nicht installiert');
});
"
```

### 7. SUPABASE TABELLEN (via MCP)
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```
Markiere: Wissensdatenbank-Tabellen (urteile, kennzahlen, behoerdenfehler, analysis_results) vorhanden?

### 8. OFFENE TODOS
```bash
cd /home/henne1990/bescheidrecht-frontend
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
  grep -v "node_modules" | head -10
```

---

## AUSGABE

```
╔═══════════════════════════════════════════════════════════╗
║  BESCHEIDRECHT — SYSTEM-STATUS  [Datum + Zeit]           ║
╠═════════════════════╦═════════════════════════════════════╣
║  TypeScript         ║  ✅ 0 Fehler / ❌ N Fehler          ║
║  ESLint             ║  ✅ Clean / ❌ N Warnings            ║
║  Tests              ║  ✅ N passed / ❌ N failed           ║
╠═════════════════════╬═════════════════════════════════════╣
║  Git Branch         ║  [branch-name]                     ║
║  Letzter Commit     ║  [message] vor [Zeit]              ║
║  Uncommitted        ║  [N Dateien / Clean]               ║
╠═════════════════════╬═════════════════════════════════════╣
║  Agent-Pipeline     ║  [N/13] Agenten implementiert      ║
║  Fehlerkatalog      ║  [N] Fehlertypen                   ║
║  Wissensdatenbank   ║  ✅ Tabellen vorhanden / ❌ Fehlt   ║
╠═════════════════════╬═════════════════════════════════════╣
║  Env-Vars           ║  [N/N] gesetzt                     ║
║  Kritische Dateien  ║  [N/N] vorhanden                   ║
╠═════════════════════╬═════════════════════════════════════╣
║  Next.js            ║  [Version]                         ║
║  Anthropic SDK      ║  [Version]                         ║
║  Supabase           ║  [Version]                         ║
╚═════════════════════╩═════════════════════════════════════╝

OFFENE TODOS: [N]
[Liste der TODOs falls vorhanden]

SOFORTIGER HANDLUNGSBEDARF:
❌ [Blocker] → [Was zu tun ist]

EMPFEHLUNG: [Nächster sinnvoller Schritt]
```
