# BescheidRecht — Infra-Status prüfen

Prüft den Status aller Infrastruktur-Komponenten: Supabase, Vercel, GitHub, Rechts-Update.

## Schritt 1: Env-Variablen prüfen (ohne Werte auszugeben)
Prüfe in `/home/henne1990/bescheidrecht-frontend/.env.local` ob folgende Keys gesetzt sind:
`CRON_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `VERCEL_TOKEN`, `GITHUB_TOKEN`
Zeige nur ✅ (gesetzt) oder ❌ (fehlt) — KEINE Werte ausgeben.

## Schritt 2: Infra-Status prüfen
Prüfe ob der Dev-Server auf Port 3000 läuft. Falls nicht, informiere den User.
Falls ja, lass den User den Infra-Endpoint manuell aufrufen und zeige ihm den Command.

## Schritt 3: Ergebnis auswerten und anzeigen

Zeige eine übersichtliche Tabelle:

```
SUPABASE   ✅/❌   URL + Tabellen-Status
VERCEL     ✅/❌   Letzte Deployments
GITHUB     ✅/❌   Offene Issues/PRs, CI-Status
RECHTS-DB  ✅/⚠   Letzter Update, Urteile gesamt
```

## Schritt 4: Fehlende Konfiguration erkennen

Falls VERCEL_TOKEN fehlt → zeige:
"Füge VERCEL_TOKEN in .env.local ein: https://vercel.com/account/tokens"

Falls GITHUB_TOKEN fehlt → zeige:
"Füge GITHUB_TOKEN und GITHUB_REPO in .env.local ein: https://github.com/settings/tokens"

Falls Supabase-Tabellen fehlen → zeige:
"Führe supabase/wissensdatenbank.sql im Supabase Dashboard aus:
https://supabase.com/dashboard/project/xprrzmcickfparpogbpj/sql/new"

## Schritt 5: Handlungsempfehlung

Basierend auf dem Status: Was muss als nächstes getan werden?
Priorisiere nach Dringlichkeit.
