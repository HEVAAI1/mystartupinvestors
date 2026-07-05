-- =============================================================================
-- RLS Security Migration — Single comprehensive script
-- =============================================================================
-- Prerequisites: None (idempotent, safe for existing production data)
-- Run method: Paste into Supabase Dashboard SQL Editor and execute
-- =============================================================================
-- HOW THIS WAS DESIGNED:
--   We audited every Supabase query in the Next.js codebase and found:
--     - All API routes use service_role key (bypasses RLS entirely)
--     - Only 'users' table is queried with RLS-respecting SSR/browser clients
--     - investors, transactions, affiliates, etc. are NEVER queried
--       with an RLS-respecting client — only via service_role
--   Therefore, RLS policies on non-users tables can MAXIMALLY RESTRICT
--   (block everything) without breaking any functionality.
-- =============================================================================

-- =============================================================================
-- SECTION 1: Helper functions (idempotent)
-- =============================================================================

-- 1a. is_admin() — checks whether the current user has admin role.
--     Uses SECURITY DEFINER to bypass RLS and avoid infinite recursion.
--     Used in admin bypass policies below.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 1b. Secure increment_credits_used — atomically increments credits_used.
--     SECURITY DEFINER + auth.uid() guard prevents user A from incrementing
--     user B's credits (critical for credit-based pay-per-unlock model).
--     GRANT EXECUTE to authenticated is needed for admin-client calls that
--     go through the REST API.
CREATE OR REPLACE FUNCTION public.increment_credits_used(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.users
  SET credits_used = credits_used + 1,
      last_login = NOW()
  WHERE id = user_id
    AND (auth.uid() IS NULL OR auth.uid() = user_id);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'increment_credits_used: cannot modify another user''s credits or user not found';
  END IF;
END;
$$;

-- Grant execution to authenticated so the REST API accepts calls
-- (the admin client calls this via service_role JWT; auth.uid() will
--  be NULL for service_role, so the guard permits the operation).
REVOKE EXECUTE ON FUNCTION public.increment_credits_used(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_credits_used(UUID) TO authenticated;

COMMENT ON FUNCTION public.increment_credits_used IS
'Atomically increments credits_used for the given user. Guards against cross-user manipulation via auth.uid() check.';

-- =============================================================================
-- SECTION 2: Revoke excessive anon + authenticated privileges
-- =============================================================================
-- The anon role should have ZERO table access. It does not need any.
-- The authenticated role needs only SELECT on users (for RLS policy evaluation)
-- plus INSERT/UPDATE on users (for the auth callback). Other tables only get
-- SELECT so that RLS can filter (blocking policies will still reject).

-- 2a. Strip anon of ALL table privileges
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'users', 'investors', 'user_investor_views', 'transactions',
      'affiliates', 'referrals', 'commissions', 'withdrawal_requests',
      'startup_leads'
    ])
  LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon', tbl);
  END LOOP;
END;
$$;

-- 2b. Restrict authenticated role to the minimum necessary
--     - SELECT needed on ALL tables so RLS policies can evaluate
--     - INSERT + UPDATE only on users (auth callback, user profile updates)
--     - INSERT on startup_leads (user submits startup form) — through API

-- Revoke DELETE, UPDATE, INSERT, TRUNCATE from authenticated on non-users tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'investors', 'user_investor_views', 'transactions',
      'affiliates', 'referrals', 'commissions', 'withdrawal_requests'
    ])
  LOOP
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.%I FROM authenticated', tbl);
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO authenticated', tbl);
  END LOOP;
END;
$$;

-- startup_leads: authenticated needs INSERT only (user submits form via API)
GRANT SELECT, INSERT ON TABLE public.startup_leads TO authenticated;

-- users: authenticated needs SELECT + INSERT (auth callback) + UPDATE (profile)
GRANT SELECT, INSERT, UPDATE ON TABLE public.users TO authenticated;

-- =============================================================================
-- SECTION 3: Enable Row Level Security on every public table
-- =============================================================================
-- All 9 tables get RLS enabled. Idempotent (ALTER TABLE already handles this).

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investor_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_leads ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SECTION 4: RLS Policies — users table
-- =============================================================================
-- The users table is unique: it is the ONLY table queried with RLS-respecting
-- clients (SSR server client in middleware, layouts, auth callback, user API
-- routes; browser client in HomeClient.tsx). All other tables are queried
-- exclusively with the service_role admin client.

-- 4a. Users: SELECT own row only
--     Used by middleware (role check), layouts (credits), HomeClient (role),
--     user API routes (credits, startup_status), auth callback.
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- 4b. Users: INSERT own row (auth callback creates new user after signup)
--     CHECK ensures user can only create a row with their own auth.uid().
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- 4c. Users: UPDATE own safe fields only
--     Protects sensitive billing/permissions fields from user modification.
--     USING — user may only UPDATE their own row.
--     WITH CHECK — rejects any attempt to change protected columns:
--       plan, credits_allocated, credits_used, role, has_paid,
--       calculation_credits, weekly_calculation_credits
--     How it works: each protected column is compared against its current
--     database value. If the NEW value differs, WITH CHECK fails and the
--     UPDATE is rejected. This allows changes to name, email, profile_picture,
--     last_login (used by auth callback) while blocking billing/role changes.
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND plan IS NOT DISTINCT FROM (SELECT plan FROM public.users WHERE id = auth.uid())
    AND credits_allocated IS NOT DISTINCT FROM (SELECT credits_allocated FROM public.users WHERE id = auth.uid())
    AND credits_used IS NOT DISTINCT FROM (SELECT credits_used FROM public.users WHERE id = auth.uid())
    AND role IS NOT DISTINCT FROM (SELECT role FROM public.users WHERE id = auth.uid())
    AND has_paid IS NOT DISTINCT FROM (SELECT has_paid FROM public.users WHERE id = auth.uid())
    AND calculation_credits IS NOT DISTINCT FROM (SELECT calculation_credits FROM public.users WHERE id = auth.uid())
    AND weekly_calculation_credits IS NOT DISTINCT FROM (SELECT weekly_calculation_credits FROM public.users WHERE id = auth.uid())
  );

-- 4d. Users: Admin bypass — admins can do everything on users table
--     Uses the SECURITY DEFINER is_admin() helper to avoid recursion.
--     NOTE: Admin dashboard already uses service_role admin client; this
--     policy is additional safety net for admin sessions using SSR client.
DROP POLICY IF EXISTS "users_admin_all" ON public.users;
CREATE POLICY "users_admin_all" ON public.users
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- SECTION 5: RLS Policies — investors (block all direct user access)
-- =============================================================================
-- Investors data is the PRODUCT — users pay credits to unlock investor details.
-- ALL investor queries go through API routes using service_role admin client.
-- No SSR or browser client ever queries this table directly.
-- Policy: block everything for non-service-role users.

DROP POLICY IF EXISTS "investors_block_direct_select" ON public.investors;
CREATE POLICY "investors_block_direct_select" ON public.investors
  FOR SELECT
  USING (false);

DROP POLICY IF EXISTS "investors_block_insert" ON public.investors;
CREATE POLICY "investors_block_insert" ON public.investors
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "investors_block_update" ON public.investors;
CREATE POLICY "investors_block_update" ON public.investors
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "investors_block_delete" ON public.investors;
CREATE POLICY "investors_block_delete" ON public.investors
  FOR DELETE
  USING (false);

-- =============================================================================
-- SECTION 6: RLS Policies — user_investor_views (own views only)
-- =============================================================================
-- Tracks which user unlocked which investor. Accessed only via admin client
-- in API routes. Block user access as defense-in-depth.

DROP POLICY IF EXISTS "user_investor_views_select_own" ON public.user_investor_views;
CREATE POLICY "user_investor_views_select_own" ON public.user_investor_views
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_investor_views_insert_own" ON public.user_investor_views;
CREATE POLICY "user_investor_views_insert_own" ON public.user_investor_views
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_investor_views_block_update_delete" ON public.user_investor_views;
CREATE POLICY "user_investor_views_block_update_delete" ON public.user_investor_views
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================================
-- SECTION 7: RLS Policies — transactions (own rows only, no insert/update)
-- =============================================================================
-- Payment history. Users should only see their own transactions.
-- INSERT is handled exclusively by the Dodo webhook (service_role admin client).

DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_block_insert_update" ON public.transactions;
CREATE POLICY "transactions_block_insert_update" ON public.transactions
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================================
-- SECTION 8: RLS Policies — affiliates (own row only)
-- =============================================================================
-- Each user has at most one affiliate record. Only the owning user's affiliate
-- data should be visible. All mutations go through admin client.

DROP POLICY IF EXISTS "affiliates_select_own" ON public.affiliates;
CREATE POLICY "affiliates_select_own" ON public.affiliates
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "affiliates_block_insert_update_delete" ON public.affiliates;
CREATE POLICY "affiliates_block_insert_update_delete" ON public.affiliates
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================================
-- SECTION 9: RLS Policies — referrals (own affiliate's referrals)
-- =============================================================================
-- Referrals are linked to an affiliate record. Affiliates should only see
-- referrals linked to their affiliate record. All mutations via admin client.

DROP POLICY IF EXISTS "referrals_select_own" ON public.referrals;
CREATE POLICY "referrals_select_own" ON public.referrals
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "referrals_block_insert_update_delete" ON public.referrals;
CREATE POLICY "referrals_block_insert_update_delete" ON public.referrals
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================================
-- SECTION 10: RLS Policies — commissions (own affiliate's commissions)
-- =============================================================================
-- Commissions earned by an affiliate. Same logic as referrals.

DROP POLICY IF EXISTS "commissions_select_own" ON public.commissions;
CREATE POLICY "commissions_select_own" ON public.commissions
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "commissions_block_insert_update_delete" ON public.commissions;
CREATE POLICY "commissions_block_insert_update_delete" ON public.commissions
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================================
-- SECTION 11: RLS Policies — withdrawal_requests (own affiliate's requests)
-- =============================================================================
-- Withdrawal/payout requests from affiliates.

DROP POLICY IF EXISTS "withdrawal_requests_select_own" ON public.withdrawal_requests;
CREATE POLICY "withdrawal_requests_select_own" ON public.withdrawal_requests
  FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "withdrawal_requests_block_insert_update_delete" ON public.withdrawal_requests;
CREATE POLICY "withdrawal_requests_block_insert_update_delete" ON public.withdrawal_requests
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================================
-- SECTION 12: RLS Policies — startup_leads (own leads only)
-- =============================================================================
-- Startup submissions. Users should see only their own leads.
-- INSERT goes through the admin client in API route, but we allow it with RLS
-- as defense-in-depth (the API route already auth-checks the user).
-- UPDATE/DELETE blocked — handled exclusively via admin client.

DROP POLICY IF EXISTS "startup_leads_select_own" ON public.startup_leads;
CREATE POLICY "startup_leads_select_own" ON public.startup_leads
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "startup_leads_block_update_delete" ON public.startup_leads;
CREATE POLICY "startup_leads_block_update_delete" ON public.startup_leads
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================================================
-- SECTION 13: Role column hardening (trigger)
-- =============================================================================
-- Defense-in-depth: prevent role escalation even if RLS is somehow bypassed.
-- This trigger fires BEFORE UPDATE OF role and rejects any change where the
-- current user is not an admin (checked via SECURITY DEFINER is_admin()).

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.users;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE OF role ON public.users
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.prevent_role_escalation();

-- =============================================================================
-- SECTION 14: Verification queries (run after migration)
-- =============================================================================

-- 14a. Confirm RLS is enabled on all tables
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled,
  CASE WHEN relrowsecurity THEN '✅ ON' ELSE '❌ OFF' END AS status
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relname IN (
    'users', 'investors', 'user_investor_views',
    'transactions', 'affiliates', 'referrals',
    'commissions', 'withdrawal_requests', 'startup_leads'
  )
ORDER BY relname;

-- 14b. List all RLS policies created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'investors', 'user_investor_views',
    'transactions', 'affiliates', 'referrals',
    'commissions', 'withdrawal_requests', 'startup_leads'
  )
ORDER BY tablename, policyname;

-- 14c. Confirm anon has no table privileges
SELECT
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon'
  AND table_schema = 'public'
ORDER BY table_name, privilege_type;
-- Expected: zero rows

-- 14d. Confirm authenticated has expected privileges
SELECT
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'authenticated'
  AND table_schema = 'public'
  AND table_name IN (
    'users', 'investors', 'user_investor_views',
    'transactions', 'affiliates', 'referrals',
    'commissions', 'withdrawal_requests', 'startup_leads'
  )
ORDER BY table_name, privilege_type;
-- Expected:
--   investors, user_investor_views, transactions, affiliates,
--   referrals, commissions, withdrawal_requests: SELECT only
--   startup_leads: SELECT, INSERT
--   users: SELECT, INSERT, UPDATE

-- 14e. Verify is_admin() function exists and works
SELECT
  p.proname AS function_name,
  pg_catalog.pg_get_function_result(p.oid) AS return_type,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security
FROM pg_catalog.pg_proc p
WHERE p.proname = 'is_admin'
  AND pg_catalog.pg_function_is_visible(p.oid);

-- 14f. Verify increment_credits_used function exists and has auth guard
SELECT
  p.proname AS function_name,
  pg_catalog.pg_get_function_result(p.oid) AS return_type,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security
FROM pg_catalog.pg_proc p
WHERE p.proname = 'increment_credits_used'
  AND pg_catalog.pg_function_is_visible(p.oid);

-- 14g. Verify role escalation trigger exists
SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgname = 'trg_prevent_role_escalation'
  AND NOT tgisinternal;
