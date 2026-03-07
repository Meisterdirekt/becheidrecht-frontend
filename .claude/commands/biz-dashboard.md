# BescheidRecht — Business Intelligence Dashboard

Du bist der CFO und Head of Analytics. Zeige dem Gründer in 60 Sekunden alles was er wissen muss: Revenue, User, KI-Kosten, Fehler, Feedback. Kein Bullshit, nur Zahlen die zählen.

---

## PHASE 1 — VERBINDUNG

Prüfe: Supabase MCP verfügbar? SUPABASE_SERVICE_ROLE_KEY gesetzt?
Falls nicht: Anleitung zeigen und abbrechen.

Supabase-Projekt: `xprrzmcickfparpogbpj`

---

## PHASE 2 — METRIKEN ABRUFEN (parallel)

### USER-METRIKEN
```sql
-- Gesamt-User
SELECT COUNT(*) as gesamt,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24h') as heute,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7d') as diese_woche,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30d') as diesen_monat
FROM profiles;
```

### REVENUE-METRIKEN
```sql
-- Aktive Abonnements
SELECT
  plan_id,
  COUNT(*) as anzahl,
  COUNT(*) FILTER (WHERE status = 'active') as aktiv,
  COUNT(*) FILTER (WHERE status = 'cancelled') as gekuendigt
FROM user_subscriptions
GROUP BY plan_id
ORDER BY anzahl DESC;
```

```sql
-- Einzel-Käufe
SELECT
  product_key,
  COUNT(*) as kaeufe,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30d') as letzte_30_tage
FROM single_purchases
GROUP BY product_key;
```

### NUTZUNGS-METRIKEN
```sql
-- Analysen gesamt + Trend
SELECT
  COUNT(*) as gesamt,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24h') as heute,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7d') as diese_woche,
  AVG(CASE WHEN token_cost_eur IS NOT NULL THEN token_cost_eur END) as avg_kosten_eur,
  SUM(CASE WHEN created_at >= NOW() - INTERVAL '30d' AND token_cost_eur IS NOT NULL
    THEN token_cost_eur END) as kosten_diesen_monat
FROM analysis_results;
```

```sql
-- Routing-Verteilung (Normal/Hoch/Notfall)
SELECT
  dringlichkeit,
  COUNT(*) as analysen,
  ROUND(AVG(token_cost_eur)::numeric, 4) as avg_cost_eur
FROM analysis_results
WHERE created_at >= NOW() - INTERVAL '30d'
GROUP BY dringlichkeit;
```

### FEHLER-METRIKEN
```sql
-- AG06 Qualitätsprobleme der letzten Woche
SELECT agent_id, operation, notiz, created_at
FROM update_protokoll
WHERE created_at >= NOW() - INTERVAL '7d'
ORDER BY created_at DESC
LIMIT 10;
```

### FRISTEN-METRIKEN
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'offen') as offen,
  COUNT(*) FILTER (WHERE status = 'abgelaufen') as abgelaufen,
  COUNT(*) FILTER (WHERE frist_datum < NOW() AND status = 'offen') as ueberfaellig,
  COUNT(*) FILTER (WHERE frist_datum <= NOW() + INTERVAL '7d' AND status = 'offen') as bald_faellig
FROM user_fristen;
```

### USER-FEEDBACK
```sql
SELECT rating, feedback_text, created_at
FROM site_feedback
ORDER BY created_at DESC
LIMIT 5;
```

---

## PHASE 3 — KI-KOSTEN BERECHNEN

Lese `src/lib/logic/agents/utils.ts` für aktuelle Preisstruktur.
Berechne:
- Kosten dieser Monat (aus analysis_results)
- Hochrechnung auf Jahresbasis
- Cost per Analysis (Durchschnitt)
- Welches Modell verursacht die meisten Kosten?

Monatliche Kosten-Schwellenwerte:
- < €50/Monat: Grün (unkritisch)
- €50–200/Monat: Gelb (im Auge behalten)
- > €200/Monat: Rot (Optimierung nötig)

---

## PHASE 4 — DASHBOARD AUSGEBEN

```
╔══════════════════════════════════════════════════════════╗
║  BESCHEIDRECHT — BUSINESS DASHBOARD  [Datum]            ║
╠════════════════════╦═════════════════════════════════════╣
║  NUTZER            ║                                     ║
║  Gesamt            ║  [N]                               ║
║  Heute neu         ║  [N]  [↑↓ vs. gestern]             ║
║  Diese Woche       ║  [N]                               ║
║  Diesen Monat      ║  [N]                               ║
╠════════════════════╬═════════════════════════════════════╣
║  REVENUE           ║                                     ║
║  Aktive Abos       ║  Basic: N  Standard: N  Pro: N     ║
║  Einzel-Käufe/30d  ║  [N] × €19,90 = €[X]              ║
╠════════════════════╬═════════════════════════════════════╣
║  ANALYSEN          ║                                     ║
║  Heute             ║  [N]                               ║
║  Diese Woche       ║  [N]                               ║
║  Routing           ║  Normal: N%  Hoch: N%  Notfall: N% ║
╠════════════════════╬═════════════════════════════════════╣
║  KI-KOSTEN         ║                                     ║
║  Diesen Monat      ║  €[X]  ([Warnstufe])               ║
║  Ø pro Analyse     ║  €[X]                              ║
║  Hochrechnung/Jahr ║  €[X]                              ║
╠════════════════════╬═════════════════════════════════════╣
║  FRISTEN           ║                                     ║
║  Offen             ║  [N]  (davon [N] in 7 Tagen!)      ║
║  Abgelaufen        ║  [N]                               ║
╠════════════════════╬═════════════════════════════════════╣
║  QUALITÄT          ║                                     ║
║  AG06-Probleme/7d  ║  [N]  [Details falls > 0]          ║
╠════════════════════╬═════════════════════════════════════╣
║  FEEDBACK (letzte) ║                                     ║
║  ⭐⭐⭐⭐⭐           ║  "[Feedback-Text]"                 ║
╚════════════════════╩═════════════════════════════════════╝

HANDLUNGSBEDARF:
❌ [Kritisches Problem] → [Konkreter nächster Schritt]
⚠️ [Wichtiges Thema]   → [Empfehlung]
✅ [Was gut läuft]
```

---

## REGELN

- Niemals Passwörter, API-Keys oder Rohdaten ausgeben
- Keine User-E-Mails ausgeben (DSGVO)
- Bei fehlenden Tabellen: Klarer Hinweis, kein Crash
- Revenue-Zahlen immer mit "~" markieren wenn geschätzt
