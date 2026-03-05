# Registrierung & Anmeldung funktionieren nicht – Fix

Wenn sich auf **bescheidrecht.de** (Vercel) niemand registrieren oder anmelden kann, fehlen fast immer die **Supabase-Umgebungsvariablen** in Vercel. Die App lädt die Config jetzt **zur Laufzeit** über `/api/auth-config` – sobald die Variablen in Vercel stehen, funktioniert Login/Registrierung **ohne erneuten Deploy**.

---

## Schritt 1: Supabase-URL und Key holen

1. **Supabase Dashboard** öffnen: https://supabase.com/dashboard  
2. Dein **Projekt** auswählen.  
3. **Project Settings** (Zahnrad links unten) → **API**.  
4. Dort notieren:
   - **Project URL** (z. B. `https://xxxxx.supabase.co`)
   - **anon public** Key (unter "Project API keys")

---

## Schritt 2: In Vercel eintragen

1. **Vercel** öffnen: https://vercel.com  
2. Projekt **bescheidrecht-frontend** (oder wie es heißt) öffnen.  
3. Oben **Settings** → links **Environment Variables**.  
4. Zwei Variablen anlegen:

   | Name | Value | Environment |
   |------|--------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | deine **Project URL** aus Supabase (z. B. `https://xxxxx.supabase.co`) | Production, Preview, Development (alle anhaken) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dein **anon public** Key aus Supabase | Production, Preview, Development (alle anhaken) |

5. **Save** klicken.  
6. **Kein Redeploy nötig:** Die App holt die Config zur Laufzeit. Nach dem Speichern der Variablen **Seite neu laden** (z. B. https://bescheidrecht.de/register) – dann sollte es funktionieren. Falls nicht, einmal **Redeploy** ausführen.

---

## Schritt 3: Supabase Redirect-URLs prüfen

Damit Login/Registrierung nach dem Redirect funktionieren:

1. **Supabase** → **Project Settings** → **Authentication** → **URL Configuration**.  
2. **Site URL:** `https://bescheidrecht.de` (ohne Slash am Ende).  
3. **Redirect URLs:** diese Zeilen eintragen (eine pro Zeile):
   - `https://bescheidrecht.de/**`
   - `https://bescheidrecht.de`
   - `https://bescheidrecht-frontend-fg78.vercel.app/**` (optional, für Preview)
4. **Save**.

---

## Schritt 4: „Confirm email“ (optional)

Damit Nutzer sich **sofort** nach der Registrierung nutzen können, ohne E-Mail-Link:

1. Supabase → **Authentication** → **Providers** → **Email**.  
2. **Confirm email** auf **OFF**.  
3. **Save**.

---

## Kurz-Checkliste

- [ ] In Vercel: `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` eingetragen (Production + Preview + Development).  
- [ ] In Vercel: **Redeploy** ausgeführt (oder neuer Push).  
- [ ] In Supabase: **Site URL** = `https://bescheidrecht.de`, **Redirect URLs** enthalten `https://bescheidrecht.de/**`.  
- [ ] Optional: **Confirm email** = OFF.

Danach Registrierung und Anmeldung auf **https://bescheidrecht.de** testen.
