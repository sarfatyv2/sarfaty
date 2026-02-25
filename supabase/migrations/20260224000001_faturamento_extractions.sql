-- ============================================================
-- Faturamento Extractions
-- Stores AI-extracted annual billing/revenue data from client documents
-- ============================================================

-- Main extractions table (canonical record per CNPJ + year)
CREATE TABLE IF NOT EXISTS faturamento_extractions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Canonical key
  cnpj                  TEXT NOT NULL,
  year                  INTEGER NOT NULL,

  -- Identification
  cpf                   TEXT,
  company_name          TEXT,

  -- Revenue data
  monthly_revenues      JSONB,
  total_annual_revenue  NUMERIC(18, 2),
  document_description  TEXT,

  -- Extraction metadata
  extraction_status     TEXT NOT NULL DEFAULT 'pending',
  extraction_confidence TEXT,
  ocr_applied           BOOLEAN NOT NULL DEFAULT FALSE,
  needs_review          BOOLEAN NOT NULL DEFAULT FALSE,
  extraction_log        JSONB,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_faturamento_cnpj_year UNIQUE (cnpj, year)
);

CREATE INDEX IF NOT EXISTS idx_faturamento_extractions_client
  ON faturamento_extractions (client_id);

CREATE INDEX IF NOT EXISTS idx_faturamento_extractions_cnpj
  ON faturamento_extractions (cnpj);

CREATE INDEX IF NOT EXISTS idx_faturamento_extractions_year
  ON faturamento_extractions (year);

CREATE INDEX IF NOT EXISTS idx_faturamento_extractions_status
  ON faturamento_extractions (extraction_status);

CREATE INDEX IF NOT EXISTS idx_faturamento_extractions_needs_review
  ON faturamento_extractions (needs_review);

-- Source documents audit trail
CREATE TABLE IF NOT EXISTS faturamento_extraction_sources (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id  UUID NOT NULL REFERENCES faturamento_extractions(id) ON DELETE CASCADE,
  document_id    UUID NOT NULL REFERENCES client_documents(id) ON DELETE CASCADE,
  file_hash      TEXT,
  page_count     INTEGER,
  ocr_applied    BOOLEAN NOT NULL DEFAULT FALSE,
  ocr_quality    NUMERIC(5, 2),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faturamento_sources_extraction
  ON faturamento_extraction_sources (extraction_id);

CREATE INDEX IF NOT EXISTS idx_faturamento_sources_document
  ON faturamento_extraction_sources (document_id);

CREATE INDEX IF NOT EXISTS idx_faturamento_sources_hash
  ON faturamento_extraction_sources (file_hash);

-- Enable RLS
ALTER TABLE faturamento_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturamento_extraction_sources ENABLE ROW LEVEL SECURITY;

-- Service role bypass (API uses service role)
CREATE POLICY "service_role_all_faturamento_extractions"
  ON faturamento_extractions FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_faturamento_sources"
  ON faturamento_extraction_sources FOR ALL
  TO service_role USING (true) WITH CHECK (true);
