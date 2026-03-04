-- Add source tracking to client_authorized_persons
-- Enables tracing data origin (manual, serasa, vadu, etc.) for partners/directors

ALTER TABLE "client_authorized_persons" ADD COLUMN "source" text;
ALTER TABLE "client_authorized_persons" ADD COLUMN "source_queried_at" timestamptz;

-- Backfill existing records as manual entries
UPDATE "client_authorized_persons" SET "source" = 'manual' WHERE "source" IS NULL;

-- Index for upsert by client + source
CREATE INDEX IF NOT EXISTS "idx_client_auth_persons_source"
  ON "client_authorized_persons" ("client_id", "source");
