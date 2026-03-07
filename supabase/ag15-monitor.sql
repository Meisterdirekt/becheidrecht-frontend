-- AG15 — Rechts-Monitor: Zusätzliche Tabellen + Indices
-- Ausführen im Supabase SQL-Editor NACH wissensdatenbank.sql

-- ---------------------------------------------------------------------------
-- weisungen — Fachliche Weisungen der BA, DRV, Pflegekassen (befüllt von AG15)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS weisungen (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  traeger         text NOT NULL,  -- 'jobcenter', 'arbeitsagentur', 'drv', 'pflegekasse'
  weisung_nr      text NOT NULL UNIQUE,
  titel           text NOT NULL,
  gueltig_ab      date,
  gueltig_bis     date,  -- null = noch gültig
  zusammenfassung text,
  url             text,
  rechtsgebiet    text
);

ALTER TABLE weisungen ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'weisungen' AND policyname = 'Authenticated read weisungen'
  ) THEN
    CREATE POLICY "Authenticated read weisungen"
      ON weisungen FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Service-Role darf schreiben (AG15 nutzt Service-Key)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'weisungen' AND policyname = 'Service write weisungen'
  ) THEN
    CREATE POLICY "Service write weisungen"
      ON weisungen FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS weisungen_traeger_idx ON weisungen(traeger);
CREATE INDEX IF NOT EXISTS weisungen_gueltig_ab_idx ON weisungen(gueltig_ab DESC);
CREATE INDEX IF NOT EXISTS weisungen_rechtsgebiet_idx ON weisungen(rechtsgebiet);

-- ---------------------------------------------------------------------------
-- Fehlende Indices aus wissensdatenbank.sql für Performance
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS kennzahlen_schluessel_idx ON kennzahlen(schluessel);
CREATE INDEX IF NOT EXISTS urteile_datum_idx ON urteile(entscheidungsdatum DESC);
CREATE INDEX IF NOT EXISTS urteile_stichwort_idx ON urteile USING gin(stichwort);
CREATE INDEX IF NOT EXISTS behoerdenfehler_updated_idx ON behoerdenfehler(updated_at DESC);

-- ---------------------------------------------------------------------------
-- update_protokoll: agent_id Spalte auf AG15 erweitern (bereits text-Feld)
-- Keine Migration nötig — AG15 schreibt direkt mit agent_id='AG15'
-- ---------------------------------------------------------------------------

-- Hinweis: update_protokoll.daten ist text-Feld, deshalb JSON.stringify() nötig
-- Dies ist bereits in db-write.ts implementiert

-- ---------------------------------------------------------------------------
-- Deployment-Check
-- ---------------------------------------------------------------------------
-- Nach Ausführung prüfen:
-- Table Editor → weisungen (vorhanden, mit RLS)
-- Table Editor → update_protokoll → filter: agent_id = 'AG15'
-- ---------------------------------------------------------------------------
