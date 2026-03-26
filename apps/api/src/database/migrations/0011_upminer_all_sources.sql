-- Phase 1: Certidões Negativas (unified table)
CREATE TABLE IF NOT EXISTS "upminer_certidoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "method" text NOT NULL,
  "nome" text,
  "documento" text,
  "conteudo" text,
  "pdf" text,
  "data_emissao" text,
  "data_validade" text,
  "certidao_numero" text,
  "selo_digital" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_upminer_certidoes_dossier_method" ON "upminer_certidoes" ("upminer_dossier_id", "method");

-- Phase 2: Sanções/Impedimentos (unified hits table)
CREATE TABLE IF NOT EXISTS "upminer_sancao_hits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "method" text NOT NULL,
  "nome" text,
  "cpf_cnpj" text,
  "tipo_sancao" text,
  "data_inicio" text,
  "data_fim" text,
  "orgao_sancionador" text,
  "fundamentacao" text,
  "pais" text,
  "observacao" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_sancao_hits_dossier_method" ON "upminer_sancao_hits" ("upminer_dossier_id", "method");

-- Phase 2: SICAF
CREATE TABLE IF NOT EXISTS "upminer_sicaf" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL UNIQUE REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "cnpj" text,
  "razao_social" text,
  "nome_fantasia" text,
  "situacao" text,
  "situacao_cadastral" text
);

-- Phase 3: MPF Processos
CREATE TABLE IF NOT EXISTS "upminer_mpf_processos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "api_id" text,
  "nome" text,
  "estado" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_mpf_proc_dossier" ON "upminer_mpf_processos" ("upminer_dossier_id");

CREATE TABLE IF NOT EXISTS "upminer_mpf_processo_detalhes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "mpf_processo_id" uuid NOT NULL REFERENCES "upminer_mpf_processos"("id") ON DELETE CASCADE,
  "num_processo" text,
  "partes" text[],
  "orgao_poder" text,
  "vara" text,
  "localizacao_atual" text,
  "classe" text,
  "camara" text,
  "data_autuacao" text,
  "assunto" text,
  "distribuicao" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_mpf_det_proc" ON "upminer_mpf_processo_detalhes" ("mpf_processo_id");

-- Phase 3: DJEN
CREATE TABLE IF NOT EXISTS "upminer_djen_citacoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "api_id" text,
  "estado" text,
  "data" text,
  "sigla" text,
  "tipo_comunicacao" text,
  "nome_orgao" text,
  "tipo_documento" text,
  "nome_classe" text,
  "numero_processo" text,
  "numero_processo_mascara" text,
  "link" text,
  "texto" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_djen_dossier" ON "upminer_djen_citacoes" ("upminer_dossier_id");

CREATE TABLE IF NOT EXISTS "upminer_djen_destinatarios" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "djen_citacao_id" uuid NOT NULL REFERENCES "upminer_djen_citacoes"("id") ON DELETE CASCADE,
  "nome" text,
  "tipo_destinatario" text,
  "numero_oab" text,
  "uf_oab" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_djen_dest" ON "upminer_djen_destinatarios" ("djen_citacao_id");

-- Phase 3: PROCON SP
CREATE TABLE IF NOT EXISTS "upminer_procon_anos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "nome_fantasia" text,
  "razao_social" text,
  "ano" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_procon_dossier" ON "upminer_procon_anos" ("upminer_dossier_id");

CREATE TABLE IF NOT EXISTS "upminer_procon_reclamacoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "procon_ano_id" uuid NOT NULL REFERENCES "upminer_procon_anos"("id") ON DELETE CASCADE,
  "descricao" text,
  "atendida" text,
  "nao_atendida" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_procon_rec" ON "upminer_procon_reclamacoes" ("procon_ano_id");

-- Phase 3: Reclame Aqui
CREATE TABLE IF NOT EXISTS "upminer_reclame_aqui" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL UNIQUE REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "empresa" text,
  "data_cadastro" text,
  "site" text,
  "telefone" text,
  "classificacao" text,
  "atendidas" text,
  "solucao" text,
  "voltaria" text,
  "nota_consumidor" text,
  "tempo_medio_resposta" text,
  "total_atendidas" text,
  "total_nao_atendidas" text,
  "total_reclamacoes" text
);

CREATE TABLE IF NOT EXISTS "upminer_reclame_aqui_reclamacoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "reclame_aqui_id" uuid NOT NULL REFERENCES "upminer_reclame_aqui"("id") ON DELETE CASCADE,
  "texto" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_reclame_rec" ON "upminer_reclame_aqui_reclamacoes" ("reclame_aqui_id");

-- Phase 3: CRSFN
CREATE TABLE IF NOT EXISTS "upminer_crsfn_acoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "processo" text,
  "ementa" text,
  "data_julgamento" text,
  "resultado" text,
  "relator" text,
  "recurso" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_crsfn_dossier" ON "upminer_crsfn_acoes" ("upminer_dossier_id");

-- Phase 3: TCU Processos
CREATE TABLE IF NOT EXISTS "upminer_tcu_processos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "num_processo" text,
  "tipo" text,
  "assunto" text,
  "situacao" text,
  "orgao" text,
  "acordao" text,
  "data_acordao" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_tcu_proc_dossier" ON "upminer_tcu_processos" ("upminer_dossier_id");

-- Phase 4: Contratos
CREATE TABLE IF NOT EXISTS "upminer_contratos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "api_id" text,
  "ano" text,
  "mes" text,
  "numero_contrato" text,
  "objeto" text,
  "fundamento_legal" text,
  "modalidade_compra" text,
  "situacao_compra" text,
  "nome_orgao_superior" text,
  "nome_orgao" text,
  "nome_ug" text,
  "assinatura_contrato" text,
  "publicacao_dou" text,
  "inicio_vigencia" text,
  "fim_vigencia" text,
  "cnpj" text,
  "nome_empresa" text,
  "valor_inicial" text,
  "valor_final" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_contratos_dossier" ON "upminer_contratos" ("upminer_dossier_id");

-- Phase 4: Google Hits
CREATE TABLE IF NOT EXISTS "upminer_google_hits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "upminer_dossier_id" uuid NOT NULL REFERENCES "upminer_dossiers"("id") ON DELETE CASCADE,
  "pais" text,
  "criterio" text,
  "url" text,
  "titulo" text,
  "snippet" text
);
CREATE INDEX IF NOT EXISTS "idx_upminer_google_dossier" ON "upminer_google_hits" ("upminer_dossier_id");
