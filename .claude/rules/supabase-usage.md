---
description: Regeln fuer Supabase-Nutzung — korrekter Client, RLS, kein Legacy-Import
globs: src/lib/supabase/**/*.ts, src/lib/supabase.ts
---

# Supabase Regeln

1. **Drei Dateien, nur zwei verwenden:**
   - `src/lib/supabase/client.ts` — Frontend (Browser). Anon Key.
   - `src/lib/supabase/middleware.ts` — Server (SSR Session-Refresh).
   - `src/lib/supabase.ts` — **LEGACY. NICHT VERWENDEN.** Existiert nur fuer Abwaertskompatibilitaet.

2. **Auth-Helper** — In API-Routes immer `getAuthenticatedUser(req)` aus `src/lib/supabase/auth.ts` verwenden.

3. **RLS beachten** — Supabase-Queries laufen unter RLS. Service-Role-Key umgeht RLS → nur in Admin-Routes mit expliziter Begruendung.

4. **User-JWT fuer User-Daten** — `user_fristen`, `analysis_results` etc. filtern nach `auth.uid()`. Service-Key wuerde alle User-Daten zurueckgeben → Sicherheitsluecke.

5. **Keys nie ausgeben** — Werte aus `.env.local` nie loggen, nie in Responses, nie ins Frontend. Nur Existenz pruefen.
