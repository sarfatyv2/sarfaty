CREATE TABLE IF NOT EXISTS "cerc_validation_resultados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cerc_validation_id" uuid NOT NULL,
	"resultado_cerc_id" text NOT NULL,
	"codigo" text,
	"algoritmo_id" text,
	"algoritmo_codigo" text,
	"algoritmo_nome" text,
	"algoritmo_tipo" text NOT NULL,
	"algoritmo_dimensao" text NOT NULL,
	"algoritmo_escopo" text NOT NULL,
	"mensagem" text NOT NULL,
	"impacto" text NOT NULL,
	"dados_utilizados" text,
	"parametros_do_algoritmo" text,
	"informacoes_complementares" text,
	"data_conclusao" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cerc_validation_resultados" ADD CONSTRAINT "cerc_validation_resultados_cerc_validation_id_cerc_validations_id_fk" FOREIGN KEY ("cerc_validation_id") REFERENCES "public"."cerc_validations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cerc_resultados_validation" ON "cerc_validation_resultados" USING btree ("cerc_validation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cerc_resultados_impacto" ON "cerc_validation_resultados" USING btree ("impacto");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cerc_resultados_dimensao" ON "cerc_validation_resultados" USING btree ("algoritmo_dimensao");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cerc_resultados_tipo" ON "cerc_validation_resultados" USING btree ("algoritmo_tipo");
