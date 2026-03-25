-- ============================================================
-- Commercial report v2: extra scalar fields + child tables
-- ============================================================

ALTER TABLE client_commercial_reports
  ADD COLUMN IF NOT EXISTS employee_count                INTEGER,
  ADD COLUMN IF NOT EXISTS referral_source               TEXT,
  ADD COLUMN IF NOT EXISTS average_ticket                TEXT,
  ADD COLUMN IF NOT EXISTS operation_notes               TEXT,
  ADD COLUMN IF NOT EXISTS serasa_notes                  TEXT,
  ADD COLUMN IF NOT EXISTS partners_notes                TEXT,
  ADD COLUMN IF NOT EXISTS related_companies_notes       TEXT,
  ADD COLUMN IF NOT EXISTS main_products                 TEXT,
  ADD COLUMN IF NOT EXISTS anticipa_grandes_redes        BOOLEAN,
  ADD COLUMN IF NOT EXISTS anticipa_grandes_redes_list   TEXT,
  ADD COLUMN IF NOT EXISTS pre_billing_percentage        NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS cte_days                      INTEGER,
  ADD COLUMN IF NOT EXISTS sales_south_percentage        NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS sales_southeast_percentage    NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS sales_north_percentage        NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS sales_northeast_percentage    NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS sales_midwest_percentage      NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS inventory_value               NUMERIC(15, 2),
  ADD COLUMN IF NOT EXISTS banks_balance                 NUMERIC(15, 2),
  ADD COLUMN IF NOT EXISTS funds_balance                 NUMERIC(15, 2),
  ADD COLUMN IF NOT EXISTS suppliers_balance             NUMERIC(15, 2),
  ADD COLUMN IF NOT EXISTS receipt_methods_detail        JSONB,
  ADD COLUMN IF NOT EXISTS external_receipt_methods_detail JSONB,
  ADD COLUMN IF NOT EXISTS suppliers_detail             JSONB;

CREATE TABLE IF NOT EXISTS commercial_report_proposals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id         UUID NOT NULL REFERENCES client_commercial_reports(id) ON DELETE CASCADE,
  modality          TEXT,
  limit_amount      NUMERIC(15, 2),
  guarantee         TEXT,
  rate              TEXT,
  concentration_pct NUMERIC(5, 2),
  term              TEXT,
  tranche           TEXT,
  tac_value         NUMERIC(15, 2),
  boleto_tariff     NUMERIC(15, 2),
  ted_value         NUMERIC(15, 2),
  serasa            TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commercial_report_proposals_report
  ON commercial_report_proposals (report_id);

CREATE TABLE IF NOT EXISTS commercial_report_guarantors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id  UUID NOT NULL REFERENCES client_commercial_reports(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  cpf        TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commercial_report_guarantors_report
  ON commercial_report_guarantors (report_id);

CREATE TABLE IF NOT EXISTS commercial_report_properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL REFERENCES client_commercial_reports(id) ON DELETE CASCADE,
  property_name   TEXT,
  situation       TEXT,
  total_area      TEXT,
  built_area      TEXT,
  appraised_value NUMERIC(15, 2),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commercial_report_properties_report
  ON commercial_report_properties (report_id);

ALTER TABLE commercial_report_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_report_guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_report_properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "commercial_report_proposals_service_role" ON commercial_report_proposals;
CREATE POLICY "commercial_report_proposals_service_role" ON commercial_report_proposals
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "commercial_report_guarantors_service_role" ON commercial_report_guarantors;
CREATE POLICY "commercial_report_guarantors_service_role" ON commercial_report_guarantors
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "commercial_report_properties_service_role" ON commercial_report_properties;
CREATE POLICY "commercial_report_properties_service_role" ON commercial_report_properties
  FOR ALL TO service_role USING (true) WITH CHECK (true);
