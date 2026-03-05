-- Falls die Tabelle site_feedback schon existiert, aber Feedback nicht abgeschickt werden kann:
-- Dieses SQL einmal im Supabase SQL-Editor ausführen. Es erlaubt der API (mit Anon-Key), Feedback zu speichern und anzuzeigen.

-- Alte Policies entfernen, falls sie unter anderem Namen existieren (ignorieren falls Fehler "does not exist")
DROP POLICY IF EXISTS "site_feedback_anon_insert" ON site_feedback;
DROP POLICY IF EXISTS "site_feedback_anon_select" ON site_feedback;

-- Anon darf neue Zeilen einfügen (Feedback-Formular)
CREATE POLICY "site_feedback_anon_insert"
  ON site_feedback FOR INSERT TO anon WITH CHECK (true);

-- Anon darf alle Zeilen lesen (Anzeige "Was andere sagen")
CREATE POLICY "site_feedback_anon_select"
  ON site_feedback FOR SELECT TO anon USING (true);
