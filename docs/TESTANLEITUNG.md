# Testanleitung: Analyse + Schreiben erstellen

So testest du die Website mit einem Test-Bescheid (Hochladen & Analyse) und dem Antrags-Generator (Schreiben erstellen).

## Voraussetzung

- Dev-Server läuft: `npm run dev` (z. B. http://localhost:3000 oder 3002)
- Du bist **angemeldet** (Login/Registrierung), sonst funktionieren Analyse und Schreiben-Generator nicht

---

## 1. Test: Bescheid hochladen & analysieren

1. **Startseite** öffnen → Tab **„Bescheid analysieren“** → Button **„Dokument jetzt hochladen“** (führt zu `/analyze`)
   - oder direkt: **http://localhost:3000/analyze** (bzw. dein Port)

2. Auf der Analyse-Seite:
   - **„Zum Testen: Test-Bescheid herunterladen“** klicken → die Datei `test-bescheid.pdf` wird heruntergeladen
   - **„Datei auswählen“** klicken → die heruntergeladene `test-bescheid.pdf` (oder eine andere PDF/Bild) auswählen
   - **„Analyse starten“** klicken

3. Erwartung:
   - Kurze Ladezeit, dann **Zuordnung** (z. B. Behörde/Rechtsgebiet), **mögliche Auffälligkeiten** und ein **Musterschreiben** zum Download

---

## 2. Test: Schreiben / Antrag erstellen

1. **Startseite** → Tab **„Schreiben erstellen“**

2. Formular ausfüllen:
   - **Behörde:** z. B. Jobcenter
   - **Schreibentyp:** z. B. Widerspruch gegen Bescheid
   - **Situation:** mind. 20 Zeichen (z. B. „Bescheid vom 01.02.2026 erhalten, Leistung um 30 % gekürzt, keine Begründung.“)
   - **Aktenzeichen:** z. B. `BG-123456-2026`
   - **Datum des Bescheids:** z. B. `01.02.2026`
   - Adresse optional
   - **Einwilligung** ankreuzen

3. **„Schreiben als Vorlage generieren“** klicken

4. Erwartung:
   - „Schreiben wird erstellt…“ → dann **Schreiben-Entwurf** mit Absender, Empfänger, Betreff, Text
   - Buttons: **Text kopieren**, **Als PDF herunterladen**, **Drucken**
   - PDF-Download: Dateiname z. B. `BescheidRecht_BG-123456-2026_10022026.pdf`

---

## Test-PDF neu erzeugen

Das Test-PDF liegt unter `public/test-bescheid.pdf`. Neu erzeugen (z. B. nach Änderungen am Script):

```bash
node scripts/generate-test-bescheid.js
```

---

## Häufige Probleme

- **„Nicht angemeldet“** → Einloggen unter /login, dann Analyse bzw. Schreiben erneut testen
- **„Keine Analysen mehr verfügbar“** → Abo/Guthaben prüfen (Admin oder Subscription)
- **Port nicht 3000** → In der Konsole nach „Local: http://localhost:XXXX“ schauen und diese URL im Browser nutzen
