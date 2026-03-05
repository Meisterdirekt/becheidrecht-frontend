# BescheidRecht – Projekt-Audit & Live-Checkliste

Stand: Februar 2026. Vollständiger Durchlauf: Was ist da, was harmoniert, was fehlt für Go-Live.

---

## 1. Was funktioniert und ist verbunden

| Bereich | Status | Details |
|--------|--------|---------|
| **Middleware** | ✅ | `updateSession` (Supabase) läuft auf allen Routen, Cookies werden gesetzt. |
| **Auth-Config** | ✅ | `/api/auth-config` liefert Supabase URL/AnonKey aus Env (auch ohne NEXT_PUBLIC_* beim Build). |
| **Forgot Password** | ✅ | Nutzt Supabase `resetPasswordForEmail`, auth-config, Redirect auf `/reset-password`. |
| **Reset Password** | ✅ | Liest Recovery aus Hash/Query, `updateUser({ password })`, Redirect zur Startseite. |
| **RecoveryRedirect** | ✅ | Leitet `#type=recovery` auf `/reset-password` um. |
| **Subscription-API** | ✅ | `subscription-status` und `use-analysis` mit Bearer-Token, lesen/schreiben `user_subscriptions`. |
| **Grant-Subscription** | ✅ | Admin-API schreibt `user_subscriptions` (Service Role), Abo-Typen und Analysen-Anzahl konsistent. |
| **Analyze-API** | ✅ | PDF/Image → Text-Extraktion, `runForensicAnalysis`, content/ + vault-Fallback, JSON-Response. |
| **Engine** | ✅ | Lädt `behoerdenfehler_logik.json`, `weisungen_2025_2026.json`, omega_prompt/error_catalog aus vault, strikte JSON-Ausgabe, RDG-konforme Formulierungen. |
| **Supabase DB** | ✅ | `supabase_subscription_table_FIXED.sql`: Tabelle + Trigger `on_auth_user_created` → neuer User bekommt Zeile in `user_subscriptions` (free, 0 Analysen). |
| **Rechtliche Seiten** | ✅ | Impressum, Datenschutz, AGB vorhanden; Landing verlinkt sie. |
| **Design-System** | ✅ | Landing: bg-[#05070a], Cards, blue-600, Mehrsprachigkeit DE/RU/EN/AR/TR in page.tsx. |

---

## 2. Was vorhanden ist, aber nicht fertig / nicht verbunden

| Bereich | Problem | Auswirkung |
|--------|--------|------------|
| **Login** | Kein Supabase-Aufruf | Formular sendet nur `console.log` – niemand kann sich anmelden. |
| **Register** | Kein Supabase-Aufruf | Kein `signUp` – kein User in `auth.users`, kein Trigger, kein Eintrag in `user_subscriptions`. |
| **Startseite „Dokument hochladen“** | `onClick` ist leer (TODO) | Button mit Consent macht nichts. |
| **FileUpload-Komponente** | Kein API-Call | Nur lokaler State + 2s Timeout – keine Analyse, kein `/api/analyze`, kein `use-analysis`. |
| **Upload-Route** | Stub | `POST /api/upload` antwortet nur `{ success: true }` – wird nirgends für echten Upload genutzt. |
| **test-ki** | Falsches API-Format | Sendet `JSON.stringify({ text })`, Analyze erwartet `FormData` mit `file` → 400 „Datei fehlt“. |
| **Pricing-Komponente** | Nicht eingebunden | Landing hat eigenes Pricing-Inline; `Pricing.tsx` (Basic/Pro) wird nirgends verwendet. |
| **Übersetzungen** | Zwei Quellen | Landing: eigenes `translations`-Objekt in page.tsx; `src/lib/translations.ts` nur minimale Einträge – Projektregel „nur über translations.ts“ verletzt. |

---

## 3. Fehlende oder falsche Verknüpfungen (Harmonie)

| Thema | Detail |
|-------|--------|
| **Passwort vergessen – Link** | Login verlinkt `/passwort-vergessen`, Route existiert nur als `/forgot` → 404. |
| **Dashboard** | Login-Kommentar `router.push('/dashboard')` – Route `/dashboard` existiert nicht. |
| **Nach Login/Register** | Kein definierter Zielort für eingeloggte User (kein Dashboard, keine „Mein Bereich“-Seite mit Upload). |
| **Analyze ohne Auth** | `/api/analyze` prüft weder Session noch Bearer – jeder kann die Route aufrufen und OpenAI-Kosten auslösen. |
| **Admin ungeschützt** | `/admin` und `POST /api/admin/grant-subscription` ohne Auth – jeder mit URL kann Abos vergeben. |
| **Supabase Client** | `createClient(supabaseUrl!, supabaseAnonKey!)` – bei fehlenden Env-Vars Laufzeitfehler statt klarer Fehlermeldung. |

---

## 4. Was für Go-Live noch fehlt

### 4.1 Auth & Nutzerfluss (kritisch)

- [ ] **Login** mit Supabase: `supabase.auth.signInWithPassword({ email, password })`, bei Erfolg Redirect auf eine geschützte Seite (z. B. `/dashboard` oder Startseite mit „eingeloggt“-Zustand).
- [ ] **Register** mit Supabase: `supabase.auth.signUp({ email, password, options })` (ggf. Redirect zur E-Mail-Bestätigung oder direkt einloggen); Trigger füllt `user_subscriptions`.
- [ ] **Link „Passwort vergessen“**: Auf `/forgot` zeigen (oder Route `/passwort-vergessen` nach `/forgot` redirecten).
- [ ] **Ziel nach Login**: Route anlegen (z. B. `/dashboard`) oder Startseite so erweitern, dass nach Login Upload-Bereich + Abo-Status sichtbar sind.

### 4.2 Upload → Analyse → Verbrauch (kritisch)

- [ ] **Startseite oder Dashboard**: Nach Consent „Dokument hochladen“ so umsetzen, dass ein Upload-Modal oder eine Upload-Seite geöffnet wird (mit eingeloggtem User).
- [ ] **FileUpload** anbinden: Datei als `FormData` an `POST /api/analyze` senden; Antwort (musterschreiben, fehler, zuordnung) anzeigen.
- [ ] **Auth in Analyze**: Vor der Analyse Session/Bearer prüfen; nur eingeloggte User mit `analyses_remaining > 0` zulassen (oder klare Regel: z. B. nur mit gültigem Token).
- [ ] **Nach erfolgreicher Analyse**: `POST /api/use-analysis` mit Bearer-Token aufrufen, damit `analyses_remaining` dekrementiert wird.
- [ ] **Ergebnis-UI**: Analyse-Ergebnis anzeigen + DownloadButton für Musterschreiben (z. B. PDF); Fehlermeldung bei 403 (keine Analysen mehr).

### 4.3 Abo & Zahlung

- [ ] **Webhook** `/api/webhook`: Aktuell Stub. Für echte Abrechnung (z. B. Stripe/Paddle) Signatur prüfen, `user_subscriptions` aktualisieren (analyses_total, analyses_remaining, expires_at).
- [ ] **Pricing/Checkout**: Klären, ob Einzelkauf oder Abos über externen Payment laufen; dann Buttons mit Checkout-Links oder API anbinden.

### 4.4 Admin & Sicherheit

- [ ] **Admin schützen**: `/admin` nur für bestimmte User (z. B. E-Mail-Liste oder Supabase-Rolle) zugänglich; Middleware oder Server-Check. `POST /api/admin/grant-subscription` mit Admin-Check (z. B. Service-Role oder eigener Admin-Token).
- [ ] **Env für Produktion**: `.env.example` um `SUPABASE_SERVICE_ROLE_KEY` ergänzen (für use-analysis und grant-subscription); dokumentieren, dass OPENAI_API_KEY auf Vercel gesetzt werden muss.

### 4.5 Optional vor Live

- [ ] **test-ki** anpassen: Entweder Analyze mit `FormData` + Test-PDF aufrufen oder separate Test-Route, die Rohtext akzeptiert (nur für Dev/Staging).
- [ ] **Übersetzungen**: Landing-Strings in `src/lib/translations.ts` auslagern und auf der Landing nutzen (Projektregel).
- [ ] **Supabase Client**: Fallback bei fehlendem Env (z. B. klare Fehlermeldung oder „Auth nicht konfiguriert“), damit Build/Start nicht mit kryptischem Fehler abbricht.
- [ ] **Vault auf Vercel**: Sicherstellen, dass ohne vault/ die Env-Variablen (OPENAI_API_KEY, ggf. omega_prompt als Env) reichen; Engine-Fallback ist bereits vorhanden.

---

## 5. Kurzfassung: Harmonie & Prioritäten

- **Kern-Kette** (Registrierung → Login → Upload → Analyse → Verbrauch) ist an mehreren Stellen unterbrochen: Login/Register ohne Supabase, Upload-Button ohne Aktion, FileUpload ohne API, Analyze ohne Auth.
- **DB und Subscription-Logik** sind vorbereitet; sobald Register/Login Supabase nutzen, entstehen User und `user_subscriptions`-Einträge.
- **Erste Schritte für Live**: (1) Login + Register mit Supabase verbinden, (2) Link „Passwort vergessen“ auf `/forgot`, (3) Upload-Flow (Button → FileUpload → Analyze + use-analysis) mit Auth implementieren, (4) Analyze-Route mit Auth/Quota prüfen, (5) Admin + Webhook absichern und ggf. Zahlungsanbieter anbinden.

Dieses Dokument kann als Checkliste bis Go-Live genutzt werden; bei Änderungen im Code oder an der DB-Struktur die betroffenen Abschnitte anpassen.
