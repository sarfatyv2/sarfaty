CREATE TABLE "address_validation_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"cep" text,
	"is_valid" boolean DEFAULT false NOT NULL,
	"street" text,
	"neighborhood" text,
	"city" text,
	"state" text,
	"matches_registered" boolean,
	"raw_data" jsonb,
	"queried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cgu_check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"cnpj" text,
	"check_type" text NOT NULL,
	"has_match" boolean DEFAULT false NOT NULL,
	"match_count" integer DEFAULT 0 NOT NULL,
	"summary" text,
	"raw_data" jsonb,
	"queried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cndt_check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"cnpj" text,
	"certificate_status" text NOT NULL,
	"certificate_number" text,
	"valid_until" timestamp with time zone,
	"raw_data" jsonb,
	"queried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comm_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"cover_image_url" text,
	"target_roles" text[] DEFAULT '{}' NOT NULL,
	"author_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comm_wiki_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" jsonb,
	"youtube_video_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_id" uuid NOT NULL,
	"last_updated_by" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comm_wiki_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comm_wiki_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comm_wiki_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "faturamento_extraction_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extraction_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"file_hash" text,
	"page_count" integer,
	"ocr_applied" boolean DEFAULT false NOT NULL,
	"ocr_quality" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "faturamento_extractions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"cnpj" text NOT NULL,
	"year" integer NOT NULL,
	"cpf" text,
	"company_name" text,
	"monthly_revenues" jsonb,
	"total_annual_revenue" numeric(18, 2),
	"document_description" text,
	"extraction_status" text DEFAULT 'pending' NOT NULL,
	"extraction_confidence" text,
	"ocr_applied" boolean DEFAULT false NOT NULL,
	"needs_review" boolean DEFAULT false NOT NULL,
	"extraction_log" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_faturamento_cnpj_year" UNIQUE("cnpj","year")
);
--> statement-breakpoint
CREATE TABLE "gov_action_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"committee_id" uuid NOT NULL,
	"minute_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"assignee_id" uuid,
	"group_label" text,
	"due_date" timestamp with time zone,
	"status" text DEFAULT 'todo' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_action_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_item_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"comment" text NOT NULL,
	"status_change" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_committee_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"committee_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"invited_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gov_committee_members_unique" UNIQUE("committee_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "gov_committees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"regulation" text,
	"frequency" text DEFAULT 'monthly' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gov_meeting_minutes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"content" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gov_meeting_minutes_meeting_id_unique" UNIQUE("meeting_id")
);
--> statement-breakpoint
CREATE TABLE "gov_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"committee_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"location_or_link" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "irpf_extraction_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extraction_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"document_subtype" text DEFAULT 'unknown' NOT NULL,
	"file_hash" text,
	"page_count" integer,
	"ocr_applied" boolean DEFAULT false NOT NULL,
	"ocr_quality" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "irpf_extractions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"authorized_person_id" uuid,
	"cpf" text NOT NULL,
	"exercise_year" integer NOT NULL,
	"calendar_year" integer NOT NULL,
	"full_name" text,
	"birth_date" date,
	"occupation" text,
	"occupation_code" text,
	"nationality" text,
	"naturality" text,
	"phone" text,
	"email" text,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"address_neighborhood" text,
	"address_city" text,
	"address_state" text,
	"address_zip" text,
	"spouse_name" text,
	"spouse_cpf" text,
	"declaration_type" text,
	"taxation_option" text,
	"receipt_number" text,
	"delivery_timestamp" timestamp with time zone,
	"total_taxable_income" numeric(18, 2),
	"total_exempt_income" numeric(18, 2),
	"total_exclusive_income" numeric(18, 2),
	"total_deductions" numeric(18, 2),
	"taxable_base" numeric(18, 2),
	"tax_due" numeric(18, 2),
	"tax_paid" numeric(18, 2),
	"tax_refund" numeric(18, 2),
	"tax_balance" numeric(18, 2),
	"total_assets_current_year" numeric(18, 2),
	"total_assets_previous_year" numeric(18, 2),
	"total_debts_current_year" numeric(18, 2),
	"total_debts_previous_year" numeric(18, 2),
	"dependents" jsonb,
	"taxable_income_items" jsonb,
	"exempt_income_items" jsonb,
	"exclusive_income_items" jsonb,
	"payments" jsonb,
	"assets" jsonb,
	"debts" jsonb,
	"extraction_status" text DEFAULT 'pending' NOT NULL,
	"extraction_confidence" text,
	"ocr_applied" boolean DEFAULT false NOT NULL,
	"needs_review" boolean DEFAULT false NOT NULL,
	"conflicts" jsonb,
	"extraction_log" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_irpf_cpf_exercise" UNIQUE("cpf","exercise_year")
);
--> statement-breakpoint
CREATE TABLE "pep_check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"cpf" text,
	"person_name" text,
	"has_match" boolean DEFAULT false NOT NULL,
	"matched_role" text,
	"matched_org" text,
	"raw_data" jsonb,
	"queried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pgfn_check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"cnpj" text,
	"has_debt" boolean DEFAULT false NOT NULL,
	"total_debt_amount" numeric(15, 2),
	"debt_count" integer DEFAULT 0 NOT NULL,
	"summary" text,
	"raw_data" jsonb,
	"queried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sanctions_check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"entity_name" text,
	"document_searched" text,
	"source" text NOT NULL,
	"has_match" boolean DEFAULT false NOT NULL,
	"match_score" numeric(5, 4),
	"match_details" text,
	"raw_data" jsonb,
	"queried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slave_labor_check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"cnpj" text,
	"has_match" boolean DEFAULT false NOT NULL,
	"employer_name" text,
	"rescued_workers" integer,
	"inspection_date" timestamp with time zone,
	"raw_data" jsonb,
	"queried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "address_validation_results" ADD CONSTRAINT "address_validation_results_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cgu_check_results" ADD CONSTRAINT "cgu_check_results_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cndt_check_results" ADD CONSTRAINT "cndt_check_results_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_announcements" ADD CONSTRAINT "comm_announcements_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_wiki_articles" ADD CONSTRAINT "comm_wiki_articles_category_id_comm_wiki_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."comm_wiki_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_wiki_articles" ADD CONSTRAINT "comm_wiki_articles_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comm_wiki_articles" ADD CONSTRAINT "comm_wiki_articles_last_updated_by_profiles_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faturamento_extraction_sources" ADD CONSTRAINT "faturamento_extraction_sources_extraction_id_faturamento_extractions_id_fk" FOREIGN KEY ("extraction_id") REFERENCES "public"."faturamento_extractions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faturamento_extraction_sources" ADD CONSTRAINT "faturamento_extraction_sources_document_id_client_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."client_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faturamento_extractions" ADD CONSTRAINT "faturamento_extractions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_action_items" ADD CONSTRAINT "gov_action_items_committee_id_gov_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."gov_committees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_action_items" ADD CONSTRAINT "gov_action_items_minute_id_gov_meeting_minutes_id_fk" FOREIGN KEY ("minute_id") REFERENCES "public"."gov_meeting_minutes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_action_items" ADD CONSTRAINT "gov_action_items_assignee_id_profiles_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_action_items" ADD CONSTRAINT "gov_action_items_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_action_updates" ADD CONSTRAINT "gov_action_updates_action_item_id_gov_action_items_id_fk" FOREIGN KEY ("action_item_id") REFERENCES "public"."gov_action_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_action_updates" ADD CONSTRAINT "gov_action_updates_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_committee_members" ADD CONSTRAINT "gov_committee_members_committee_id_gov_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."gov_committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_committee_members" ADD CONSTRAINT "gov_committee_members_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_committee_members" ADD CONSTRAINT "gov_committee_members_invited_by_profiles_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_committees" ADD CONSTRAINT "gov_committees_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_meeting_minutes" ADD CONSTRAINT "gov_meeting_minutes_meeting_id_gov_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."gov_meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_meeting_minutes" ADD CONSTRAINT "gov_meeting_minutes_published_by_profiles_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_meeting_minutes" ADD CONSTRAINT "gov_meeting_minutes_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_meetings" ADD CONSTRAINT "gov_meetings_committee_id_gov_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."gov_committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gov_meetings" ADD CONSTRAINT "gov_meetings_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "irpf_extraction_sources" ADD CONSTRAINT "irpf_extraction_sources_extraction_id_irpf_extractions_id_fk" FOREIGN KEY ("extraction_id") REFERENCES "public"."irpf_extractions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "irpf_extraction_sources" ADD CONSTRAINT "irpf_extraction_sources_document_id_client_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."client_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "irpf_extractions" ADD CONSTRAINT "irpf_extractions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "irpf_extractions" ADD CONSTRAINT "irpf_extractions_authorized_person_id_client_authorized_persons_id_fk" FOREIGN KEY ("authorized_person_id") REFERENCES "public"."client_authorized_persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pep_check_results" ADD CONSTRAINT "pep_check_results_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pgfn_check_results" ADD CONSTRAINT "pgfn_check_results_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sanctions_check_results" ADD CONSTRAINT "sanctions_check_results_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slave_labor_check_results" ADD CONSTRAINT "slave_labor_check_results_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_address_validation_results_client" ON "address_validation_results" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_cgu_check_results_client" ON "cgu_check_results" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_cgu_check_results_cnpj" ON "cgu_check_results" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_cgu_check_results_type" ON "cgu_check_results" USING btree ("check_type");--> statement-breakpoint
CREATE INDEX "idx_cndt_check_results_client" ON "cndt_check_results" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_cndt_check_results_cnpj" ON "cndt_check_results" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_comm_announcements_status" ON "comm_announcements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_comm_announcements_published" ON "comm_announcements" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_comm_announcements_expires" ON "comm_announcements" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_comm_wiki_articles_slug" ON "comm_wiki_articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_comm_wiki_articles_category" ON "comm_wiki_articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_comm_wiki_articles_status" ON "comm_wiki_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_comm_wiki_categories_slug" ON "comm_wiki_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_comm_wiki_categories_parent" ON "comm_wiki_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_faturamento_sources_extraction" ON "faturamento_extraction_sources" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "idx_faturamento_sources_document" ON "faturamento_extraction_sources" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "idx_faturamento_sources_hash" ON "faturamento_extraction_sources" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "idx_faturamento_extractions_client" ON "faturamento_extractions" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_faturamento_extractions_cnpj" ON "faturamento_extractions" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_faturamento_extractions_year" ON "faturamento_extractions" USING btree ("year");--> statement-breakpoint
CREATE INDEX "idx_faturamento_extractions_status" ON "faturamento_extractions" USING btree ("extraction_status");--> statement-breakpoint
CREATE INDEX "idx_faturamento_extractions_needs_review" ON "faturamento_extractions" USING btree ("needs_review");--> statement-breakpoint
CREATE INDEX "idx_gov_actions_committee" ON "gov_action_items" USING btree ("committee_id");--> statement-breakpoint
CREATE INDEX "idx_gov_actions_assignee" ON "gov_action_items" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "idx_gov_actions_status" ON "gov_action_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_gov_actions_due_date" ON "gov_action_items" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_gov_action_updates_item" ON "gov_action_updates" USING btree ("action_item_id");--> statement-breakpoint
CREATE INDEX "idx_gov_action_updates_author" ON "gov_action_updates" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_gov_members_committee" ON "gov_committee_members" USING btree ("committee_id");--> statement-breakpoint
CREATE INDEX "idx_gov_members_profile" ON "gov_committee_members" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_gov_committees_status" ON "gov_committees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_gov_committees_created_by" ON "gov_committees" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_gov_minutes_meeting" ON "gov_meeting_minutes" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "idx_gov_minutes_status" ON "gov_meeting_minutes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_gov_meetings_committee" ON "gov_meetings" USING btree ("committee_id");--> statement-breakpoint
CREATE INDEX "idx_gov_meetings_status" ON "gov_meetings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_gov_meetings_scheduled" ON "gov_meetings" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_irpf_sources_extraction" ON "irpf_extraction_sources" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "idx_irpf_sources_document" ON "irpf_extraction_sources" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "idx_irpf_sources_hash" ON "irpf_extraction_sources" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "idx_irpf_extractions_client" ON "irpf_extractions" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_irpf_extractions_cpf" ON "irpf_extractions" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "idx_irpf_extractions_exercise" ON "irpf_extractions" USING btree ("exercise_year");--> statement-breakpoint
CREATE INDEX "idx_irpf_extractions_status" ON "irpf_extractions" USING btree ("extraction_status");--> statement-breakpoint
CREATE INDEX "idx_irpf_extractions_needs_review" ON "irpf_extractions" USING btree ("needs_review");--> statement-breakpoint
CREATE INDEX "idx_pep_check_results_client" ON "pep_check_results" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_pep_check_results_cpf" ON "pep_check_results" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "idx_pgfn_check_results_client" ON "pgfn_check_results" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_pgfn_check_results_cnpj" ON "pgfn_check_results" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_sanctions_check_results_client" ON "sanctions_check_results" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_sanctions_check_results_source" ON "sanctions_check_results" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_slave_labor_check_results_client" ON "slave_labor_check_results" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_slave_labor_check_results_cnpj" ON "slave_labor_check_results" USING btree ("cnpj");