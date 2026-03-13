-- Analyse-Meta Spalte für AG14 Lern-Loop
ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS analyse_meta jsonb DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS analysis_results_rechtsgebiet_idx ON analysis_results(rechtsgebiet);
