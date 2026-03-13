-- Demo-Anfragen Tabelle für B2B-Leads
-- Deploy: Supabase SQL-Editor → dieses Script ausführen

CREATE TABLE IF NOT EXISTS demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  org_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  berater_count smallint,
  message text,
  selected_tarif text,
  status text NOT NULL DEFAULT 'neu'
    CHECK (status IN ('neu', 'kontaktiert', 'konvertiert', 'abgelehnt'))
);

-- Index für Admin-Abfragen
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests (status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created ON demo_requests (created_at DESC);

-- RLS aktivieren
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Öffentliches INSERT (Formular auf B2B-Seite)
CREATE POLICY "demo_requests_anon_insert"
  ON demo_requests FOR INSERT TO anon
  WITH CHECK (true);

-- Nur service_role darf lesen (Admin-Panel)
CREATE POLICY "demo_requests_service_select"
  ON demo_requests FOR SELECT TO service_role
  USING (true);

-- Nur service_role darf Status updaten
CREATE POLICY "demo_requests_service_update"
  ON demo_requests FOR UPDATE TO service_role
  USING (true);
