-- kennzahlen_history: Versionierung von Kennzahlen-Änderungen
-- Jede Wertänderung wird automatisch per Trigger protokolliert (alt → neu),
-- damit alte vs. neue Gesetzesversionen verglichen werden können.
--
-- Trigger feuert BEFORE UPDATE auf kennzahlen — nur wenn sich wert, einheit
-- oder gueltig_ab tatsächlich ändern (kein Spam bei identischen Upserts).

CREATE TABLE IF NOT EXISTS kennzahlen_history (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_at       timestamptz NOT NULL DEFAULT now(),
  kennzahl_id      uuid REFERENCES kennzahlen(id) ON DELETE CASCADE,
  schluessel       text NOT NULL,
  wert_alt         numeric,
  wert_neu         numeric,
  einheit_alt      text,
  einheit_neu      text,
  gueltig_ab_alt   date,
  gueltig_ab_neu   date,
  beschreibung_alt text,
  beschreibung_neu text,
  geaendert_durch  text DEFAULT 'AG15'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kennzahlen_history_schluessel ON kennzahlen_history (schluessel);
CREATE INDEX IF NOT EXISTS idx_kennzahlen_history_changed ON kennzahlen_history (changed_at DESC);

-- RLS
ALTER TABLE kennzahlen_history ENABLE ROW LEVEL SECURITY;

-- Service-Role kann schreiben (Trigger + AG15 Cron)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'kennzahlen_history' AND policyname = 'service_role_insert_kennzahlen_history'
  ) THEN
    CREATE POLICY "service_role_insert_kennzahlen_history"
      ON kennzahlen_history FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Authenticated Users können History lesen (Admin-Panel)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'kennzahlen_history' AND policyname = 'authenticated_read_kennzahlen_history'
  ) THEN
    CREATE POLICY "authenticated_read_kennzahlen_history"
      ON kennzahlen_history FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Service-Role Lesezugriff
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'kennzahlen_history' AND policyname = 'service_role_read_kennzahlen_history'
  ) THEN
    CREATE POLICY "service_role_read_kennzahlen_history"
      ON kennzahlen_history FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Trigger: Automatisch alten Wert archivieren bei UPDATE auf kennzahlen
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION kennzahlen_version_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Nur archivieren wenn sich wert, einheit oder gueltig_ab ändert
  IF (OLD.wert IS DISTINCT FROM NEW.wert)
     OR (OLD.einheit IS DISTINCT FROM NEW.einheit)
     OR (OLD.gueltig_ab IS DISTINCT FROM NEW.gueltig_ab) THEN

    INSERT INTO kennzahlen_history (
      kennzahl_id, schluessel,
      wert_alt, wert_neu,
      einheit_alt, einheit_neu,
      gueltig_ab_alt, gueltig_ab_neu,
      beschreibung_alt, beschreibung_neu
    ) VALUES (
      OLD.id, OLD.schluessel,
      OLD.wert, NEW.wert,
      OLD.einheit, NEW.einheit,
      OLD.gueltig_ab, NEW.gueltig_ab,
      OLD.beschreibung, NEW.beschreibung
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS kennzahlen_version ON kennzahlen;
CREATE TRIGGER kennzahlen_version
  BEFORE UPDATE ON kennzahlen
  FOR EACH ROW
  EXECUTE FUNCTION kennzahlen_version_trigger();

-- ---------------------------------------------------------------------------
-- update_protokoll: alter_wert Spalte hinzufügen (für menschenlesbare Diffs)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'update_protokoll' AND column_name = 'alter_wert'
  ) THEN
    ALTER TABLE update_protokoll ADD COLUMN alter_wert text;
  END IF;
END $$;
