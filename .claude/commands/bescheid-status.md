# BescheidRecht — Projekt-Status

Prüfe den aktuellen Status des BescheidRecht-Projekts unter `/home/henne1990/bescheidrecht-frontend`.

Führe folgende Checks durch (parallel wo möglich):

1. **Dev-Server:** Läuft `npm run dev` oder ein Build-Prozess?
2. **TypeScript:** Sind Fehler vorhanden? (`npx tsc --noEmit` in Projektordner)
3. **Env-Variablen:** Sind ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY gesetzt (Werte nicht ausgeben, nur ob vorhanden)?
4. **Kritische Dateien:** Existieren diese Dateien?
   - `src/lib/logic/agent_engine.ts`
   - `src/app/api/analyze/route.ts`
   - `src/app/api/fristen/route.ts`
   - `src/app/api/assistant/route.ts`
   - `content/behoerdenfehler_logik.json`
   - `content/weisungen_2025_2026.json`
5. **Supabase-Verbindung:** Ist `NEXT_PUBLIC_SUPABASE_URL` gesetzt?
6. **Package-Version:** Welche Versionen haben `@anthropic-ai/sdk` und `@supabase/supabase-js`?

Gib eine übersichtliche Zusammenfassung mit Status-Emojis (✅ / ❌ / ⚠️) aus.
Am Ende: Empfehle die nächste sinnvolle Aktion wenn etwas fehlt.
