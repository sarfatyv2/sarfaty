-- Add source tracking to drawee_addresses and drawee_contacts,
-- matching the same columns already present on client_addresses and client_contacts.

ALTER TABLE drawee_addresses
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_queried_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_drawee_addresses_source
  ON drawee_addresses (drawee_id, source);

ALTER TABLE drawee_contacts
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_queried_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_drawee_contacts_source
  ON drawee_contacts (drawee_id, source);
