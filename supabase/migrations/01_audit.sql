-- =============================================================================
-- 01_audit.sql — Audit current Supabase security posture
-- Run these queries FIRST to assess your current state before migrating.
-- =============================================================================

-- 1.1 List ALL tables in the public schema
SELECT
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 1.2 Check which tables have RLS enabled
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled,
  relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
ORDER BY relname;

-- 1.3 List ALL existing RLS policies (per table)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 1.4 Find all functions in the public schema (including RPCs)
SELECT
  p.proname AS function_name,
  pg_get_function_result(p.oid) AS return_type,
  pg_get_function_arguments(p.oid) AS arguments,
  p.prosecdef AS security_definer,
  l.lanname AS language
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- 1.5 Check privileges granted to anon role
SELECT
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon'
  AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- 1.6 Check privileges granted to authenticated role
SELECT
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'authenticated'
  AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- 1.7 Check privileges granted to service_role
SELECT
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'service_role'
  AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- 1.8 Find tables without RLS enabled (dangerous)
SELECT
  relname AS table_name,
  CASE
    WHEN relrowsecurity THEN 'RLS ENABLED'
    ELSE '⚠️  RLS NOT ENABLED'
  END AS status
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND NOT relrowsecurity
ORDER BY relname;

-- 1.9 Find tables with potentially dangerous public access
-- (no RLS + anon has INSERT/UPDATE/DELETE grants)
SELECT
  c.relname AS table_name,
  CASE WHEN c.relrowsecurity THEN 'RLS ON' ELSE 'NO RLS' END AS rls,
  tp.privilege_type
FROM pg_class c
JOIN information_schema.table_privileges tp
  ON tp.table_name = c.relname
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relkind = 'r'
  AND tp.grantee = 'anon'
  AND tp.table_schema = 'public'
  AND tp.privilege_type IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
ORDER BY c.relname, tp.privilege_type;

-- 1.10 List ALL RPC functions with their security characteristics
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security,
  CASE WHEN p.proleakproof THEN 'LEAKPROOF' ELSE '' END AS leakproof,
  l.lanname AS language,
  pg_get_function_arguments(p.oid) AS args,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
  AND p.proname NOT LIKE 'pg_%'
ORDER BY p.proname;

-- 1.11 List all Triggers
SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_timing AS timing,
  action_statement AS definition
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
