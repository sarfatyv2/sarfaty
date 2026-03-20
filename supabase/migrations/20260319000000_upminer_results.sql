-- ============================================================
-- upMiner Bureau Results Table
-- Stores async batch processing results from upLexis upMiner API
-- ============================================================

CREATE TABLE IF NOT EXISTS upminer_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES clients(id),

  document            TEXT NOT NULL,
  input_type          INTEGER NOT NULL,
  search_profile_id   INTEGER NOT NULL,
  batch_id            INTEGER,

  status              TEXT NOT NULL DEFAULT 'PENDING',
  dossiers_data       JSONB,
  error_message       TEXT,

  requested_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_upminer_results_client ON upminer_results (client_id);
CREATE INDEX IF NOT EXISTS idx_upminer_results_batch  ON upminer_results (batch_id);
CREATE INDEX IF NOT EXISTS idx_upminer_results_status ON upminer_results (status);

-- RLS
ALTER TABLE upminer_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upminer_results_service_role" ON upminer_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
