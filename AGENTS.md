# BescheidRecht — Agenten & Skills Blueprint

## Kernprinzip: Weltklasse-Qualität bei minimalen Token-Kosten

Die goldene Regel: **Teures Modell nur wo es den Unterschied macht.**
Alles andere läuft auf Haiku oder Sonnet — mit Prompt-Caching.

---

## Token-Kosten Realität (Stand 2026)

| Modell | Input | Output | Wann einsetzen |
|--------|-------|--------|----------------|
| Haiku 4.5 | $0.25/MTok | $1.25/MTok | Klassifizierung, Security, Erklärungen |
| Sonnet 4.6 | $3/MTok | $15/MTok | Hauptanalyse, Musterschreiben (Standard) |
| Opus 4.6 | $15/MTok | $75/MTok | NUR NOTFALL/KRITISCH oder Premium-Nutzer |

**Prompt-Caching spart 90%** auf System-Prompts (omega_prompt, Fehlerkatalog, Weisungen).
→ Die 43KB Fehlerkatalog einmal cachen = fast gratis wiederverwenden.

### Kosten pro Analyse (nach Routing-Stufe)

| Stufe | Wann | Agenten aktiv | Kosten (ohne Cache) | Kosten (mit Cache) |
|-------|------|---------------|--------------------|--------------------|
| NORMAL | Standard-Fall | AG08+AG12+AG01+AG02+AG07+AG13 | ~$0.18 | ~$0.05 |
| HOCH | Frist < 14 Tage | + AG04 Recherche + AG03 Kritiker | ~$0.35 | ~$0.12 |
| NOTFALL | Frist heute / Vollstreckung | + AG02→Opus + AG07→Opus | ~$0.65 | ~$0.25 |
| PREMIUM | Zahlender B2B-Nutzer | Alle 13 Agenten | ~$1.20 | ~$0.45 |

**Ziel: 85% aller Analysen laufen auf NORMAL-Stufe.**

---

## Die 13 Agenten

### Pflicht-Agenten (laufen IMMER)

#### AG08 — Security (Haiku · IMMER ZUERST)
- **Was:** Input prüfen auf Prompt-Injection, Jailbreak, PII-Lecks
- **Was NICHT:** Echte Rechtsprüfung, das macht AG02
- **Output:** `freigabe: true/false` + anonymisiertes Dokument
- **Kosten:** ~$0.003 | **Ohne ihn:** Pipeline stoppt hart

#### AG12 — Dokumenten-Prozessor (Haiku · IMMER)
- **Was:** PDF/Bild → sauberer Text. OCR mit Tesseract als Fallback
- **Besonderheit:** Erkennt Struktur (Rubrum, Begründung, Rechtsbehelfsbelehrung)
- **Kosten:** ~$0.005 | **Ohne ihn:** kein Text = kein Start

#### AG01 — Orchestrator (Sonnet · IMMER)
- **Was:** Triage in unter 5 Sekunden. Rechtsgebiet, Dringlichkeit, Routing-Stufe
- **Entscheidet:** Welche Agenten als nächstes laufen
- **Output:** `{ dringlichkeit: NOTFALL|KRITISCH|HOCH|MITTEL|NORMAL, rechtsgebiet: SGB_II|... }`
- **Kosten:** ~$0.012 | **Ohne ihn:** kein Routing

#### AG07 — Musterschreiben (Sonnet · IMMER)
- **Was:** Widerspruchsschreiben auf Anwaltsniveau
- **Bei NOTFALL:** Wechselt auf Opus automatisch
- **Kosten Sonnet:** ~$0.08 | **Kosten Opus:** ~$0.25

#### AG13 — Nutzer-Erklärer (Haiku · IMMER)
- **Was:** Übersetzt Juristendeutsch in verständliche Sprache
- **Output:** Max. 3 Sätze was der Nutzer konkret tun soll
- **Kosten:** ~$0.003

---

### Standard-Agenten (ab HOCH-Dringlichkeit)

#### AG02 — Analytiker (Sonnet/Opus · ab HOCH)
- **Was:** Tiefste Fehleranalyse — vergleicht mit Fehlerkatalog + Urteilen in DB
- **Tools:** `db_read` → lädt passende Urteile + Behördenfehler
- **Bei NOTFALL:** Automatisch Opus
- **Kosten Sonnet:** ~$0.10 | **Kosten Opus:** ~$0.40

#### AG04 — Rechts-Rechercheur (Sonnet · ab HOCH)
- **Was:** Sucht aktuelle BSG-Urteile im Internet (bundessozialgericht.de etc.)
- **Tools:** `web_search` + `fetch_url` (Domain-Whitelist!)
- **Parallel mit AG02** — spart Zeit
- **Kosten:** ~$0.08 (inkl. Tavily API ~$0.003/Suche)

#### AG03 — Kritiker (Sonnet · ab HOCH)
- **Was:** Hinterfragt AG02-Analyse. Sucht Gegenargumente der Behörde
- **Output:** Erfolgschance in %, Schwachstellen im Widerspruch
- **Tools:** `db_read` → lädt Gegenargumente aus Behördenfehler-DB
- **Kosten:** ~$0.06

---

### Hintergrund-Agenten (async, nie blockierend)

#### AG05 — Wissens-Verwalter (Haiku)
- **Was:** Speichert neue Urteile aus AG04-Recherche in die DB
- **Der EINZIGE Agent mit `db_write`**
- **Läuft nach** der Antwort an den Nutzer — blockiert nicht
- **Kosten:** ~$0.004

#### AG06 — Prompt-Optimierer (Opus · async)
- **Was:** Analysiert ob Agenten gut gearbeitet haben, verbessert Prompts
- **Wann:** Nur wenn AG02/AG03/AG07 Probleme hatten
- **Läuft im Hintergrund** — Nutzer merkt nichts
- **Kosten:** ~$0.15 (selten)

#### AG09 Frontend / AG10 Backend / AG11 DevOps
- **Was:** Erstellen GitHub Issues bei erkannten Verbesserungen
- **Tools:** `github_action`, `vercel_action`
- **Läuft:** Nur wöchentlich in einem Batch, nicht bei jeder Analyse
- **Kosten:** ~$0.05/Woche gesamt

---

## Die 6 Skills (Tools der Agenten)

### `web_search` — Nur AG04
```
Erlaubte Domains (Whitelist, nie erweitern!):
- bundessozialgericht.de
- bundesverfassungsgericht.de
- gesetze-im-internet.de
- sozialgerichtsbarkeit.de
- bmas.de / arbeitsagentur.de
```
- Provider: Tavily API (~$0.003/Suche)
- Max 10 Ergebnisse, Timeout 15s

### `fetch_url` — Nur AG04
- Lädt Volltexte von Whitelist-Domains
- HTML → bereinigter Text, max 10.000 Zeichen
- Domain-Whitelist identisch mit web_search

### `db_read` — AG02, AG03, AG04, AG05
- Liest: `urteile`, `kennzahlen`, `behoerdenfehler`, `update_protokoll`
- Max 100 Zeilen pro Query
- Kein direkter Frontend-Zugriff (nur Service-Role)

### `db_write` — NUR AG05
- Schreibt: `urteile`, `kennzahlen`, `behoerdenfehler`, `update_protokoll`
- Jeder Schreibvorgang landet im `update_protokoll` (Audit-Trail)

### `github_action` — AG09, AG10, AG11
- Issues erstellen, CI/CD-Status prüfen
- Kein Code-Push, kein Force-Push

### `vercel_action` — AG10, AG11
- Deployments prüfen, Logs lesen
- KEIN Schreiben von Env-Variablen (Security!)

---

## Prompt-Caching Strategie (Pflicht!)

Folgende Inhalte werden gecacht (`cache_control: ephemeral`):
```
1. omega_prompt.txt          → ~2.000 Token | bei jeder Analyse
2. behoerdenfehler_logik.json → ~11.000 Token | bei jeder Analyse
3. weisungen_2025_2026.json   → ~800 Token | bei Jobcenter-Analysen
4. PROMPTS[agentId]           → 1.000-3.000 Token | pro Agent
```
**Ersparnis:** 60-80% der Kosten auf wiederholte Anfragen

---

## Datenbank-Tabellen (Wissensdatenbank)

| Tabelle | Inhalt | Wer schreibt | Wer liest |
|---------|--------|-------------|-----------|
| `sessions` | Anonyme Analyse-Sessions (24h TTL) | Backend | AG01 |
| `analysis_results` | Ergebnisse, Token-Kosten, Status | Backend | Admin |
| `urteile` | BSG/BVerfG Urteile mit Leitsätzen | AG05 | AG02, AG03, AG04 |
| `kennzahlen` | Regelbedarfe, Schonvermögen (aktuell!) | AG05 | AG02 |
| `behoerdenfehler` | Fehlertypen mit Argumenten | AG05/AG06 | AG02, AG03 |
| `update_protokoll` | Audit-Trail aller Änderungen | AG05 | Admin |
| `user_fristen` | Widerspruchsfristen der Nutzer | Frontend | Frontend |

---

## Routing-Logik (AG01 Entscheidungsbaum)

```
Dokument eingehangen
    │
    ▼
AG08 Security-Check ──── ABGELEHNT ──→ STOP (Fehler an Nutzer)
    │ OK
    ▼
AG12 Text extrahieren
    │
    ▼
AG01 Triage
    │
    ├── NOTFALL/KRITISCH ──→ ALLE Pflicht-Agenten + AG02(Opus) + AG04 + AG03
    │                         + sofortige SSE-Notification "NOTFALL!"
    │
    ├── HOCH ──────────────→ Pflicht-Agenten + AG02(Sonnet) + AG04 + AG03
    │
    └── NORMAL/MITTEL ─────→ Nur Pflicht-Agenten (AG08+AG12+AG01+AG02+AG07+AG13)
                              AG05 async, AG06 nur bei Problemen
```

---

## Integration in Next.js (aktueller Stand + geplant)

### Aktuell vorhanden (`src/lib/logic/agent_engine.ts`)
- 4-Tool Agent (Claude Sonnet)
- Keine Prompt-Caching
- Keine DB-Wissensdatenbank
- Keine parallele Ausführung

### Nächste Ausbaustufe
1. **Prompt-Caching** in agent_engine.ts → sofort -60% Kosten
2. **Routing-Logik** in analyze/route.ts → Haiku für einfache Fälle
3. **Wissensdatenbank** (DB-Tabellen) → bessere Analyse-Qualität
4. **AG04 Recherche** → echte Urteile als Belege

### Backend-Service (aus Download-Ordner)
- Separater Node.js Service (Express)
- Läuft neben Next.js auf anderem Port
- Next.js ruft ihn intern auf
- Für Produktion: eigener Vercel-Service oder Railway

---

## Kosten-Monitoring (Pflicht in Produktion)

Jede Analyse speichert in `analysis_results`:
```json
{ "token_gesamt": 4821, "kosten_eur": 0.0723, "agenten_status": {...} }
```

**Alert-Schwellen:**
- > $0.50 pro Analyse → Log-Warning
- > $0.80 pro Analyse → Slack/Email-Alert
- > $50/Tag gesamt → Auto-Pause (Kostenschutz)
