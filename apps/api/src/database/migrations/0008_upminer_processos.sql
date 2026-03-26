-- upminer_processos
CREATE TABLE IF NOT EXISTS "upminer_processos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"upminer_result_id" uuid NOT NULL,
	"api_processo_id" text,
	"url_processo" text,
	"numero_processo_unico" text,
	"numero_processo_antigo" text,
	"status_observacao" text,
	"juiz" text,
	"relator" text,
	"orgao_julgador" text,
	"unidade_origem" text,
	"grau_processo" integer,
	"area" text,
	"sistema" text,
	"segmento" text,
	"tribunal_origem" text,
	"uf" text,
	"tribunal" text,
	"data_distribuicao" timestamp,
	"data_processamento" timestamp,
	"data_autuacao" timestamp,
	"valor_causa_moeda" text,
	"valor_causa_valor" numeric(18, 2),
	"classe_processual_nome" text,
	"classe_processual_codigo_cnj" text,
	"e_tutela_antecipada" boolean,
	"tem_injuncao" boolean,
	"e_justica_gratuita" boolean,
	"e_prioritario" boolean,
	"e_segredo_justica" boolean,
	"e_processo_digital" boolean,
	"tem_acordao" boolean,
	"tem_sentenca" boolean,
	"status_predictus_status_processo" text,
	"status_predictus_ramo_direito" text,
	"status_predictus_justica_gratuita" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- upminer_processo_assuntos_cnj
CREATE TABLE IF NOT EXISTS "upminer_processo_assuntos_cnj" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"titulo" text,
	"codigo_cnj" text,
	"e_principal" boolean
);
--> statement-breakpoint

-- upminer_processo_partes
CREATE TABLE IF NOT EXISTS "upminer_processo_partes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"tipo" text,
	"nome" text,
	"polo" text,
	"cpf" text,
	"cnpj" text,
	"cnpj_raiz" text,
	"origem_documento" text,
	"data_atualizacao" text
);
--> statement-breakpoint

-- upminer_processo_advogados
CREATE TABLE IF NOT EXISTS "upminer_processo_advogados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parte_id" uuid NOT NULL,
	"tipo" text,
	"nome" text,
	"cpf" text,
	"oab_uf" text,
	"oab_numero" integer,
	"oab_tipo" text,
	"data_atualizacao" text
);
--> statement-breakpoint

-- upminer_processo_movimentos
CREATE TABLE IF NOT EXISTS "upminer_processo_movimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"indice" integer,
	"nome_original" text[],
	"classificacao_cnj_codigo" text,
	"classificacao_cnj_nome" text,
	"data" timestamp
);
--> statement-breakpoint

-- upminer_processo_relacionados
CREATE TABLE IF NOT EXISTS "upminer_processo_relacionados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"numero_processo" text
);
--> statement-breakpoint

-- upminer_processo_julgamentos
CREATE TABLE IF NOT EXISTS "upminer_processo_julgamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"data_julgamento" timestamp,
	"status_julgamento" text,
	"dias_ate_julgamento" integer,
	"tipo_julgamento" text
);
--> statement-breakpoint

-- upminer_processo_penhoras
CREATE TABLE IF NOT EXISTS "upminer_processo_penhoras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"data" timestamp,
	"tipo" text,
	"trecho_decisao" text
);
--> statement-breakpoint

-- Foreign Keys
DO $$ BEGIN
 ALTER TABLE "upminer_processos" ADD CONSTRAINT "upminer_processos_upminer_result_id_fk" FOREIGN KEY ("upminer_result_id") REFERENCES "public"."upminer_results"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_processo_assuntos_cnj" ADD CONSTRAINT "upminer_processo_assuntos_cnj_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."upminer_processos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_processo_partes" ADD CONSTRAINT "upminer_processo_partes_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."upminer_processos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_processo_advogados" ADD CONSTRAINT "upminer_processo_advogados_parte_id_fk" FOREIGN KEY ("parte_id") REFERENCES "public"."upminer_processo_partes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_processo_movimentos" ADD CONSTRAINT "upminer_processo_movimentos_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."upminer_processos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_processo_relacionados" ADD CONSTRAINT "upminer_processo_relacionados_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."upminer_processos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_processo_julgamentos" ADD CONSTRAINT "upminer_processo_julgamentos_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."upminer_processos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upminer_processo_penhoras" ADD CONSTRAINT "upminer_processo_penhoras_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."upminer_processos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_upminer_processos_result" ON "upminer_processos" USING btree ("upminer_result_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_processos_numero" ON "upminer_processos" USING btree ("numero_processo_unico");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_processos_tribunal" ON "upminer_processos" USING btree ("tribunal");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_assuntos_processo" ON "upminer_processo_assuntos_cnj" USING btree ("processo_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_partes_processo" ON "upminer_processo_partes" USING btree ("processo_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_partes_cnpj" ON "upminer_processo_partes" USING btree ("cnpj");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_partes_cpf" ON "upminer_processo_partes" USING btree ("cpf");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_advogados_parte" ON "upminer_processo_advogados" USING btree ("parte_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_movimentos_processo" ON "upminer_processo_movimentos" USING btree ("processo_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_relacionados_processo" ON "upminer_processo_relacionados" USING btree ("processo_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_julgamentos_processo" ON "upminer_processo_julgamentos" USING btree ("processo_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_upminer_penhoras_processo" ON "upminer_processo_penhoras" USING btree ("processo_id");
