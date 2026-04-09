-- ============================================================
-- upMiner — relational storage for dossiers and source payloads
-- Replaces reliance on dossiers_data JSONB for new writes (column kept for legacy rows).
-- ============================================================

-- Dossier header (one API dossier per upminer_result when batch completes)
CREATE TABLE IF NOT EXISTS upminer_dossiers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upminer_result_id     UUID NOT NULL REFERENCES upminer_results(id) ON DELETE CASCADE,
  api_dossier_id        INTEGER NOT NULL,
  criterion_input       TEXT NOT NULL,
  criterion_name        TEXT,
  dossier_status        TEXT,
  dossier_state         TEXT,
  has_upflag            BOOLEAN NOT NULL DEFAULT FALSE,
  search_profile_name   TEXT,
  homonyms              INTEGER,
  api_batch_id          INTEGER,
  api_user_id           INTEGER,
  api_user_name         TEXT,
  created_at_api        TEXT,
  processed_at_api      TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (upminer_result_id, api_dossier_id)
);

CREATE INDEX IF NOT EXISTS idx_upminer_dossiers_result ON upminer_dossiers (upminer_result_id);
CREATE INDEX IF NOT EXISTS idx_upminer_dossiers_api_id ON upminer_dossiers (api_dossier_id);

-- Source row per capture method (metadata from dossier detail)
CREATE TABLE IF NOT EXISTS upminer_dossier_sources (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upminer_dossier_id UUID NOT NULL REFERENCES upminer_dossiers(id) ON DELETE CASCADE,
  method             TEXT NOT NULL,
  name               TEXT,
  has_result         BOOLEAN NOT NULL DEFAULT FALSE,
  processed_status   TEXT,
  processed_at_api   TEXT,
  UNIQUE (upminer_dossier_id, method)
);

CREATE INDEX IF NOT EXISTS idx_upminer_dossier_sources_dossier ON upminer_dossier_sources (upminer_dossier_id);

-- Receita Federal PJ (one snapshot per dossier)
CREATE TABLE IF NOT EXISTS upminer_receita_federal_pj (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upminer_dossier_id           UUID NOT NULL UNIQUE REFERENCES upminer_dossiers(id) ON DELETE CASCADE,
  cnpj                         TEXT,
  tipo                         TEXT,
  data_abertura                TEXT,
  nome_empresarial             TEXT,
  nome_fantasia                TEXT,
  atividade_economica_principal TEXT
);

CREATE TABLE IF NOT EXISTS upminer_receita_secundarias (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receita_federal_pj_id     UUID NOT NULL REFERENCES upminer_receita_federal_pj(id) ON DELETE CASCADE,
  codigo                    TEXT,
  descricao                 TEXT,
  ordem                     SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_upminer_receita_sec ON upminer_receita_secundarias (receita_federal_pj_id);

-- QSA / baseEmpresas (one snapshot per dossier)
CREATE TABLE IF NOT EXISTS upminer_qsa (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upminer_dossier_id UUID NOT NULL UNIQUE REFERENCES upminer_dossiers(id) ON DELETE CASCADE,
  cnpj            TEXT,
  razao_social    TEXT,
  capital_social  TEXT,
  data_consulta   TEXT,
  pep             TEXT
);

CREATE TABLE IF NOT EXISTS upminer_qsa_socios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upminer_qsa_id  UUID NOT NULL REFERENCES upminer_qsa(id) ON DELETE CASCADE,
  cpf_cnpj        TEXT,
  nome            TEXT,
  entrada         TEXT,
  qualificacao    TEXT,
  participacao    TEXT,
  situacao        TEXT,
  pep             TEXT,
  tipo_socio      TEXT
);

CREATE INDEX IF NOT EXISTS idx_upminer_qsa_socios_qsa ON upminer_qsa_socios (upminer_qsa_id);

-- CADE — process + child rows
CREATE TABLE IF NOT EXISTS upminer_cade_processos (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upminer_dossier_id   UUID NOT NULL REFERENCES upminer_dossiers(id) ON DELETE CASCADE,
  api_row_id           TEXT,
  estado               TEXT,
  processo             TEXT,
  tipo                 TEXT,
  data_registro        TEXT,
  resumo_int           TEXT,
  interessados         TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_upminer_cade_dossier ON upminer_cade_processos (upminer_dossier_id);

CREATE TABLE IF NOT EXISTS upminer_cade_protocolos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cade_processo_id   UUID NOT NULL REFERENCES upminer_cade_processos(id) ON DELETE CASCADE,
  doc_processo       TEXT,
  tipo_doc           TEXT,
  data_documento     TEXT,
  data_registro      TEXT,
  unidade            TEXT,
  link_pdf           TEXT
);

CREATE INDEX IF NOT EXISTS idx_upminer_cade_proto_processo ON upminer_cade_protocolos (cade_processo_id);

CREATE TABLE IF NOT EXISTS upminer_cade_andamentos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cade_processo_id   UUID NOT NULL REFERENCES upminer_cade_processos(id) ON DELETE CASCADE,
  data_hora          TEXT,
  unidade            TEXT,
  descricao          TEXT
);

CREATE INDEX IF NOT EXISTS idx_upminer_cade_and_processo ON upminer_cade_andamentos (cade_processo_id);

-- RLS (same pattern as upminer_results)
ALTER TABLE upminer_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE upminer_dossier_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE upminer_receita_federal_pj ENABLE ROW LEVEL SECURITY;
ALTER TABLE upminer_receita_secundarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE upminer_qsa ENABLE ROW LEVEL SECURITY;
ALTER TABLE upminer_qsa_socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE upminer_cade_processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE upminer_cade_protocolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE upminer_cade_andamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upminer_dossiers_service_role" ON upminer_dossiers
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "upminer_dossier_sources_service_role" ON upminer_dossier_sources
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "upminer_receita_federal_pj_service_role" ON upminer_receita_federal_pj
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "upminer_receita_secundarias_service_role" ON upminer_receita_secundarias
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "upminer_qsa_service_role" ON upminer_qsa
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "upminer_qsa_socios_service_role" ON upminer_qsa_socios
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "upminer_cade_processos_service_role" ON upminer_cade_processos
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "upminer_cade_protocolos_service_role" ON upminer_cade_protocolos
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "upminer_cade_andamentos_service_role" ON upminer_cade_andamentos
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON COLUMN upminer_results.dossiers_data IS 'Legacy JSON snapshot; prefer relational tables upminer_dossiers and children.';
