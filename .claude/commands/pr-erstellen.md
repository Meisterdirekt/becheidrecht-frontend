# BescheidRecht — Pull Request erstellen

Erstelle einen sauberen Git-Commit und Push für aktuelle Änderungen im BescheidRecht-Projekt.

## Vorgehen

### 1. Status prüfen
```bash
cd /home/henne1990/bescheidrecht-frontend
git status
git diff --stat
```

### 2. Änderungen analysieren
Lies die geänderten Dateien und erstelle eine sinnvolle Commit-Nachricht.

Kategorien:
- `feat:` Neue Funktion
- `fix:` Bugfix
- `perf:` Performance/Kosten-Verbesserung
- `refactor:` Code-Umstrukturierung

### 3. TypeScript prüfen
`npx tsc --noEmit`
Keine Fehler? → weiter. Fehler? → erst beheben.

### 4. Sensible Dateien ausschließen
NIEMALS committen:
- `.env.local` (API-Keys!)
- `node_modules/`
- `.next/`

### 5. Commit erstellen
Aussagekräftige Commit-Message auf Englisch, Details auf Deutsch im Body.

### 6. Remote prüfen
Gibt es einen Remote-Branch? Falls ja: `git push`.
Falls nicht: Remote-URL erfragen bevor push.

Zeige am Ende den Commit-Hash und eine Zusammenfassung der Änderungen.
