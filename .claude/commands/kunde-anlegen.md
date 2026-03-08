# /kunde-anlegen — Kunden-Account direkt anlegen

Legt einen neuen Kunden-Account auf BescheidRecht an — vollautomatisch.
Kein Admin-Panel, kein manuelles Klicken.

## Verwendung

```
/kunde-anlegen
```

Dann wirst du nach folgenden Daten gefragt:
- Vorname, Nachname, E-Mail
- Abo-Typ (single / basic / standard / pro / business / b2b_starter / b2b_professional / b2b_enterprise / b2b_corporate)

## Was passiert automatisch

1. Supabase Auth-User wird angelegt
2. Abo wird zugewiesen (Analysen-Credits, Ablaufdatum)
3. Einladungs-E-Mail wird an den Kunden gesendet (Passwort setzen)
4. Bestätigung mit Account-Details

## Abo-Typen & Analysen

| Typ | Analysen | Laufzeit |
|-----|----------|----------|
| single | 1 | einmalig |
| basic | 5 | 1 Monat |
| standard | 15 | 1 Monat |
| pro | 50 | 1 Monat |
| business | 120 | 1 Monat |
| b2b_starter | 300 | 12 Monate |
| b2b_professional | 1000 | 12 Monate |
| b2b_enterprise | 2500 | 12 Monate |
| b2b_corporate | 6000 | 12 Monate |

## Ausführung

Führe die folgenden Schritte aus:

1. Lies die Kundendaten aus dem User-Input
2. Führe dieses Python-Script aus mit den Kundendaten:

```bash
cd /home/henne1990/bescheidrecht-frontend && python3 scripts/create-customer.py \
  --email "EMAIL" \
  --first-name "VORNAME" \
  --last-name "NACHNAME" \
  --plan "ABO-TYP"
```

3. Zeige dem User die Bestätigung mit:
   - User-ID
   - E-Mail
   - Abo-Typ + Analysen
   - Ablaufdatum
   - Hinweis: Einladungs-E-Mail wurde gesendet

Falls kein Produktions-Server läuft, nutze direkt die Supabase Admin API (Service-Role-Key aus .env.local).
