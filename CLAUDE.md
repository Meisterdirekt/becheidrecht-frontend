# CLAUDE.md — BescheidRecht

Du bist Architekt eines Sozialrecht-Tools das echten Menschen hilft, fehlerhafte
Behördenbescheide anzufechten. Jede Zeile Code, jede UI-Entscheidung, jede
juristische Formulierung hat reale Konsequenzen.

---

## Commands

```
npm run dev          # Next.js Dev-Server (Port 3000)
npm run build        # Produktions-Build
npm run start        # Produktions-Server (nach build)
npm run lint         # ESLint
npm run test         # Vitest (run)
npm run test:watch   # Vitest (watch)
npx tsc --noEmit     # TypeScript Strict Check — VOR JEDEM COMMIT
```

Deploy-Workflow: `npx tsc --noEmit && npm run lint && npm run build`

---

## Architecture

```
middleware.ts                           # Root — Supabase Session-Refresh (delegiert an lib/supabase/middleware.ts)
eslint.config.mjs                      # ESLint Flat Config (next/core-web-vitals + typescript)
postcss.config.js                      # Tailwind v4 via @tailwindcss/postcss
src/
├── app/
│   ├── layout.tsx                      # Root Layout (Outfit Font, Metadata)
│   ├── page.tsx                        # Landingpage (Pricing inline)
│   ├── error.tsx                       # Error Boundary
│   ├── loading.tsx                     # Global Loading
│   ├── not-found.tsx                   # 404
│   ├── analyze/page.tsx                # Analyse-Wizard + FristBanner + RefineSection
│   ├── assistant/page.tsx              # 4-Schritt Widerspruchs-Assistent (SSE)
│   ├── fristen/page.tsx                # Fristen-Dashboard (Filter: offen/eingereicht/erledigt/abgelaufen)
│   ├── admin/page.tsx                  # Admin-Panel
│   ├── login/page.tsx                  # Login
│   ├── register/page.tsx               # Registrierung
│   ├── forgot/page.tsx                 # Passwort vergessen
│   ├── reset-password/page.tsx         # Passwort zurücksetzen
│   ├── blog/page.tsx                   # Blog-Übersicht
│   ├── blog/[slug]/page.tsx            # Blog-Einzelartikel
│   ├── feedback/page.tsx               # Nutzer-Feedback
│   ├── test-ki/page.tsx                # KI-Testseite
│   ├── agb/page.tsx                    # AGB
│   ├── datenschutz/page.tsx            # Datenschutzerklärung
│   ├── impressum/page.tsx              # Impressum
│   ├── avv/page.tsx                    # Auftragsverarbeitungsvertrag
│   ├── b2b/page.tsx                    # B2B-Landingpage
│   ├── pitch-deck/page.tsx             # Pitch-Deck (intern)
│   ├── intern/page.tsx                 # Interner Hub (B2B-Tools)
│   ├── angebot/page.tsx                # Angebots-Generator (intern)
│   ├── rahmenvertrag/page.tsx          # Rahmenvertrag-Generator (intern)
│   ├── einrichtung/page.tsx            # Einrichtungs-Dashboard (B2B Org-Verwaltung)
│   ├── einrichtung/einladen/page.tsx   # Mitarbeiter einladen
│   └── api/
│       ├── analyze/route.ts            # POST — Agent-Engine Analyse + Auto-Frist-Save
│       ├── assistant/route.ts          # POST — SSE-Streaming Assistent
│       ├── fristen/route.ts            # GET|POST|PATCH — Fristen CRUD (User-JWT, nicht Service-Key!)
│       ├── generate-letter/route.ts    # POST — Musterschreiben (Anthropic claude-sonnet-4-6)
│       ├── upload/route.ts             # POST — Datei-Upload (PDF/Bild → Text)
│       ├── use-analysis/route.ts       # POST — Analyse-Credit verbrauchen
│       ├── subscription-status/route.ts # GET — Abo-Status prüfen
│       ├── feedback/route.ts           # POST — Nutzer-Feedback speichern
│       ├── mollie/webhook/route.ts     # POST — Mollie Payment Webhook (produktiv)
│       ├── auth-config/route.ts        # GET — Auth-Konfiguration
│       ├── auth-debug/route.ts         # GET — Auth-Debug (nur Dev)
│       ├── stats/customer-count/route.ts # GET — Kundenzähler
│       ├── admin/grant-subscription/route.ts # POST — Admin: Abo manuell vergeben
│       ├── admin/infra-status/route.ts  # GET — Admin: Infra-Status
│       ├── admin/create-customer/route.ts # POST — Admin: Kunden anlegen
│       ├── admin/create-org/route.ts    # POST — Admin: B2B-Organisation anlegen
│       ├── admin/customers/route.ts     # GET — Admin: Kundenliste
│       ├── einrichtung/status/route.ts  # GET — Org-Status für eingeloggte Einrichtung
│       ├── einrichtung/invite/route.ts  # POST — Einladung senden
│       ├── einrichtung/invite/accept/route.ts # POST — Einladung annehmen
│       ├── einrichtung/members/route.ts # GET — Mitgliederliste der Einrichtung
│       ├── health/route.ts             # GET — Öffentlicher Health-Check (kein Auth!) für UptimeRobot
│       ├── cron/rechts-update/route.ts # GET — Monatlicher Cron (1. des Monats, 03:00 UTC)
│       ├── cron/agent-batch/route.ts   # GET — Wöchentlicher Cron AG09/AG10/AG11 (Sonntag 02:00 UTC)
│       ├── cron/backend-health/route.ts # GET — Täglicher Cron 03:00 UTC: DB-Health + Kosten-Anomalien
│       ├── cron/costs-monitor/route.ts  # GET — Täglicher Cron 07:00 UTC: Claude-API-Kosten-Tracking
│       ├── cron/design-audit/route.ts   # GET — Wöchentlicher Cron Di 04:00 UTC: Lighthouse + Core Web Vitals
│       ├── cron/vercel-monitor/route.ts # GET — Täglicher Cron 06:00 UTC: AG16 Deployment-Check
│       ├── cron/agent-audit/route.ts    # GET — Wöchentlicher Cron Mi 05:00 UTC: AG17 Metriken
│       ├── cron/content-audit/route.ts  # GET — Monatlicher Cron 15. 01:00 UTC: AG18 Content-Audit
│       └── cron/design-guardian/route.ts # GET — Wöchentlicher Cron Do 05:00 UTC: AG19 Design-Guardian
├── components/
│   ├── LetterPDF.tsx                   # DIN A4 PDF-Vorschau (@react-pdf/renderer)
│   ├── DownloadButton.tsx              # PDF-Download (jspdf)
│   ├── SiteNav.tsx                     # Navigation (Desktop)
│   ├── MobileNav.tsx                   # Navigation (Mobile)
│   ├── SiteFooter.tsx                  # Footer
│   ├── DemoAnimation.tsx               # Startseiten-Animation (größte Komponente)
│   ├── PrivacyModal.tsx                # Datenschutz-Modal
│   ├── PseudonymizationPreviewModal.tsx # PII-Vorschau vor Analyse
│   ├── ScrollReveal.tsx                # Scroll-Animation
│   ├── ThemeToggle.tsx                 # Dark/Light Toggle
│   ├── TestimonialsBlock.tsx           # Bewertungen
│   ├── CustomerCount.tsx               # Live-Kundenzähler
│   ├── VisitorCount.tsx                # Besucherzähler
│   ├── MarkdownContent.tsx             # Markdown-Renderer
│   ├── RecoveryRedirect.tsx            # Auth-Recovery-Redirect
│   ├── CommandPalette.tsx              # Cmd+K Command Palette
│   ├── B2BThemeInit.tsx                # B2B Theme-Initialisierung
│   ├── RoiCalculator.tsx               # ROI-Kalkulator (B2B)
│   ├── EmptyState.tsx                  # Leerzustand-Platzhalter
│   └── Skeleton.tsx                    # Loading-Skeleton
├── lib/
│   ├── logic/
│   │   ├── agent_engine.ts             # KERN — Claude Tool-Use Loop, 4 Skills, Routing
│   │   └── engine.ts                   # Legacy GPT-4o Fallback — nicht weiterentwickeln
│   ├── privacy/
│   │   ├── pseudonymizer.ts            # PII-Anonymisierung (Namen, IBAN, Geburtsdaten, etc.)
│   │   └── pseudonymizer.test.ts       # Tests
│   ├── supabase/
│   │   ├── client.ts                   # Frontend-Client (Anon Key) ← DIESEN VERWENDEN
│   │   ├── middleware.ts               # Server-Client (SSR Session-Refresh)
│   │   └── auth.ts                     # Shared Auth-Helper: getAuthenticatedUser(req) → {id, token} | null
│   ├── error-reporter.ts               # Zentrales Error-Tracking (Sentry wenn SENTRY_DSN gesetzt, sonst structured logging)
│   ├── rate-limit.ts                   # API Rate-Limiting
│   ├── supabase.ts                     # LEGACY-Client — NICHT verwenden, nur noch für Abwärtskompatibilität
│   ├── page-translations.ts            # i18n DE/RU/EN/AR/TR (32KB) ← ALLE Strings hier
│   ├── translations.ts                 # Minimal-Wrapper (7 Zeilen) — page-translations.ts ist die echte Datei
│   ├── letter-generator.ts             # Brief-Template + TRAEGER_TO_PREFIX Mapping
│   ├── blog.ts                         # Blog-Loader (gray-matter)
│   ├── ai-system-prompt.txt            # Legacy-Stub — nicht verwenden
│   └── vault/internal_rules.json       # Interne Regeln (in .gitignore)
├── data/blog/posts.ts                  # Blog-Metadaten
content/                                # GESCHÜTZT — Hook blockiert Edits ohne Freigabe
├── behoerdenfehler_logik.json          # 128 Fehlertypen, 16 Träger/Rechtsgebiete, 3 Severity-Stufen
├── weisungen_2025_2026.json            # BA-Weisungen 2025/2026
├── *_quellen.md                        # 12 Quellensammlungen pro Rechtsgebiet (SGB II–IX, BAMF, etc.)
├── behoerden_checkliste.md             # Prüfliste Behörden
├── behoerden_traeger_uebersicht.md     # Träger-Übersicht
└── blog/                               # 5 Markdown-Blogartikel
supabase/                               # SQL-Migrations (manuell via SQL-Editor deployen)
├── wissensdatenbank.sql                # urteile, kennzahlen, behoerdenfehler, update_protokoll, sessions, analysis_results
├── fristen_table.sql                   # user_fristen
├── feedback_table.sql                  # site_feedback
├── feedback_policies.sql               # RLS für Feedback
├── b2b_organizations.sql               # B2B-Organisationen + Einladungen + RLS
├── ag15-monitor.sql                    # AG15 Rechts-Monitor Tabellen
├── rls_fix_plans_single_purchases.sql  # RLS-Fix für plans/single_purchases
└── supabase_subscription_table_FIXED.sql # Subscription-Tabelle (korrigiert)
```

---

## Engineering Standards

- **Demand Elegance (Boris Cherny):** Sauberste Architektur. Keine "hacky" Lösungen.
- **Minimal Impact:** Nur das Notwendige ändern. Kein Code-Drift.
- **Plan-First:** `/plan` für Änderungen > 3 Zeilen.
- **No Logic Compression:** JSON-Logik in `content/` darf niemals gekürzt werden. Einzeiler = Fail.
- **CLI Verification:** Erfolg muss durch CLI bewiesen werden (`npm run build`, `npx tsc --noEmit`).
- **Legal Compliance:** Nur 2026er Gesetze aus `compliance/` verwenden.
- **Contrast Excellence:** Light-Mode Kontrast gemäß WCAG AAA (> 7:1).
- **Logic Isolation:** `schema_analysis.json` (Input) und `schema_generation.json` (Output) strikt trennen.
- **Performance Budget:** API-Latenz < 200ms. Frontend-Bundle < 150kb (gzip).
- **Verified Sources Only:** Jede Regel in `compliance/` braucht eine Quell-URL.
- **Command Persistence:** Agenten-Prompts in `FINAL_SYSTEM_ORCHESTRATION.md` pflegen.

---

## Architektur-Gesetze

- KI-Logik **nur** in `src/lib/logic/` — nie in Komponenten oder API-Routes
- API-Calls **nur** über `src/app/api/` — nie direkt Frontend → KI-Provider
- Übersetzungen **nur** über `src/lib/page-translations.ts` — nie hardcoded, nie in `translations.ts`
- Supabase: **`supabase/client.ts`** für Frontend, **`supabase/middleware.ts`** für Server. **Nicht** `supabase.ts` (Legacy)
- API-Routes: **Auth prüfen BEVOR Logik** ausgeführt wird
- `content/` und `vault/` **nie ohne explizite Freigabe** anfassen
- Lazy Loading + minimale Bundle-Size — jede Komponente nur laden wenn sichtbar

---

## Agent Engine (src/lib/logic/agent_engine.ts)

**Aktueller Stand:** 13-Agenten-Pipeline + 7 Cron-Agenten vollständig implementiert in `src/lib/logic/agents/`.
`agent_engine.ts` ist ein dünner Wrapper über `agents/orchestrator.ts`.

**Pipeline:** AG08 → AG12 → AG01 → [AG02 ‖ AG04] → AG03 → [AG07 ‖ AG14] → AG13

| Agent | Datei | Rolle |
|---|---|---|
| AG01 | ag01-orchestrator.ts | Triage-Agent (Rechtsgebiet, Dringlichkeit, Routing) |
| AG02 | ag02-analyst.ts | Bescheid-Analyse (Klasssifikation, Fehler) |
| AG03 | ag03-critic.ts | Qualitätskritiker (Erfolgschance, Lücken) |
| AG04 | ag04-researcher.ts | Recherche-Agent (Urteile, Weisungen) |
| AG05 | ag05-knowledge-manager.ts | Wissensdatenbank-Schreiber |
| AG06 | ag06-prompt-optimizer.ts | Prompt-Optimierung |
| AG07 | ag07-letter-generator.ts | Musterschreiben-Generator |
| AG08 | ag08-security-gate.ts | Eingangs-Sicherheitsfilter |
| AG09–13 | ag09–ag13-*.ts | Frontend/Backend/DevOps/Dokument/Erklärer |
| AG14 | ag14-praezedenz-analyzer.ts | Präzedenzfall-Analyse (DB-only) |
| AG15 | ag15-rechts-monitor.ts | Rechts-Monitor (1. des Monats) |
| AG16 | ag16-vercel-agent.ts | Vercel-Ops (täglich 06:00 UTC) |
| AG17 | ag17-agent-auditor.ts | Agent-Auditor (Mi 05:00 UTC) |
| AG18 | ag18-content-auditor.ts | Content-Auditor (15. des Monats 01:00 UTC) |
| AG19 | ag19-design-guardian.ts | Design-Guardian (donnerstags 05:00 UTC) |

**Routing nach Dringlichkeit:**
- NORMAL (>14 Tage Frist) → `claude-sonnet-4-6`
- HOCH (7–14 Tage) → `claude-sonnet-4-6`
- NOTFALL (<7 Tage / Vollstreckung) → `claude-opus-4-6`

---

## Supabase

- Projekt: `xprrzmcickfparpogbpj`
- **Aktive Tabellen:** analyses, documents, plans, profiles, single_purchases, site_feedback, subscriptions, usage, usage_counters, user_subscriptions, user_fristen, organizations, organization_members, organization_invites, analysis_results
- **Wissensdatenbank (SQL existiert in `supabase/wissensdatenbank.sql`, manuell via SQL-Editor zu deployen):** urteile, kennzahlen, behoerdenfehler, update_protokoll, sessions, analysis_results
- **Setup:** `npx ts-node -r tsconfig-paths/register scripts/setup-wissensdatenbank.ts` prüft Tabellen-Status und gibt Deploy-Anleitung aus
- Keys in `.env.local` — Werte nie ausgeben, nur Existenz prüfen

---

## Design System

Vollstaendige Referenz: `/design-system` Slash-Command (`.claude/commands/design-system.md`)

```
Background:    var(--bg) → #05070a (dark) / #f1f5f9 (light)
Cards:         bg-white/[0.03]  border border-white/10  rounded-2xl
Akzent:        var(--accent) #0ea5e9 (sky-500) → var(--accent-hover) #38bdf8 (dark) / #0284c7 (light)
Text:          white (H1)  white/40 (Labels via .label-upper)  gray-500 (Body)
Severity:      red-500 (kritisch)  amber-500 (wichtig)  blue-500 (hinweis)  green-500 (erfolg)
Font:          Outfit (var(--font-outfit)), font-mono fuer Code-Output
Buttons Nav:   rounded-full    Buttons CTA:   rounded-2xl
Headlines:     font-black tracking-tight    Labels: tracking-widest / tracking-[0.25em]
```

Mobile first (375px zuerst). Arabisch (AR) → `dir="rtl"`. Fehler freundlich formulieren. Fortschritt immer sichtbar. Consent/Datenschutz prominent.

---

## Juristische Schutzmauer

- **§ 2 RDG:** Kein Ersatz für Rechtsberatung — Disclaimer immer sichtbar
- **Null Halluzinationen:** Kein erfundener Paragraph, kein erfundenes Urteil
- Bei juristischer Unsicherheit: „nicht sicher" sagen, nicht raten
- Severity: `kritisch` (Leistungsanspruch/Frist), `wichtig` (Verfahrensfehler), `hinweis` (Infopflicht)

**Antrags-Generator:** Aktenzeichen + Bescheiddatum Pflicht. PDF DIN A4 (70pt/57pt, Helvetica 11pt). Dateiname: `BescheidRecht_[AZ]_[Datum].pdf`. Nie „rechtssicher" → „professionell". Nie „Antrag" → „Schreiben-Entwurf". Disclaimer § 2 RDG am Ende.

**Blog:** CTA → `/#pricing` oder `/b2b`. Meta-Tags Pflicht. Disclaimer § 2 RDG.

---

## Gotchas

1. **Drei Supabase-Dateien existieren.** `src/lib/supabase.ts` ist ein Legacy-Wrapper — **nicht verwenden**. Korrekt: `src/lib/supabase/client.ts` (Frontend), `src/lib/supabase/middleware.ts` (Server), `src/lib/supabase/auth.ts` (API-Route Auth-Guard). Falscher Import = subtile Auth-Bugs.

2. **Zwei Translations-Dateien existieren.** `translations.ts` (7 Zeilen, Minimal-Wrapper) und `page-translations.ts` (32KB, die echte). **Immer `page-translations.ts` verwenden.**

3. **Fristen-API nutzt User-JWT, nicht Service-Role-Key.** RLS-Policies von `user_fristen` filtern nach `auth.uid()`. Service-Key umgeht RLS → Sicherheitslücke.

4. **Fehlerkatalog hat 163 Einträge (16 Rechtsgebiete)** mit festem Schema: `id` (string, z.B. "BA_001"), `titel`, `beschreibung`, `rechtsbasis[]`, `severity` ("hinweis"|"wichtig"|"kritisch"), `prueflogik` ({bedingungen[], suchbegriffe[]}), `musterschreiben_hinweis`, `severity_beschreibung`. Schema wird per Test validiert (`content/__tests__/fehlerkatalog-schema.test.ts`).

5. **Middleware refresht Supabase-Session bei JEDEM Request.** Fehlende Keys → silent `NextResponse.next()` statt Crash. Fehlende Env-Vars verursachen leise Auth-Fehler, keine lauten.

6. **Zwei PDF-Libraries installiert.** `@react-pdf/renderer` für Vorschau (`LetterPDF.tsx`), `jspdf` für Download (`DownloadButton.tsx`). Nicht verwechseln.

7. **`frist_datum` ist ein ISO-String.** `tage_verbleibend` immer zur Laufzeit berechnen, nie in DB speichern.

8. **OCR-Fallback (tesseract.js) ist langsam** (~5–15 Sek/Seite). `pdf2json` ist primär. Tesseract nur wenn kein Text gefunden.

9. **Zehn Vercel Crons (vercel.json):**
   - `rechts-update` → 1. des Monats 03:00 UTC (AG15 Rechts-Monitor)
   - `agent-batch` → Sonntag 02:00 UTC (AG09/AG10/AG11)
   - `backend-health` → täglich 03:00 UTC (DB-Health + Kosten-Anomalien → GitHub Issue)
   - `costs-monitor` → täglich 07:00 UTC (Claude-API-Kosten-Tracking + Alert)
   - `design-audit` → Di 04:00 UTC (Lighthouse + Core Web Vitals → GitHub Issue)
   - `vercel-monitor` → täglich 06:00 UTC (AG16 Deployment-Check)
   - `agent-audit` → Mi 05:00 UTC (AG17 Agent-Metriken → GitHub Issue)
   - `content-audit` → 15. des Monats 01:00 UTC (AG18 Kennzahlen/Fehlerkatalog/Weisungen-Audit → GitHub Issue)
   - `design-guardian` → Do 05:00 UTC (AG19 Statische Design-System-Analyse → GitHub Issue)
   Alle: Auth via `?secret=CRON_SECRET`. Manuell: `curl "http://localhost:3000/api/cron/design-guardian?secret=$CRON_SECRET"`.

10. **SSE-Streaming** (`/api/assistant/route.ts`) nutzt `ReadableStream` + `TextEncoder`. Client: `reader.read()` in While-Schleife. Kein EventSource API.

11. **Legacy Engine** (`engine.ts`, GPT-4o) springt ein wenn ANTHROPIC_API_KEY fehlt. Nicht löschen, nicht weiterentwickeln.

12. **`mollie/webhook/route.ts` ist der produktive Payment-Webhook** — verarbeitet Mollie-Zahlungen (paid/failed/expired). Beim Erstellen einer Zahlung via Mollie API: `metadata: { product_key: "starter"|"team"|"einrichtung", buyer_email: "..." }`. MOLLIE_API_KEY Pflicht.

13. **19-Agenten-System vollständig implementiert** in `src/lib/logic/agents/` (AG01–AG18 + orchestrator.ts). `agent_engine.ts` ist nur ein dünner Wrapper. Die `wissensdatenbank.sql`-Tabellen (urteile, kennzahlen, analysis_results etc.) müssen noch manuell in Supabase deployed werden — erst dann können AG04/AG05 in die DB schreiben.

14. **`vault/` enthält echte Credentials** (`keys.env`, `provider_logins.txt`). In `.gitignore`, aber als Entwickler nie darin stöbern oder Inhalte ausgeben. **Dev-Workaround:** 4 Routes (`analyze`, `generate-letter`, `assistant`, `agents/utils.ts`) lesen `vault/keys.env` via `fs.readFileSync` als lokalen Key-Fallback. Auf Vercel scheitert das stumm (`try/catch`) und es werden ENV-Vars verwendet. Das ist Absicht — nicht "fixen".

15. **Tailwind v4 + ESLint Flat Config.** Keine `tailwind.config.js` — Tailwind läuft über `postcss.config.js` mit `@tailwindcss/postcss`. Keine `.eslintrc.json` — ESLint nutzt `eslint.config.mjs` (Flat Config). Theme-Werte in CSS-Variablen, nicht in JS-Config.

16. **B2B-Modul (Einrichtungen).** `einrichtung/` Pages + API-Routes bilden ein Org-Verwaltungssystem: Org anlegen (`admin/create-org`), Mitarbeiter einladen (`einrichtung/invite`), Einladung annehmen (`einrichtung/invite/accept`), Mitglieder verwalten (`einrichtung/members`). DB-Schema in `supabase/b2b_organizations.sql`. Einrichtungs-Routes nutzen User-JWT + Org-Zugehörigkeitsprüfung.

17. **GitHub Actions (4 Workflows).** `ci.yml` (Build/Test/E2E+Playwright), `pr-review.yml` (AG-CRITIC Claude PR-Review), `security.yml` (npm audit + Secrets-Scan), `uptime.yml` (Health-Check alle 5 Min). E2E-Tests laufen in CI mit Chromium, Screenshots werden als Artifacts gespeichert (30 Tage). Secrets: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, CRON_SECRET, NEXT_PUBLIC_APP_URL.

---

## Environment Variables

Benötigt in `.env.local` (Werte nie ausgeben):

```
NEXT_PUBLIC_SUPABASE_URL       # Supabase Projekt-URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Öffentlicher Anon Key
SUPABASE_SERVICE_ROLE_KEY      # Server-Only, NIE im Frontend
ANTHROPIC_API_KEY              # Claude API
OPENAI_API_KEY                 # GPT-4o Fallback (OCR)
CRON_SECRET                    # Auth für alle Cron-Endpunkte
TAVILY_API_KEY                 # Web-Recherche für AG04 (optional, AG04 läuft ohne)
MOLLIE_API_KEY                 # Mollie Payment Webhook (live_ oder test_) — noch nicht aktiv, KYC offen
ADMIN_EMAILS                   # Komma-separierte Admin-E-Mails
ADMIN_SECRET                   # Admin-Authentifizierung
```

Infrastruktur:
```
VERCEL_TOKEN                   # Vercel API (AG16 Deployment-Check)
VERCEL_TEAM_ID                 # Vercel Team-ID
GITHUB_TOKEN                   # GitHub API (AG15/AG16/AG17 Issues/PRs)
GITHUB_REPO                    # Format: owner/repo
CLOUDFLARE_DOMAIN              # Cloudflare Domain
CLOUDFLARE_TOKEN               # Cloudflare API-Token
UPSTASH_REDIS_REST_URL         # Redis für Rate-Limiting (rate-limit.ts)
UPSTASH_REDIS_REST_TOKEN       # Redis Auth-Token
```

Monitoring:
```
SENTRY_DSN                     # Sentry Error-Tracking
NEXT_PUBLIC_SENTRY_DSN         # Sentry Client-Side (gleicher Wert wie SENTRY_DSN)
SENTRY_AUTH_TOKEN              # Sentry Release-Upload
SENTRY_ORG                     # Sentry Organisation
SENTRY_PROJECT                 # Sentry Projektname
SENTRY_URL                     # Sentry URL
NEXT_PUBLIC_APP_URL            # Produktions-URL für Lighthouse-Audit (https://bescheidrecht.de)
PAGESPEED_API_KEY              # Google PageSpeed Insights API Key (optional, ohne Key: 25 req/Tag limit)
```

**GitHub Actions Secrets (in Repo → Settings → Secrets):**
```
ANTHROPIC_API_KEY              # Für AG-CRITIC automatisches PR-Review
NEXT_PUBLIC_SUPABASE_URL       # Für Build-Job
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Für Build-Job
CRON_SECRET                    # Für Cron-Endpunkte
NEXT_PUBLIC_APP_URL            # Für Lighthouse
```

---

## Workflow

**Vor jeder Änderung:** Was genau verlangt? Was kann schiefgehen (Auth, Daten, Mobile)? Beste Lösung? 100% sicher → handle. Unsicher → sage es.

**Checkliste vor Ausgabe:** Problem oder Symptom gelöst? TypeScript strict? Auth geprüft? Mobile 375px? Keine Daten-Leaks? Deutsche Meldungen? Imports komplett? Nichts weggelassen?

**Kommunikation:** Max drei Sätze — was getan, warum, was prüfen. Fehler sofort ansprechen.

---

## Verbote

- `content/` oder `vault/` ohne explizite Freigabe ändern
- `backups/` produktiv verwenden
- Auth oder DB-Schema eigenständig ändern
- Halbfertigen Code liefern
- Sensible Daten ins Frontend oder in Logs ausgeben
- Bei juristischen Inhalten raten
- `any` in TypeScript
- Hardcoded Strings statt `page-translations.ts`
- Service-Role-Key in Frontend oder User-Context API-Routes
- `package-lock.json` manuell editieren
- `src/lib/supabase.ts` (Legacy) in neuem Code importieren
