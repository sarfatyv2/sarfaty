CREATE TABLE "commercial_report_guarantors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"cpf" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commercial_report_properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"property_name" text,
	"situation" text,
	"total_area" text,
	"built_area" text,
	"appraised_value" numeric(15, 2),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commercial_report_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"modality" text,
	"limit_amount" numeric(15, 2),
	"guarantee" text,
	"rate" text,
	"concentration_pct" numeric(5, 2),
	"term" text,
	"tranche" text,
	"tac_value" numeric(15, 2),
	"boleto_tariff" numeric(15, 2),
	"ted_value" numeric(15, 2),
	"serasa" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "employee_count" integer;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "referral_source" text;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "average_ticket" text;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "operation_notes" text;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "serasa_notes" text;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "partners_notes" text;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "related_companies_notes" text;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "main_products" text;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "anticipa_grandes_redes" boolean;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "anticipa_grandes_redes_list" text;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "pre_billing_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "cte_days" integer;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "sales_south_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "sales_southeast_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "sales_north_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "sales_northeast_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "sales_midwest_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "inventory_value" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "banks_balance" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "funds_balance" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "suppliers_balance" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "receipt_methods_detail" jsonb;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "external_receipt_methods_detail" jsonb;--> statement-breakpoint
ALTER TABLE "client_commercial_reports" ADD COLUMN "suppliers_detail" jsonb;--> statement-breakpoint
ALTER TABLE "commercial_report_guarantors" ADD CONSTRAINT "commercial_report_guarantors_report_id_client_commercial_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."client_commercial_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commercial_report_properties" ADD CONSTRAINT "commercial_report_properties_report_id_client_commercial_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."client_commercial_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commercial_report_proposals" ADD CONSTRAINT "commercial_report_proposals_report_id_client_commercial_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."client_commercial_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_commercial_report_guarantors_report" ON "commercial_report_guarantors" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "idx_commercial_report_properties_report" ON "commercial_report_properties" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "idx_commercial_report_proposals_report" ON "commercial_report_proposals" USING btree ("report_id");
