-- ============================================================
-- IRPF Extractions
-- Stores AI-extracted IRPF declaration data per CPF per exercise year
-- ============================================================

CREATE TABLE IF NOT EXISTS irpf_extractions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                 UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  authorized_person_id      UUID REFERENCES client_authorized_persons(id) ON DELETE SET NULL,

  -- Canonical key
  cpf                       TEXT NOT NULL,
  exercise_year             INTEGER NOT NULL,
  calendar_year             INTEGER NOT NULL,

  -- Identification
  full_name                 TEXT,
  birth_date                DATE,
  occupation                TEXT,
  occupation_code           TEXT,
  nationality               TEXT,
  naturality                TEXT,
  phone                     TEXT,
  email                     TEXT,

  -- Address extracted from declaration
  address_street            TEXT,
  address_number            TEXT,
  address_complement        TEXT,
  address_neighborhood      TEXT,
  address_city              TEXT,
  address_state             TEXT,
  address_zip               TEXT,

  -- Spouse
  spouse_name               TEXT,
  spouse_cpf                TEXT,

  -- Declaration context
  declaration_type          TEXT,
  taxation_option           TEXT,
  receipt_number            TEXT,
  delivery_timestamp        TIMESTAMPTZ,

  -- Financial summary
  total_taxable_income      NUMERIC(18, 2),
  total_exempt_income       NUMERIC(18, 2),
  total_exclusive_income    NUMERIC(18, 2),
  total_deductions          NUMERIC(18, 2),
  taxable_base              NUMERIC(18, 2),
  tax_due                   NUMERIC(18, 2),
  tax_paid                  NUMERIC(18, 2),
  tax_refund                NUMERIC(18, 2),
  tax_balance               NUMERIC(18, 2),
  total_assets_current_year NUMERIC(18, 2),
  total_assets_previous_year NUMERIC(18, 2),
  total_debts_current_year  NUMERIC(18, 2),
  total_debts_previous_year NUMERIC(18, 2),

  -- Detailed lists (JSONB)
  dependents                JSONB,
  taxable_income_items      JSONB,
  exempt_income_items       JSONB,
  exclusive_income_items    JSONB,
  payments                  JSONB,
  assets                    JSONB,
  debts                     JSONB,

  -- Extraction metadata
  extraction_status         TEXT NOT NULL DEFAULT 'pending',
  extraction_confidence     TEXT,
  ocr_applied               BOOLEAN NOT NULL DEFAULT FALSE,
  needs_review              BOOLEAN NOT NULL DEFAULT FALSE,
  conflicts                 JSONB,
  extraction_log            JSONB,

  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_irpf_cpf_exercise UNIQUE (cpf, exercise_year)
);

CREATE INDEX IF NOT EXISTS idx_irpf_extractions_client
  ON irpf_extractions (client_id);

CREATE INDEX IF NOT EXISTS idx_irpf_extractions_cpf
  ON irpf_extractions (cpf);

CREATE INDEX IF NOT EXISTS idx_irpf_extractions_exercise
  ON irpf_extractions (exercise_year);

CREATE INDEX IF NOT EXISTS idx_irpf_extractions_status
  ON irpf_extractions (extraction_status);

CREATE INDEX IF NOT EXISTS idx_irpf_extractions_needs_review
  ON irpf_extractions (needs_review);

-- ============================================================
-- IRPF Extraction Sources
-- Audit trail linking extractions to source documents
-- ============================================================

CREATE TABLE IF NOT EXISTS irpf_extraction_sources (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id    UUID NOT NULL REFERENCES irpf_extractions(id) ON DELETE CASCADE,
  document_id      UUID NOT NULL REFERENCES client_documents(id) ON DELETE CASCADE,
  document_subtype TEXT NOT NULL DEFAULT 'unknown',
  file_hash        TEXT,
  page_count       INTEGER,
  ocr_applied      BOOLEAN NOT NULL DEFAULT FALSE,
  ocr_quality      NUMERIC(5, 2),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_irpf_sources_extraction
  ON irpf_extraction_sources (extraction_id);

CREATE INDEX IF NOT EXISTS idx_irpf_sources_document
  ON irpf_extraction_sources (document_id);

CREATE INDEX IF NOT EXISTS idx_irpf_sources_hash
  ON irpf_extraction_sources (file_hash);

-- Enable RLS
ALTER TABLE irpf_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE irpf_extraction_sources ENABLE ROW LEVEL SECURITY;

-- Service role bypass (API uses service role)
CREATE POLICY "service_role_all_irpf_extractions"
  ON irpf_extractions FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_irpf_sources"
  ON irpf_extraction_sources FOR ALL
  TO service_role USING (true) WITH CHECK (true);
