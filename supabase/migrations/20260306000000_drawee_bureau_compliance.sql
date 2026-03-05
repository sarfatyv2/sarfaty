-- ============================================================
-- Drawee Bureau & Compliance Tables
-- Vadu, Serasa and compliance check results for drawees (sacados)
-- ============================================================

-- 1. Vadu Drawee Results
CREATE TABLE IF NOT EXISTS vadu_drawee_company_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id           UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,

  cnpj                TEXT,
  company_name        TEXT,
  trade_name          TEXT,
  revenue_status      TEXT,
  revenue_status_date TIMESTAMPTZ,
  special_status      TEXT,
  capital_social      NUMERIC(15, 2),
  legal_nature        TEXT,
  is_simples_nacional BOOLEAN,
  company_size        TEXT,
  environmental_score NUMERIC(10, 2),
  environmental_level TEXT,

  raw_data            JSONB,
  queried_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vadu_drawee_company_drawee ON vadu_drawee_company_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_vadu_drawee_company_cnpj ON vadu_drawee_company_results (cnpj);

CREATE TABLE IF NOT EXISTS vadu_drawee_person_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id           UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,

  cpf                 TEXT,
  name                TEXT,
  birth_date          TIMESTAMPTZ,
  mother_name         TEXT,

  raw_data            JSONB,
  queried_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vadu_drawee_person_drawee ON vadu_drawee_person_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_vadu_drawee_person_cpf ON vadu_drawee_person_results (cpf);

-- 2. Serasa Drawee Report Results
CREATE TABLE IF NOT EXISTS serasa_drawee_report_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id           UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  cnpj                TEXT NOT NULL,
  report_name         TEXT NOT NULL,
  optional_features   JSONB,
  status_code         INTEGER NOT NULL,
  raw_response        JSONB,
  error_message       TEXT,
  request_id          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_serasa_drawee_report_drawee ON serasa_drawee_report_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_serasa_drawee_report_cnpj ON serasa_drawee_report_results (cnpj, report_name, created_at);

-- 3. Compliance Check Results for Drawees
CREATE TABLE IF NOT EXISTS cgu_drawee_check_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id   UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  cnpj        TEXT,
  check_type  TEXT NOT NULL,
  has_match   BOOLEAN NOT NULL DEFAULT false,
  match_count INTEGER NOT NULL DEFAULT 0,
  summary    TEXT,
  raw_data   JSONB,
  queried_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cgu_drawee_check_drawee ON cgu_drawee_check_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_cgu_drawee_check_cnpj ON cgu_drawee_check_results (cnpj);
CREATE INDEX IF NOT EXISTS idx_cgu_drawee_check_type ON cgu_drawee_check_results (check_type);

CREATE TABLE IF NOT EXISTS pgfn_drawee_check_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id         UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  cnpj              TEXT,
  has_debt          BOOLEAN NOT NULL DEFAULT false,
  total_debt_amount NUMERIC(15, 2),
  debt_count        INTEGER NOT NULL DEFAULT 0,
  summary           TEXT,
  raw_data          JSONB,
  queried_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pgfn_drawee_check_drawee ON pgfn_drawee_check_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_pgfn_drawee_check_cnpj ON pgfn_drawee_check_results (cnpj);

CREATE TABLE IF NOT EXISTS cndt_drawee_check_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id           UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  cnpj                TEXT,
  certificate_status  TEXT NOT NULL,
  certificate_number  TEXT,
  valid_until         TIMESTAMPTZ,
  raw_data            JSONB,
  queried_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cndt_drawee_check_drawee ON cndt_drawee_check_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_cndt_drawee_check_cnpj ON cndt_drawee_check_results (cnpj);

CREATE TABLE IF NOT EXISTS pep_drawee_check_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id    UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  cpf          TEXT,
  person_name  TEXT,
  has_match    BOOLEAN NOT NULL DEFAULT false,
  matched_role TEXT,
  matched_org  TEXT,
  raw_data     JSONB,
  queried_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pep_drawee_check_drawee ON pep_drawee_check_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_pep_drawee_check_cpf ON pep_drawee_check_results (cpf);

CREATE TABLE IF NOT EXISTS sanctions_drawee_check_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id        UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  entity_name      TEXT,
  document_searched TEXT,
  source           TEXT NOT NULL,
  has_match        BOOLEAN NOT NULL DEFAULT false,
  match_score      NUMERIC(5, 4),
  match_details    TEXT,
  raw_data         JSONB,
  queried_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sanctions_drawee_check_drawee ON sanctions_drawee_check_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_drawee_check_source ON sanctions_drawee_check_results (source);

CREATE TABLE IF NOT EXISTS slave_labor_drawee_check_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id        UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  cnpj             TEXT,
  has_match        BOOLEAN NOT NULL DEFAULT false,
  employer_name    TEXT,
  rescued_workers  INTEGER,
  inspection_date  TIMESTAMPTZ,
  raw_data         JSONB,
  queried_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_slave_labor_drawee_check_drawee ON slave_labor_drawee_check_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_slave_labor_drawee_check_cnpj ON slave_labor_drawee_check_results (cnpj);

CREATE TABLE IF NOT EXISTS address_validation_drawee_results (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id          UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  cep                TEXT,
  is_valid           BOOLEAN NOT NULL DEFAULT false,
  street             TEXT,
  neighborhood       TEXT,
  city               TEXT,
  state              TEXT,
  matches_registered BOOLEAN,
  raw_data           JSONB,
  queried_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_address_validation_drawee_drawee ON address_validation_drawee_results (drawee_id);

CREATE TABLE IF NOT EXISTS negative_media_drawee_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id         UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  cnpj              TEXT,
  company_name      TEXT,
  risk_level        TEXT NOT NULL,
  findings_count    INTEGER NOT NULL DEFAULT 0,
  findings          JSONB,
  summary           TEXT,
  grounding_sources JSONB,
  raw_response      JSONB,
  queried_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_negative_media_drawee_drawee ON negative_media_drawee_results (drawee_id);
CREATE INDEX IF NOT EXISTS idx_negative_media_drawee_cnpj ON negative_media_drawee_results (cnpj);

CREATE TABLE IF NOT EXISTS digital_presence_drawee_results (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawee_id      UUID NOT NULL REFERENCES drawees(id) ON DELETE CASCADE,
  domain         TEXT,
  email_type     TEXT NOT NULL,
  has_dns        BOOLEAN NOT NULL DEFAULT false,
  has_active_site BOOLEAN NOT NULL DEFAULT false,
  site_title     TEXT,
  raw_data       JSONB,
  queried_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_digital_presence_drawee_drawee ON digital_presence_drawee_results (drawee_id);

-- 4. RLS
ALTER TABLE vadu_drawee_company_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE vadu_drawee_person_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE serasa_drawee_report_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE cgu_drawee_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE pgfn_drawee_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE cndt_drawee_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE pep_drawee_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions_drawee_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE slave_labor_drawee_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_validation_drawee_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE negative_media_drawee_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_presence_drawee_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_vadu_drawee_company"
  ON vadu_drawee_company_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_vadu_drawee_person"
  ON vadu_drawee_person_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_serasa_drawee_report"
  ON serasa_drawee_report_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_cgu_drawee_check"
  ON cgu_drawee_check_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_pgfn_drawee_check"
  ON pgfn_drawee_check_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_cndt_drawee_check"
  ON cndt_drawee_check_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_pep_drawee_check"
  ON pep_drawee_check_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_sanctions_drawee_check"
  ON sanctions_drawee_check_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_slave_labor_drawee_check"
  ON slave_labor_drawee_check_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_address_validation_drawee"
  ON address_validation_drawee_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_negative_media_drawee"
  ON negative_media_drawee_results FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_digital_presence_drawee"
  ON digital_presence_drawee_results FOR ALL TO service_role USING (true) WITH CHECK (true);
