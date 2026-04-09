-- Add Serasa QSA fields to capture all partner/director data (aligned with apps/api migration 0006)

ALTER TABLE "client_authorized_persons" ADD COLUMN IF NOT EXISTS "joined_at" timestamptz;
ALTER TABLE "client_authorized_persons" ADD COLUMN IF NOT EXISTS "mandate_end_at" timestamptz;
ALTER TABLE "client_authorized_persons" ADD COLUMN IF NOT EXISTS "role" text;
ALTER TABLE "client_authorized_persons" ADD COLUMN IF NOT EXISTS "participation_percentage" numeric(6,2);
ALTER TABLE "client_authorized_persons" ADD COLUMN IF NOT EXISTS "capital_total_value" numeric(20,2);
ALTER TABLE "client_authorized_persons" ADD COLUMN IF NOT EXISTS "restriction_sign" text;

ALTER TABLE "drawee_authorized_persons" ADD COLUMN IF NOT EXISTS "joined_at" timestamptz;
ALTER TABLE "drawee_authorized_persons" ADD COLUMN IF NOT EXISTS "mandate_end_at" timestamptz;
ALTER TABLE "drawee_authorized_persons" ADD COLUMN IF NOT EXISTS "role" text;
ALTER TABLE "drawee_authorized_persons" ADD COLUMN IF NOT EXISTS "participation_percentage" numeric(6,2);
ALTER TABLE "drawee_authorized_persons" ADD COLUMN IF NOT EXISTS "capital_total_value" numeric(20,2);
ALTER TABLE "drawee_authorized_persons" ADD COLUMN IF NOT EXISTS "restriction_sign" text;
