# Vercel – Umgebungsvariablen eintragen (falls andere Namen nicht gehen)

Wenn Vercel die langen Namen nicht akzeptiert, diese **kurzen** Namen verwenden. Die App liest beide Varianten.

---

## Variante A: Kurze Namen (einfach zu tippen)

In Vercel → Projekt → **Settings** → **Environment Variables** → **Add New**:

**1. Erste Variable**
- **Key:** `SUPABASE_URL`
- **Value:** `https://xprrzmcickfparpogbpj.supabase.co`
- Environment: **Production** (und ggf. Preview) ankreuzen → **Save**

**2. Zweite Variable**
- **Key:** `SUPABASE_ANON_KEY`
- **Value:** deinen Anon-Key aus Supabase (Supabase Dashboard → Project Settings → API → anon public → Reveal → kopieren)
- Environment: **Production** (und ggf. Preview) ankreuzen → **Save**

---

## Variante B: Lange Namen (Standard)

- **Key:** `NEXT_PUBLIC_SUPABASE_URL`  
  **Value:** `https://xprrzmcickfparpogbpj.supabase.co`

- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
  **Value:** dein Anon-Key

---

## Wenn Vercel weiter „invalid characters“ anzeigt

1. **Neuen Tab** öffnen, zu Vercel gehen, nochmal zu Settings → Environment Variables.
2. **Key** immer **von Hand tippen** (kein Copy-Paste), nur: Buchstaben A–Z, Unterstrich `_`, keine Leerzeichen.
3. Browser wechseln (z. B. Chrome statt Firefox oder umgekehrt) und es dort erneut versuchen.
4. Oder in einem **anderen Projekt** testweise eine Variable anlegen – wenn es dort klappt, liegt es am Projekt/Cache.

Die App funktioniert mit **SUPABASE_URL** und **SUPABASE_ANON_KEY** genauso wie mit den NEXT_PUBLIC_-Namen.
