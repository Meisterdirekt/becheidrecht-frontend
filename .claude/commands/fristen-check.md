# BescheidRecht — Fristen-System Check

Prüfe das Fristen-System im Projekt `/home/henne1990/bescheidrecht-frontend`.

## Code-Check

Lies und prüfe folgende Dateien auf Korrektheit:

1. `src/app/api/fristen/route.ts`
   - Nutzt User-JWT (nicht Service-Role-Key) für Supabase-Anfragen?
   - Berechnet `tage_verbleibend` korrekt?
   - Fehlerbehandlung für `42P01` (Tabelle nicht vorhanden)?

2. `src/app/fristen/page.tsx`
   - Auth-Check vorhanden?
   - Filter-Tabs funktionieren (offen/eingereicht/erledigt/abgelaufen)?

3. `src/app/analyze/page.tsx`
   - `FristBanner` wird gezeigt wenn `frist_datum` erkannt?
   - `RefineSection` vorhanden?

4. `src/app/api/analyze/route.ts`
   - Auto-Save der Frist nach Analyse implementiert?

## Supabase-Check

Prüfe ob die Tabelle `user_fristen` das korrekte Schema hat.
Lese dafür `supabase/fristen_table.sql`.

## Zusammenfassung

Gib an:
- Was funktioniert ✅
- Was fehlt oder fehlerhaft ist ❌
- Was optimiert werden könnte ⚠️

Wenn Probleme gefunden: Behebe sie direkt.
