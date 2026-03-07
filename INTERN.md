# BescheidRecht — Interne Tools

## Schnellzugriff B2B-Werkzeuge

| Tool | URL | Wofür |
|---|---|---|
| **Hub** | `localhost:3000/intern` | Startseite für alle internen Tools |
| **Angebot** | `localhost:3000/angebot` | Preisübersicht erstellen → als PDF drucken |
| **Rahmenvertrag** | `localhost:3000/rahmenvertrag` | Vertrag ausfüllen → als PDF drucken |

> Port kann je nach Start variieren (3000, 3001, 3002). Einfach `/intern` ans Ende hängen.

## Server starten

```bash
cd /home/henne1990/bescheidrecht-frontend
nohup npm run dev > /tmp/bescheidrecht-dev.log 2>&1 &
```

Danach: [http://localhost:3000/intern](http://localhost:3000/intern)

## Workflow mit Kunden (z.B. Caritas)

1. **Demo-Gespräch** → Interesse bestätigt
2. `/angebot` öffnen → Felder ausfüllen → PDF drucken/speichern → per Mail schicken
3. **Kunde sagt Ja** → Paket S / M / L festlegen
4. `/rahmenvertrag` öffnen → Felder ausfüllen → PDF drucken → unterschreiben lassen
5. Unterschriebenen Vertrag zurückbekommen → Zugang aktivieren

## Preise (Stand März 2026)

| Paket | Nutzer | Analysen | Preis/Monat | Onboarding |
|---|---|---|---|---|
| S — Beratungsstelle | bis 15 | 1.000 | 1.490 € netto | 1.500 € |
| M — Kreisverband | bis 50 | 5.000 | 3.490 € netto | 2.500 € |
| L — Landes-/Diözesanverband | bis 200 | unbegrenzt | 7.490 € netto | 4.500 € |

**Jahresrabatt:** −10 % bei Vorauszahlung · **Preisanpassung:** max. 5 % p. a.

## Noch ausfüllen (einmalig!)

In beiden Dateien das `ANBIETER`-Objekt am Anfang anpassen:

- `src/app/angebot/page.tsx` → Zeile ~9
- `src/app/rahmenvertrag/page.tsx` → Zeile ~9

```
adresse:      "Deine echte Straße, PLZ Stadt"
steuernummer: "DE123456789"  ← USt-IdNr. vom Finanzamt
gerichtsstand: "Deine Stadt" ← nur Rahmenvertrag
```
