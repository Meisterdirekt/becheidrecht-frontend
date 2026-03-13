-- Fristen-Tracker Tabelle
-- Speichert Widerspruchsfristen aus analysierten Bescheiden

CREATE TABLE IF NOT EXISTS user_fristen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Bescheid-Infos
  behoerde text,
  rechtsgebiet text,
  untergebiet text,
  bescheid_datum text,

  -- Frist
  frist_datum date,

  -- Status: offen | eingereicht | erledigt | abgelaufen
  status text NOT NULL DEFAULT 'offen',

  -- Optionale Felder
  notizen text,
  musterschreiben text,
  analyse_meta jsonb
);

-- Row Level Security
ALTER TABLE user_fristen ENABLE ROW LEVEL SECURITY;

-- Policy: Nutzer sehen nur ihre eigenen Fristen
DROP POLICY IF EXISTS "Users can manage their own fristen" ON user_fristen;
CREATE POLICY "Users can manage their own fristen"
  ON user_fristen
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Automatisches updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_fristen_updated_at
  BEFORE UPDATE ON user_fristen
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Index für schnelle User-Abfragen
CREATE INDEX IF NOT EXISTS user_fristen_user_id_idx ON user_fristen(user_id);
CREATE INDEX IF NOT EXISTS user_fristen_frist_datum_idx ON user_fristen(frist_datum);
