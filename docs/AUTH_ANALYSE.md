# Tiefenanalyse: Registrierung & Anmeldung

Wo es haken kann und wie du es prüfst.

---

## 1. Ablauf Registrierung (Schritt für Schritt)

```
User klickt "Kostenlos registrieren"
  → handleSubmit()
  → supabase.auth.signUp({ email, password, options })
```

**Mögliche Ergebnisse von signUp():**

| Supabase-Antwort | Was die App macht |
|------------------|-------------------|
| **Fehler** (z. B. "User already registered") | Fehlermeldung anzeigen, kein Redirect. |
| **data.user + data.session** (Confirm email AUS) | `setRedirecting(true)` → nach 2,5 s `window.location.href = '/'` → **Weiterleitung zur Startseite**. |
| **data.user, aber KEINE data.session** (Confirm email AN oder Supabase-Eigenheit) | App ruft sofort `signInWithPassword()` auf. Wenn das klappt → Redirect zu `/`. Wenn nicht (z. B. "Email not confirmed") → Anzeige "E-Mail geschickt" oder Fehlermeldung. |

**Wenn keine Weiterleitung passiert**, kommt die App in einen dieser Zustände:

- Es wird eine **Fehlermeldung** angezeigt (z. B. "Registrierung ok, Anmeldung fehlgeschlagen: …").
- Es wird **"Wir haben Ihnen eine E-Mail geschickt"** angezeigt (weil signIn fehlgeschlagen ist und als Grund "email not confirmed" erkannt wurde).
- Es passiert **gar nichts** (z. B. Timeout, Netzwerkfehler, unerwarteter Fehler).

---

## 2. Ablauf Login

```
User gibt E-Mail + Passwort ein → "Anmelden"
  → supabase.auth.signInWithPassword({ email, password })
```

| Ergebnis | Reaktion der App |
|----------|------------------|
| **Fehler** (Invalid login, Email not confirmed, …) | Fehlermeldung anzeigen. |
| **data.session** | `router.push('/')` + `router.refresh()` → Startseite. |

Wenn du nach Klick auf "Anmelden" nicht weitergeleitet wirst, liefert Supabase einen Fehler (z. B. "Invalid login" oder "Email not confirmed").

---

## 3. Wo die Config herkommt (kritisch)

- **Seiten /register, /login, /forgot, /reset-password:**  
  Beim Laden wird **`/api/auth-config`** aufgerufen. Die API liest auf dem **Server**:
  - `process.env.NEXT_PUBLIC_SUPABASE_URL` oder `process.env.SUPABASE_URL`
  - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` oder `process.env.SUPABASE_ANON_KEY`
  Liefert die API `configured: true` und `url` + `anonKey`, baut die App einen **Supabase-Browser-Client** mit genau diesen Werten.

- **Middleware** (läuft bei jedem Request):  
  Aktualisiert die Session (Cookies). Sie nutzt jetzt **dieselben** Env-Variablen (mit Fallback auf `SUPABASE_URL` / `SUPABASE_ANON_KEY`).  
  **Wichtig:** Wenn hier keine URL/Key gesetzt sind, wird die Session nicht serverseitig gesetzt/aktualisiert – dann kann die Weiterleitung nach Login/Registrierung „wirken“, aber beim nächsten Request wirkt der User trotzdem nicht eingeloggt.

**Fazit:**  
Auth-Config und Middleware müssen **dasselbe** Supabase-Projekt verwenden. Das ist der Fall, wenn in Vercel (oder lokal) dieselben Werte gesetzt sind (entweder beide NEXT_PUBLIC_* oder beide SUPABASE_* oder eine Mischung, die auf dasselbe Projekt zeigt).

---

## 4. Typische Fehlerquellen

| Problem | Was prüfen |
|--------|-------------|
| **Keine Weiterleitung nach Registrierung** | 1) Supabase: **Authentication → Providers → Email → Confirm email** = **AUS**. 2) Nach Registrierung erscheint eine **sichtbare Fehlermeldung**? Dann diese lesen (z. B. "Email not confirmed" → Confirm ausschalten oder E-Mail bestätigen). 3) **/api/auth-debug** aufrufen: `configured: true` und gleiche Projekt-URL wie in Supabase. |
| **Login schlägt immer fehl (z. B. "E-Mail oder Passwort falsch")** | 1) Passwort wirklich dasselbe wie bei Registrierung? 2) **Gleiches Supabase-Projekt?** In Supabase Dashboard prüfen, ob der User in **diesem** Projekt existiert. 3) **/api/auth-config** und **/api/auth-debug**: `urlPrefix` mit Supabase Project URL vergleichen. |
| **Weiterleitung passiert, aber auf der Startseite bin ich wieder "ausgeloggt"** | Session wird nicht in Cookies übernommen oder Middleware hat keine Keys. **Vercel:** `SUPABASE_URL` und `SUPABASE_ANON_KEY` (oder NEXT_PUBLIC_*) für **Production** setzen, **Redeploy**. Middleware nutzt jetzt dieselben Variablen (mit Fallback). |
| **"Supabase ist nicht konfiguriert"** | **/api/auth-config** liefert `configured: false`. In Vercel (oder .env.local) **SUPABASE_URL** und **SUPABASE_ANON_KEY** (oder NEXT_PUBLIC_*) setzen und Deployment/Server neu starten. |

---

## 5. Diagnose-Checkliste

1. **`https://deine-domain.de/api/auth-config`**  
   Erwartung: `configured: true`, `url` und `anonKey` gesetzt, `debug.urlPrefix` = Anfang der Supabase Project URL.

2. **`https://deine-domain.de/api/auth-debug`**  
   Zeigt, welche Env-Variablen gesetzt sind (`hasNextPublicUrl`, `hasSupabaseUrl`, …). So siehst du, ob Config und Middleware überhaupt Keys haben.

3. **Supabase Dashboard**  
   - **Authentication → Providers → Email:** Confirm email **AUS** für sofortigen Login ohne E-Mail-Bestätigung.  
   - **Authentication → URL Configuration:** Site URL und Redirect URLs passend (z. B. `https://bescheidrecht.de` und `https://bescheidrecht.de/**`).

4. **Vercel → Environment Variables**  
   Für **Production** (und ggf. Preview) mindestens eine der folgenden Kombinationen, **immer für dasselbe Supabase-Projekt**:
   - **Option A:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Option B:** `SUPABASE_URL` + `SUPABASE_ANON_KEY`  
   (Middleware und auth-config nutzen beide Varianten mit Fallback.)

5. **Registrierung testen und Meldung lesen**  
   - Wenn eine **rote Fehlermeldung** erscheint: genauen Text notieren (z. B. "Registrierung ok, Anmeldung fehlgeschlagen: Email not confirmed").  
   - Wenn **"E-Mail geschickt"** erscheint: Supabase erwartet E-Mail-Bestätigung → Confirm email prüfen oder Bestätigungs-Mail nutzen.

6. **Login testen**  
   Mit derselben E-Mail und dem **bei der Registrierung verwendeten** Passwort. Wenn es dann "Invalid login" gibt: entweder falsches Passwort oder anderes Supabase-Projekt (auth-debug urlPrefix vergleichen).

---

## 6. Kurz: Warum „es leitet nicht weiter“

- **Weiterleitung** passiert nur, wenn `signUp()` eine **Session** liefert **oder** der nachfolgende `signInWithPassword()` eine Session liefert. Sonst zeigt die App bewusst eine Meldung (Fehler oder "E-Mail geschickt") und leitet **nicht** zur Startseite weiter.
- **Häufigste Ursachen:**  
  (1) **Confirm email** in Supabase ist an → keine Session bei signUp, signIn schlägt mit "Email not confirmed" fehl.  
  (2) **Falsches Projekt** (andere Env-URL/Key) → User existiert in Projekt A, App spricht mit Projekt B.  
  (3) **Session/Cookies** werden nicht gesetzt/weitergegeben → Middleware hatte vor dem Fix keine Keys; mit Fallback auf SUPABASE_* und gesetzten Env-Variablen sollte das behoben sein.

Nach Anpassung der Env und Supabase-Einstellungen: **Redeploy**, dann Registrierung und Login erneut testen und bei Bedarf die genaue Fehlermeldung aus der App und das Ergebnis von **/api/auth-debug** prüfen.
