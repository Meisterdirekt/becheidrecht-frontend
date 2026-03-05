# BescheidRecht — Wissensdatenbank Setup

Richte die Wissensdatenbank-Tabellen für das 13-Agenten-System in Supabase ein.

## Kontext
Projekt: `/home/henne1990/bescheidrecht-frontend`
Supabase-Projekt: `xprrzmcickfparpogbpj`
Dokumentation: `AGENTS.md` im Projektordner

## Benötigte Tabellen (aus AGENTS.md)

Erstelle die SQL-Datei `supabase/wissensdatenbank.sql` mit diesen Tabellen:

### 1. `urteile` — BSG/BVerfG Urteile
```sql
CREATE TABLE IF NOT EXISTS urteile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  gericht text NOT NULL,           -- 'BSG', 'BVerfG', 'LSG'
  aktenzeichen text NOT NULL UNIQUE,
  entscheidungsdatum date,
  leitsatz text NOT NULL,
  volltext_url text,
  rechtsgebiet text,               -- 'SGB_II', 'SGB_V', etc.
  stichwort text[],
  relevanz_score int DEFAULT 5
);
```

### 2. `kennzahlen` — Aktuelle Regelbedarfe etc.
```sql
CREATE TABLE IF NOT EXISTS kennzahlen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  schluessel text NOT NULL UNIQUE,  -- z.B. 'regelbedarf_2026_single'
  wert numeric,
  wert_text text,
  gueltig_ab date,
  einheit text,                     -- 'EUR', 'Tage', etc.
  beschreibung text
);
```

### 3. `behoerdenfehler` — Fehlertypen
```sql
CREATE TABLE IF NOT EXISTS behoerdenfehler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  code text NOT NULL UNIQUE,
  traeger text,                     -- 'BA_', 'GKV_', 'MDK_', etc.
  kategorie text,                   -- 'formell', 'materiell', 'verfahren'
  titel text NOT NULL,
  beschreibung text,
  norm text[],
  argumente text[],
  severity int DEFAULT 3            -- 1=niedrig, 5=kritisch
);
```

### 4. `update_protokoll` — Audit-Trail
```sql
CREATE TABLE IF NOT EXISTS update_protokoll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  agent_id text NOT NULL,           -- 'AG05', 'AG06'
  tabelle text NOT NULL,
  operation text NOT NULL,          -- 'INSERT', 'UPDATE', 'DELETE'
  datensatz_id uuid,
  notiz text
);
```

## Sicherheit
- Alle Tabellen: RLS aktivieren
- Lese-Policy für authentifizierte Nutzer (urteile, kennzahlen)
- Keine direkte Schreib-Policy für Nutzer (nur via Service-Role / AG05)

## SQL ausgeben
Zeige das vollständige SQL zum Einfügen in den Supabase SQL-Editor.
Erstelle zusätzlich die Datei `supabase/wissensdatenbank.sql`.
