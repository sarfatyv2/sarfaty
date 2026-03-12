-- Allcheck localizador results for clients (cedentes) and drawees (sacados).
-- Append-only: each sync creates a new row for audit trail.

CREATE TABLE allcheck_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  document TEXT,
  name TEXT,
  emails JSONB,
  current_address JSONB,
  address_history JSONB,
  phones JSONB,
  partners JSONB,
  company_data JSONB,
  is_pep BOOLEAN NOT NULL DEFAULT FALSE,
  vehicles JSONB,
  ccf_occurrences INTEGER NOT NULL DEFAULT 0,
  consultation_network JSONB,
  raw_data JSONB,
  queried_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_allcheck_results_client ON allcheck_results(client_id);

CREATE TABLE allcheck_drawee_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  document TEXT,
  name TEXT,
  emails JSONB,
  current_address JSONB,
  address_history JSONB,
  phones JSONB,
  partners JSONB,
  company_data JSONB,
  is_pep BOOLEAN NOT NULL DEFAULT FALSE,
  vehicles JSONB,
  ccf_occurrences INTEGER NOT NULL DEFAULT 0,
  consultation_network JSONB,
  raw_data JSONB,
  queried_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_allcheck_drawee_results_drawee ON allcheck_drawee_results(drawee_id);
