-- Fix Profiles RLS Policy to allow all authenticated users to read profiles
-- This ensures admins and other roles can see the list of all users instead of just their own

DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
DROP POLICY IF EXISTS "profiles_role_based_select" ON profiles;
DROP POLICY IF EXISTS "profiles_self_select" ON profiles;

CREATE POLICY "profiles_select_all"
ON profiles
FOR SELECT
TO authenticated
USING (true);
