-- ============================================================
-- Client Commercial Reports Table
-- Stores structured visit reports submitted by the commercial team
-- ============================================================

CREATE TABLE IF NOT EXISTS client_commercial_reports (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                 UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_by                UUID NOT NULL REFERENCES profiles(id),

  -- Metadata
  visit_date                DATE,
  report_date               DATE,
  proposal_type             TEXT,

  -- Productive data
  installed_capacity        TEXT,
  utilized_capacity         TEXT,
  productive_capacity       TEXT,
  main_clients              TEXT,
  main_suppliers            TEXT,
  inventory                 TEXT,

  -- Working capital (meios circulantes)
  gross_payroll             NUMERIC(15, 2),
  accounts_receivable       NUMERIC(15, 2),
  available_cash            NUMERIC(15, 2),
  advances_to_suppliers     NUMERIC(15, 2),
  advances_from_clients     NUMERIC(15, 2),

  -- Concentration
  concentration             NUMERIC(5, 2),
  concentration_drawee      NUMERIC(5, 2),

  -- Sales mix
  sales_percentage_cash     NUMERIC(5, 2),
  sales_percentage_term     NUMERIC(5, 2),
  internal_market_percentage NUMERIC(5, 2),
  external_market_percentage NUMERIC(5, 2),

  -- Logistics and terms
  average_payment_term      INTEGER,
  average_receipt_term      INTEGER,
  average_delivery_time     INTEGER,
  transport_type            TEXT,
  delivered_percentage      NUMERIC(5, 2),
  shipped_percentage        NUMERIC(5, 2),
  delivery_proof_type       TEXT,
  has_carrier_site_access   BOOLEAN,

  -- Payment/receipt methods
  payment_methods           TEXT,
  receipt_methods           TEXT,

  -- Fees and tariffs
  tac_value                 NUMERIC(15, 2),
  ted_value                 NUMERIC(15, 2),
  boleto_tariff             NUMERIC(15, 2),
  notary_term               INTEGER,
  expired_title_tariff      NUMERIC(15, 2),
  protested_title_tariff    NUMERIC(15, 2),
  sustained_title_tariff    NUMERIC(15, 2),

  -- Commercial defense / narrative
  commercial_defense        TEXT,

  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commercial_reports_client     ON client_commercial_reports (client_id);
CREATE INDEX IF NOT EXISTS idx_commercial_reports_created_by ON client_commercial_reports (created_by);
CREATE INDEX IF NOT EXISTS idx_commercial_reports_created_at ON client_commercial_reports (created_at);
CREATE INDEX IF NOT EXISTS idx_commercial_reports_visit_date ON client_commercial_reports (visit_date);

-- RLS: only service_role bypasses RLS; application layer enforces scoping
ALTER TABLE client_commercial_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commercial_reports_service_role" ON client_commercial_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
