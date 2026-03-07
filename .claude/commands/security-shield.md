# BescheidRecht — Security Shield

Du bist Chief Security Officer. Scanne das gesamte System auf Sicherheitslücken: API-Auth, RLS, DSGVO, OWASP, PII, Secrets. Keine Lücke bleibt unentdeckt. Bei kritischen Funden: direkt fixen.

---

## PHASE 1 — API-ROUTES AUTH-AUDIT

Scanne alle Dateien in `src/app/api/**/*.ts` (parallel lesen):

Für jede Route prüfen:
- Wird `getAuthenticatedUser(req)` VOR der Logik aufgerufen?
- Wird bei `null` return sofort mit 401 abgebrochen?
- Wird `SUPABASE_SERVICE_ROLE_KEY` nur in Server-Contexts verwendet?
- Kein Service-Role-Key in User-Context Routes (fristen, analyze, etc.)?

```bash
cd /home/henne1990/bescheidrecht-frontend
grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/app/ --include="*.ts"
grep -rn "getAuthenticatedUser" src/app/api/ --include="*.ts"
```

Finde Routes die Auth haben sollten aber keine `getAuthenticatedUser`-Prüfung:
```bash
grep -rL "getAuthenticatedUser" src/app/api/ --include="*.ts" | grep -v "admin\|cron\|webhook\|auth-config\|stats\|customer"
```

---

## PHASE 2 — RLS-AUDIT (Supabase)

Via Supabase MCP:
```sql
-- Tabellen ohne Row Level Security
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;

-- Aktive RLS-Policies
SELECT tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Kritisch: User-Tabellen (`profiles`, `user_fristen`, `subscriptions`, `usage`) MÜSSEN RLS = true haben.
Wissensdatenbank-Tabellen (`urteile`, `kennzahlen`) sollten read-only für auth users sein.

---

## PHASE 3 — SECRET-SCAN

```bash
cd /home/henne1990/bescheidrecht-frontend

# Hardcoded Keys im Code?
grep -rn "sk-\|supabase\|anthropic\|Bearer " src/ --include="*.ts" --include="*.tsx" | \
  grep -v "Authorization.*Bearer\|process\.env\|//.*example"

# .env-Dateien in Git?
git log --oneline --diff-filter=A -- "*.env" "*.env.*" 2>/dev/null | head -5

# package.json scripts die Secrets exposen?
grep -n "API_KEY\|SECRET\|TOKEN" package.json
```

---

## PHASE 4 — PII-AUDIT

```bash
cd /home/henne1990/bescheidrecht-frontend

# console.log mit potentiell sensiblen Daten
grep -rn "console\.log\|console\.error" src/ --include="*.ts" --include="*.tsx" | \
  grep -i "user\|email\|name\|address\|iban\|birth" | head -20

# Pseudonymizer wird genutzt?
grep -rn "pseudonymize\|Pseudonymizer" src/app/api/ --include="*.ts" | head -10
```

Pseudonymizer MUSS vor KI-API-Calls aktiv sein (in analyze/route.ts).

---

## PHASE 5 — OWASP TOP 10 CHECK

### A01 — Broken Access Control
- Prüfe: können User auf andere User-Daten zugreifen?
- Ist `/api/admin/` mit Admin-Check gesichert?
```bash
grep -n "admin\|isAdmin\|role" src/app/api/admin/ --include="*.ts" -r
```

### A02 — Cryptographic Failures
- Passwörter werden NICHT im Code gespeichert (Supabase Auth)
- Supabase JWT-Verifizierung aktiv?

### A03 — Injection
- Werden User-Inputs direkt in Supabase-Queries eingebaut?
```bash
grep -rn "\.query\|\.from.*\${" src/ --include="*.ts" | grep -v "test\|spec" | head -10
```

### A05 — Security Misconfiguration
- CORS in next.config.js zu offen?
- Debug-Endpoints in Produktion?
```bash
grep -n "auth-debug\|test-ki" src/app/api/ -r --include="*.ts" | head -5
```

### A07 — Authentication Failures
- Session-Timeout konfiguriert?
- Rate-Limiting auf /api/analyze?

---

## PHASE 6 — DSGVO-COMPLIANCE

```bash
cd /home/henne1990/bescheidrecht-frontend

# Datenschutzerklärung und Impressum vorhanden?
ls src/app/datenschutz/ src/app/impressum/ src/app/agb/ 2>&1

# Consent vor Datenverarbeitung?
grep -rn "PrivacyModal\|Einwilligung\|consent" src/ --include="*.tsx" | head -10

# Bescheid-Upload: PII-Warning vorhanden?
grep -rn "PseudonymizationPreviewModal" src/ --include="*.tsx" | head -5
```

---

## PHASE 7 — CRON-SECURITY

```bash
# Cron-Endpoints: Secret-Check vorhanden?
grep -n "CRON_SECRET" src/app/api/cron/ -r --include="*.ts"

# Mollie Webhook: Signatur-Validierung?
grep -n "signature\|x-mollie\|verify" src/app/api/mollie/ -r --include="*.ts"
```

---

## AUSGABE

```
╔══════════════════════════════════════════════════════╗
║  SECURITY SHIELD REPORT — [Datum]                   ║
╠══════════════════════════════════════════════════════╣
║  API AUTH          ║  [N Routes geprüft]             ║
║  RLS               ║  [N Tabellen OK / N ohne RLS]   ║
║  Secrets           ║  [Keine Leaks / Leak gefunden!] ║
║  PII-Protection    ║  [Pseudonymizer aktiv/inaktiv]  ║
║  DSGVO             ║  [OK / Lücken]                  ║
║  OWASP             ║  [Score N/10]                   ║
╚══════════════════════════════════════════════════════╝

KRITISCH (sofort beheben):
❌ [Problem] → [Datei:Zeile] → [Konkreter Fix]

WICHTIG (diese Woche):
⚠️ [Problem] → [Empfehlung]

ALLES OK:
✅ [Was sicher ist]
```

Bei KRITISCHEN Funden: sofort den Fix implementieren (nach Abfrage beim User).

---

## REGELN

- Keine API-Keys oder Secrets ausgeben
- Keine User-Daten ausgeben
- Kritische Findings immer mit Datei:Zeile
- Fix-Vorschlag immer konkret (kein "sollte verbessert werden")
