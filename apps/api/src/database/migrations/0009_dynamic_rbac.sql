-- Create roles table
CREATE TABLE "roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" text NOT NULL UNIQUE,
  "label" text NOT NULL,
  "home_route" text NOT NULL DEFAULT '/dashboard',
  "is_system" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX "idx_roles_key" ON "roles"("key");
CREATE INDEX "idx_roles_is_active" ON "roles"("is_active");

-- Create role_permissions table
CREATE TABLE "role_permissions" (
  "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
  "feature_key" text NOT NULL,
  PRIMARY KEY ("role_id", "feature_key")
);

CREATE INDEX "idx_role_permissions_role_id" ON "role_permissions"("role_id");
CREATE INDEX "idx_role_permissions_feature_key" ON "role_permissions"("feature_key");

-- Add role_id FK to profiles
ALTER TABLE "profiles"
  ADD COLUMN "role_id" uuid REFERENCES "roles"("id") ON DELETE SET NULL;

CREATE INDEX "idx_profiles_role_id" ON "profiles"("role_id");

-- Seed roles from existing role values
INSERT INTO "roles" ("key", "label", "home_route", "is_system", "is_active") VALUES
  ('sales_rep',          'Comercial',             '/dashboard',                true, true),
  ('sales_supervisor',   'Supervisor Comercial',  '/dashboard',                true, true),
  ('sales_manager',      'Gerente Regional',      '/dashboard',                true, true),
  ('sales_director',     'Diretor Comercial',     '/dashboard',                true, true),
  ('credit_analyst',     'Analista de Crédito',   '/credit/queue',             true, true),
  ('compliance_officer', 'Compliance',            '/compliance/queue',         true, true),
  ('approver',           'Mesa Aprovadora',       '/approval/queue',           true, true),
  ('backoffice',         'Backoffice',            '/backoffice/operations',    true, true),
  ('legal',              'Jurídico',              '/legal/contracts',          true, true),
  ('risk_manager',       'Gestão de Risco',       '/risk/overview',            true, true),
  ('recovery',           'Recuperação',           '/risk/recovery',            true, true),
  ('litigation',         'Contencioso',           '/risk/litigation',          true, true),
  ('employee',           'Colaborador',           '/people/me',                true, true),
  ('people_manager',     'Gestor de Pessoas',     '/people/team',              true, true),
  ('hr',                 'RH',                    '/people/collaborators',     true, true),
  ('dp',                 'Departamento Pessoal',  '/people/collaborators',     true, true),
  ('hr_admin',           'Admin RH',              '/people/collaborators',     true, true),
  ('governance',         'Governança',            '/governance',               true, true),
  ('admin',              'Administrador',         '/admin/overview',           true, true)
ON CONFLICT ("key") DO NOTHING;

-- Populate role_id in profiles based on existing role text
UPDATE "profiles" p
SET "role_id" = r."id"
FROM "roles" r
WHERE p."role" = r."key";
