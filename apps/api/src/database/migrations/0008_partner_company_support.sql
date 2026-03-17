ALTER TABLE "client_authorized_persons"
  ADD COLUMN "person_type" text NOT NULL DEFAULT 'pf',
  ADD COLUMN "cnpj" text,
  ADD COLUMN "linked_client_id" uuid REFERENCES "clients"("id") ON DELETE SET NULL;

CREATE INDEX "idx_client_auth_persons_cnpj" ON "client_authorized_persons"("cnpj");
CREATE INDEX "idx_client_auth_persons_linked_client" ON "client_authorized_persons"("linked_client_id");
