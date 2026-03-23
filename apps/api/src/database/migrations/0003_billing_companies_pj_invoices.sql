CREATE TABLE "billing_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"trade_name" text,
	"cnpj" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "billing_companies_cnpj_unique" UNIQUE("cnpj")
);

CREATE INDEX "idx_billing_companies_cnpj" ON "billing_companies" USING btree ("cnpj");
CREATE INDEX "idx_billing_companies_active" ON "billing_companies" USING btree ("is_active");

ALTER TABLE "pj_invoices" ADD COLUMN "billing_company_id" uuid;
ALTER TABLE "pj_invoices" ADD COLUMN "email_notified_at" timestamp with time zone;

ALTER TABLE "pj_invoices" ADD CONSTRAINT "pj_invoices_billing_company_id_billing_companies_id_fk" FOREIGN KEY ("billing_company_id") REFERENCES "public"."billing_companies"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX "idx_pj_invoices_billing_company" ON "pj_invoices" USING btree ("billing_company_id");
