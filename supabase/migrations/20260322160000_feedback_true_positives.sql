-- Erweitert feedback_stats um True-Positive-Tracking
-- AG20 zaehlt jetzt auch bestaetigte Fehler (nicht nur False Positives)
-- AG02 nutzt beide Signale: "Vorsicht" (FP) + "Haeufig bestaetigt" (TP)

ALTER TABLE feedback_stats
  ADD COLUMN IF NOT EXISTS true_positive_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS true_positive_rate numeric(5,2) NOT NULL DEFAULT 0;
