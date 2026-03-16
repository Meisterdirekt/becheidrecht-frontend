---
description: Regeln fuer API-Route Entwicklung — Auth, Rate-Limiting, Error-Handling
globs: src/app/api/**/*.ts
---

# API-Route Regeln

1. **Auth ZUERST** — Jede Route (ausser `/api/health`) muss als erstes Auth pruefen:
   ```ts
   import { getAuthenticatedUser } from "@/lib/supabase/auth";
   const user = await getAuthenticatedUser(req);
   if (!user) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
   ```

2. **Supabase-Client** — In API-Routes `createClient` aus `@supabase/supabase-js` mit User-Token verwenden, NICHT den Service-Role-Key (ausser explizit Admin-Routes). Niemals `src/lib/supabase.ts` (Legacy) importieren.

3. **Rate-Limiting** — Fuer alle oeffentlichen/teuren Endpoints `rate-limit.ts` verwenden.

4. **Error-Handling** — Fehler ueber `reportError` aus `@/lib/error-reporter` loggen. Keine sensiblen Details in der Response. Deutsche Fehlermeldungen.

5. **Response-Format** — Immer `NextResponse.json()`. Status-Codes korrekt: 400 (User-Fehler), 401 (nicht eingeloggt), 403 (kein Zugriff), 500 (Server-Fehler).

6. **Keine KI-Logik in Routes** — KI-Aufrufe gehoeren in `src/lib/logic/`. Routes sind nur Glue-Code.
