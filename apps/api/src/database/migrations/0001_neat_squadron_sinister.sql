CREATE TABLE "client_commercial_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"visit_date" date,
	"report_date" date,
	"proposal_type" text,
	"installed_capacity" text,
	"utilized_capacity" text,
	"productive_capacity" text,
	"main_clients" text,
	"main_suppliers" text,
	"inventory" text,
	"gross_payroll" numeric(15, 2),
	"accounts_receivable" numeric(15, 2),
	"available_cash" numeric(15, 2),
	"advances_to_suppliers" numeric(15, 2),
	"advances_from_clients" numeric(15, 2),
	"concentration" numeric(5, 2),
	"concentration_drawee" numeric(5, 2),
	"sales_percentage_cash" numeric(5, 2),
	"sales_percentage_term" numeric(5, 2),
	"internal_market_percentage" numeric(5, 2),
	"external_market_percentage" numeric(5, 2),
	"average_payment_term" integer,
	"average_receipt_term" integer,
	"average_delivery_time" integer,
	"transport_type" text,
	"delivered_percentage" numeric(5, 2),
	"shipped_percentage" numeric(5, 2),
	"delivery_proof_type" text,
	"has_carrier_site_access" boolean,
	"payment_methods" text,
	"receipt_methods" text,
	"tac_value" numeric(15, 2),
	"ted_value" numeric(15, 2),
	"boleto_tariff" numeric(15, 2),
	"notary_term" integer,
	"expired_title_tariff" numeric(15, 2),
	"protested_title_tariff" numeric(15, 2),
	"sustained_title_tariff" numeric(15, 2),
	"commercial_defense" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creditbox_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"process_id" text,
	"status" text NOT NULL,
	"report_json" jsonb,
	"pdf_base64" text,
	"error_message" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD CONSTRAINT "client_commercial_reports_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD CONSTRAINT "client_commercial_reports_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creditbox_reports" ADD CONSTRAINT "creditbox_reports_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_commercial_reports_client" ON "client_commercial_reports" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_commercial_reports_created_by" ON "client_commercial_reports" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_commercial_reports_created_at" ON "client_commercial_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_creditbox_reports_client" ON "creditbox_reports" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_creditbox_reports_process" ON "creditbox_reports" USING btree ("process_id");