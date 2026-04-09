-- ============================================================
-- CNAB Operations — Operações de crédito derivadas de arquivos CNAB
-- Agrupa duplicatas de um CNAB para avaliação (aprovadas/rejeitadas)
-- e cálculo do crédito liberado.
-- ============================================================

-- 1. cnab_operations -------------------------------------------------------
CREATE TABLE IF NOT EXISTS cnab_operations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id               UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  cnab_file_id            UUID NOT NULL UNIQUE REFERENCES cnab_remittance_files(id) ON DELETE CASCADE,

  status                  TEXT NOT NULL DEFAULT 'draft',
  total_submitted_amount  NUMERIC(18, 4) NOT NULL DEFAULT 0,
  total_approved_amount   NUMERIC(18, 4) NOT NULL DEFAULT 0,

  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cnab_operations_client
  ON cnab_operations (client_id);

CREATE INDEX IF NOT EXISTS idx_cnab_operations_status
  ON cnab_operations (status);

CREATE INDEX IF NOT EXISTS idx_cnab_operations_cnab_file
  ON cnab_operations (cnab_file_id);

-- 2. Alterações em trade_receivables --------------------------------------
ALTER TABLE trade_receivables
  ADD COLUMN IF NOT EXISTS operation_id UUID REFERENCES cnab_operations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS evaluation_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Constraint para evaluation_status
ALTER TABLE trade_receivables
  ADD CONSTRAINT chk_trade_receivables_evaluation_status
  CHECK (evaluation_status IN ('pending', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_trade_receivables_operation
  ON trade_receivables (operation_id);

-- 3. RLS -------------------------------------------------------------------
ALTER TABLE cnab_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_cnab_operations"
  ON cnab_operations FOR ALL
  TO service_role USING (true) WITH CHECK (true);
