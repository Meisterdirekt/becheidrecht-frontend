# Auth-Checkliste: Registrierung & Login prüfen

Wenn sich Nutzer weder registrieren noch anmelden können, alle Schritte der Reihe nach durchgehen.

---

## 1. Supabase – gleiches Projekt

- **Dashboard:** https://supabase.com/dashboard → dein Projekt öffnen.
- **Project Settings → API:** Dort stehen **Project URL** und **anon public** Key.
- Diese Werte müssen **genau so** in Vercel stehen (siehe Abschnitt 2). Wenn in Vercel andere Werte stehen, spricht die App mit einem **anderen** Supabase-Projekt (dort existieren die User nicht).

---

## 2. Vercel – Umgebungsvariablen

- **Vercel** → dein Projekt (bescheidrecht) → **Settings → Environment Variables.**

Für **Production** (und ggf. Preview) müssen gesetzt sein:

| Variable | Wert | Woher |
|----------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | z.B. `https://xxxx.supabase.co` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | langer String `eyJ...` | Supabase → Project Settings → API → anon public |

Optional (für `/api/auth-config` und falls beim Build keine NEXT_PUBLIC_ gesetzt waren):

| Variable | Wert |
|----------|------|
| `SUPABASE_URL` | gleicher Wert wie NEXT_PUBLIC_SUPABASE_URL |
| `SUPABASE_ANON_KEY` | gleicher Wert wie NEXT_PUBLIC_SUPABASE_ANON_KEY |

- Keine Leerzeichen vor/nach den Werten.
- **Wichtig:** `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` werden auch von der **Middleware** (Session/Cookies) genutzt. Ohne diese beiden Variablen kann die Session nach Login/Registrierung auf manchen Wegen nicht korrekt gesetzt werden. Also immer beide NEXT_PUBLIC_ Variablen in Vercel setzen.
- Nach Änderung: **Redeploy** (oder neuer Deployment), damit der Build die neuen Werte nutzt (bei NEXT_PUBLIC_*).

**Prüfen:** Nach Deploy `https://bescheidrecht.de/api/auth-config` im Browser öffnen. Es sollte `configured: true` und `url` / `anonKey` kommen. `debug.urlPrefix` mit der Project URL in Supabase vergleichen.

---

## 3. Supabase – E-Mail-Bestätigung („Confirm email“)

- **Supabase** → **Authentication → Providers → Email.**
- **Confirm email:**  
  - **AUS** = Nutzer kann sich direkt nach der Registrierung anmelden (keine Bestätigungs-Mail nötig).  
  - **AN** = Supabase schickt eine Bestätigungs-Mail; ohne Klick auf den Link funktioniert Login oft nicht.

Wenn du **keine** Bestätigungs-Mail willst und direkten Login: **Confirm email = OFF**.

---

## 4. Supabase – URL-Konfiguration

- **Authentication → URL Configuration.**

| Einstellung | Sollte sein |
|-------------|-------------|
| **Site URL** | `https://bescheidrecht.de` (oder deine echte Domain) |
| **Redirect URLs** | Mindestens: `https://bescheidrecht.de`, `https://bescheidrecht.de/**`, `https://bescheidrecht.de/reset-password`, `https://bescheidrecht.de/login` |

Ohne passende Redirect URLs können Bestätigungs- oder Passwort-Reset-Links fehlschlagen oder auf die falsche Seite leiten.

---

## 5. Supabase – E-Mail (SMTP) optional

- Wenn **Confirm email = ON** ist: Unter **Project Settings → Auth → SMTP** prüfen, ob E-Mails versendet werden (Standard: Supabase-Eigenversand, oft mit Limitierungen).
- Wenn **Confirm email = OFF** ist: E-Mail-Versand für die Registrierung nicht nötig.

---

## 6. Hostinger vs. Vercel

- **Hostinger:** Wird nur genutzt, wenn die **Domain** (z.B. bescheidrecht.de) dort verwaltet wird (DNS). Dann zeigt die Domain per A/CNAME auf **Vercel**.
- **Auth läuft komplett auf Vercel + Supabase:** Registrierung, Login, Cookies, Redirects. Hostinger leitet nur die Domain weiter.
- Prüfen: Im Browser die volle URL beim Login/Registrierung – sie muss `https://bescheidrecht.de/...` sein (oder deine Domain), nicht `https://irgendwas.hostinger...`.

---

## 7. Ablauf im Code (zum Nachvollziehen)

1. **Registrierung:**  
   - App holt Supabase-Config von `/api/auth-config` (oder nutzt `NEXT_PUBLIC_*`).  
   - `signUp()` wird aufgerufen.  
   - Wenn Supabase **keine Session** zurückgibt (z.B. weil Confirm email an ist), versucht die App einmal `signInWithPassword()`.  
   - Gelingt das nicht, erscheint jetzt die **konkrete Fehlermeldung** (z.B. „Email not confirmed“ oder „Invalid login“).

2. **Login:**  
   - Gleiche Config wie oben.  
   - `signInWithPassword()` – bei falschem Passwort oder falschem Projekt: „Invalid login“ bzw. Fehlermeldung.

Wenn nach der Registrierung eine **sinnvolle Fehlermeldung** erscheint (z.B. „Registrierung ok, Anmeldung fehlgeschlagen: …“), daran orientieren: oft „Email not confirmed“ → Confirm email in Supabase prüfen; oder falsche Keys → Abschnitt 1 und 2 prüfen.

---

## 8. Schnell-Check

1. `https://bescheidrecht.de/api/auth-config` → `configured: true` und `url` wie in Supabase?  
2. Supabase → Authentication → Providers → Email → Confirm email = **OFF** (wenn kein E-Mail-Bestätigung gewünscht).  
3. Vercel → Environment Variables → `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` für Production gesetzt, Werte aus **demselben** Supabase-Projekt.  
4. Nach Änderungen an Env-Vars: **Redeploy** auf Vercel.

Wenn alles passt, Registrierung erneut testen – bei Fehlern zeigt die App jetzt die genaue Meldung an.
