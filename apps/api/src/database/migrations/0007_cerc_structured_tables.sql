-- cerc_validation_eventos
CREATE TABLE IF NOT EXISTS "cerc_validation_eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cerc_validation_id" uuid NOT NULL,
	"data" timestamp with time zone NOT NULL,
	"codigo" text NOT NULL,
	"descricao" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- cerc_validation_partes
CREATE TABLE IF NOT EXISTS "cerc_validation_partes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cerc_validation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"documento_tipo" text NOT NULL,
	"documento_numero" text NOT NULL,
	"razao_social" text,
	"nome_fantasia" text,
	"uf" text,
	"cep" text,
	"municipio" text,
	"data_de_abertura" date,
	"capital_social" numeric(20, 2),
	"situacao_cadastral_status" text,
	"atividade_principal_codigo" text,
	"atividade_principal_descricao" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- cerc_validation_doc_fiscal
CREATE TABLE IF NOT EXISTS "cerc_validation_doc_fiscal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cerc_validation_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"chave_acesso" text,
	"numero" text,
	"serie" text,
	"modelo" text,
	"situacao" text,
	"natureza_operacao" text,
	"data_emissao" timestamp with time zone,
	"valor_total" numeric(15, 2),
	"emitente_nome" text,
	"emitente_cnpj" text,
	"emitente_uf" text,
	"destinatario_nome" text,
	"destinatario_cnpj" text,
	"destinatario_cpf" text,
	"destinatario_uf" text,
	"fatura_numero" text,
	"fatura_valor_original" numeric(15, 2),
	"fatura_valor_liquido" numeric(15, 2),
	"modalidade_frete" text,
	"transportador_nome" text,
	"transportador_cnpj" text,
	"valor_icms" numeric(15, 2),
	"valor_pis" numeric(15, 2),
	"valor_cofins" numeric(15, 2),
	"valor_produtos" numeric(15, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_cerc_doc_fiscal_validation" UNIQUE("cerc_validation_id")
);
--> statement-breakpoint

-- cerc_validation_nfe_duplicatas
CREATE TABLE IF NOT EXISTS "cerc_validation_nfe_duplicatas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cerc_validation_id" uuid NOT NULL,
	"numero" text NOT NULL,
	"valor" numeric(15, 2),
	"vencimento" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- cerc_validation_nfe_produtos
CREATE TABLE IF NOT EXISTS "cerc_validation_nfe_produtos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cerc_validation_id" uuid NOT NULL,
	"num" text NOT NULL,
	"codigo" text,
	"descricao" text NOT NULL,
	"ncm" text,
	"cfop" text,
	"unidade" text,
	"quantidade" numeric(15, 4),
	"valor_unitario" numeric(15, 4),
	"valor_total" numeric(15, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- cerc_validation_nfe_eventos_fiscais
CREATE TABLE IF NOT EXISTS "cerc_validation_nfe_eventos_fiscais" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cerc_validation_id" uuid NOT NULL,
	"tipo" text,
	"data" timestamp with time zone,
	"orgao" text,
	"protocolo" text,
	"evento" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Foreign Keys
DO $$ BEGIN
 ALTER TABLE "cerc_validation_eventos" ADD CONSTRAINT "cerc_validation_eventos_cerc_validation_id_fk" FOREIGN KEY ("cerc_validation_id") REFERENCES "public"."cerc_validations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cerc_validation_partes" ADD CONSTRAINT "cerc_validation_partes_cerc_validation_id_fk" FOREIGN KEY ("cerc_validation_id") REFERENCES "public"."cerc_validations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cerc_validation_doc_fiscal" ADD CONSTRAINT "cerc_validation_doc_fiscal_cerc_validation_id_fk" FOREIGN KEY ("cerc_validation_id") REFERENCES "public"."cerc_validations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cerc_validation_nfe_duplicatas" ADD CONSTRAINT "cerc_validation_nfe_duplicatas_cerc_validation_id_fk" FOREIGN KEY ("cerc_validation_id") REFERENCES "public"."cerc_validations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cerc_validation_nfe_produtos" ADD CONSTRAINT "cerc_validation_nfe_produtos_cerc_validation_id_fk" FOREIGN KEY ("cerc_validation_id") REFERENCES "public"."cerc_validations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cerc_validation_nfe_eventos_fiscais" ADD CONSTRAINT "cerc_validation_nfe_eventos_fiscais_cerc_validation_id_fk" FOREIGN KEY ("cerc_validation_id") REFERENCES "public"."cerc_validations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_cerc_eventos_validation" ON "cerc_validation_eventos" USING btree ("cerc_validation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cerc_partes_validation" ON "cerc_validation_partes" USING btree ("cerc_validation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cerc_partes_role" ON "cerc_validation_partes" USING btree ("role");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cerc_nfe_duplicatas_validation" ON "cerc_validation_nfe_duplicatas" USING btree ("cerc_validation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cerc_nfe_produtos_validation" ON "cerc_validation_nfe_produtos" USING btree ("cerc_validation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cerc_nfe_eventos_fiscais_validation" ON "cerc_validation_nfe_eventos_fiscais" USING btree ("cerc_validation_id");
--> statement-breakpoint

-- ============================================================
-- DATA MIGRATION: events
-- ============================================================
INSERT INTO cerc_validation_eventos (cerc_validation_id, data, codigo, descricao)
SELECT
  cv.id,
  (ev->>'data')::timestamptz,
  COALESCE(ev->>'codigo', ''),
  ev->'informacoes_complementares'->>'descricao'
FROM cerc_validations cv,
     jsonb_array_elements(cv.eventos_data) AS ev
WHERE cv.eventos_data IS NOT NULL
  AND jsonb_typeof(cv.eventos_data) = 'array';
--> statement-breakpoint

-- ============================================================
-- DATA MIGRATION: partes (pagador + originador from partes_data, cedente from validacao_data)
-- ============================================================
INSERT INTO cerc_validation_partes (
  cerc_validation_id, role, documento_tipo, documento_numero, razao_social,
  nome_fantasia, uf, cep, municipio, data_de_abertura, capital_social,
  situacao_cadastral_status, atividade_principal_codigo, atividade_principal_descricao
)
SELECT
  cv.id,
  parte_role.role,
  (cv.partes_data->'partes'->parte_role.role->'documento'->>'tipo'),
  (cv.partes_data->'partes'->parte_role.role->'documento'->'identificador'->>'numero'),
  (cv.partes_data->'partes'->parte_role.role->>'razao_social'),
  (cv.partes_data->'partes'->parte_role.role->>'nome_fantasia'),
  (cv.partes_data->'partes'->parte_role.role->'endereco'->>'uf'),
  (cv.partes_data->'partes'->parte_role.role->'endereco'->>'cep'),
  (cv.partes_data->'partes'->parte_role.role->'endereco'->'municipio'->>'descricao'),
  NULLIF(cv.partes_data->'partes'->parte_role.role->>'data_de_abertura', '')::date,
  NULLIF(cv.partes_data->'partes'->parte_role.role->>'capital_social', '')::numeric,
  (cv.partes_data->'partes'->parte_role.role->'situacao_cadastral'->>'status'),
  (cv.partes_data->'partes'->parte_role.role->'atividade_economica'->'principal'->>'codigo'),
  (cv.partes_data->'partes'->parte_role.role->'atividade_economica'->'principal'->>'descricao')
FROM cerc_validations cv,
     (VALUES ('pagador'), ('originador')) AS parte_role(role)
WHERE cv.partes_data IS NOT NULL
  AND cv.partes_data->'partes'->parte_role.role IS NOT NULL
  AND cv.partes_data->'partes'->parte_role.role->'documento' IS NOT NULL;
--> statement-breakpoint

INSERT INTO cerc_validation_partes (
  cerc_validation_id, role, documento_tipo, documento_numero, razao_social
)
SELECT
  cv.id,
  'cedente',
  (cv.validacao_data->'cedente'->'documento'->>'tipo'),
  (cv.validacao_data->'cedente'->'documento'->'identificador'->>'numero'),
  (cv.validacao_data->'cedente'->>'nome')
FROM cerc_validations cv
WHERE cv.validacao_data IS NOT NULL
  AND cv.validacao_data->'cedente' IS NOT NULL
  AND cv.validacao_data->'cedente'->'documento' IS NOT NULL;
--> statement-breakpoint

-- ============================================================
-- DATA MIGRATION: doc_fiscal header
-- ============================================================
INSERT INTO cerc_validation_doc_fiscal (
  cerc_validation_id, tipo, chave_acesso, numero, serie, modelo,
  situacao, natureza_operacao, data_emissao, valor_total,
  emitente_nome, emitente_cnpj, emitente_uf,
  destinatario_nome, destinatario_cnpj, destinatario_cpf, destinatario_uf,
  fatura_numero, fatura_valor_original, fatura_valor_liquido,
  modalidade_frete, transportador_nome, transportador_cnpj,
  valor_icms, valor_pis, valor_cofins, valor_produtos
)
SELECT
  cv.id,
  COALESCE(cv.doc_fiscal_data->>'tipo', 'nfe'),
  cv.doc_fiscal_data->'dados'->'nfe'->>'normalizado_chave_acesso',
  cv.doc_fiscal_data->'dados'->'nfe'->>'numero',
  cv.doc_fiscal_data->'dados'->'nfe'->>'serie',
  cv.doc_fiscal_data->'dados'->'nfe'->>'modelo',
  cv.doc_fiscal_data->'dados'->'nfe'->>'situacao',
  cv.doc_fiscal_data->'dados'->'nfe'->'emissao'->>'natureza_operacao',
  NULLIF(cv.doc_fiscal_data->'dados'->'nfe'->>'normalizado_data_emissao', '')::timestamptz,
  NULLIF(cv.doc_fiscal_data->'dados'->'nfe'->>'normalizado_valor_total', '')::numeric,
  cv.doc_fiscal_data->'dados'->'nfe'->'emitente'->>'nome',
  cv.doc_fiscal_data->'dados'->'nfe'->'emitente'->>'normalizado_cnpj',
  cv.doc_fiscal_data->'dados'->'nfe'->'emitente'->>'uf',
  cv.doc_fiscal_data->'dados'->'nfe'->'destinatario'->>'nome',
  cv.doc_fiscal_data->'dados'->'nfe'->'destinatario'->>'normalizado_cnpj',
  cv.doc_fiscal_data->'dados'->'nfe'->'destinatario'->>'normalizado_cpf',
  cv.doc_fiscal_data->'dados'->'nfe'->'destinatario'->>'uf',
  cv.doc_fiscal_data->'dados'->'nfe'->'cobranca'->'fatura'->>'numero',
  NULLIF(cv.doc_fiscal_data->'dados'->'nfe'->'cobranca'->'fatura'->>'normalizado_valor_original', '')::numeric,
  NULLIF(cv.doc_fiscal_data->'dados'->'nfe'->'cobranca'->'fatura'->>'normalizado_valor_liquido', '')::numeric,
  cv.doc_fiscal_data->'dados'->'nfe'->'transporte'->>'modalidade_frete',
  cv.doc_fiscal_data->'dados'->'nfe'->'transporte'->'transportador'->>'nome',
  cv.doc_fiscal_data->'dados'->'nfe'->'transporte'->'transportador'->>'cnpj',
  NULLIF(cv.doc_fiscal_data->'dados'->'nfe'->'totais'->>'normalizado_valor_icms', '')::numeric,
  NULLIF(cv.doc_fiscal_data->'dados'->'nfe'->'totais'->>'normalizado_valor_pis', '')::numeric,
  NULLIF(cv.doc_fiscal_data->'dados'->'nfe'->'totais'->>'normalizado_valor_cofins', '')::numeric,
  NULLIF(cv.doc_fiscal_data->'dados'->'nfe'->'totais'->>'normalizado_valor_produtos', '')::numeric
FROM cerc_validations cv
WHERE cv.doc_fiscal_data IS NOT NULL
  AND cv.doc_fiscal_data->'dados'->'nfe' IS NOT NULL;
--> statement-breakpoint

-- ============================================================
-- DATA MIGRATION: nfe duplicatas
-- ============================================================
INSERT INTO cerc_validation_nfe_duplicatas (cerc_validation_id, numero, valor, vencimento)
SELECT
  cv.id,
  dup->>'numero',
  NULLIF(dup->>'normalizado_valor', '')::numeric,
  NULLIF(dup->>'normalizado_vencimento', '')::timestamptz::date
FROM cerc_validations cv,
     jsonb_array_elements(cv.doc_fiscal_data->'dados'->'nfe'->'cobranca'->'duplicatas') AS dup
WHERE cv.doc_fiscal_data IS NOT NULL
  AND cv.doc_fiscal_data->'dados'->'nfe'->'cobranca'->'duplicatas' IS NOT NULL
  AND jsonb_typeof(cv.doc_fiscal_data->'dados'->'nfe'->'cobranca'->'duplicatas') = 'array';
--> statement-breakpoint

-- ============================================================
-- DATA MIGRATION: nfe produtos
-- ============================================================
INSERT INTO cerc_validation_nfe_produtos (
  cerc_validation_id, num, codigo, descricao, ncm, cfop,
  unidade, quantidade, valor_unitario, valor_total
)
SELECT
  cv.id,
  COALESCE(prod->>'num', ''),
  prod->>'codigo',
  COALESCE(prod->>'descricao', ''),
  prod->>'ncm',
  prod->>'cfop',
  prod->>'unidade',
  NULLIF(prod->>'normalizado_quantidade_comercial', '')::numeric,
  NULLIF(prod->>'normalizado_valor_unitario_comercial', '')::numeric,
  NULLIF(prod->>'normalizado_valor', '')::numeric
FROM cerc_validations cv,
     jsonb_array_elements(cv.doc_fiscal_data->'dados'->'nfe'->'produtos') AS prod
WHERE cv.doc_fiscal_data IS NOT NULL
  AND cv.doc_fiscal_data->'dados'->'nfe'->'produtos' IS NOT NULL
  AND jsonb_typeof(cv.doc_fiscal_data->'dados'->'nfe'->'produtos') = 'array';
--> statement-breakpoint

-- ============================================================
-- DATA MIGRATION: nfe eventos fiscais
-- ============================================================
INSERT INTO cerc_validation_nfe_eventos_fiscais (
  cerc_validation_id, tipo, data, orgao, protocolo, evento
)
SELECT
  cv.id,
  ev->'info'->>'tipo',
  NULLIF(ev->'info'->>'normalizado_data', '')::timestamptz,
  ev->'info'->>'desc_orgao',
  ev->>'protocolo',
  ev->>'evento'
FROM cerc_validations cv,
     jsonb_array_elements(cv.doc_fiscal_data->'dados'->'nfe'->'eventos') AS ev
WHERE cv.doc_fiscal_data IS NOT NULL
  AND cv.doc_fiscal_data->'dados'->'nfe'->'eventos' IS NOT NULL
  AND jsonb_typeof(cv.doc_fiscal_data->'dados'->'nfe'->'eventos') = 'array';
--> statement-breakpoint

-- ============================================================
-- DROP JSONB columns from cerc_validations
-- ============================================================
ALTER TABLE "cerc_validations"
  DROP COLUMN IF EXISTS "request_payload",
  DROP COLUMN IF EXISTS "validacao_data",
  DROP COLUMN IF EXISTS "constatacoes_data",
  DROP COLUMN IF EXISTS "eventos_data",
  DROP COLUMN IF EXISTS "partes_data",
  DROP COLUMN IF EXISTS "doc_fiscal_data";
