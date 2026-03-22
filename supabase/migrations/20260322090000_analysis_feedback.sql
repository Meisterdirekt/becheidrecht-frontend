-- Analysis Feedback: Nutzer-Feedback zu einzelnen Analysen
-- Ermoeglicht Lernmechanismus: "War diese Analyse korrekt?"

CREATE TABLE IF NOT EXISTS analysis_feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id     uuid NOT NULL REFERENCES analysis_results(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type   text NOT NULL CHECK (feedback_type IN ('correct', 'partially_correct', 'incorrect')),
  correction_text text,
  fehler_feedback jsonb DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analysis_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own feedback"
  ON analysis_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own feedback"
  ON analysis_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own feedback"
  ON analysis_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS analysis_feedback_analysis_idx ON analysis_feedback(analysis_id);
CREATE INDEX IF NOT EXISTS analysis_feedback_user_idx ON analysis_feedback(user_id);
CREATE INDEX IF NOT EXISTS analysis_feedback_type_idx ON analysis_feedback(feedback_type);

-- Ein Feedback pro User pro Analyse
CREATE UNIQUE INDEX IF NOT EXISTS analysis_feedback_unique ON analysis_feedback(analysis_id, user_id);
