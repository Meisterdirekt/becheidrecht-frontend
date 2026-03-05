# BescheidRecht — Rechts-Update manuell auslösen

Löst den monatlichen Gesetzes-Checker für BescheidRecht manuell aus.

## Was passiert
- Fetcht aktuelle Entscheidungen von BSG, BVerfG, BMAS
- Claude Haiku analysiert & klassifiziert neue Urteile
- Neue Einträge landen in der Supabase `urteile` Tabelle
- Audit-Trail in `update_protokoll`

## Schritt 1: Voraussetzungen prüfen
- Prüfe ob `CRON_SECRET` in `.env.local` gesetzt ist (nur ✅/❌, KEIN Wert ausgeben)
- Prüfe ob Dev-Server auf Port 3000 läuft

## Schritt 2: Endpoint aufrufen
Zeige dem User den Command zum manuellen Ausführen:
```
curl -s "http://localhost:3000/api/cron/rechts-update?secret=DEIN_CRON_SECRET" | jq .
```
Der User muss den Secret-Wert selbst einsetzen. Lies KEINE Secrets aus Dateien.

## Schritt 3: Ergebnis zeigen
Zeige:
- Wie viele Quellen gecheckt wurden
- Wie viele neue Urteile gefunden
- Details pro Quelle (✓ oder ✗)
- Fehler wenn vorhanden

## Schritt 4: Tabellen-Status prüfen
Falls `urteile`-Tabelle nicht existiert:
Zeige dem Nutzer das SQL aus `supabase/wissensdatenbank.sql` zum manuellen Ausführen im Supabase Dashboard.
Link: https://supabase.com/dashboard/project/xprrzmcickfparpogbpj/sql/new
