-- Seed 4 test users for commercial roles.
-- Password for all: Sarfaty@2026

DO $$
DECLARE
  v_bcrypt text;
  v_argon text := '$argon2id$v=19$m=65536,t=3,p=4$/kt+VBLdkVKPZrx4nI4heg$nzJk/xH98AIjU1F7flN73OuNAZdStPkdWnZqYBOaKx0';
  v_id1 uuid := gen_random_uuid();
  v_id2 uuid := gen_random_uuid();
  v_id3 uuid := gen_random_uuid();
  v_id4 uuid := gen_random_uuid();
  v_now timestamptz := now();
BEGIN
  v_bcrypt := crypt('Sarfaty@2026', gen_salt('bf', 10));

  -- 1) sales_rep — Comercial
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at)
  VALUES (v_id1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana.silva@sarfaty.com.br', v_bcrypt, v_now,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"sales_rep","full_name":"Ana Silva","email_verified":true}'::jsonb,
    false, false, v_now, v_now)
  ON CONFLICT DO NOTHING;

  INSERT INTO profiles (id, full_name, email, role, role_id, password_hash, is_active)
  SELECT v_id1, 'Ana Silva', 'ana.silva@sarfaty.com.br', 'sales_rep', r.id, v_argon, true
  FROM roles r WHERE r.key = 'sales_rep'
  ON CONFLICT (email) DO NOTHING;

  -- 2) sales_supervisor — Supervisor Comercial
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at)
  VALUES (v_id2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carlos.mendes@sarfaty.com.br', v_bcrypt, v_now,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"sales_supervisor","full_name":"Carlos Mendes","email_verified":true}'::jsonb,
    false, false, v_now, v_now)
  ON CONFLICT DO NOTHING;

  INSERT INTO profiles (id, full_name, email, role, role_id, password_hash, is_active)
  SELECT v_id2, 'Carlos Mendes', 'carlos.mendes@sarfaty.com.br', 'sales_supervisor', r.id, v_argon, true
  FROM roles r WHERE r.key = 'sales_supervisor'
  ON CONFLICT (email) DO NOTHING;

  -- 3) sales_manager — Gerente Regional
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at)
  VALUES (v_id3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'patricia.lima@sarfaty.com.br', v_bcrypt, v_now,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"sales_manager","full_name":"Patricia Lima","email_verified":true}'::jsonb,
    false, false, v_now, v_now)
  ON CONFLICT DO NOTHING;

  INSERT INTO profiles (id, full_name, email, role, role_id, password_hash, is_active)
  SELECT v_id3, 'Patricia Lima', 'patricia.lima@sarfaty.com.br', 'sales_manager', r.id, v_argon, true
  FROM roles r WHERE r.key = 'sales_manager'
  ON CONFLICT (email) DO NOTHING;

  -- 4) sales_director — Diretor Comercial
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at)
  VALUES (v_id4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'roberto.andrade@sarfaty.com.br', v_bcrypt, v_now,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"sales_director","full_name":"Roberto Andrade","email_verified":true}'::jsonb,
    false, false, v_now, v_now)
  ON CONFLICT DO NOTHING;

  INSERT INTO profiles (id, full_name, email, role, role_id, password_hash, is_active)
  SELECT v_id4, 'Roberto Andrade', 'roberto.andrade@sarfaty.com.br', 'sales_director', r.id, v_argon, true
  FROM roles r WHERE r.key = 'sales_director'
  ON CONFLICT (email) DO NOTHING;

  -- Ensure role_id is populated
  UPDATE profiles p SET role_id = r.id
  FROM roles r
  WHERE p.role = r.key
    AND p.role_id IS NULL
    AND p.email IN ('ana.silva@sarfaty.com.br', 'carlos.mendes@sarfaty.com.br', 'patricia.lima@sarfaty.com.br', 'roberto.andrade@sarfaty.com.br');
END $$;
