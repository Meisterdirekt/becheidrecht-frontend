# BescheidRecht — Infra-Status (Aktiv)

Vollständige Infrastruktur-Diagnose — aktiv, nicht passiv. Kein "füge manuell ein", kein "prüfe selbst". Wir prüfen alles automatisch und zeigen den genauen Status.

Nutze `/cloud-ops` für tiefere Eingriffe (Migrationen, Redeploys).

---

## SCHRITT 1 — CREDENTIALS (parallel prüfen)

```bash
cd /home/henne1990/bescheidrecht-frontend
for key in CRON_SECRET NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY \
           SUPABASE_SERVICE_ROLE_KEY ANTHROPIC_API_KEY OPENAI_API_KEY \
           MOLLIE_API_KEY VERCEL_TOKEN GITHUB_TOKEN TAVILY_API_KEY; do
  grep -q "^${key}=" .env.local 2>/dev/null && echo "✅ $key" || echo "❌ $key"
done
```

---

## SCHRITT 2 — SUPABASE (via MCP)

Führe via Supabase MCP aus:
```sql
SELECT table_name, (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_name = t.table_name AND table_schema='public') as cols,
  pg_size_pretty(pg_total_relation_size(table_name::regclass)) as size
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

Markiere: Sind `urteile`, `kennzahlen`, `behoerdenfehler`, `analysis_results`, `user_fristen` vorhanden?

---

## SCHRITT 3 — VERCEL (API)

```bash
VERCEL_TOKEN=$(grep -oP '(?<=^VERCEL_TOKEN=).*' /home/henne1990/bescheidrecht-frontend/.env.local 2>/dev/null)
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN fehlt — kein Vercel-Check möglich"
else
  curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v6/deployments?limit=3&target=production" | \
    python3 -c "
import json,sys
d=json.load(sys.stdin)
deps = d.get('deployments',[])
if not deps: print('Keine Deployments gefunden')
for dep in deps:
    state=dep.get('state','?')
    url=dep.get('url','?')
    msg=dep.get('meta',{}).get('githubCommitMessage','?')[:50]
    ts=dep.get('createdAt',0)
    print(f'{state} | {url} | {msg}')
" 2>/dev/null || echo "❌ Vercel API nicht erreichbar"
fi
```

---

## SCHRITT 4 — DEV-SERVER

```bash
curl -s --max-time 3 http://localhost:3000/api/admin/infra-status 2>/dev/null | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print(json.dumps(d, indent=2, ensure_ascii=False))" \
  2>/dev/null || echo "⚠️ Dev-Server nicht erreichbar auf Port 3000"

# Alternativ: Port 3001, 3002
for port in 3001 3002; do
  curl -s --max-time 2 http://localhost:$port/ > /dev/null 2>&1 && echo "⚠️ Server läuft auf Port $port (nicht 3000!)" || true
done
```

---

## SCHRITT 5 — CRON-STATUS

```bash
# Letzte Cron-Ausführungen via update_protokoll prüfen (Supabase MCP):
```
```sql
SELECT agent_id, operation, notiz, created_at
FROM update_protokoll
WHERE agent_id IN ('CRON_RECHTS', 'CRON_AGENT_BATCH')
ORDER BY created_at DESC LIMIT 5;
```

---

## AUSGABE

```
╔══════════════════════════════════════════════════════╗
║  INFRA-STATUS — [Datum + Zeit]                      ║
╠══════════════════════════╦═══════════════════════════╣
║  CREDENTIALS             ║  [N/N gesetzt]            ║
║  SUPABASE DB             ║  [N Tabellen / Status]    ║
║  WISSENSDATENBANK        ║  [Vorhanden / Fehlt]      ║
║  VERCEL                  ║  [READY / ERROR / ?]      ║
║  DEV-SERVER              ║  [Läuft / Offline]        ║
║  CRONS                   ║  [Letzter Lauf]           ║
╚══════════════════════════╩═══════════════════════════╝

SOFORTIGER HANDLUNGSBEDARF:
❌ [Was fehlt] → [Exakte Aktion]

WARNUNG:
⚠️ [Was zu beachten ist]

FÜR TIEFERE AKTIONEN: /cloud-ops
```
