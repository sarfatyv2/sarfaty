-- Security hardening (Supabase advisor: rls_disabled_in_public, sensitive_columns_exposed)
-- - Enable RLS + service_role-only policies on tables that were missing them.
-- - Restrict profiles.password_hash from anon/authenticated so PostgREST cannot return it.
--   NestJS uses the database owner connection and retains full row/column access.

-- -----------------------------------------------------------------------------
-- refresh_tokens: opaque session material (token_hash)
-- -----------------------------------------------------------------------------
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "refresh_tokens_service_role_all" ON public.refresh_tokens;
CREATE POLICY "refresh_tokens_service_role_all"
  ON public.refresh_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- drawee_authorized_persons (PII: cpf, email, phone)
-- -----------------------------------------------------------------------------
ALTER TABLE public.drawee_authorized_persons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "drawee_authorized_persons_service_role_all" ON public.drawee_authorized_persons;
CREATE POLICY "drawee_authorized_persons_service_role_all"
  ON public.drawee_authorized_persons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- allcheck results (addresses, emails, phones in columns / JSONB)
-- -----------------------------------------------------------------------------
ALTER TABLE public.allcheck_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allcheck_drawee_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allcheck_results_service_role_all" ON public.allcheck_results;
CREATE POLICY "allcheck_results_service_role_all"
  ON public.allcheck_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "allcheck_drawee_results_service_role_all" ON public.allcheck_drawee_results;
CREATE POLICY "allcheck_drawee_results_service_role_all"
  ON public.allcheck_drawee_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- roles / role_permissions (API + Drizzle; not direct browser Supabase client)
-- -----------------------------------------------------------------------------
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_service_role_all" ON public.roles;
CREATE POLICY "roles_service_role_all"
  ON public.roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "role_permissions_service_role_all" ON public.role_permissions;
CREATE POLICY "role_permissions_service_role_all"
  ON public.role_permissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- profiles: remove table-level SELECT for API roles, grant safe columns only
-- -----------------------------------------------------------------------------
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.profiles FROM authenticated;

GRANT SELECT (
  id,
  full_name,
  email,
  phone,
  role,
  role_id,
  team_id,
  region_id,
  is_active,
  avatar_url,
  created_at,
  updated_at
) ON public.profiles TO authenticated;
