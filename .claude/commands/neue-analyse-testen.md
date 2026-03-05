# BescheidRecht — Neue Analyse testen

Teste die komplette Analyse-Pipeline in `/home/henne1990/bescheidrecht-frontend` ohne echten PDF-Upload.

## Schritt 1: Agent Engine direkt testen

Erstelle einen temporären Test-Script `scripts/test-agent.ts` mit einem Beispiel-Bescheid-Text (SGB II Kürzungsbescheid, fiktiv):

```
Bescheid über die Aufhebung und Erstattung vom 15.01.2026
Jobcenter Berlin Mitte
BG-Nr: 123456789

Sehr geehrte Damen und Herren,
hiermit heben wir den Bescheid vom 01.01.2026 teilweise auf.
Sie haben Einkommen in Höhe von 850 EUR erzielt, welches wir ab 01.02.2026 anrechnen.
Die Leistungen werden um 250 EUR monatlich gekürzt.
Widerspruch kann innerhalb eines Monats eingelegt werden.
```

Führe aus: `cd /home/henne1990/bescheidrecht-frontend && npx ts-node --project tsconfig.json scripts/test-agent.ts`

## Schritt 2: Ergebnis analysieren

Prüfe die Ausgabe auf:
- Alle 4 Tool-Calls ausgeführt? (klassifiziere → suche → weisungen → musterschreiben)
- Fristdatum korrekt berechnet?
- Musterschreiben enthält juristische Argumentation?
- Token-Verbrauch im Log?

## Schritt 3: TypeScript-Check

`cd /home/henne1990/bescheidrecht-frontend && npx tsc --noEmit`

Berichte Ergebnisse und behebe gefundene Fehler.
Nach dem Test: Lösche den Test-Script wieder.
