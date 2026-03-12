-- Add cedent fields to trade_receivables and service_code to cnab_remittance_files

ALTER TABLE trade_receivables
  ADD COLUMN IF NOT EXISTS cedent_doc TEXT,
  ADD COLUMN IF NOT EXISTS cedent_doc_type TEXT;

ALTER TABLE cnab_remittance_files
  ADD COLUMN IF NOT EXISTS service_code TEXT;
