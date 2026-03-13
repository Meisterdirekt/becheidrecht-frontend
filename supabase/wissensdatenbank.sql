-- BescheidRecht — Wissensdatenbank
-- Ausführen im Supabase SQL-Editor:
-- Dashboard → SQL Editor → New Query → einfügen → Run

-- ---------------------------------------------------------------------------
-- 1. urteile — BSG/BVerfG/LSG Entscheidungen (befüllt von AG04/AG05)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS urteile (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  gericht          text NOT NULL,
  aktenzeichen     text NOT NULL UNIQUE,
  entscheidungsdatum date,
  leitsatz         text NOT NULL,
  volltext_url     text,
  rechtsgebiet     text,
  stichwort        text[],
  relevanz_score   int DEFAULT 3
);

ALTER TABLE urteile ENABLE ROW LEVEL SECURITY;

-- Lesen: alle eingeloggten Nutzer (für AG02/AG03)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'urteile' AND policyname = 'Authenticated read urteile'
  ) THEN
    CREATE POLICY "Authenticated read urteile"
      ON urteile FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS urteile_rechtsgebiet_idx ON urteile(rechtsgebiet);
CREATE INDEX IF NOT EXISTS urteile_relevanz_idx ON urteile(relevanz_score DESC);

-- ---------------------------------------------------------------------------
-- 2. kennzahlen — Aktuelle Regelbedarfe, Schonvermögen, Freibeträge
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kennzahlen (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  schluessel   text NOT NULL UNIQUE,
  wert         numeric,
  wert_text    text,
  gueltig_ab   date,
  einheit      text,
  beschreibung text
);

ALTER TABLE kennzahlen ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'kennzahlen' AND policyname = 'Authenticated read kennzahlen'
  ) THEN
    CREATE POLICY "Authenticated read kennzahlen"
      ON kennzahlen FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Grundwerte 2026 — SGB II (Bürgergeld)
INSERT INTO kennzahlen (schluessel, wert, einheit, gueltig_ab, beschreibung) VALUES
  ('regelbedarf_2026_single',       563,   'EUR', '2026-01-01', 'Regelbedarf Alleinstehende SGB II 2026'),
  ('regelbedarf_2026_partner',      506,   'EUR', '2026-01-01', 'Regelbedarf Partner in BG SGB II 2026'),
  ('regelbedarf_2026_kind_0_5',     357,   'EUR', '2026-01-01', 'Regelbedarf Kind 0-5 Jahre SGB II 2026'),
  ('regelbedarf_2026_kind_6_13',    390,   'EUR', '2026-01-01', 'Regelbedarf Kind 6-13 Jahre SGB II 2026'),
  ('regelbedarf_2026_kind_14_17',   471,   'EUR', '2026-01-01', 'Regelbedarf Kind 14-17 Jahre SGB II 2026'),
  ('schonvermoegen_2026_single',  15000,   'EUR', '2026-01-01', 'Schonvermögen Einzelperson SGB II 2026'),
  ('schonvermoegen_2026_partner', 15000,   'EUR', '2026-01-01', 'Schonvermögen je Partner SGB II 2026'),
  ('schonvermoegen_2026_kind',    3100,    'EUR', '2026-01-01', 'Schonvermögen je Kind SGB II 2026'),
  ('freibetrag_erwerbstaetig_2026', 100,   'EUR', '2026-01-01', 'Grundfreibetrag Erwerbstätigkeit § 11b SGB II 2026')
ON CONFLICT (schluessel) DO NOTHING;

-- Grundwerte — Pflege (SGB XI) 2026
INSERT INTO kennzahlen (schluessel, wert, einheit, gueltig_ab, beschreibung) VALUES
  ('pflegegeld_2026_grad2',        347,   'EUR', '2025-01-01', 'Pflegegeld Pflegegrad 2 (§ 37 SGB XI) 2025/2026'),
  ('pflegegeld_2026_grad3',        599,   'EUR', '2025-01-01', 'Pflegegeld Pflegegrad 3 (§ 37 SGB XI) 2025/2026'),
  ('pflegegeld_2026_grad4',        800,   'EUR', '2025-01-01', 'Pflegegeld Pflegegrad 4 (§ 37 SGB XI) 2025/2026'),
  ('pflegegeld_2026_grad5',        990,   'EUR', '2025-01-01', 'Pflegegeld Pflegegrad 5 (§ 37 SGB XI) 2025/2026'),
  ('sachleistung_2026_grad2',      796,   'EUR', '2025-01-01', 'Pflegesachleistung Grad 2 (§ 36 SGB XI) 2025/2026'),
  ('sachleistung_2026_grad3',     1497,   'EUR', '2025-01-01', 'Pflegesachleistung Grad 3 (§ 36 SGB XI) 2025/2026'),
  ('sachleistung_2026_grad4',     1859,   'EUR', '2025-01-01', 'Pflegesachleistung Grad 4 (§ 36 SGB XI) 2025/2026'),
  ('sachleistung_2026_grad5',     2299,   'EUR', '2025-01-01', 'Pflegesachleistung Grad 5 (§ 36 SGB XI) 2025/2026'),
  ('entlastungsbetrag_2026',       131,   'EUR', '2025-01-01', 'Entlastungsbetrag § 45b SGB XI 2025/2026'),
  ('gemeinsamer_jahresbetrag_2026', 3539, 'EUR', '2025-07-01', 'Gemeinsamer Jahresbetrag Verhinderungs-/Kurzzeitpflege § 42a SGB XI')
ON CONFLICT (schluessel) DO NOTHING;

-- Grundwerte — BAföG 2026
INSERT INTO kennzahlen (schluessel, wert, einheit, gueltig_ab, beschreibung) VALUES
  ('bafoeg_2026_hoechstsatz',      992,   'EUR', '2026-01-01', 'BAföG Höchstsatz 2024/25 (inkl. Wohnpauschale + KV/PV)'),
  ('bafoeg_2026_grundbedarf',      475,   'EUR', '2026-01-01', 'BAföG Grundbedarf Studium'),
  ('bafoeg_2026_wohnpauschale',    380,   'EUR', '2026-01-01', 'BAföG Wohnpauschale (nicht bei Eltern)'),
  ('bafoeg_2026_freibetrag_verm', 15000,  'EUR', '2026-01-01', 'BAföG Vermögensfreibetrag § 29 BAföG'),
  ('bafoeg_2026_freibetrag_eltern_verheiratet', 2415, 'EUR', '2026-01-01', 'BAföG Elternfreibetrag (verheiratet, zusammen)'),
  ('bafoeg_2026_freibetrag_elternteil_allein', 1605, 'EUR', '2026-01-01', 'BAföG Elternfreibetrag (alleinstehend)')
ON CONFLICT (schluessel) DO NOTHING;

-- Grundwerte — Wohngeld 2026 (Beispielwerte, abhängig von Mietenstufe)
INSERT INTO kennzahlen (schluessel, wert, einheit, gueltig_ab, beschreibung) VALUES
  ('wohngeld_2026_klimakomponente',   0.40, 'EUR/qm', '2026-01-01', 'Wohngeld Klimakomponente pro qm'),
  ('wohngeld_2026_heizkostenkomponente', 2.20, 'EUR/qm', '2026-01-01', 'Wohngeld Heizkostenkomponente 2026')
ON CONFLICT (schluessel) DO NOTHING;

-- Grundwerte — Elterngeld (BEEG) 2026
INSERT INTO kennzahlen (schluessel, wert, einheit, gueltig_ab, beschreibung) VALUES
  ('elterngeld_2026_min',           300,   'EUR', '2026-01-01', 'Elterngeld Mindestbetrag § 2 Abs. 4 BEEG'),
  ('elterngeld_2026_max',          1800,   'EUR', '2026-01-01', 'Elterngeld Höchstbetrag § 2 Abs. 1 BEEG'),
  ('elterngeld_plus_2026_max',      900,   'EUR', '2026-01-01', 'ElterngeldPlus Höchstbetrag § 4a BEEG'),
  ('elterngeld_2026_ersatzrate',     67,   '%',   '2026-01-01', 'Elterngeld Ersatzrate (65-67% des Nettoeinkommens)')
ON CONFLICT (schluessel) DO NOTHING;

-- Grundwerte — Unterhaltsvorschuss (UVG) 2026
INSERT INTO kennzahlen (schluessel, wert, einheit, gueltig_ab, beschreibung) VALUES
  ('uvs_2026_0_5',                  227,   'EUR', '2026-01-01', 'Unterhaltsvorschuss 0-5 Jahre 2026'),
  ('uvs_2026_6_11',                 299,   'EUR', '2026-01-01', 'Unterhaltsvorschuss 6-11 Jahre 2026'),
  ('uvs_2026_12_17',                394,   'EUR', '2026-01-01', 'Unterhaltsvorschuss 12-17 Jahre 2026')
ON CONFLICT (schluessel) DO NOTHING;

-- Grundwerte — Rente (SGB VI)
INSERT INTO kennzahlen (schluessel, wert, einheit, gueltig_ab, beschreibung) VALUES
  ('rentenwert_west_2026_h1',     40.79,   'EUR', '2026-01-01', 'Aktueller Rentenwert West 01.01.-30.06.2026'),
  ('rentenwert_2026_h2',          42.52,   'EUR', '2026-07-01', 'Aktueller Rentenwert ab 01.07.2026 (+4,24%, Ost=West)'),
  ('regelaltersgrenze_jahrgang_1964', 67,  'Jahre','2031-01-01', 'Regelaltersgrenze Jahrgang 1964+')
ON CONFLICT (schluessel) DO NOTHING;

-- Grundwerte — Allgemein (Fristen)
INSERT INTO kennzahlen (schluessel, wert, einheit, gueltig_ab, beschreibung) VALUES
  ('widerspruchsfrist_tage',        30,    'Tage', '2000-01-01', 'Standard Widerspruchsfrist Verwaltungsakt'),
  ('klagefrist_tage',               30,    'Tage', '2000-01-01', 'Standard Klagefrist Sozialgericht'),
  ('widerspruchsfrist_ohne_belehrung', 365,'Tage', '2000-01-01', 'Widerspruchsfrist ohne Rechtsbehelfsbelehrung')
ON CONFLICT (schluessel) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. behoerdenfehler — Fehlertypen (Schema passend zu behoerdenfehler_logik.json)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS behoerdenfehler (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  fehler_id       text NOT NULL UNIQUE,
  titel           text NOT NULL,
  beschreibung    text,
  rechtsbasis     text[],
  severity        text NOT NULL DEFAULT 'hinweis' CHECK (severity IN ('hinweis', 'wichtig', 'kritisch')),
  prueflogik      jsonb,
  musterschreiben_hinweis text,
  severity_beschreibung text
);

ALTER TABLE behoerdenfehler ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'behoerdenfehler' AND policyname = 'Authenticated read behoerdenfehler'
  ) THEN
    CREATE POLICY "Authenticated read behoerdenfehler"
      ON behoerdenfehler FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS behoerdenfehler_severity_idx ON behoerdenfehler(severity);
CREATE INDEX IF NOT EXISTS behoerdenfehler_fehler_id_idx ON behoerdenfehler(fehler_id);

-- ---------------------------------------------------------------------------
-- 4. update_protokoll — Audit-Trail aller AG05-Schreibvorgänge
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS update_protokoll (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  agent_id      text NOT NULL,
  tabelle       text NOT NULL,
  operation     text NOT NULL,
  datensatz_id  uuid,
  notiz         text
);

ALTER TABLE update_protokoll ENABLE ROW LEVEL SECURITY;

-- Service-Role Write-Policy (Cron/Admin-Operationen)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'update_protokoll' AND policyname = 'Service write update_protokoll'
  ) THEN
    CREATE POLICY "Service write update_protokoll"
      ON update_protokoll FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Admin-Read via Service-Role
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'update_protokoll' AND policyname = 'Service read update_protokoll'
  ) THEN
    CREATE POLICY "Service read update_protokoll"
      ON update_protokoll FOR SELECT
      USING (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS update_protokoll_agent_idx ON update_protokoll(agent_id);
CREATE INDEX IF NOT EXISTS update_protokoll_created_idx ON update_protokoll(created_at DESC);

-- ---------------------------------------------------------------------------
-- 5. sessions — Analyse-Sitzungen pro Nutzer
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  status          text NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed')),
  document_name   text,
  file_type       text CHECK (file_type IN ('pdf', 'image', 'text')),
  file_size_bytes int
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Users read own sessions'
  ) THEN
    CREATE POLICY "Users read own sessions"
      ON sessions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Users insert own sessions'
  ) THEN
    CREATE POLICY "Users insert own sessions"
      ON sessions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_created_idx ON sessions(created_at DESC);

-- ---------------------------------------------------------------------------
-- 6. analysis_results — Analyse-Ergebnisse (referenziert session)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS analysis_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid REFERENCES sessions(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  behoerde        text,
  rechtsgebiet    text,
  fehler          jsonb DEFAULT '[]'::jsonb,
  musterschreiben text,
  frist_datum     text,
  dringlichkeit   text CHECK (dringlichkeit IN ('NORMAL', 'HOCH', 'NOTFALL')),
  model_used      text,
  token_cost_eur  numeric(8,4) DEFAULT 0,
  analyse_meta    jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analysis_results' AND policyname = 'Users read own results'
  ) THEN
    CREATE POLICY "Users read own results"
      ON analysis_results FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analysis_results' AND policyname = 'Users insert own results'
  ) THEN
    CREATE POLICY "Users insert own results"
      ON analysis_results FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS analysis_results_user_idx ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS analysis_results_session_idx ON analysis_results(session_id);
CREATE INDEX IF NOT EXISTS analysis_results_created_idx ON analysis_results(created_at DESC);
CREATE INDEX IF NOT EXISTS analysis_results_rechtsgebiet_idx ON analysis_results(rechtsgebiet);

-- ---------------------------------------------------------------------------
-- Deployment-Anleitung
-- ---------------------------------------------------------------------------
-- 1. Supabase Dashboard öffnen → SQL Editor → New Query
-- 2. Gesamtes Script einfügen → Run
-- 3. Prüfen: Table Editor → alle 6 Tabellen sichtbar
-- 4. Prüfen: /api/admin/infra-status → alle Tabellen "ok"
-- ---------------------------------------------------------------------------
