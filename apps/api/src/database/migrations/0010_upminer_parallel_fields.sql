ALTER TABLE "upminer_results"
  ADD COLUMN IF NOT EXISTS "parallel_process_id" text,
  ADD COLUMN IF NOT EXISTS "parallel_status" text;
