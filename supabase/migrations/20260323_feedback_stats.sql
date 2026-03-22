-- ============================================================================
-- feedback_stats — Aggregierte False-Positive-Raten pro Fehler-ID
-- Geschrieben von AG20 (woechentlicher Feedback-Learner)
-- Gelesen von AG02 (Analyst) um bekannte False Positives zu vermeiden
-- ============================================================================

CREATE TABLE IF NOT EXISTS feedback_stats (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fehler_id            text NOT NULL,
  false_positive_count int NOT NULL DEFAULT 0,
  total_count          int NOT NULL DEFAULT 0,
  false_positive_rate  numeric(5,2) NOT NULL DEFAULT 0,
  rechtsgebiet         text,
  last_updated         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(fehler_id)
);

ALTER TABLE feedback_stats ENABLE ROW LEVEL SECURITY;

-- AG20 Cron schreibt mit Service-Role-Key
CREATE POLICY "service_write_feedback_stats"
  ON feedback_stats FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- AG02 liest ueber db_read (authenticated oder service_role)
CREATE POLICY "authenticated_read_feedback_stats"
  ON feedback_stats FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

CREATE INDEX IF NOT EXISTS feedback_stats_fp_rate_idx
  ON feedback_stats(false_positive_rate DESC);

-- Service-Role SELECT auf analysis_feedback (fuer AG20 Aggregation)
-- Nur wenn analysis_feedback existiert
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analysis_feedback') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'analysis_feedback' AND policyname = 'service_read_analysis_feedback'
    ) THEN
      EXECUTE 'CREATE POLICY "service_read_analysis_feedback"
        ON analysis_feedback FOR SELECT
        USING (auth.role() = ''service_role'')';
    END IF;
  END IF;
END $$;
