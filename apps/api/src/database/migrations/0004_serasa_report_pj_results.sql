-- Serasa Experian — Business Information Report (Relatório Avançado PJ)
-- Stores raw API responses for audit, LGPD compliance and credit analysis

CREATE TABLE IF NOT EXISTS "serasa_report_pj_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid NOT NULL REFERENCES "clients"("id"),
  "cnpj" text NOT NULL,
  "report_name" text NOT NULL,
  "optional_features" jsonb,
  "status_code" integer NOT NULL,
  "raw_response" jsonb,
  "error_message" text,
  "request_id" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_serasa_report_client"
  ON "serasa_report_pj_results" ("client_id");

CREATE INDEX IF NOT EXISTS "idx_serasa_report_cnpj_report"
  ON "serasa_report_pj_results" ("cnpj", "report_name", "created_at" DESC);
