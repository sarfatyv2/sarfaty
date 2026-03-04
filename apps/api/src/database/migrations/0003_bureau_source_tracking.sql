-- Add source tracking to client_addresses and client_contacts
-- Enables tracing data origin (manual, vadu, serasa, brasilapi, creditbox, etc.)

ALTER TABLE "client_addresses" ADD COLUMN "source" text;
ALTER TABLE "client_addresses" ADD COLUMN "source_queried_at" timestamptz;

ALTER TABLE "client_contacts" ADD COLUMN "source" text;
ALTER TABLE "client_contacts" ADD COLUMN "source_queried_at" timestamptz;

-- Backfill existing records as manual entries
UPDATE "client_addresses" SET "source" = 'manual' WHERE "source" IS NULL;
UPDATE "client_contacts" SET "source" = 'manual' WHERE "source" IS NULL;
