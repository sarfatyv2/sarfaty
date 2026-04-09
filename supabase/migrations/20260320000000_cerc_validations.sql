-- ============================================================
-- CERC Validations Table
-- Stores all data from CERC duplicata mercantil validation API
-- ============================================================

CREATE TABLE IF NOT EXISTS cerc_validations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request input (everything submitted)
  lote_id               TEXT,
  validacao_id          TEXT,
  veiculo_id            TEXT NOT NULL,
  numero_duplicata      TEXT NOT NULL,
  chave_nfe             TEXT NOT NULL,
  valor                 NUMERIC(15,2) NOT NULL,
  vencimento            DATE NOT NULL,
  cnpj_cedente          TEXT NOT NULL,
  cnpj_cpf_pagador      TEXT NOT NULL,
  tipo_pagador          TEXT NOT NULL,
  cnpj_originador       TEXT NOT NULL,
  referencia_externa    TEXT,
  plano_de_cobranca     INTEGER NOT NULL DEFAULT 6,

  -- Status tracking
  status                TEXT NOT NULL DEFAULT 'PENDING',
  status_processamento  TEXT,

  -- Full CERC raw responses — every field preserved
  request_payload       JSONB,
  validacao_data        JSONB,
  constatacoes_data     JSONB,
  eventos_data          JSONB,
  partes_data           JSONB,
  doc_fiscal_data       JSONB,

  error_message         TEXT,
  requested_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processed_at          TIMESTAMPTZ,

  -- Requester (Supabase Auth user)
  requested_by          UUID
);

CREATE INDEX IF NOT EXISTS idx_cerc_validations_lote      ON cerc_validations (lote_id);
CREATE INDEX IF NOT EXISTS idx_cerc_validations_validacao  ON cerc_validations (validacao_id);
CREATE INDEX IF NOT EXISTS idx_cerc_validations_status     ON cerc_validations (status);
CREATE INDEX IF NOT EXISTS idx_cerc_validations_requested  ON cerc_validations (requested_at DESC);

ALTER TABLE cerc_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cerc_validations_service_role" ON cerc_validations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
