-- upminer_empresa_pj
CREATE TABLE IF NOT EXISTS "upminer_empresa_pj" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"upminer_result_id" uuid NOT NULL,
	"cnpj" text,
	"razao_social" text,
	"nome_fantasia" text,
	"matriz" text,
	"data_abertura" text,
	"situacao_cadastral" text,
	"data_situacao" text,
	"natureza_juridica_codigo" text,
	"natureza_juridica_descricao" text,
	"tipo_cnae" text,
	"cnae" text,
	"cnae_segmento" text,
	"cnae_descricao" text,
	"dominio" text,
	"catchall" text,
	"optante_simples" text,
	"numero_filiais" integer,
	"capital_social" numeric(18, 2),
	"porte" text,
	"setor" text,
	"faixa_funcionarios" text,
	"faturamento_anual_estimado" text,
	"tipo" text,
	"tipo_estabelecimento" text,
	"operacionalidade" text,
	"motivo_situacao" text,
	"classe_risco" text,
	"ultima_atualizacao" text,
	"data_consulta" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- upminer_empresa_pj_enderecos
CREATE TABLE IF NOT EXISTS "upminer_empresa_pj_enderecos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_pj_id" uuid NOT NULL,
	"bairro" text,
	"cidade" text,
	"uf" text,
	"cep" text,
	"ibge" text,
	"logradouro_tipo" text,
	"logradouro_numero" text,
	"logradouro_complemento" text,
	"logradouro" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"ultima_atualizacao" text
);
--> statement-breakpoint

-- upminer_empresa_pj_telefones
CREATE TABLE IF NOT EXISTS "upminer_empresa_pj_telefones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_pj_id" uuid NOT NULL,
	"cnpj" text,
	"api_id" text,
	"data_log" text,
	"ddd" text,
	"descricao" text,
	"telefone" text,
	"telefone_com_ddd" text,
	"rank" text
);
--> statement-breakpoint

-- upminer_empresa_pj_emails
CREATE TABLE IF NOT EXISTS "upminer_empresa_pj_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_pj_id" uuid NOT NULL,
	"endereco_email" text,
	"ultima_atualizacao" text
);
--> statement-breakpoint

-- upminer_empresa_pj_socios
CREATE TABLE IF NOT EXISTS "upminer_empresa_pj_socios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_pj_id" uuid NOT NULL,
	"documento_socio" text,
	"nome" text,
	"tipo_socio" text,
	"qualificacao" text,
	"participacao" numeric(10, 4),
	"data_entrada" text,
	"data_cad" text,
	"data_alt" text,
	"ano" text
);
--> statement-breakpoint

-- upminer_empresa_pj_atividades_secundarias
CREATE TABLE IF NOT EXISTS "upminer_empresa_pj_atividades_secundarias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_pj_id" uuid NOT NULL,
	"codigo" text,
	"descricao" text
);
--> statement-breakpoint

-- upminer_empresa_pj_simples_nacional
CREATE TABLE IF NOT EXISTS "upminer_empresa_pj_simples_nacional" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_pj_id" uuid NOT NULL,
	"cnpj" text,
	"data_consulta" text,
	"status_simples_nacional" text,
	"status_simei" text,
	"data_simples_nacional" text,
	"data_simei" text
);
--> statement-breakpoint

-- Foreign Keys
DO $$ BEGIN
 ALTER TABLE "upminer_empresa_pj" ADD CONSTRAINT "upminer_empresa_pj_upminer_result_id_fk" FOREIGN KEY ("upminer_result_id") REFERENCES "public"."upminer_results"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_empresa_pj_enderecos" ADD CONSTRAINT "upminer_empresa_pj_enderecos_empresa_pj_id_fk" FOREIGN KEY ("empresa_pj_id") REFERENCES "public"."upminer_empresa_pj"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_empresa_pj_telefones" ADD CONSTRAINT "upminer_empresa_pj_telefones_empresa_pj_id_fk" FOREIGN KEY ("empresa_pj_id") REFERENCES "public"."upminer_empresa_pj"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_empresa_pj_emails" ADD CONSTRAINT "upminer_empresa_pj_emails_empresa_pj_id_fk" FOREIGN KEY ("empresa_pj_id") REFERENCES "public"."upminer_empresa_pj"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_empresa_pj_socios" ADD CONSTRAINT "upminer_empresa_pj_socios_empresa_pj_id_fk" FOREIGN KEY ("empresa_pj_id") REFERENCES "public"."upminer_empresa_pj"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_empresa_pj_atividades_secundarias" ADD CONSTRAINT "upminer_empresa_pj_ativ_sec_empresa_pj_id_fk" FOREIGN KEY ("empresa_pj_id") REFERENCES "public"."upminer_empresa_pj"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_empresa_pj_simples_nacional" ADD CONSTRAINT "upminer_empresa_pj_simples_empresa_pj_id_fk" FOREIGN KEY ("empresa_pj_id") REFERENCES "public"."upminer_empresa_pj"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_upminer_empresa_pj_result" ON "upminer_empresa_pj" USING btree ("upminer_result_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_empresa_pj_cnpj" ON "upminer_empresa_pj" USING btree ("cnpj");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_empresa_pj_enderecos_empresa" ON "upminer_empresa_pj_enderecos" USING btree ("empresa_pj_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_empresa_pj_telefones_empresa" ON "upminer_empresa_pj_telefones" USING btree ("empresa_pj_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_empresa_pj_emails_empresa" ON "upminer_empresa_pj_emails" USING btree ("empresa_pj_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_empresa_pj_socios_empresa" ON "upminer_empresa_pj_socios" USING btree ("empresa_pj_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_empresa_pj_socios_documento" ON "upminer_empresa_pj_socios" USING btree ("documento_socio");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_empresa_pj_ativ_sec_empresa" ON "upminer_empresa_pj_atividades_secundarias" USING btree ("empresa_pj_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_empresa_pj_simples_empresa" ON "upminer_empresa_pj_simples_nacional" USING btree ("empresa_pj_id");
