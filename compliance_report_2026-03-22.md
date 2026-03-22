# Compliance-Bericht BescheidRecht

**Datum:** 2026-03-22
**Auditor:** Claude Opus 4.6 (automatisiert)
**Projekt:** bescheidrecht-frontend (`/home/henne1990/bescheidrecht-frontend`)
**Methode:** Statische Code-Analyse aller relevanten Dateien

---

## BLOCK 1: RDG (Rechtsdienstleistungsgesetz)

### 1.1 Verbotene Formulierungen

| Fund | Datei | Zeile | Bewertung |
|------|-------|-------|-----------|
| `"rechtssicher und DSGVO-konform"` | `src/app/layout.tsx` | 19 | **KRITISCH** — Meta-Description suggeriert Rechtssicherheit. Verboten nach § 2 RDG. |
| `"nicht rechtsverbindlich"` | `src/app/ki-transparenz/page.tsx` | 116 | OK — korrekte Verneinung |
| `"Niemals 'rechtssicher' verwenden"` | `src/app/api/generate-letter/route.ts` | 64 | OK — interne Anweisung an KI |
| `"keine Rechtsberatung ist und keinen Anwalt ersetzt"` | `src/lib/page-translations.ts` | 156 | OK — Consent-Checkbox |
| `"Garantiert bis 01.07.2031"` | `src/lib/logic/agents/compliance-2026.ts` | 114 | OK — Sachaussage zu Rentengarantie, kein Rechtsversprechen |

**Ergebnis:** 1 kritischer Fund (`layout.tsx` Meta-Description).

### 1.2 Disclaimer-Abdeckung

| Seite / Kontext | § 2 RDG Disclaimer | Beweis |
|-----------------|---------------------|--------|
| **Footer (global)** | "Kein Ersatz für Rechtsberatung. Informationsdienst gem. § 2 RDG." | `SiteFooter.tsx:20` + `page-translations.ts:247` (DE/EN/RU/AR/TR) |
| **Analyse-Seite** | "stellt keine Rechtsberatung dar (§ 2 RDG)" | `analyze/page.tsx:829` + `:984` |
| **Assistent-Seite** | "stellt keine Rechtsberatung im Sinne des § 2 RDG dar" | `assistant/page.tsx:283` |
| **PDF-Download** | "Hinweis gemäß § 2 RDG: Dieses Schreiben ist ein KI-gestützter Entwurf..." | `DownloadButton.tsx:58-62` |
| **PDF-Vorschau** | "Dieser Entwurf ersetzt keine Rechtsberatung (§ 2 RDG)" | `LetterPDF.tsx:161` |
| **Briefgenerierung (AG07)** | Disclaimer wird automatisch angehängt + `hasRDG`-Check | `ag07-letter-generator.ts:35-37` + `assistant/route.ts:194-202` |
| **AGB** | "Wichtiger Hinweis – Keine Rechtsberatung" | `agb/page.tsx:17-19` |
| **B2B-FAQ** | "Ersetzt BescheidRecht eine rechtliche Beratung (§ 2 RDG)?" → "Nein." | `b2b/page.tsx:172-173` |
| **KI-Transparenz** | "Die Analyse ersetzt keine Rechtsberatung gemäß § 2 RDG" | `ki-transparenz/page.tsx:117` |
| **Consent-Checkbox** | "Mir ist bekannt, dass dies keine Rechtsberatung ist und keinen Anwalt ersetzt." | `page-translations.ts:156+177` (5 Sprachen) |
| **Ergebnis-Warnung** | "Entwurf prüfen vor dem Absenden. Kein Ersatz für Rechtsberatung (§ 2 RDG)." | `page-translations.ts:186` (5 Sprachen) |
| **Pitch-Deck** | "Technisches Analyse-Werkzeug gem. § 2 Abs. 1 RDG." | `pitch-deck/page.tsx:643+1219` |
| **Rahmenvertrag** | "kein Ersatz für Rechtsberatung im Sinne des § 3 RDG" | `rahmenvertrag/page.tsx:227-228` |
| **Angebot** | "kein Ersatz für rechtliche Beratung im Sinne von § 3 RDG" | `angebot/page.tsx:513` |

**Ergebnis:** Hervorragende Abdeckung. Disclaimer auf allen relevanten Seiten, in 5 Sprachen, in PDFs und im generierten Brief.

### 1.3 Weiterleitungen zu Beratungsstellen

| Verweis | Datei | Zeile |
|---------|-------|-------|
| "VdK, Sozialverband" | `assistant/page.tsx` | 283 |
| "VdK, Sozialverband" | `analyze/page.tsx` | 984 |
| "VdK, Sozialverband" | `ag07-letter-generator.ts` | 37 |
| "VdK, Sozialverband" | `assistant/route.ts` | 201 |
| "Rechtsanwalt oder Beratungsstelle" | `DownloadButton.tsx` | 62 |
| "Beratungsstelle (z. B. VdK, Sozialverband) hinzuziehen" | `antraege/page.tsx` | 201-202 |
| "Anwalt oder Sozialverband prüfen" | `page.tsx` (Landingpage) | 713 |

**Fehlend:** Kein dedizierter "Beratungsstelle finden"-Link mit externen URLs (z.B. vdk.de/beratung, caritas.de/beratung). Verweise sind nur textuell, nicht verlinkt.

### 1.4 Zusätzliche RDG-Funde (Agent-Scan)

| Fund | Bewertung |
|------|-----------|
| **Landingpage Footer-Disclaimer quasi unsichtbar** — `text-white/25` (4% Kontrast auf dunklem Hintergrund). Der einzige § 2 RDG Hinweis auf der Traffic-stärksten Seite ist im Footer versteckt. | WICHTIG — Sichtbaren Hinweis im Pricing/CTA-Bereich ergänzen |
| **§-Inkonsistenz** — `SiteFooter.tsx:20` zitiert "§ 2 RDG", `rahmenvertrag/page.tsx:227` zitiert "§ 3 RDG", `angebot/page.tsx:513` mischt beides. Inhaltlich vertretbar (§ 2 = Definition, § 3 = Verbot), aber unprofessionell. | HINWEIS — Einheitlich "gem. § 2 Abs. 1 RDG" verwenden |
| **AG07 Brief ohne Disclaimer** — `ag07-letter-generator.ts:182` entfernt bewusst alle Disclaimer aus dem Brieftext. `DownloadButton.tsx:58-67` fügt ihn im PDF wieder ein. Kein zweiter Downloadpfad darf am Disclaimer vorbeiführen. | HINWEIS — Kommentar in AG07 sollte auf DownloadButton-Abhängigkeit hinweisen |

---

## BLOCK 2: DSGVO

### 2.1 Datenspeicherung — Welche Daten wo?

| Tabelle | Personenbezogene Spalten | Risiko |
|---------|--------------------------|--------|
| `profiles` | email, name | Mittel |
| `user_subscriptions` | user_id (→ auth.users) | Gering |
| `usage_counters` | user_id | Gering |
| `analysis_results` | user_id, behoerde, rechtsgebiet, fehler, musterschreiben | **Hoch** — Musterschreiben kann Klardaten enthalten (nach De-Pseudonymisierung) |
| `user_fristen` | user_id, behoerde, rechtsgebiet, frist_datum, musterschreiben | **Hoch** — Musterschreiben enthält de-pseudonymisierte Daten |
| `site_feedback` | name, email, message | Mittel |
| `organizations` | name, contact_email, admin_email | Mittel |
| `organization_members` | user_id, org_id, role | Gering |
| `organization_invites` | email, org_id | Gering |
| `plans` | — | Keine PII |
| `single_purchases` | user_id | Gering |

**Kritischer Punkt:** `analysis_results` und `user_fristen` speichern das **de-pseudonymisierte** Musterschreiben (`depseudonymizeText()` wird in `analyze/route.ts:320` aufgerufen VOR dem Speichern). Das bedeutet: Klardaten (Namen, IBAN etc.) landen in Supabase.

### 2.2 Löschfristen

| Datenkategorie | Frist laut Datenschutzseite | Implementierung | Match? |
|----------------|----------------------------|-----------------|--------|
| Analyseergebnisse | 90 Tage | `data-retention/route.ts:17` — `RETENTION_DAYS = 90`, löscht `analysis_results` wo `created_at < cutoff` | **Ja** |
| Fristen (erledigt/abgelaufen) | 90 Tage | `data-retention/route.ts:57-61` — löscht `user_fristen` mit Status `erledigt`/`abgelaufen` | **Ja** |
| Hochgeladene Dokumente | "nicht dauerhaft gespeichert" | Korrekt — Dateien werden in-memory verarbeitet, nie auf Disk gespeichert | **Ja** |
| Server-Logs | 30 Tage (laut DSE) | Vercel-seitig, nicht vom Code kontrolliert | Plausibel |

**Cron-Einbindung:** `data-retention` wird täglich via `daily-hub` aufgerufen (`vercel.json` Cron).

### 2.3 Betroffenenrechte

| Recht | Technisch umsetzbar? | Implementierung |
|-------|----------------------|-----------------|
| **Auskunft** (Art. 15) | Manuell per E-Mail | Kein Self-Service-Export |
| **Löschung** (Art. 17) | Manuell per E-Mail | Kein "Account löschen"-Button |
| **Datenübertragbarkeit** (Art. 20) | Manuell per E-Mail | Kein Daten-Export-Feature |
| **Widerruf** (Art. 7) | Dokumentiert | Per E-Mail an `datenschutz@bescheidrecht.de` |
| **Berichtigung** (Art. 16) | Manuell | Kein Profil-Edit für Name/Adresse |

**Risiko:** Alle Rechte nur manuell per E-Mail durchsetzbar. Kein Self-Service. Bei B2B-Skalierung (hunderte Nutzer) wird das zum Flaschenhals.

### 2.4 Datenflüsse außerhalb EU

| Dienst | Standort | Was wird übermittelt | Pseudonymisiert? | AVV vorhanden? |
|--------|----------|----------------------|-------------------|----------------|
| **Anthropic (Claude)** | USA | Bescheid-Text (Analyse-Pipeline) | **Ja** — `pseudonymizeText()` in `analyze/route.ts:296` | Laut DSE: Ja |
| **Anthropic (Claude)** | USA | Beschreibung + Antworten (Assistent) | **NEIN** | Laut DSE: Ja |
| **OpenAI (GPT-4o)** | USA | Stichpunkte (Brief-Generator) | **NEIN** | Laut DSE: Ja |
| **OpenAI (GPT-4o)** | USA | Bescheid-Text (Legacy-Fallback) | **Ja** — gleicher pseudonymisierter Text | Laut DSE: Ja |
| **Sentry** | USA | Error-Messages, Stack-Traces | Keine PII (nur technische Daten) | Laut DSE: Ja |
| **Supabase** | **Frankfurt, EU** | Alle DB-Daten | n/a | Laut DSE: Ja |
| **Mollie** | **Amsterdam, EU** | E-Mail, Transaktions-ID | n/a | Laut DSE: Ja |
| **Upstash** | **Frankfurt, EU** | Gehashte IPs | n/a | Laut DSE: Ja |
| **Vercel** | EU (CDN) + USA (Functions) | Request-Daten | n/a | Laut DSE: Ja |

### 2.5 Cookies / Consent

- **Kein Cookie-Banner** vorhanden
- Nur **technisch notwendige Session-Cookies** (Supabase Auth)
- Kein Analytics, kein Marketing-Tracking
- `PrivacyModal.tsx` existiert — zeigt Datenschutz-Info VOR Upload an
- Consent-Checkbox VOR Analyse vorhanden (`page-translations.ts:156`)

**Bewertung:** Kein Cookie-Banner nötig, da nur technisch notwendige Cookies. Korrekt nach ePrivacy-Richtlinie.

### 2.6 Zusätzlicher DSGVO-Fund (Agent-Scan)

| Fund | Bewertung |
|------|-----------|
| **OpenAI Vision OCR-Fallback sendet Rohbilder mit PII** — `analyze/route.ts:114-147`: Wenn Tesseract < 50 Zeichen liefert, wird das Base64-Bild (mit allen Klardaten im Bild!) direkt an OpenAI gesendet. Pseudonymisierung greift erst NACH der Textextraktion (`analyze/route.ts:296`). Der Code-Kommentar Zeile 117 bestätigt: "Bild enthält zu diesem Zeitpunkt noch PII". | **KRITISCH (P0)** — Bilder können nicht vor OCR pseudonymisiert werden. Entweder OpenAI-Fallback entfernen (nur Tesseract) oder separaten Consent-Schritt einbauen. |
| **user_fristen Löschung unvollständig** — `data-retention/route.ts:60`: Nur Fristen mit Status "erledigt"/"abgelaufen" werden nach 90 Tagen gelöscht. Offene Fristen ("offen", "eingereicht") akkumulieren unbegrenzt. `musterschreiben`-Feld enthält de-pseudonymisierte Brieftexte. | WICHTIG (P1) — Alle Fristen nach 90 Tagen löschen, oder Datenschutzseite anpassen |

**Korrektur:** `userContext` wird in `analyze/route.ts:212-213` korrekt pseudonymisiert — kein Problem dort.

---

## BLOCK 3: ANONYMISIERUNG

### 3.1 Pseudonymizer-Abdeckung

| PII-Typ | Erkannt? | Regex-Qualität | Beweis |
|---------|----------|----------------|--------|
| **Namen** (Vorname Nachname) | Ja | Gut — NO_NAME-Blocklist mit ~130 Einträgen, Kontext-Signale (Herr/Frau) | `pseudonymizer.ts:192-227` |
| **IBAN** (DE/AT/CH) | Ja | Gut | `pseudonymizer.ts:58-61` |
| **Geburtsdaten** (4 Formate) | Ja | Gut — DD.MM.YYYY, YYYY-MM-DD, DD-MM-YYYY, "1. Januar 2000" | `pseudonymizer.ts:120-130` |
| **E-Mail** | Ja | Standard-Regex | `pseudonymizer.ts:52-55` |
| **Telefon** (+49, 0xxx) | Ja | Gut — DE-Formate | `pseudonymizer.ts:64-67` |
| **BIC/SWIFT** | Ja | Kontextgebunden + Standalone | `pseudonymizer.ts:71-83` |
| **Sozialversicherungsnr.** | Ja | 2 Formate (XX XXXXXX X XXX + 12-stellig) | `pseudonymizer.ts:86-94` |
| **Steuer-ID** | Ja | 3 Formate (Kontext, gruppiert, kompakt) | `pseudonymizer.ts:98-117` |
| **Adressen** | Ja | Straße+Nr, PLZ+Ort | `pseudonymizer.ts:133-147` |
| **Aktenzeichen** | **Nein** | Nicht erkannt — können Namen enthalten (z.B. "AZ 12/2024 Müller") | — |
| **Bedarfsgemeinschaftsnr.** | **Nein** | Nicht erkannt (AG01 extrahiert sie separat, aber kein Pseudonym) | — |
| **Fallnummern** | **Nein** | — | — |
| **Ausländische IBANs** | **Nein** | Nur DE/AT/CH — GB, FR, NL etc. nicht erkannt (relevant bei EU-Bürgern) | — |
| **Mobilnummern ohne Trennzeichen** | **Teilweise** | "01701234567" wird nicht erkannt — Regex erfordert Trennzeichen nach Vorwahl | — |
| **Einzelvornamen** | **Nein** | "gez. Klaus" wird nicht erkannt — nameContextRegex braucht Vor+Nachname | — |

### 3.2 Wo wird der Pseudonymizer aufgerufen?

| Codepfad | Pseudonymisiert? | Beweis |
|----------|------------------|--------|
| `/api/analyze` → Agent-Pipeline | **Ja** | `analyze/route.ts:296` — `pseudonymizeText(extractedText)` |
| `/api/analyze` → Legacy-Engine | **Ja** | `analyze/route.ts:423` — verwendet `pseudonymized` |
| `/api/assistant` → Claude | **NEIN** | `assistant/route.ts:94-95+170-172` — `beschreibung` und `antworten` gehen als Klartext an Claude |
| `/api/generate-letter` → OpenAI | **NEIN** | `generate-letter/route.ts:128+155` — `stichpunkte` gehen als Klartext an OpenAI |
| Agent-Pipeline intern | **Ja** | Orchestrator erhält bereits pseudonymisierten Text |

### 3.3 Tests

7 Testfälle in `pseudonymizer.test.ts`:
- Namen, Geburtsdaten, IBAN, mehrere Namen, E-Mail, Telefon, leerer Text
- **Fehlende Tests:** Steuer-ID, SVN, BIC, Adressen (PLZ+Ort), De-Pseudonymisierung aller Typen, Edge Cases (Name = Behördenname)

### 3.4 Logging

- **API-Routes:** Keine `console.log`-Aufrufe mit Klardaten gefunden
- **Error-Reporter:** Sendet `error.message` + `stack` + `context` an Sentry (`error-reporter.ts:43-48`). Keine PII im Normalfall, aber bei unerwarteten Fehlern könnten Error-Messages Bescheid-Text enthalten
- **Orchestrator:** `console.warn` nur für Hintergrund-Fehler (`orchestrator.ts:56+77`) — Agent-IDs, keine PII
- **AG01:** `console.info` mit Behörde + Rechtsgebiet (`ag01-orchestrator.ts:208`) — keine PII

### 3.5 Daten nach Analyse

- `analysis_results` speichert **de-pseudonymisierte** Daten (`analyze/route.ts:318-320` — `depseudonymizeText()`)
- Musterschreiben in `user_fristen` ebenfalls de-pseudonymisiert (`analyze/route.ts:348`)
- **Löschung nach 90 Tagen** implementiert (`data-retention/route.ts`)
- **Während der 90 Tage:** Klardaten in Supabase (Frankfurt, EU) — durch RLS geschützt, nur eigener User sieht eigene Daten

---

## BLOCK 4: AGENTEN-SYSTEM

### 4.1 Alle Agenten

| Agent | Datei | Rolle | In Pipeline? |
|-------|-------|-------|--------------|
| AG01 | `ag01-orchestrator.ts` | Triage: Behörde, Rechtsgebiet, Dringlichkeit | Ja (Haiku → Sonnet Fallback) |
| AG02 | `ag02-analyst.ts` | Bescheid-Analyse, Fehler-Erkennung | Ja (parallel mit AG04) |
| AG03 | `ag03-critic.ts` | Qualitätskritiker, Halluzinations-Filter | Ja |
| AG04 | `ag04-researcher.ts` | Urteile + Weisungen aus DB | Ja (parallel mit AG02) |
| AG05 | `ag05-knowledge-manager.ts` | Wissensdatenbank-Schreiber | Async (fire-and-forget) |
| AG06 | `ag06-prompt-optimizer.ts` | Prompt-Optimierung bei schlechten Ergebnissen | Async (bedingt) |
| AG07 | `ag07-letter-generator.ts` | Musterschreiben-Generator | Ja (parallel mit AG14+AG13) |
| AG08 | `ag08-security-gate.ts` | Prompt-Injection + Jailbreak Filter | Ja (ERSTER Agent) |
| AG09 | `ag09-frontend-agent.ts` | Frontend-Audit (Cron) | Nein (Cron/Wartung) |
| AG10 | `ag10-backend-agent.ts` | Backend-Audit (Cron) | Nein (Cron/Wartung) |
| AG11 | `ag11-devops-agent.ts` | DevOps-Audit (Cron) | Nein (Cron/Wartung) |
| AG12 | `ag12-document-processor.ts` | Dokument-Vorverarbeitung | Ja (nach AG08) |
| AG13 | `ag13-user-explainer.ts` | Nutzer-Erklärung | Ja (parallel mit AG07+AG14) |
| AG14 | `ag14-praezedenz-analyzer.ts` | Präzedenzfall-Analyse aus DB | Ja (parallel mit AG07+AG13) |
| AG15 | `ag15-rechts-monitor.ts` | Rechts-Monitor (monatlich) | Nein (Cron) |
| AG16 | `ag16-vercel-agent.ts` | Vercel-Deployment-Check (täglich) | Nein (Cron) |
| AG17 | `ag17-agent-auditor.ts` | Agent-Metriken + Anomalien (wöchentlich) | Nein (Cron) |
| AG18 | `ag18-content-auditor.ts` | Content-Integrität (monatlich) | Nein (Cron) |
| AG19 | `ag19-design-guardian.ts` | Design-System-Audit (wöchentlich) | Nein (Cron) |

**Pipeline:** `AG08 → AG12 → AG01 → [AG02 ‖ AG04] → AG03 → [AG07 ‖ AG14 ‖ AG13]`

### 4.2 Rechtsgebiete-Abdeckung

| Kürzel | Rechtsgebiet | Fehlermuster |
|--------|-------------|-------------|
| BA | Bürgergeld/Grundsicherungsgeld (SGB II) | 25 |
| KK | Krankenkasse (SGB V) | 20 |
| DRV | Rentenversicherung (SGB VI) | 18 |
| ALG | Arbeitslosengeld (SGB III) | 15 |
| PK | Pflegekasse (SGB XI) | 15 |
| EH | Eingliederungshilfe (SGB IX) | 8 |
| SH | Sozialhilfe (SGB XII) | 8 |
| UV | Unfallversicherung (SGB VII) | 8 |
| VA | Versorgungsamt (BVG/SER) | 8 |
| BAMF | Bundesamt für Migration | 7 |
| JA | Jugendamt (SGB VIII) | 7 |
| BAF | BAföG | 5 |
| EG | Elterngeld (BEEG) | 5 |
| FK | Familienkasse (Kindergeld) | 5 |
| WG | Wohngeld (WoGG) | 5 |
| UVS | Unterhaltsvorschuss (UVG) | 4 |
| **Gesamt** | **16 Rechtsgebiete** | **163 Muster** |

**Lücken:** Keine strukturellen Lücken — AG01 erkennt alle 16 Gebiete, und alle haben Fehlermuster. Schwach abgedeckt sind UVS (4), BAF (5), EG (5), FK (5), WG (5).

### 4.3 Edge Cases

| Szenario | Verhalten | Beweis |
|----------|-----------|--------|
| **Leerer Text** | AG08 lässt durch (prüft nur 2000 Zeichen, leerer String → kein Treffer) | `ag08-security-gate.ts:34` |
| **Kein Rechtsgebiet erkannt** | AG01 gibt `"Unbekannt"` zurück → Sonnet-Fallback | `ag01-orchestrator.ts:161+188` |
| **Agent-Timeout / API-Fehler** | `safeExecute()` mit Graceful Degradation | `orchestrator.ts:28` |
| **Claude API down** | Legacy-Engine (`engine.ts`, GPT-4o) als Fallback | `analyze/route.ts:423` |
| **Budget überschritten** | `isBudgetExceeded()` prüft Kosten | `orchestrator.ts:27` |
| **Prompt Injection** | AG08 prüft (Haiku, 2000 Zeichen) — bei Parse-Fehler: **freigeben** | `ag08-security-gate.ts:62` — Risiko! |
| **Kein API-Key** | AG08 überspringt Security-Check (`freigabe: true`) | `ag08-security-gate.ts:25` |

### 4.4 AG08 Security Gate — Schwachstellen

1. **Nur 2000 Zeichen geprüft** (`ag08-security-gate.ts:34`) — Injection nach Zeichen 2001 wird nicht erkannt
2. **Parse-Fehler = Freigabe** (`ag08-security-gate.ts:62`) — wenn Haiku kein valides JSON liefert, wird der Input freigegeben
3. **Kein API-Key = Bypass** (`ag08-security-gate.ts:25`) — ohne Key wird der gesamte Security-Check übersprungen
4. **Orchestrator-Fallback = Freigabe** (`orchestrator.ts:138+149`) — sowohl `safeExecute` Fallback als auch `Promise.allSettled` Rejection setzen `freigabe: true`. Dreifach-Bypass: kein Key, Parse-Fehler, oder technischer Fehler → Input passiert immer.
5. **Kein Leerstring-Check** — leerer `documentText` wird nicht vor Pipeline-Start abgefangen

### 4.5 Edge Case: "Unbekannt"-Fallback

Wenn AG01 kein Rechtsgebiet erkennt (`"Unbekannt"`), fällt `detectTraegerKey()` auf `"jobcenter"` zurück (`utils.ts:139`). AG02 sucht dann im BA_-Fehlerkatalog — **fachlich falsch** für z.B. Rentenversicherungsbescheide. Der User wird **nicht** darüber informiert, dass die Analyse mit dem falschen Fehlerkatalog lief.

---

## ERGEBNIS-TABELLE

| # | Bereich | Status | Problem | Priorität |
|---|---------|--------|---------|-----------|
| 1 | **RDG: Verbotene Formulierungen** | KRITISCH | `layout.tsx:19` — "rechtssicher" in Meta-Description | P0 |
| 2 | **DSGVO: /api/assistant ohne Pseudonymisierung** | KRITISCH | User-Beschreibung geht als Klartext an Claude (USA) | P0 |
| 3 | **DSGVO: OpenAI Vision OCR-Fallback** | KRITISCH | Rohbilder mit PII an OpenAI (`analyze/route.ts:119-147`) | P0 |
| 4 | **DSGVO: /api/generate-letter ohne Pseudonymisierung** | RISIKO | Stichpunkte (max 500 Zeichen, user-getippt) an OpenAI (USA) | P1 |
| 5 | **DSGVO: Betroffenenrechte** | RISIKO | Kein Self-Service (Account löschen, Datenexport) | P1 |
| 6 | **DSGVO: Klardaten in DB** | RISIKO | `analysis_results` + `user_fristen` speichern de-pseudonymisierte Musterschreiben | P1 |
| 7 | **DSGVO: user_fristen Löschung unvollständig** | RISIKO | Offene Fristen ("offen"/"eingereicht") werden nie gelöscht | P1 |
| 8 | **Agenten: AG08 Security Gate** | RISIKO | Dreifach-Bypass (kein Key, Parse-Fehler, Rejection) → immer `freigabe: true` | P1 |
| 9 | **Agenten: "Unbekannt"-Fallback** | RISIKO | Falscher Fehlerkatalog (BA_) bei unerkanntem Rechtsgebiet, User nicht informiert | P1 |
| 10 | **RDG: Landingpage-Disclaimer** | RISIKO | Footer-only, `text-white/25` quasi unsichtbar | P1 |
| 11 | **RDG: Beratungsstellen-Links** | HINWEIS | Nur textuelle Verweise, keine klickbaren Links zu VdK/Caritas | P2 |
| 12 | **RDG: §-Inkonsistenz** | HINWEIS | § 2 vs. § 3 RDG uneinheitlich in Marketing/Verträgen | P2 |
| 13 | **Anonymisierung: Pseudonymizer-Lücken** | HINWEIS | Aktenzeichen, ausländische IBANs, Mobilnummern, Einzelvornamen | P2 |
| 14 | **Anonymisierung: Test-Abdeckung** | HINWEIS | 7 Tests, fehlende Edge Cases (SVN, Steuer-ID, BIC, Adressen) | P2 |
| — | **RDG: Disclaimer-Abdeckung** | OK | Auf allen relevanten Seiten, 5 Sprachen, PDFs | — |
| — | **DSGVO: Datenschutzseite** | OK | Umfassend, 14 Sektionen, alle Dienste genannt | — |
| — | **DSGVO: Löschfristen (analysis_results)** | OK | 90-Tage-Cron implementiert, stimmt mit DSE überein | — |
| — | **DSGVO: Cookie-Consent** | OK | Nur Session-Cookies, kein Banner nötig | — |
| — | **DSGVO: AVV-Seite** | OK | `/avv` vorhanden | — |
| — | **Anonymisierung: Pseudonymizer** | OK | 9 PII-Typen, 130+ Ausschluss-Wörter, in Analyse-Pipeline aktiv | — |
| — | **Anonymisierung: Logging** | OK | Keine PII in console.log/error gefunden | — |
| — | **Agenten: Vollständigkeit** | OK | 19 Agenten, alle Dateien vorhanden | — |
| — | **Agenten: Rechtsgebiete** | OK | 16 Gebiete, 163 Fehlermuster, lückenlos | — |
| — | **Agenten: Fallback-Mechanismen** | OK | Legacy-Engine, Sonnet-Fallback, safeExecute(), Graceful Degradation | — |

---

## ZUSAMMENFASSUNG

### Kritisch (P0) — sofort beheben

1. **`layout.tsx:19`** — "rechtssicher" aus Meta-Description entfernen. Ersatz: "professionell".
   - Fix: 1 Zeile, 10 Sekunden.

2. **`/api/assistant`** — Pseudonymisierung einbauen. User-`beschreibung` und `antworten` werden direkt an Claude gesendet. Nutzer geben dort oft Namen, Aktenzeichen und persönliche Details ein.
   - Fix: `pseudonymizeText()` + `depseudonymizeText()` um `beschreibung`/`antworten` wrappen.

3. **`/api/analyze` OpenAI Vision OCR** — Rohbilder mit PII (Namen, IBAN, Adressen als Pixel) an OpenAI. Pseudonymisierung greift erst NACH Textextraktion.
   - Fix: OpenAI-OCR-Fallback entfernen (nur Tesseract, lokal, DSGVO-konform) ODER separaten Consent-Schritt einbauen.

### Wichtig (P1) — innerhalb 2 Wochen

4. **`/api/generate-letter`** — Pseudonymisierung für `stichpunkte` einbauen (an OpenAI gesendet).

5. **Betroffenenrechte Self-Service** — Mindestens "Account löschen"-Button. Bei B2B-Skalierung wird manueller E-Mail-Prozess unhaltbar.

6. **AG08 Security Gate Dreifach-Bypass** — (a) `safeExecute` Fallback: `freigabe: false` statt `true` (`orchestrator.ts:138`), (b) Parse-Fehler: blockieren statt freigeben (`ag08-security-gate.ts:62`), (c) Kein-Key: blockieren statt bypassen (`ag08-security-gate.ts:25`), (d) `Promise.allSettled` Rejection: `freigabe: false` (`orchestrator.ts:149`).

7. **Klardaten in DB** — `analysis_results.fehler` wird nach `depseudonymizeText()` gespeichert → Klarnamen in DB. Entweder vor INSERT re-pseudonymisieren, oder INSERT vor De-Pseudonymisierung ausführen.

8. **user_fristen Löschung** — Offene Fristen akkumulieren unbegrenzt. `data-retention/route.ts:60` nur `erledigt`/`abgelaufen`. Fix: Alle Fristen nach 90 Tagen löschen, oder DSE anpassen.

9. **Landingpage-Disclaimer** — `text-white/25` im Footer quasi unsichtbar. Sichtbaren § 2 RDG Hinweis im Pricing/CTA-Bereich ergänzen.

10. **"Unbekannt"-Fallback** — Bei unerkanntem Rechtsgebiet fällt AG02 auf BA_-Fehlerkatalog zurück. User informieren wenn Rechtsgebiet nicht erkannt wurde.

### Hinweis (P2) — mittelfristig

11. **Beratungsstellen-Links** — Klickbare Links zu vdk.de, caritas.de, awo.org einbauen.
12. **§-Zitierung vereinheitlichen** — Konsistent "gem. § 2 Abs. 1 RDG".
13. **Pseudonymizer-Lücken** — Ausländische IBANs, Mobilnummern ohne Trennzeichen, Einzelvornamen, Aktenzeichen.
14. **Pseudonymizer-Tests** — Testfälle für alle 9+ PII-Typen, Roundtrip-Tests, Negative Tests.

---

## COMPLIANCE-SCORE

| Bereich | Score | Begründung |
|---------|-------|------------|
| RDG | 7.5/10 | 1x "rechtssicher", Landingpage-Disclaimer unsichtbar, sonst exzellent |
| DSGVO | 5/10 | 3 Codepfade ohne Pseudonymisierung (assistant, generate-letter, OCR-Fallback), kein Self-Service, offene Fristen nie gelöscht |
| Anonymisierung | 6.5/10 | Pseudonymizer solide für Analyse-Pipeline, aber 3 API-Routes umgehen ihn, Lücken bei exotischen PII-Typen |
| Agenten-System | 8/10 | Vollständig, robuste Fallbacks — aber AG08 hat Dreifach-Bypass, "Unbekannt"-Fallback problematisch |
| **Gesamt** | **6.5/10** |

---

## NÄCHSTE SCHRITTE (priorisiert)

```
P0 — SOFORT (vor nächstem Deploy):
  [ ] layout.tsx:19 — "rechtssicher" → "professionell"
  [ ] /api/assistant — pseudonymizeText() für beschreibung + antworten
  [ ] /api/analyze — OpenAI Vision OCR-Fallback entfernen oder Consent einbauen

P1 — INNERHALB 2 WOCHEN:
  [ ] /api/generate-letter — pseudonymizeText() für stichpunkte
  [ ] AG08 + orchestrator.ts — alle Fallbacks auf freigabe: false
  [ ] data-retention — alle user_fristen nach 90 Tagen löschen
  [ ] analysis_results — fehler pseudonymisiert speichern
  [ ] Landingpage — sichtbaren RDG-Disclaimer im CTA-Bereich
  [ ] "Unbekannt"-Fallback — User-Warnung wenn Rechtsgebiet nicht erkannt

P2 — MITTELFRISTIG:
  [ ] Account-Löschung Self-Service
  [ ] Beratungsstellen-Links (klickbar)
  [ ] Pseudonymizer: ausländische IBANs, Mobilnummern, Einzelvornamen
  [ ] Pseudonymizer-Tests erweitern
  [ ] §-Zitierung vereinheitlichen
```

---

*Dieser Bericht wurde automatisiert durch statische Code-Analyse erstellt (4 spezialisierte Agenten + manuelle Verifikation). Er ersetzt keine juristische Prüfung. Empfehlung: P0-Punkte sofort beheben, dann externen Datenschutzbeauftragten für formale DSGVO-Prüfung beauftragen.*
