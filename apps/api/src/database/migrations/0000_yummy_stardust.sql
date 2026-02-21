CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"correlation_id" text NOT NULL,
	"actor_id" uuid NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"http_method" text NOT NULL,
	"path" text NOT NULL,
	"payload" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"use_type" text,
	"street" text,
	"number" text,
	"without_number" boolean DEFAULT false NOT NULL,
	"complement" text,
	"neighborhood" text,
	"zip_code" text,
	"city" text,
	"state" char(2),
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_authorized_persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"authorization_type" text,
	"full_name" text NOT NULL,
	"cpf" text,
	"phone" text,
	"email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"bank_code" text,
	"bank_name" text,
	"branch" text,
	"account_number" text,
	"account_type" text,
	"pix_key" text,
	"nickname" text,
	"opened_at" date,
	"closed_at" date,
	"status" text DEFAULT 'active' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"contact_name" text,
	"use_type" text,
	"email" text,
	"email_secondary" text,
	"phone" text,
	"phone_mobile" text,
	"phone_sms" text,
	"whatsapp" boolean DEFAULT false NOT NULL,
	"homepage" text,
	"notes" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"document_category" text DEFAULT 'base' NOT NULL,
	"segment_template_id" uuid,
	"product_template_id" uuid,
	"guarantee_template_id" uuid,
	"client_guarantee_id" uuid,
	"document_label" text,
	"reference_year" integer,
	"reference_month" integer,
	"partner_name" text,
	"storage_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"validation_status" text DEFAULT 'pending',
	"validation_result" jsonb,
	"validated_at" timestamp with time zone,
	"extracted_data" jsonb,
	"uploaded_by" uuid NOT NULL,
	"canhoto_reference" text,
	"canhoto_date" date,
	"canhoto_status" text,
	"collection_order" text,
	"collection_status" text,
	"verification_date" date,
	"verification_status" text,
	"verification_notes" text,
	"confirmation_type" text,
	"confirmation_status" text,
	"nfe_number" text,
	"nfe_value" numeric(18, 4),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_guarantees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"guarantee_type_id" uuid NOT NULL,
	"description" text,
	"estimated_value" numeric(15, 2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"changed_by" uuid,
	"change_reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_type" text DEFAULT 'company' NOT NULL,
	"company_name" text NOT NULL,
	"cnpj" text,
	"cnpj_root" text,
	"trade_name" text,
	"cpf" text,
	"rg" text,
	"rg_issuer" text,
	"rg_issued_at" date,
	"cnh_number" text,
	"cnh_issued_at" date,
	"cnh_expires_at" date,
	"passport_number" text,
	"foreign_id" text,
	"rg_document_id" uuid,
	"cnh_document_id" uuid,
	"birth_date" date,
	"gender" text,
	"nationality" text,
	"marital_status" text,
	"naturality" text,
	"mother_name" text,
	"father_name" text,
	"state_registration" text,
	"city_registration" text,
	"founded_at" date,
	"established_at" date,
	"registration_status" text DEFAULT 'prospect' NOT NULL,
	"prospect_at" timestamp with time zone,
	"renewed_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"closure_reason" text,
	"is_pep" boolean DEFAULT false NOT NULL,
	"is_pep_related" boolean DEFAULT false NOT NULL,
	"is_ofac_listed" boolean DEFAULT false NOT NULL,
	"has_risk_profession" boolean DEFAULT false NOT NULL,
	"has_risk_activity" boolean DEFAULT false NOT NULL,
	"has_risk_city" boolean DEFAULT false NOT NULL,
	"risk_rating" text,
	"revenue_situation" text,
	"segment_id" uuid NOT NULL,
	"credit_product_id" uuid NOT NULL,
	"assigned_to" uuid NOT NULL,
	"team_id" uuid,
	"region_id" uuid,
	"economic_group_id" uuid,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"address_neighborhood" text,
	"address_city" text,
	"address_state" text,
	"address_zip" text,
	"requested_amount" numeric(15, 2),
	"approved_amount" numeric(15, 2),
	"has_guarantees" boolean DEFAULT false,
	"is_judicial_recovery" boolean DEFAULT false,
	"working_capital_notes" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"cnpj_status" text,
	"cnpj_validated_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"homologated_at" timestamp with time zone,
	"legacy_sgs_id" integer,
	"legacy_nf_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "clients_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "cnae_segment_mapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cnae_code" text NOT NULL,
	"cnae_group" text NOT NULL,
	"segment_id" uuid NOT NULL,
	"confidence" text DEFAULT 'medium',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaborator_clt_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaborator_id" uuid,
	"ctps_number" text,
	"ctps_series" text,
	"pis_pasep" text,
	"timesheet_system" text DEFAULT 'ponto_mais',
	"timesheet_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "collaborator_clt_data_collaborator_id_unique" UNIQUE("collaborator_id")
);
--> statement-breakpoint
CREATE TABLE "collaborator_compensation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaborator_id" uuid,
	"effective_date" date NOT NULL,
	"movement_type" text NOT NULL,
	"previous_salary" numeric(15, 2),
	"new_salary" numeric(15, 2),
	"increase_amount" numeric(15, 2),
	"increase_pct" numeric(5, 2),
	"previous_role" text,
	"new_role" text,
	"previous_level" text,
	"new_level" text,
	"reason" text,
	"approved_by" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaborator_dependents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaborator_id" uuid,
	"relationship" text,
	"full_name" text NOT NULL,
	"date_of_birth" date,
	"cpf" text,
	"is_ir_dependent" boolean DEFAULT false,
	"is_health_plan" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaborator_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaborator_id" uuid,
	"document_type" text NOT NULL,
	"document_label" text,
	"storage_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaborator_pj_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaborator_id" uuid,
	"company_name" text,
	"company_cnpj" text,
	"company_cnae" text,
	"service_contract_path" text,
	"contract_signed_at" timestamp with time zone,
	"monthly_nf_amount" numeric(15, 2),
	"nf_due_day" integer DEFAULT 25,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "collaborator_pj_data_collaborator_id_unique" UNIQUE("collaborator_id")
);
--> statement-breakpoint
CREATE TABLE "collaborators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"registration_number" text,
	"badge_number" text,
	"employment_type" text NOT NULL,
	"is_internal" boolean DEFAULT true,
	"full_name" text NOT NULL,
	"social_name" text,
	"date_of_birth" date,
	"gender" text,
	"marital_status" text,
	"nationality" text DEFAULT 'Brasileira',
	"cpf" text,
	"rg" text,
	"rg_issuer" text,
	"voter_registration" text,
	"voter_zone" text,
	"voter_section" text,
	"military_cert" text,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"address_neighborhood" text,
	"address_city" text,
	"address_state" text,
	"address_zip" text,
	"phone" text,
	"personal_email" text,
	"corporate_email" text,
	"extension" text,
	"company" text DEFAULT 'Sarfaty',
	"directorate" text,
	"department" text,
	"branch" text,
	"manager_id" uuid,
	"job_title" text,
	"role_code" text,
	"role_level" text,
	"start_date_original" date,
	"start_date_current" date,
	"registration_date" date,
	"termination_date" date,
	"termination_reason" text,
	"termination_year" integer,
	"has_medical_assistance" boolean DEFAULT true,
	"medical_plan_notes" text,
	"plr_eligible" boolean DEFAULT false,
	"thirteenth_pj" boolean DEFAULT false,
	"guaranteed_bonus" numeric(15, 2),
	"commission_pct" numeric(5, 2),
	"bank_name" text,
	"bank_branch" text,
	"bank_account" text,
	"bank_account_type" text,
	"current_salary" numeric(15, 2),
	"last_movement_date" date,
	"last_movement_type" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "collaborators_profile_id_unique" UNIQUE("profile_id"),
	CONSTRAINT "collaborators_registration_number_unique" UNIQUE("registration_number"),
	CONSTRAINT "collaborators_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "credit_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "credit_products_name_unique" UNIQUE("name"),
	CONSTRAINT "credit_products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "debenture_issuances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issuer_id" uuid NOT NULL,
	"asset_id" uuid,
	"issuance_number" integer NOT NULL,
	"name" text NOT NULL,
	"yield_type" text NOT NULL,
	"issuance_type" text DEFAULT 'private' NOT NULL,
	"species" text DEFAULT 'subordinated' NOT NULL,
	"issuance_form" text,
	"issuance_date" date NOT NULL,
	"maturity_date" date NOT NULL,
	"integration_deadline" date,
	"series_count" integer,
	"total_quantity" integer NOT NULL,
	"total_value" numeric(15, 2) NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"penalty_rate" numeric(5, 2),
	"mora_rate" numeric(5, 2),
	"balance" numeric(15, 2),
	"status" text DEFAULT 'open' NOT NULL,
	"prospectus_file_path" text,
	"age_document_path" text,
	"legacy_sgs_id" integer,
	"legacy_nf_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "debenture_issuers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cnpj" text NOT NULL,
	"legal_name" text NOT NULL,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"address_neighborhood" text,
	"address_city" text,
	"address_state" text,
	"address_zip" text,
	"bank_code" text,
	"bank_branch" text,
	"bank_account" text,
	"status" text DEFAULT 'active' NOT NULL,
	"legacy_sgs_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "debenture_issuers_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "debenture_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"requested_at" timestamp with time zone NOT NULL,
	"processed_at" timestamp with time zone,
	"settled_at" timestamp with time zone,
	"quantity" integer NOT NULL,
	"unit_price_at_sub" numeric(15, 2),
	"unit_price_at_red" numeric(15, 2),
	"invested_value" numeric(15, 2),
	"gross_redemption" numeric(15, 2),
	"gross_yield" numeric(15, 2),
	"ir_withheld" numeric(15, 2),
	"iof_withheld" numeric(15, 2),
	"net_redemption" numeric(15, 2),
	"net_yield" numeric(15, 2),
	"ir_rate" numeric(5, 2),
	"iof_rate" numeric(5, 2),
	"elapsed_days" integer,
	"iof_days" integer,
	"yield_rate" numeric(7, 4),
	"status" integer DEFAULT 0 NOT NULL,
	"legacy_sgs_id" integer,
	"legacy_nf_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "debenture_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issuance_id" uuid NOT NULL,
	"series_number" integer NOT NULL,
	"index_type" text NOT NULL,
	"index_percentage" numeric(15, 4),
	"issuance_rate" numeric(15, 4),
	"std_deviation" numeric(15, 4),
	"quantity" integer NOT NULL,
	"balance_quantity" integer NOT NULL,
	"maturity_date" date NOT NULL,
	"target_audience" text,
	"allow_web_redemption" boolean DEFAULT false NOT NULL,
	"publish_on_portal" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"legacy_sgs_id" integer,
	"legacy_nf_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "debenture_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_id" uuid NOT NULL,
	"debenturist_id" uuid NOT NULL,
	"subscription_date" date NOT NULL,
	"unit_price_at_sub" numeric(16, 7) NOT NULL,
	"quantity" integer NOT NULL,
	"total_value" numeric(15, 2) NOT NULL,
	"redeemed_quantity" integer DEFAULT 0 NOT NULL,
	"balance_quantity" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"legacy_sgs_id" integer,
	"legacy_nf_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "debenture_valuations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"valuation_date" date NOT NULL,
	"subscription_date" date NOT NULL,
	"index_type" text,
	"issuance_rate" numeric(15, 4),
	"capitalized_rate" numeric(15, 4),
	"index_daily_factor" numeric(18, 16),
	"prev_day_gross_value" numeric(15, 2),
	"daily_yield" numeric(15, 4),
	"monthly_yield" numeric(15, 4),
	"prev_month_yield" numeric(15, 4),
	"cumulative_yield" numeric(15, 4),
	"issuance_unit_price" numeric(15, 2),
	"current_quantity" integer,
	"current_unit_price" numeric(15, 2),
	"current_value" numeric(15, 2),
	"gross_value" numeric(15, 2),
	"daily_gross_yield" numeric(15, 2),
	"cumulative_gross_yield" numeric(15, 2),
	"elapsed_days" integer,
	"iof_free_days" integer,
	"iof_rate" numeric(5, 2),
	"calculated_iof" numeric(15, 2),
	"ir_rate" numeric(5, 2),
	"calculated_ir" numeric(15, 2),
	"net_yield" numeric(15, 2),
	"net_value" numeric(15, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_debenture_valuations" UNIQUE("subscription_id","valuation_date")
);
--> statement-breakpoint
CREATE TABLE "drawee_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drawee_id" uuid NOT NULL,
	"use_type" text,
	"street" text,
	"number" text,
	"without_number" boolean DEFAULT false NOT NULL,
	"complement" text,
	"neighborhood" text,
	"zip_code" text,
	"city" text,
	"state" char(2),
	"billing_street" text,
	"billing_number" text,
	"billing_complement" text,
	"billing_neighborhood" text,
	"billing_zip_code" text,
	"billing_city" text,
	"billing_state" char(2),
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drawee_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drawee_id" uuid NOT NULL,
	"bank_code" text,
	"bank_name" text,
	"branch" text,
	"account_number" text,
	"account_type" text,
	"pix_key" text,
	"nickname" text,
	"opened_at" date,
	"closed_at" date,
	"status" text DEFAULT 'active' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drawee_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drawee_id" uuid NOT NULL,
	"contact_name" text,
	"use_type" text,
	"email" text,
	"email_secondary" text,
	"billing_email" text,
	"xml_email" text,
	"phone" text,
	"phone_mobile" text,
	"phone_sms" text,
	"billing_phone" text,
	"whatsapp" boolean DEFAULT false NOT NULL,
	"homepage" text,
	"notes" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drawee_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drawee_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"document_category" text DEFAULT 'base' NOT NULL,
	"document_label" text,
	"storage_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"validation_status" text DEFAULT 'pending',
	"validation_result" jsonb,
	"validated_at" timestamp with time zone,
	"extracted_data" jsonb,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drawee_enabled_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drawee_id" uuid NOT NULL,
	"credit_product_id" uuid NOT NULL,
	"enabled_at" date,
	"disabled_at" date,
	"disabled_reason" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drawee_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drawee_id" uuid NOT NULL,
	"economic_group_id" uuid NOT NULL,
	"joined_at" date,
	"left_at" date,
	"is_headquarters" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drawees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_type" text DEFAULT 'company' NOT NULL,
	"cpf" text,
	"cnpj" text,
	"cnpj_root" text,
	"trade_name" text,
	"company_name" text NOT NULL,
	"legal_name" text,
	"rg" text,
	"birth_date" date,
	"gender" text,
	"rg_document_id" uuid,
	"cnh_document_id" uuid,
	"is_pep" boolean DEFAULT false NOT NULL,
	"is_ofac_listed" boolean DEFAULT false NOT NULL,
	"risk_rating" text,
	"credit_score" integer,
	"assigned_to" uuid,
	"segment_id" uuid,
	"economic_group_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"blocked_at" timestamp with time zone,
	"block_reason" text,
	"legacy_sgs_id" integer,
	"legacy_nf_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "drawees_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "economic_group_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"economic_group_id" uuid NOT NULL,
	"bank_code" text,
	"bank_name" text,
	"branch" text,
	"account_number" text,
	"account_type" text,
	"pix_key" text,
	"nickname" text,
	"opened_at" date,
	"closed_at" date,
	"status" text DEFAULT 'active' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "economic_group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"economic_group_id" uuid NOT NULL,
	"member_type" text NOT NULL,
	"client_id" uuid,
	"joined_at" date,
	"left_at" date,
	"is_headquarters" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "economic_group_persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"economic_group_id" uuid NOT NULL,
	"relationship_type" text,
	"full_name" text NOT NULL,
	"cpf_cnpj" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "economic_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"active_since" date,
	"inactive_since" date,
	"status" text DEFAULT 'active' NOT NULL,
	"legacy_sgs_id" integer,
	"legacy_nf_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"account_type" text NOT NULL,
	"bank_code" text,
	"branch" text,
	"account_number" text,
	"status" text DEFAULT 'active' NOT NULL,
	"block_type" text,
	"block_reason" text,
	"fees" numeric(18, 4),
	"opened_at" date,
	"closed_at" date,
	"legacy_nf_id" integer,
	"legacy_sgs_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_event_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_nf_code" integer,
	"legacy_sgs_code" integer,
	"name" text NOT NULL,
	"entry_type" char(1) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_pendencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"financial_account_id" uuid NOT NULL,
	"event_type_id" uuid,
	"drawee_id" uuid,
	"original_amount" numeric(18, 4) NOT NULL,
	"corrected_amount" numeric(18, 4),
	"settled_amount" numeric(18, 4),
	"pending_date" date NOT NULL,
	"settlement_date" date,
	"is_reversal" boolean DEFAULT false NOT NULL,
	"notes" text,
	"legacy_nf_code" integer,
	"legacy_sgs_code" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"pendency_id" uuid NOT NULL,
	"settled_amount" numeric(18, 4) NOT NULL,
	"settlement_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"financial_account_id" uuid NOT NULL,
	"event_type_id" uuid,
	"amount" numeric(18, 4) NOT NULL,
	"entry_type" char(1) NOT NULL,
	"description" text,
	"transaction_date" date NOT NULL,
	"reference_nf_code" integer,
	"reference_sgs_code" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guarantee_document_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guarantee_type_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"document_label" text NOT NULL,
	"description" text,
	"is_required" boolean DEFAULT true,
	"accepted_mime_types" text[] DEFAULT '{"application/pdf"}',
	"max_file_size_mb" integer DEFAULT 25,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guarantee_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "guarantee_types_name_unique" UNIQUE("name"),
	CONSTRAINT "guarantee_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "investment_asset_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subscription_cutoff_time" text,
	"redemption_cutoff_time" text,
	"redemption_settlement_days" integer,
	"reservation_settlement_days" integer,
	"redemption_cancel_days" integer,
	"min_redemption_quantity" integer,
	"has_iof" boolean DEFAULT false NOT NULL,
	"has_ir" boolean DEFAULT true NOT NULL,
	"legacy_sgs_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investment_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_group_id" uuid NOT NULL,
	"asset_type" text,
	"yield_type" text,
	"name" text NOT NULL,
	"subscription_cutoff_time" text,
	"redemption_cutoff_time" text,
	"redemption_settlement_days" integer,
	"reservation_settlement_days" integer,
	"redemption_cancel_days" integer,
	"min_redemption_quantity" integer,
	"has_iof" boolean,
	"has_ir" boolean,
	"legacy_sgs_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "iof_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"elapsed_days" integer NOT NULL,
	"rate_percentage" numeric(5, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "iof_rates_elapsed_days_unique" UNIQUE("elapsed_days")
);
--> statement-breakpoint
CREATE TABLE "ir_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"min_days" integer NOT NULL,
	"max_days" integer,
	"rate_percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"category" text NOT NULL,
	"target_roles" text[] NOT NULL,
	"is_mandatory" boolean DEFAULT false,
	"deadline_days" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"total_duration_seconds" integer DEFAULT 0,
	"created_by" uuid NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"collaborator_id" uuid NOT NULL,
	"status" text DEFAULT 'enrolled' NOT NULL,
	"progress_pct" integer DEFAULT 0 NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now(),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"deadline_at" timestamp with time zone,
	"certificate_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_learning_enrollment" UNIQUE("course_id","collaborator_id")
);
--> statement-breakpoint
CREATE TABLE "learning_lesson_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"watched_pct" integer DEFAULT 0 NOT NULL,
	"quiz_score" integer,
	"quiz_passed" boolean,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_lesson_completion" UNIQUE("enrollment_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "learning_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"youtube_video_id" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"materials" jsonb,
	"quiz" jsonb,
	"min_quiz_score" integer DEFAULT 70,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rate_type" text NOT NULL,
	"rate_date" date NOT NULL,
	"value" numeric(18, 6) NOT NULL,
	"source" text DEFAULT 'B3' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_market_rates" UNIQUE("rate_type","rate_date")
);
--> statement-breakpoint
CREATE TABLE "medical_plan_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaborator_id" uuid,
	"plan_type" text,
	"provider" text DEFAULT 'Agrega',
	"beneficiary_name" text NOT NULL,
	"beneficiary_relationship" text NOT NULL,
	"beneficiary_cpf" text,
	"is_active" boolean DEFAULT true,
	"enrollment_date" date,
	"cancellation_date" date,
	"monthly_cost" numeric(15, 2),
	"company_subsidy_pct" numeric(5, 2),
	"employee_cost" numeric(15, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"client_id" uuid,
	"metadata" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaborator_id" uuid,
	"template_id" uuid,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"employment_type" text,
	"task_order" integer NOT NULL,
	"task_title" text NOT NULL,
	"task_description" text,
	"responsible_area" text NOT NULL,
	"due_days" integer,
	"is_required" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_review_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid,
	"collaborator_id" uuid,
	"reviewer_id" uuid,
	"self_review_score" numeric(3, 1),
	"self_review_text" text,
	"self_review_submitted_at" timestamp with time zone,
	"manager_review_score" numeric(3, 1),
	"manager_review_text" text,
	"manager_review_submitted_at" timestamp with time zone,
	"calibrated_score" numeric(3, 1),
	"calibration_notes" text,
	"calibrated_by" uuid,
	"calibrated_at" timestamp with time zone,
	"final_score" numeric(3, 1),
	"final_rating" text,
	"development_plan" text,
	"goals_next_cycle" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"feedback_given_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_performance_reviews_cycle_collaborator" UNIQUE("cycle_id","collaborator_id")
);
--> statement-breakpoint
CREATE TABLE "pj_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaborator_id" uuid,
	"reference_month" integer NOT NULL,
	"reference_year" integer NOT NULL,
	"invoice_number" text,
	"invoice_amount" numeric(15, 2) NOT NULL,
	"invoice_path" text,
	"invoice_file_name" text,
	"uploaded_at" timestamp with time zone,
	"uploaded_by" uuid,
	"invoice_file_size" integer,
	"invoice_mime_type" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by_finance_1" uuid,
	"approved_at_finance_1" timestamp with time zone,
	"approved_by_finance_2" uuid,
	"approved_at_finance_2" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"payment_reference" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"reminder_sent_at" timestamp with time zone,
	"reminder_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_pj_invoices_collab_month_year" UNIQUE("collaborator_id","reference_month","reference_year")
);
--> statement-breakpoint
CREATE TABLE "portfolio_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_name" text NOT NULL,
	"fund_cnpj" text,
	"position_date" date NOT NULL,
	"client_id" uuid,
	"drawee_id" uuid,
	"cedent_doc" text,
	"drawee_doc" text,
	"cedent_name" text,
	"drawee_name" text,
	"asset_type" text,
	"asset_subtype" text,
	"document_number" text,
	"title_id_external" text,
	"emission_date" date,
	"acquisition_date" date,
	"original_maturity" date,
	"adjusted_maturity" date,
	"extension_date" date,
	"nominal_value" numeric(18, 4) NOT NULL,
	"acquisition_value" numeric(18, 4),
	"current_nominal" numeric(18, 4),
	"present_value" numeric(18, 4),
	"mtm_value" numeric(18, 4),
	"pdd_note" text,
	"pdd_rating_value" numeric(18, 4),
	"pdd_overdue_value" numeric(18, 4),
	"status" text,
	"has_coobligation" boolean DEFAULT false NOT NULL,
	"originador_doc" text,
	"cnae" text,
	"source_file" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_document_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"document_label" text NOT NULL,
	"description" text,
	"is_required" boolean DEFAULT true,
	"accepted_mime_types" text[] DEFAULT '{"application/pdf"}',
	"max_file_size_mb" integer DEFAULT 25,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" text NOT NULL,
	"team_id" uuid,
	"region_id" uuid,
	"is_active" boolean DEFAULT true,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "range_age" (
	"id" serial PRIMARY KEY NOT NULL,
	"min_age" integer NOT NULL,
	"max_age" integer,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "range_tenure" (
	"id" serial PRIMARY KEY NOT NULL,
	"min_years" numeric(4, 1) NOT NULL,
	"max_years" numeric(4, 1),
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "reimbursements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collaborator_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"expense_date" date NOT NULL,
	"receipt_path" text,
	"receipt_file_name" text,
	"receipt_uploaded_at" timestamp with time zone,
	"receipt_file_size" integer,
	"receipt_mime_type" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejection_reason" text,
	"rejected_by" uuid,
	"rejected_at" timestamp with time zone,
	"paid_by" uuid,
	"paid_at" timestamp with time zone,
	"payment_reference" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"team_id" uuid,
	"region_id" uuid,
	"period_year" integer NOT NULL,
	"period_month" integer NOT NULL,
	"goal_amount" numeric(15, 2) NOT NULL,
	"goal_count" integer,
	"achieved_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"achieved_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goal_target_check" CHECK (("sales_goals"."profile_id" IS NOT NULL)::int + ("sales_goals"."team_id" IS NOT NULL)::int + ("sales_goals"."region_id" IS NOT NULL)::int = 1)
);
--> statement-breakpoint
CREATE TABLE "segment_document_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"segment_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"document_label" text NOT NULL,
	"description" text,
	"is_required" boolean DEFAULT true,
	"accepted_mime_types" text[] DEFAULT '{"application/pdf"}',
	"max_file_size_mb" integer DEFAULT 25,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "segments_name_unique" UNIQUE("name"),
	CONSTRAINT "segments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "supplier_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"use_type" text,
	"street" text,
	"number" text,
	"without_number" boolean DEFAULT false NOT NULL,
	"complement" text,
	"neighborhood" text,
	"zip_code" text,
	"city" text,
	"state" char(2),
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"bank_code" text,
	"bank_name" text,
	"branch" text,
	"account_number" text,
	"account_type" text,
	"pix_key" text,
	"nickname" text,
	"opened_at" date,
	"closed_at" date,
	"status" text DEFAULT 'active' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"contact_name" text,
	"use_type" text,
	"email" text,
	"email_secondary" text,
	"phone" text,
	"phone_mobile" text,
	"phone_sms" text,
	"whatsapp" boolean DEFAULT false NOT NULL,
	"homepage" text,
	"notes" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"document_category" text DEFAULT 'base' NOT NULL,
	"document_label" text,
	"storage_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"validation_status" text DEFAULT 'pending',
	"validation_result" jsonb,
	"validated_at" timestamp with time zone,
	"extracted_data" jsonb,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_type" text DEFAULT 'company' NOT NULL,
	"cpf" text,
	"cnpj" text,
	"trade_name" text,
	"company_name" text NOT NULL,
	"service_category" text,
	"rg_document_id" uuid,
	"cnh_document_id" uuid,
	"onboarded_at" date,
	"offboarded_at" date,
	"offboarding_reason" text,
	"status" text DEFAULT 'active' NOT NULL,
	"legacy_sgs_id" integer,
	"legacy_nf_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "suppliers_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"region_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vadu_company_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"cnpj" text,
	"company_name" text,
	"trade_name" text,
	"revenue_status" text,
	"revenue_status_date" timestamp,
	"special_status" text,
	"capital_social" numeric(15, 2),
	"legal_nature" text,
	"is_simples_nacional" boolean,
	"company_size" text,
	"environmental_score" numeric(10, 2),
	"environmental_level" text,
	"raw_data" jsonb,
	"queried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vadu_person_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"authorized_person_id" uuid,
	"cpf" text,
	"name" text,
	"birth_date" timestamp,
	"mother_name" text,
	"raw_data" jsonb,
	"queried_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_authorized_persons" ADD CONSTRAINT "client_authorized_persons_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_bank_accounts" ADD CONSTRAINT "client_bank_accounts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_segment_template_id_segment_document_templates_id_fk" FOREIGN KEY ("segment_template_id") REFERENCES "public"."segment_document_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_product_template_id_product_document_templates_id_fk" FOREIGN KEY ("product_template_id") REFERENCES "public"."product_document_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_guarantee_template_id_guarantee_document_templates_id_fk" FOREIGN KEY ("guarantee_template_id") REFERENCES "public"."guarantee_document_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_client_guarantee_id_client_guarantees_id_fk" FOREIGN KEY ("client_guarantee_id") REFERENCES "public"."client_guarantees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_guarantees" ADD CONSTRAINT "client_guarantees_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_guarantees" ADD CONSTRAINT "client_guarantees_guarantee_type_id_guarantee_types_id_fk" FOREIGN KEY ("guarantee_type_id") REFERENCES "public"."guarantee_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_status_history" ADD CONSTRAINT "client_status_history_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_status_history" ADD CONSTRAINT "client_status_history_changed_by_profiles_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_credit_product_id_credit_products_id_fk" FOREIGN KEY ("credit_product_id") REFERENCES "public"."credit_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_assigned_to_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cnae_segment_mapping" ADD CONSTRAINT "cnae_segment_mapping_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_clt_data" ADD CONSTRAINT "collaborator_clt_data_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_compensation" ADD CONSTRAINT "collaborator_compensation_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_compensation" ADD CONSTRAINT "collaborator_compensation_approved_by_profiles_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_compensation" ADD CONSTRAINT "collaborator_compensation_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_dependents" ADD CONSTRAINT "collaborator_dependents_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_documents" ADD CONSTRAINT "collaborator_documents_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_documents" ADD CONSTRAINT "collaborator_documents_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_pj_data" ADD CONSTRAINT "collaborator_pj_data_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_manager_id_collaborators_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."collaborators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debenture_issuances" ADD CONSTRAINT "debenture_issuances_issuer_id_debenture_issuers_id_fk" FOREIGN KEY ("issuer_id") REFERENCES "public"."debenture_issuers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debenture_issuances" ADD CONSTRAINT "debenture_issuances_asset_id_investment_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."investment_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debenture_redemptions" ADD CONSTRAINT "debenture_redemptions_subscription_id_debenture_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."debenture_subscriptions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debenture_series" ADD CONSTRAINT "debenture_series_issuance_id_debenture_issuances_id_fk" FOREIGN KEY ("issuance_id") REFERENCES "public"."debenture_issuances"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debenture_subscriptions" ADD CONSTRAINT "debenture_subscriptions_series_id_debenture_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."debenture_series"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debenture_subscriptions" ADD CONSTRAINT "debenture_subscriptions_debenturist_id_clients_id_fk" FOREIGN KEY ("debenturist_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debenture_valuations" ADD CONSTRAINT "debenture_valuations_subscription_id_debenture_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."debenture_subscriptions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawee_addresses" ADD CONSTRAINT "drawee_addresses_drawee_id_drawees_id_fk" FOREIGN KEY ("drawee_id") REFERENCES "public"."drawees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawee_bank_accounts" ADD CONSTRAINT "drawee_bank_accounts_drawee_id_drawees_id_fk" FOREIGN KEY ("drawee_id") REFERENCES "public"."drawees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawee_contacts" ADD CONSTRAINT "drawee_contacts_drawee_id_drawees_id_fk" FOREIGN KEY ("drawee_id") REFERENCES "public"."drawees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawee_documents" ADD CONSTRAINT "drawee_documents_drawee_id_drawees_id_fk" FOREIGN KEY ("drawee_id") REFERENCES "public"."drawees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawee_documents" ADD CONSTRAINT "drawee_documents_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawee_enabled_products" ADD CONSTRAINT "drawee_enabled_products_drawee_id_drawees_id_fk" FOREIGN KEY ("drawee_id") REFERENCES "public"."drawees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawee_enabled_products" ADD CONSTRAINT "drawee_enabled_products_credit_product_id_credit_products_id_fk" FOREIGN KEY ("credit_product_id") REFERENCES "public"."credit_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawee_groups" ADD CONSTRAINT "drawee_groups_drawee_id_drawees_id_fk" FOREIGN KEY ("drawee_id") REFERENCES "public"."drawees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawee_groups" ADD CONSTRAINT "drawee_groups_economic_group_id_economic_groups_id_fk" FOREIGN KEY ("economic_group_id") REFERENCES "public"."economic_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawees" ADD CONSTRAINT "drawees_assigned_to_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawees" ADD CONSTRAINT "drawees_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawees" ADD CONSTRAINT "drawees_economic_group_id_economic_groups_id_fk" FOREIGN KEY ("economic_group_id") REFERENCES "public"."economic_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "economic_group_bank_accounts" ADD CONSTRAINT "economic_group_bank_accounts_economic_group_id_economic_groups_id_fk" FOREIGN KEY ("economic_group_id") REFERENCES "public"."economic_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "economic_group_members" ADD CONSTRAINT "economic_group_members_economic_group_id_economic_groups_id_fk" FOREIGN KEY ("economic_group_id") REFERENCES "public"."economic_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "economic_group_members" ADD CONSTRAINT "economic_group_members_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "economic_group_persons" ADD CONSTRAINT "economic_group_persons_economic_group_id_economic_groups_id_fk" FOREIGN KEY ("economic_group_id") REFERENCES "public"."economic_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_pendencies" ADD CONSTRAINT "financial_pendencies_financial_account_id_financial_accounts_id_fk" FOREIGN KEY ("financial_account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_pendencies" ADD CONSTRAINT "financial_pendencies_event_type_id_financial_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."financial_event_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_settlements" ADD CONSTRAINT "financial_settlements_transaction_id_financial_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."financial_transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_settlements" ADD CONSTRAINT "financial_settlements_pendency_id_financial_pendencies_id_fk" FOREIGN KEY ("pendency_id") REFERENCES "public"."financial_pendencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_financial_account_id_financial_accounts_id_fk" FOREIGN KEY ("financial_account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_event_type_id_financial_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."financial_event_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guarantee_document_templates" ADD CONSTRAINT "guarantee_document_templates_guarantee_type_id_guarantee_types_id_fk" FOREIGN KEY ("guarantee_type_id") REFERENCES "public"."guarantee_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_assets" ADD CONSTRAINT "investment_assets_asset_group_id_investment_asset_groups_id_fk" FOREIGN KEY ("asset_group_id") REFERENCES "public"."investment_asset_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_courses" ADD CONSTRAINT "learning_courses_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_enrollments" ADD CONSTRAINT "learning_enrollments_course_id_learning_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."learning_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_enrollments" ADD CONSTRAINT "learning_enrollments_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_lesson_completions" ADD CONSTRAINT "learning_lesson_completions_enrollment_id_learning_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."learning_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_lesson_completions" ADD CONSTRAINT "learning_lesson_completions_lesson_id_learning_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."learning_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_lessons" ADD CONSTRAINT "learning_lessons_module_id_learning_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_modules" ADD CONSTRAINT "learning_modules_course_id_learning_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."learning_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_plan_entries" ADD CONSTRAINT "medical_plan_entries_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_template_id_onboarding_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."onboarding_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_completed_by_profiles_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_cycle_id_performance_review_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."performance_review_cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_id_collaborators_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."collaborators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_calibrated_by_profiles_id_fk" FOREIGN KEY ("calibrated_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pj_invoices" ADD CONSTRAINT "pj_invoices_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pj_invoices" ADD CONSTRAINT "pj_invoices_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pj_invoices" ADD CONSTRAINT "pj_invoices_approved_by_finance_1_profiles_id_fk" FOREIGN KEY ("approved_by_finance_1") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pj_invoices" ADD CONSTRAINT "pj_invoices_approved_by_finance_2_profiles_id_fk" FOREIGN KEY ("approved_by_finance_2") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pj_invoices" ADD CONSTRAINT "pj_invoices_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_positions" ADD CONSTRAINT "portfolio_positions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_document_templates" ADD CONSTRAINT "product_document_templates_product_id_credit_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."credit_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reimbursements" ADD CONSTRAINT "reimbursements_collaborator_id_collaborators_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reimbursements" ADD CONSTRAINT "reimbursements_approved_by_profiles_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reimbursements" ADD CONSTRAINT "reimbursements_rejected_by_profiles_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reimbursements" ADD CONSTRAINT "reimbursements_paid_by_profiles_id_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_goals" ADD CONSTRAINT "sales_goals_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_goals" ADD CONSTRAINT "sales_goals_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_goals" ADD CONSTRAINT "sales_goals_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segment_document_templates" ADD CONSTRAINT "segment_document_templates_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_addresses" ADD CONSTRAINT "supplier_addresses_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_bank_accounts" ADD CONSTRAINT "supplier_bank_accounts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_documents" ADD CONSTRAINT "supplier_documents_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_documents" ADD CONSTRAINT "supplier_documents_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vadu_company_results" ADD CONSTRAINT "vadu_company_results_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vadu_person_results" ADD CONSTRAINT "vadu_person_results_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vadu_person_results" ADD CONSTRAINT "vadu_person_results_authorized_person_id_client_authorized_persons_id_fk" FOREIGN KEY ("authorized_person_id") REFERENCES "public"."client_authorized_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_client_addresses_client" ON "client_addresses" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_client_addresses_primary" ON "client_addresses" USING btree ("client_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_client_addresses_use_type" ON "client_addresses" USING btree ("use_type");--> statement-breakpoint
CREATE INDEX "idx_client_auth_persons_client" ON "client_authorized_persons" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_client_auth_persons_active" ON "client_authorized_persons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_client_auth_persons_cpf" ON "client_authorized_persons" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "idx_client_bank_accounts_client" ON "client_bank_accounts" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_client_bank_accounts_primary" ON "client_bank_accounts" USING btree ("client_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_client_bank_accounts_status" ON "client_bank_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_client_contacts_client" ON "client_contacts" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_client_contacts_primary" ON "client_contacts" USING btree ("client_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_client_contacts_active" ON "client_contacts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_client_docs_client" ON "client_documents" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_client_docs_type" ON "client_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_client_docs_category" ON "client_documents" USING btree ("document_category");--> statement-breakpoint
CREATE INDEX "idx_client_docs_validation" ON "client_documents" USING btree ("validation_status");--> statement-breakpoint
CREATE INDEX "idx_client_guarantees_client" ON "client_guarantees" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_status_history_client" ON "client_status_history" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_status_history_created" ON "client_status_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_clients_assigned" ON "clients" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_clients_team" ON "clients" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_clients_region" ON "clients" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "idx_clients_segment" ON "clients" USING btree ("segment_id");--> statement-breakpoint
CREATE INDEX "idx_clients_product" ON "clients" USING btree ("credit_product_id");--> statement-breakpoint
CREATE INDEX "idx_clients_status" ON "clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_clients_cnpj" ON "clients" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_clients_cpf" ON "clients" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "idx_clients_person_type" ON "clients" USING btree ("person_type");--> statement-breakpoint
CREATE INDEX "idx_clients_registration_status" ON "clients" USING btree ("registration_status");--> statement-breakpoint
CREATE INDEX "idx_clients_economic_group" ON "clients" USING btree ("economic_group_id");--> statement-breakpoint
CREATE INDEX "idx_clients_created" ON "clients" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_cnae_mapping_code" ON "cnae_segment_mapping" USING btree ("cnae_code");--> statement-breakpoint
CREATE INDEX "idx_cnae_mapping_group" ON "cnae_segment_mapping" USING btree ("cnae_group");--> statement-breakpoint
CREATE INDEX "idx_compensation_collaborator" ON "collaborator_compensation" USING btree ("collaborator_id");--> statement-breakpoint
CREATE INDEX "idx_compensation_effective_date" ON "collaborator_compensation" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "idx_dependents_collaborator" ON "collaborator_dependents" USING btree ("collaborator_id");--> statement-breakpoint
CREATE INDEX "idx_documents_collaborator" ON "collaborator_documents" USING btree ("collaborator_id");--> statement-breakpoint
CREATE INDEX "idx_collab_active" ON "collaborators" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_collab_type" ON "collaborators" USING btree ("employment_type");--> statement-breakpoint
CREATE INDEX "idx_collab_manager" ON "collaborators" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "idx_collab_department" ON "collaborators" USING btree ("department");--> statement-breakpoint
CREATE INDEX "idx_collab_directorate" ON "collaborators" USING btree ("directorate");--> statement-breakpoint
CREATE INDEX "idx_collab_cpf" ON "collaborators" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "idx_collab_profile" ON "collaborators" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_debenture_issuances_issuer" ON "debenture_issuances" USING btree ("issuer_id");--> statement-breakpoint
CREATE INDEX "idx_debenture_issuances_status" ON "debenture_issuances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_debenture_issuances_date" ON "debenture_issuances" USING btree ("issuance_date");--> statement-breakpoint
CREATE INDEX "idx_debenture_issuers_cnpj" ON "debenture_issuers" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_debenture_issuers_status" ON "debenture_issuers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_debenture_redemptions_subscription" ON "debenture_redemptions" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_debenture_redemptions_status" ON "debenture_redemptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_debenture_redemptions_requested" ON "debenture_redemptions" USING btree ("requested_at");--> statement-breakpoint
CREATE INDEX "idx_debenture_series_issuance" ON "debenture_series" USING btree ("issuance_id");--> statement-breakpoint
CREATE INDEX "idx_debenture_series_status" ON "debenture_series" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_debenture_subscriptions_series" ON "debenture_subscriptions" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_debenture_subscriptions_debenturist" ON "debenture_subscriptions" USING btree ("debenturist_id");--> statement-breakpoint
CREATE INDEX "idx_debenture_subscriptions_status" ON "debenture_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_debenture_subscriptions_date" ON "debenture_subscriptions" USING btree ("subscription_date");--> statement-breakpoint
CREATE INDEX "idx_debenture_valuations_subscription" ON "debenture_valuations" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_debenture_valuations_date" ON "debenture_valuations" USING btree ("valuation_date");--> statement-breakpoint
CREATE INDEX "idx_drawee_addresses_drawee" ON "drawee_addresses" USING btree ("drawee_id");--> statement-breakpoint
CREATE INDEX "idx_drawee_addresses_primary" ON "drawee_addresses" USING btree ("drawee_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_drawee_addresses_use_type" ON "drawee_addresses" USING btree ("use_type");--> statement-breakpoint
CREATE INDEX "idx_drawee_bank_accounts_drawee" ON "drawee_bank_accounts" USING btree ("drawee_id");--> statement-breakpoint
CREATE INDEX "idx_drawee_bank_accounts_primary" ON "drawee_bank_accounts" USING btree ("drawee_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_drawee_bank_accounts_status" ON "drawee_bank_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_drawee_contacts_drawee" ON "drawee_contacts" USING btree ("drawee_id");--> statement-breakpoint
CREATE INDEX "idx_drawee_contacts_primary" ON "drawee_contacts" USING btree ("drawee_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_drawee_contacts_active" ON "drawee_contacts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_drawee_docs_drawee" ON "drawee_documents" USING btree ("drawee_id");--> statement-breakpoint
CREATE INDEX "idx_drawee_docs_type" ON "drawee_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_drawee_docs_validation" ON "drawee_documents" USING btree ("validation_status");--> statement-breakpoint
CREATE INDEX "idx_drawee_enabled_products_drawee" ON "drawee_enabled_products" USING btree ("drawee_id");--> statement-breakpoint
CREATE INDEX "idx_drawee_enabled_products_product" ON "drawee_enabled_products" USING btree ("credit_product_id");--> statement-breakpoint
CREATE INDEX "idx_drawee_enabled_products_active" ON "drawee_enabled_products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_drawee_groups_drawee" ON "drawee_groups" USING btree ("drawee_id");--> statement-breakpoint
CREATE INDEX "idx_drawee_groups_group" ON "drawee_groups" USING btree ("economic_group_id");--> statement-breakpoint
CREATE INDEX "idx_drawees_cnpj" ON "drawees" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_drawees_cpf" ON "drawees" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "idx_drawees_person_type" ON "drawees" USING btree ("person_type");--> statement-breakpoint
CREATE INDEX "idx_drawees_status" ON "drawees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_drawees_segment" ON "drawees" USING btree ("segment_id");--> statement-breakpoint
CREATE INDEX "idx_drawees_assigned" ON "drawees" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_drawees_economic_group" ON "drawees" USING btree ("economic_group_id");--> statement-breakpoint
CREATE INDEX "idx_eg_bank_accounts_group" ON "economic_group_bank_accounts" USING btree ("economic_group_id");--> statement-breakpoint
CREATE INDEX "idx_eg_bank_accounts_status" ON "economic_group_bank_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_eg_members_group" ON "economic_group_members" USING btree ("economic_group_id");--> statement-breakpoint
CREATE INDEX "idx_eg_members_type" ON "economic_group_members" USING btree ("member_type");--> statement-breakpoint
CREATE INDEX "idx_eg_members_client" ON "economic_group_members" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_eg_persons_group" ON "economic_group_persons" USING btree ("economic_group_id");--> statement-breakpoint
CREATE INDEX "idx_eg_persons_active" ON "economic_group_persons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_economic_groups_status" ON "economic_groups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_economic_groups_type" ON "economic_groups" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_financial_accounts_client" ON "financial_accounts" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_financial_accounts_status" ON "financial_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_financial_accounts_type" ON "financial_accounts" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "idx_financial_event_types_active" ON "financial_event_types" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_financial_event_types_entry" ON "financial_event_types" USING btree ("entry_type");--> statement-breakpoint
CREATE INDEX "idx_financial_pendencies_account" ON "financial_pendencies" USING btree ("financial_account_id");--> statement-breakpoint
CREATE INDEX "idx_financial_pendencies_drawee" ON "financial_pendencies" USING btree ("drawee_id");--> statement-breakpoint
CREATE INDEX "idx_financial_pendencies_date" ON "financial_pendencies" USING btree ("pending_date");--> statement-breakpoint
CREATE INDEX "idx_financial_pendencies_reversal" ON "financial_pendencies" USING btree ("is_reversal");--> statement-breakpoint
CREATE INDEX "idx_financial_settlements_transaction" ON "financial_settlements" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_financial_settlements_pendency" ON "financial_settlements" USING btree ("pendency_id");--> statement-breakpoint
CREATE INDEX "idx_financial_settlements_date" ON "financial_settlements" USING btree ("settlement_date");--> statement-breakpoint
CREATE INDEX "idx_financial_transactions_account" ON "financial_transactions" USING btree ("financial_account_id");--> statement-breakpoint
CREATE INDEX "idx_financial_transactions_date" ON "financial_transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "idx_financial_transactions_entry" ON "financial_transactions" USING btree ("entry_type");--> statement-breakpoint
CREATE INDEX "idx_guar_doc_templates" ON "guarantee_document_templates" USING btree ("guarantee_type_id");--> statement-breakpoint
CREATE INDEX "idx_investment_asset_groups_name" ON "investment_asset_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_investment_assets_group" ON "investment_assets" USING btree ("asset_group_id");--> statement-breakpoint
CREATE INDEX "idx_investment_assets_type" ON "investment_assets" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "idx_learning_courses_status" ON "learning_courses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_learning_courses_category" ON "learning_courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_learning_courses_created" ON "learning_courses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_learning_enrollments_course" ON "learning_enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_learning_enrollments_collaborator" ON "learning_enrollments" USING btree ("collaborator_id");--> statement-breakpoint
CREATE INDEX "idx_learning_enrollments_status" ON "learning_enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_lesson_completions_enrollment" ON "learning_lesson_completions" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_completions_lesson" ON "learning_lesson_completions" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_learning_lessons_module" ON "learning_lessons" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "idx_learning_modules_course" ON "learning_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_market_rates_type" ON "market_rates" USING btree ("rate_type");--> statement-breakpoint
CREATE INDEX "idx_market_rates_date" ON "market_rates" USING btree ("rate_date");--> statement-breakpoint
CREATE INDEX "idx_medical_plan_collaborator" ON "medical_plan_entries" USING btree ("collaborator_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_profile" ON "notifications" USING btree ("profile_id","read_at");--> statement-breakpoint
CREATE INDEX "idx_onboarding_tasks_collaborator" ON "onboarding_tasks" USING btree ("collaborator_id");--> statement-breakpoint
CREATE INDEX "idx_onboarding_tasks_status" ON "onboarding_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_onboarding_tasks_type" ON "onboarding_tasks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_performance_reviews_collaborator" ON "performance_reviews" USING btree ("collaborator_id");--> statement-breakpoint
CREATE INDEX "idx_performance_reviews_cycle" ON "performance_reviews" USING btree ("cycle_id");--> statement-breakpoint
CREATE INDEX "idx_performance_reviews_status" ON "performance_reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_performance_reviews_reviewer" ON "performance_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "idx_pj_invoices_collaborator" ON "pj_invoices" USING btree ("collaborator_id");--> statement-breakpoint
CREATE INDEX "idx_pj_invoices_status" ON "pj_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pj_invoices_reference" ON "pj_invoices" USING btree ("reference_year","reference_month");--> statement-breakpoint
CREATE INDEX "idx_pj_inv_status_period" ON "pj_invoices" USING btree ("status","reference_year","reference_month");--> statement-breakpoint
CREATE INDEX "idx_portfolio_positions_fund_date" ON "portfolio_positions" USING btree ("fund_name","position_date");--> statement-breakpoint
CREATE INDEX "idx_portfolio_positions_drawee_doc" ON "portfolio_positions" USING btree ("drawee_doc","position_date");--> statement-breakpoint
CREATE INDEX "idx_portfolio_positions_cedent_doc" ON "portfolio_positions" USING btree ("cedent_doc","position_date");--> statement-breakpoint
CREATE INDEX "idx_portfolio_positions_client" ON "portfolio_positions" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_portfolio_positions_status" ON "portfolio_positions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_prod_doc_templates_product" ON "product_document_templates" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_role" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_profiles_team" ON "profiles" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_region" ON "profiles" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "idx_reimbursements_collaborator" ON "reimbursements" USING btree ("collaborator_id");--> statement-breakpoint
CREATE INDEX "idx_reimbursements_status" ON "reimbursements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reimbursements_approved_by" ON "reimbursements" USING btree ("approved_by");--> statement-breakpoint
CREATE INDEX "idx_goals_period" ON "sales_goals" USING btree ("period_year","period_month");--> statement-breakpoint
CREATE INDEX "idx_seg_doc_templates_segment" ON "segment_document_templates" USING btree ("segment_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_addresses_supplier" ON "supplier_addresses" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_addresses_primary" ON "supplier_addresses" USING btree ("supplier_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_supplier_addresses_use_type" ON "supplier_addresses" USING btree ("use_type");--> statement-breakpoint
CREATE INDEX "idx_supplier_bank_accounts_supplier" ON "supplier_bank_accounts" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_bank_accounts_primary" ON "supplier_bank_accounts" USING btree ("supplier_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_supplier_bank_accounts_status" ON "supplier_bank_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_supplier_contacts_supplier" ON "supplier_contacts" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_contacts_primary" ON "supplier_contacts" USING btree ("supplier_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_supplier_contacts_active" ON "supplier_contacts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_supplier_docs_supplier" ON "supplier_documents" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_docs_type" ON "supplier_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_supplier_docs_validation" ON "supplier_documents" USING btree ("validation_status");--> statement-breakpoint
CREATE INDEX "idx_suppliers_cnpj" ON "suppliers" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_suppliers_cpf" ON "suppliers" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "idx_suppliers_status" ON "suppliers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_suppliers_person_type" ON "suppliers" USING btree ("person_type");--> statement-breakpoint
CREATE INDEX "idx_suppliers_service_category" ON "suppliers" USING btree ("service_category");--> statement-breakpoint
CREATE INDEX "idx_vadu_company_results_client" ON "vadu_company_results" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_vadu_company_results_cnpj" ON "vadu_company_results" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_vadu_person_results_client" ON "vadu_person_results" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_vadu_person_results_person" ON "vadu_person_results" USING btree ("authorized_person_id");--> statement-breakpoint
CREATE INDEX "idx_vadu_person_results_cpf" ON "vadu_person_results" USING btree ("cpf");