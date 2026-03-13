-- Einmalig im Supabase SQL-Editor ausführen (Dashboard → SQL Editor → New query).
-- Erstellt die Tabelle für Feedback-Einträge.
--
-- Echtzeit-Besucher: Supabase Realtime ist in der Regel bereits aktiviert.
-- Falls die Anzeige „X Besucher gerade online“ nicht erscheint: Im Dashboard unter
-- Project Settings → API prüfen, ob Realtime aktiv ist.

CREATE TABLE IF NOT EXISTS site_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  message text NOT NULL,
  rating smallint CHECK (rating >= 1 AND rating <= 5),
  name text,
  email text
);

-- RLS: Anon darf einfügen (Feedback-Formular) und lesen (Anzeige auf der Seite).
-- Wenn SUPABASE_SERVICE_ROLE_KEY gesetzt ist, nutzt die API den; sonst reicht der Anon-Key.
ALTER TABLE site_feedback ENABLE ROW LEVEL SECURITY;

-- Jeder (anon) darf neue Zeilen einfügen (für das Feedback-Formular)
DROP POLICY IF EXISTS "site_feedback_anon_insert" ON site_feedback;
CREATE POLICY "site_feedback_anon_insert"
  ON site_feedback FOR INSERT TO anon WITH CHECK (true);

-- Jeder (anon) darf alle Zeilen lesen (für die öffentliche Anzeige "Was andere sagen")
DROP POLICY IF EXISTS "site_feedback_anon_select" ON site_feedback;
CREATE POLICY "site_feedback_anon_select"
  ON site_feedback FOR SELECT TO anon USING (true);

COMMENT ON TABLE site_feedback IS 'Feedback von Besuchern (Formular /feedback)';
