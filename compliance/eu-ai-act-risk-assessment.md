# EU AI Act — Risikobewertung BescheidRecht

**Datum:** 15.03.2026
**Verantwortlich:** Hendrik Berkensträter
**System:** BescheidRecht (bescheidrecht.de)
**Rechtsgrundlage:** VO (EU) 2024/1689 (EU AI Act)

---

## 1. Systemidentifikation

| Feld | Wert |
|------|------|
| Systemname | BescheidRecht |
| Anbieter | Hendrik Berkensträter, Vechta |
| Einsatzzweck | KI-gestützte Analyse von Verwaltungsakten im deutschen Sozialrecht |
| Zielgruppe | B2B: Sozialberatungsstellen (Caritas, AWO, Diakonie etc.) |
| KI-Modelle | Anthropic Claude Sonnet/Opus, OpenAI GPT-4o (Fallback) |
| Risikoklasse | **Hochrisiko** (Art. 6 Abs. 2 i.V.m. Anhang III Nr. 8a) |

## 2. Risikoklassifikation (Art. 6)

BescheidRecht fällt unter Anhang III Nr. 8 lit. a:
> "KI-Systeme, die dazu bestimmt sind, von Behörden oder im Namen von Behörden verwendet zu werden, um [...] den Zugang zu [...] wesentlichen öffentlichen Unterstützungsleistungen und -diensten zu bewerten"

**Begründung:** Das System analysiert Bescheide, die den Zugang zu Sozialleistungen regeln (SGB II/III/V/VI/VIII/IX/XII), und generiert Widerspruchsschreiben. Fehlerhafte Analysen könnten dazu führen, dass berechtigte Ansprüche nicht geltend gemacht werden.

## 3. Identifizierte Risiken

### 3.1 Inhaltliche Risiken

| Risiko | Schwere | Wahrscheinlichkeit | Maßnahme |
|--------|---------|---------------------|----------|
| Fehlerhafte Rechtsanalyse | Hoch | Mittel | Multi-Agent-Pipeline mit Kritik-Agent (AG03), Fehlerkatalog (163 Einträge) |
| Veraltete Rechtsgrundlagen | Hoch | Mittel | Monatlicher Rechts-Monitor (AG15), Wissensdatenbank-Updates |
| Halluzinierte Paragraphen/Urteile | Hoch | Niedrig | Recherche-Agent (AG04) mit DB-Validierung, keine freie Zitation |
| Falsche Fristberechnung | Kritisch | Niedrig | Strikte Datumsberechnung in Code, nicht in KI-Prompt |

### 3.2 Datenschutzrisiken

| Risiko | Schwere | Wahrscheinlichkeit | Maßnahme |
|--------|---------|---------------------|----------|
| PII-Übertragung an KI-Anbieter | Hoch | Niedrig | Automatische Pseudonymisierung vor API-Call |
| Datenspeicherung durch KI-Anbieter | Hoch | Sehr niedrig | Zero-Retention-Policy, AVV nach Art. 28 DSGVO |
| Unbefugter Zugriff auf Analyseergebnisse | Mittel | Niedrig | RLS-Policies, JWT-basierte Authentifizierung |

### 3.3 Systemrisiken

| Risiko | Schwere | Wahrscheinlichkeit | Maßnahme |
|--------|---------|---------------------|----------|
| Prompt Injection | Hoch | Mittel | Sicherheitsfilter (AG08) als erste Pipeline-Stufe |
| Systemausfall | Mittel | Niedrig | Health-Monitoring (alle 5 Min), automatische GitHub Issues |
| Kostenexplosion | Mittel | Niedrig | Tägliches Kosten-Monitoring mit Anomalie-Erkennung |

## 4. Maßnahmen zur Risikominimierung (Art. 9)

### 4.1 Technische Maßnahmen

- **13-Agenten-Pipeline:** Separation of Concerns — jeder Agent hat eine definierte Aufgabe
- **Sicherheitsfilter (AG08):** Erster Agent in der Pipeline, prüft auf Manipulation und unzulässige Inhalte
- **Kritik-Agent (AG03):** Bewertet jede Analyse auf Plausibilität, Vollständigkeit und Erfolgschance
- **Pseudonymisierung:** Automatische PII-Erkennung und -Ersetzung vor API-Aufrufen
- **Rate-Limiting:** API-Zugriffsbeschränkung pro Nutzer
- **Fehlerkatalog:** 163 strukturierte Fehlertypen mit Prüflogiken über 16 Rechtsgebiete

### 4.2 Organisatorische Maßnahmen

- **Keine Rechtsberatung:** Klare Kennzeichnung aller Ausgaben als "Entwurf" und "Vorlage"
- **Pflicht-Disclaimer:** § 2 RDG Hinweis auf jeder Analyse-Seite und in generierten PDFs
- **Nutzer-Verantwortung:** Explizite Aufforderung zur Prüfung durch Rechtsanwalt/Beratungsstelle
- **B2B-only:** Einsatz nur durch geschultes Personal in Sozialberatungsstellen

### 4.3 Monitoring-Maßnahmen

- **AG16 (täglich):** Vercel Deployment-Check
- **AG17 (wöchentlich):** Agent-Metriken und Anomalie-Erkennung
- **AG18 (monatlich):** Content-Audit (Fehlerkatalog, Kennzahlen, Weisungen)
- **AG15 (monatlich):** Rechtsreform-Monitor mit automatischer PR-Erstellung
- **AG19 (wöchentlich):** Design-System und Accessibility-Prüfung
- **Uptime-Monitoring:** Health-Check alle 5 Minuten
- **Security-Scans:** npm audit + Secrets-Scan bei jedem Push

## 5. Menschliche Aufsicht (Art. 14)

| Maßnahme | Beschreibung |
|----------|-------------|
| Nutzer-Review | Alle Ausgaben als "Entwurf" gekennzeichnet, Nutzer muss prüfen |
| Verfeinerung | Nutzer kann zusätzlichen Kontext für Re-Analyse liefern |
| Platzhalter-Pflicht | Generierte Schreiben enthalten [Platzhalter], die manuell ersetzt werden müssen |
| Fachliche Empfehlung | Explizite Empfehlung zur Konsultation von Rechtsanwalt/VdK/Sozialverband |
| Keine automatische Einreichung | System generiert nur Entwürfe, keine automatische Behörden-Kommunikation |

## 6. Datengovernance (Art. 10)

- **Keine Trainingsdaten:** Keine eigenen KI-Modelle werden trainiert
- **Fehlerkatalog:** Kuratierte juristische Wissensbasis, manuell gepflegt
- **Quellennachweis:** Jede Regel im Fehlerkatalog hat dokumentierte Rechtsquellen
- **Datenminimierung:** Nur pseudonymisierte Bescheid-Texte werden an KI-Anbieter übermittelt
- **Löschfristen:** Analyseergebnisse nach 90 Tagen automatisch gelöscht

## 7. Transparenz (Art. 13)

- **Öffentliche KI-Transparenzseite:** /ki-transparenz auf der Website
- **Datenschutzerklärung:** Detaillierte Beschreibung der KI-Verarbeitung
- **AGB:** Haftungsausschluss und Nutzungsbedingungen
- **AVV:** Auftragsverarbeitungsvertrag für B2B-Kunden
- **KI-Label:** Sichtbares "KI-generiert" Badge auf allen Analyseergebnissen

## 8. Nächste Schritte

- [ ] Formale Konformitätsbewertung nach Art. 43 prüfen
- [ ] Registrierung in EU-KI-Datenbank nach Art. 49 prüfen (ab Anwendung der VO)
- [ ] Bias-Testing dokumentieren (Rechtsgebiete, Sprachen, Bescheid-Typen)
- [ ] Post-Market-Monitoring-Plan formalisieren
- [ ] Jährliche Review dieser Risikobewertung einplanen

---

**Letzte Aktualisierung:** 15.03.2026
**Nächste Review:** 15.06.2026
