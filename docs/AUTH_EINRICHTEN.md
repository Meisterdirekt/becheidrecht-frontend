# Registrierung & Anmeldung zum Laufen bringen – Checkliste

Alle Schritte nacheinander abarbeiten. Danach sollten Registrierung und Login auf **bescheidrecht.de** funktionieren.

---

## Schritt 1: Supabase – Werte holen

1. **https://supabase.com/dashboard** öffnen, Projekt wählen.
2. **Project Settings** (Zahnrad) → **API**.
3. Notieren:
   - **Project URL** (z. B. `https://xxxxx.supabase.co`)
   - **anon public** (unter Project API keys → **Reveal** → Key kopieren)

---

## Schritt 2: Vercel – Umgebungsvariablen setzen

1. **https://vercel.com** → dein Projekt **bescheidrecht-frontend**.
2. **Settings** → **Environment Variables**.
3. Zwei Einträge anlegen (falls noch nicht vorhanden):

   | Key (Name)           | Value (Inhalt)                    | Environment  |
   |----------------------|-----------------------------------|-------------|
   | `SUPABASE_URL`       | deine Project URL aus Schritt 1  | Production ✓ |
   | `SUPABASE_ANON_KEY`  | dein anon-public-Key aus Schritt 1 | Production ✓ |

4. **Save** klicken.

Optional (als Fallback): dieselben Werte zusätzlich mit diesen Namen anlegen:
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon Key  

Dann **einmal Redeploy** ausführen (Deployments → ⋮ → Redeploy), damit diese Werte im Build ankommen.

---

## Schritt 3: Supabase – URL-Konfiguration

1. Supabase → **Authentication** → **URL Configuration**.
2. **Site URL:** `https://bescheidrecht.de` (ohne Slash am Ende).
3. **Redirect URLs** (eine Zeile pro Eintrag):
   ```
   https://bescheidrecht.de/**
   https://bescheidrecht.de
   ```
4. **Save**.

---

## Schritt 4: Supabase – E-Mail-Bestätigung ausschalten (empfohlen)

1. Supabase → **Authentication** → **Providers** → **Email**.
2. **Confirm email** auf **OFF**.
3. **Save**.

Dann können Nutzer sich direkt nach der Registrierung einloggen, ohne E-Mail-Link.

---

## Schritt 5: Code deployen

Im Projektordner (Terminal):

```bash
cd /home/henne1990/bescheidrecht-frontend
git add .
git status
git commit -m "Auth: Fallback und Fixes"
git push origin main
```

Warten, bis bei Vercel der neue Deploy **erfolgreich** (grün) ist.

---

## Schritt 6: Prüfen

1. **Config-API:** Im Browser öffnen: **https://bescheidrecht.de/api/auth-config**  
   - Erwartung: `{"configured":true,"url":"https://...","anonKey":"eyJ..."}`  
   - Wenn `configured: false` → Schritt 2 prüfen (Variablen für Production, Redeploy).

2. **Registrierung:** **https://bescheidrecht.de/register** öffnen (Strg+Shift+R).  
   - Unten sollte stehen: **„Verbindung zu Supabase: bereit“**.  
   - Formular ausfüllen, AGB ankreuzen, auf **Kostenlos registrieren** klicken.  
   - Es erscheint der Overlay „Registrierung wird ausgeführt …“, danach grüne Meldung und Weiterleitung zur Startseite.

3. **Anmeldung:** **https://bescheidrecht.de/login** mit derselben E-Mail und Passwort testen.

---

## Wenn es noch nicht funktioniert

- **Unten steht „Verbindung zu Supabase: fehlt“**  
  → **https://bescheidrecht.de/api/auth-config** aufrufen. Zeigt die Antwort `configured: false`? Dann in Vercel die Variablen prüfen und **Redeploy** ausführen.

- **Overlay erscheint, danach Fehlermeldung**  
  → Text der Fehlermeldung notieren (oder Screenshot). Oft: falscher Anon-Key, falsche Redirect-URLs oder „Email not confirmed“.

- **Overlay erscheint, danach „Verbindung dauert zu lange“**  
  → Netzwerk/Firewall prüfen; in Supabase unter Settings prüfen, ob Projekt aktiv ist und keine IP-Einschränkungen die Anfragen blockieren.
