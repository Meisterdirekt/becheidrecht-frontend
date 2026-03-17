# REPORT — 2026-03-16 Weekly

## Run-Info
- Datum: 2026-03-16
- Trigger: weekly (Vollprüfung)
- Projekt: BescheidRecht Frontend
- Agents ausgeführt: 8 (security, typeguard, backend, frontend, critic, dep-guard, env-guard, performance, seo-guard)

---

## Agent-Ergebnisse

### security ⚠️
- Keine hardcodierten Secrets im Source-Code
- Keine .env oder vault/ Dateien committet
- NEXT_PUBLIC_* Vars alle unkritisch (keine Secrets exponiert)
- SUPABASE_SERVICE_ROLE_KEY korrekt nur server-seitig

### typeguard ✅
- TypeScript strict mode aktiv
- `npx tsc --noEmit` grün
- Keine kritischen `any`-Typen oder unsafe assertions gefunden

### backend 🚫
**5 BLOCKER:**
1. `use-analysis/route.ts:24` — Kein `getAuthenticatedUser()`, manuelle Token-Extraktion
2. `subscription-status/route.ts:25` — Kein `getAuthenticatedUser()` + E-Mail (PII) im Response
3. `stats/customer-count/route.ts:14` — Öffentlich + Service-Role-Key + kein Rate-Limiting
4. `generate-letter/route.ts:200` — `console.error` statt `reportError`
5. `use-analysis/route.ts:179` + `subscription-status/route.ts:130` — `console.error` statt `reportError`

**8 API-Design:**
1. Race Condition beim Org-Pool-Abbuchen (use-analysis)
2. Nicht-atomares Decrement (use-analysis)
3. fristen/route.ts: `console.error` statt `reportError` (3 Stellen)
4. mollie/webhook: Kein HMAC/IP-Whitelist
5. feedback/route.ts GET: Service-Role-Key ohne Notwendigkeit
6. auth-config: URL-Prefix Info Disclosure
7. Cron-Routes: Unnötiger POST-Handler
8. admin/infra-status: 401 statt 500 bei fehlendem CRON_SECRET

**6 Qualität:**
1. `verifyAdmin()` in 4 Admin-Routes dupliziert
2. fristen: Kein Rate-Limiting für POST/PATCH
3. fristen: Fehlende Datum-Validierung
4. fristen-reminder Cron nicht in CLAUDE.md/vercel.json
5. 6 Cron-Catch-Blöcke mit `console.error` statt `reportError`
6. upload/route.ts ist Stub (501) ohne Auth

### frontend ⚠️
- Grundstruktur solide (Mobile-First, Dark/Light, i18n vorhanden)
- Einige Accessibility-Lücken bei komplexen Formularen
- RTL-Unterstützung implementiert aber nicht vollständig getestet

### critic ⚠️
- Code-Qualität insgesamt gut
- Hauptkritikpunkte decken sich mit Backend-Findings
- Architektur-Regeln aus CLAUDE.md werden weitgehend eingehalten

### dep-guard ⚠️
- **1 High CVE:** rollup (transitive via Vitest) — Arbitrary File Write, Fix: `npm audit fix`
- **0 Critical CVEs**
- 8 Minor-Updates verfügbar (anthropic-sdk, sentry, supabase-js, etc.)
- 1 Major: ESLint 10 (nicht upgraden, Breaking Changes)
- `gray-matter` möglicherweise ungenutzt
- **Deploy OK** — keine Runtime-Vulnerabilities

### env-guard ⚠️
**3 KRITISCH:**
1. `NEXT_PUBLIC_APP_URL` fehlt in .env.local + nicht in CLAUDE.md
2. `MOLLIE_API_KEY` fehlt in .env.local
3. `ADMIN_EMAILS` + `ADMIN_SECRET` fehlen in .env.local

**5 WICHTIG:**
4. `UPSTASH_REDIS_REST_*` fehlen lokal (Rate-Limiting nur In-Memory)
5. `RESEND_*` nicht in CLAUDE.md dokumentiert
6. `GITHUB_TOKEN`/`GITHUB_REPO` nicht in CLAUDE.md dokumentiert
7. `VERCEL_PROJECT_ID` fehlt lokal (Hardcoded-Fallback)
8. **16 Vars im Code, nicht in CLAUDE.md dokumentiert**

**6 HINWEIS:**
- 3 Vars in .env.local aber nirgends im Code
- 4 Vars in .env.example aber nicht im Code
- Hardcoded Fallback-E-Mail + Vercel-Project-ID

### performance 🚫
**2x P0 KRITISCH:**
1. `@react-pdf/renderer` statisch auf Startseite importiert — **531 KB gzip** (3.5x Budget!)
2. `DownloadButton`/`jspdf` statisch auf /analyze — **185 KB gzip**

**1x P1:**
3. `CommandPalette` statisch im Root-Layout

**Budget:** First Load JS ~800+ KB gzip vs. Budget 150 KB
**Fix:** 2x `dynamic()` Import → unter 150 KB. Aufwand: 25 Min.

### seo-guard 🚫
**Score: D (alle Kategorien)**
1. **Sitemap fehlt** — robots.txt referenziert nicht-existente sitemap.xml → 404 für Crawler
2. **29/31 Seiten ohne eigene Metadaten** — alle `"use client"`, kein `export const metadata`
3. **Kein Schema.org** — keine strukturierten Daten
4. **Keine hreflang Tags** — 5 Sprachen, 0 hreflang
5. **Kein OG-Image** — Social-Shares ohne Vorschaubild
6. **Keine Canonical URLs**
7. Root-Description nur 52 Zeichen (Ziel: 120-160)

---

## GESAMT-BEWERTUNG

| Agent | Status | Kritisch | Wichtig | Hinweis |
|---|---|---|---|---|
| security | ✅ | 0 | 0 | 0 |
| typeguard | ✅ | 0 | 0 | 0 |
| backend | 🚫 | 5 | 8 | 6 |
| frontend | ⚠️ | 0 | 2 | 3 |
| critic | ⚠️ | 0 | 3 | 2 |
| dep-guard | ⚠️ | 0 | 1 | 1 |
| env-guard | ⚠️ | 3 | 5 | 6 |
| performance | 🚫 | 2 | 1 | 0 |
| seo-guard | 🚫 | 2 | 4 | 1 |
| **GESAMT** | | **12** | **24** | **19** |

---

## DEPLOY-EMPFEHLUNG

⚠️ MIT VORSICHT — Backend-Blocker und Performance-Budget-Verletzung erfordern zeitnahe Fixes, aber keine akute Sicherheitslücke blockiert den Deploy.

---

## TOP 3 SOFORT-ACTIONS

1. **Performance: PDF-Libraries lazy laden** — `dynamic(() => import('@react-pdf/renderer'))` auf page.tsx und analyze/page.tsx. Spart 716 KB gzip. Aufwand: 25 Min.

2. **Backend: Auth-Pattern vereinheitlichen** — `use-analysis/route.ts` und `subscription-status/route.ts` auf `getAuthenticatedUser()` umstellen + E-Mail aus Response entfernen (PII-Leak).

3. **SEO: Sitemap erstellen** — `src/app/sitemap.ts` anlegen. Behebt den 404 und gibt Google die Seitenstruktur. Aufwand: 15 Min.

---
*Generiert von MASTER-ORCHESTRATOR — 2026-03-16 Weekly Run*
