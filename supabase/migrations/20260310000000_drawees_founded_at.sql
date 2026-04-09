-- Add foundedAt to drawees (Serasa companyFoundation)

ALTER TABLE "drawees" ADD COLUMN IF NOT EXISTS "founded_at" date;
