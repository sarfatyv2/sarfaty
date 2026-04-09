-- ============================================================
-- CNAB Remittance Files, Trade Receivables & Client-Drawee Link
-- Stores uploaded CNAB 400 files, parsed trade receivables
-- (duplicatas) and the N:N relationship between clients and drawees.
-- ============================================================

-- 1. cnab_remittance_files -------------------------------------------------
CREATE TABLE IF NOT EXISTS cnab_remittance_files (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  file_type           TEXT NOT NULL DEFAULT 'remittance',
  layout_version      TEXT NOT NULL DEFAULT 'cnab400',
  bank_code           TEXT NOT NULL,
  bank_name           TEXT,
  cedent_code         TEXT,
  cedent_name         TEXT,
  remittance_date     DATE,
  sequential_number   INTEGER,

  storage_path        TEXT NOT NULL,
  original_filename   TEXT NOT NULL,

  total_records       INTEGER,
  total_amount        NUMERIC(18, 4),

  status              TEXT NOT NULL DEFAULT 'uploaded',
  parsing_errors      JSONB,
  processed_at        TIMESTAMPTZ,

  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cnab_files_client_date
  ON cnab_remittance_files (client_id, remittance_date);

CREATE INDEX IF NOT EXISTS idx_cnab_files_status
  ON cnab_remittance_files (status);

-- 2. trade_receivables -----------------------------------------------------
CREATE TABLE IF NOT EXISTS trade_receivables (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  drawee_id             UUID REFERENCES drawees(id) ON DELETE SET NULL,
  cnab_file_id          UUID NOT NULL REFERENCES cnab_remittance_files(id) ON DELETE CASCADE,

  document_number       TEXT,
  our_number            TEXT,
  document_type         TEXT,
  species_code          TEXT,

  issue_date            DATE,
  due_date              DATE,

  face_value            NUMERIC(18, 4),
  interest_per_day      NUMERIC(18, 4),
  discount_value        NUMERIC(18, 4),
  discount_deadline     DATE,
  penalty_value         NUMERIC(18, 4),
  iof_value             NUMERIC(18, 4),

  acceptance            TEXT,
  instruction_1         TEXT,
  instruction_2         TEXT,

  drawee_doc_type       TEXT,
  drawee_doc            TEXT,
  drawee_name           TEXT,
  drawee_address        TEXT,
  drawee_neighborhood   TEXT,
  drawee_zip            TEXT,
  drawee_city           TEXT,
  drawee_state          TEXT,
  drawee_email          TEXT,

  bank_code             TEXT,
  branch                TEXT,
  portfolio_code        TEXT,

  status                TEXT NOT NULL DEFAULT 'pending',
  portfolio_position_id UUID REFERENCES portfolio_positions(id) ON DELETE SET NULL,
  cnab_record_sequence  INTEGER,
  raw_line              TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_receivables_client_due
  ON trade_receivables (client_id, due_date);

CREATE INDEX IF NOT EXISTS idx_trade_receivables_drawee_status
  ON trade_receivables (drawee_id, status);

CREATE INDEX IF NOT EXISTS idx_trade_receivables_cnab_file
  ON trade_receivables (cnab_file_id);

CREATE INDEX IF NOT EXISTS idx_trade_receivables_drawee_doc
  ON trade_receivables (drawee_doc);

CREATE INDEX IF NOT EXISTS idx_trade_receivables_doc_client
  ON trade_receivables (document_number, client_id);

-- 3. client_drawees --------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_drawees (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  drawee_id           UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,

  status              TEXT NOT NULL DEFAULT 'active',
  total_titles        INTEGER NOT NULL DEFAULT 0,
  total_exposure      NUMERIC(18, 4) NOT NULL DEFAULT 0,
  first_operation_at  DATE,
  last_operation_at   DATE,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_client_drawee UNIQUE (client_id, drawee_id)
);

CREATE INDEX IF NOT EXISTS idx_client_drawees_drawee
  ON client_drawees (drawee_id);

CREATE INDEX IF NOT EXISTS idx_client_drawees_client_status
  ON client_drawees (client_id, status);

-- 4. RLS -------------------------------------------------------------------
ALTER TABLE cnab_remittance_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_drawees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_cnab_files"
  ON cnab_remittance_files FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_trade_receivables"
  ON trade_receivables FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_client_drawees"
  ON client_drawees FOR ALL
  TO service_role USING (true) WITH CHECK (true);
