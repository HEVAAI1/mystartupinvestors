-- =============================================================================
-- 02_users_rls.sql — Users table Row Level Security
--
-- Vulnerabilities fixed:
--   - Users could update plan, credits_allocated, role via direct Supabase calls
--   - Users could read other users' rows
--   - Normal user could self-upgrade plan=free → plan=growth, credits=999999
--
-- Strategy:
--   - Enable RLS on public.users
--   - Users can SELECT only their own row
--   - Users can INSERT only their own row (new signup via auth callback)
--   - Users can UPDATE only non-sensitive columns on their own row
--   - Sensitive columns (plan, credits, role, has_paid) are IMMUTABLE by the user
--   - Admins bypass all restrictions via SECURITY DEFINER function
--   - Service_role (used by API routes) bypasses RLS entirely
-- =============================================================================

-- =============================================================================
-- 2.1 Helper: check if the current user is an admin
-- Must be SECURITY DEFINER to read role column without infinite recursion.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the currently authenticated user has role=admin. SECURITY DEFINER bypasses RLS to avoid recursion.';

-- =============================================================================
-- 2.2 Enable RLS on users table
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Force RLS (even for table owner)
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- 2.3 Drop any existing unsafe policies
-- (These may not exist yet, but running this is idempotent)
-- =============================================================================
DROP POLICY IF EXISTS "Users can see own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.users;
DROP POLICY IF EXISTS "Allow anonymous write" ON public.users;
DROP POLICY IF EXISTS select_own_user ON public.users;
DROP POLICY IF EXISTS insert_own_user ON public.users;
DROP POLICY IF EXISTS update_own_safe_fields ON public.users;
DROP POLICY IF EXISTS admin_all ON public.users;

-- =============================================================================
-- 2.4 POLICY: SELECT — users can see only their own row
-- =============================================================================
CREATE POLICY select_own_user ON public.users
  FOR SELECT
  USING (id = auth.uid());

COMMENT ON POLICY select_own_user ON public.users IS 'Authenticated users can only SELECT their own user row.';

-- =============================================================================
-- 2.5 POLICY: INSERT — users can insert their own row
-- This is needed for the auth callback (new user signup via Google OAuth).
-- =============================================================================
CREATE POLICY insert_own_user ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

COMMENT ON POLICY insert_own_user ON public.users IS 'Authenticated users can INSERT their own row (first signup via auth callback).';

-- =============================================================================
-- 2.6 POLICY: UPDATE — users can update only SAFE profile fields
--
-- Sensitive columns that are BLOCKED from user modification:
--   - plan
--   - role
--   - credits_allocated
--   - credits_used
--   - has_paid
--   - calculation_credits
--   - weekly_calculation_credits
--   - last_calculation_reset_at
--
-- The WITH CHECK clause compares each sensitive column's proposed new value
-- against its current value in the database. If any differs, the UPDATE fails.
-- =============================================================================
CREATE POLICY update_own_safe_fields ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Block changes to billing/subscription columns
    AND plan IS NOT DISTINCT FROM (SELECT plan FROM public.users WHERE id = auth.uid())
    AND role IS NOT DISTINCT FROM (SELECT role FROM public.users WHERE id = auth.uid())
    AND credits_allocated IS NOT DISTINCT FROM (SELECT credits_allocated FROM public.users WHERE id = auth.uid())
    AND credits_used IS NOT DISTINCT FROM (SELECT credits_used FROM public.users WHERE id = auth.uid())
    AND has_paid IS NOT DISTINCT FROM (SELECT has_paid FROM public.users WHERE id = auth.uid())
    AND calculation_credits IS NOT DISTINCT FROM (SELECT calculation_credits FROM public.users WHERE id = auth.uid())
    AND weekly_calculation_credits IS NOT DISTINCT FROM (SELECT weekly_calculation_credits FROM public.users WHERE id = auth.uid())
    AND last_calculation_reset_at IS NOT DISTINCT FROM (SELECT last_calculation_reset_at FROM public.users WHERE id = auth.uid())
  );

COMMENT ON POLICY update_own_safe_fields ON public.users IS 'Users can UPDATE only safe profile fields on their row. Billing/plan/credits/role columns are immutable by the user.';

-- =============================================================================
-- 2.7 POLICY: ADMIN — full access for admin users
-- Uses the is_admin() helper (SECURITY DEFINER) to avoid RLS recursion.
-- This allows admin API routes using RLS-respecting clients to work correctly.
-- =============================================================================
CREATE POLICY admin_all ON public.users
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON POLICY admin_all ON public.users IS 'Admin users bypass all row restrictions. is_admin() uses SECURITY DEFINER to avoid recursion.';

-- =============================================================================
-- 2.8 Revoke dangerous direct permissions
--
-- Note: We do NOT revoke SELECT/INSERT/UPDATE from authenticated role —
-- that would break RLS. Supabase requires the role to have table-level grants
-- for RLS to work. Instead, RLS restricts which rows/columns are accessible.
-- However, we DO revoke from anon (unauthenticated) role.
-- =============================================================================

-- Revoke all table-level access from anon role (unauthenticated visitors)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Revoke all function execution from anon role
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Revoke all sequence access from anon role
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- =============================================================================
-- 2.9 Grant minimal necessary access to authenticated role
-- (These are typically already granted, but we make them explicit.)
-- =============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.users TO authenticated;

-- NOTE: DELETE is intentionally NOT granted to authenticated role.
-- User deletion should only happen via service_role or admin.

-- =============================================================================
-- 2.10 RECOMMENDATION: Separate billing table (future enhancement)
--
-- For maximum security, consider splitting billing fields into a separate
-- private.billing table that is ONLY accessible via service_role:
--
--   CREATE SCHEMA IF NOT EXISTS private;
--   CREATE TABLE private.billing (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID REFERENCES public.users(id) UNIQUE,
--     plan TEXT NOT NULL DEFAULT 'free',
--     credits_allocated INTEGER NOT NULL DEFAULT 5,
--     credits_used INTEGER NOT NULL DEFAULT 0,
--     has_paid BOOLEAN NOT NULL DEFAULT false,
--     calculation_credits INTEGER,
--     weekly_calculation_credits INTEGER DEFAULT 3,
--     last_calculation_reset_at TIMESTAMPTZ DEFAULT NOW(),
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
--   );
--   ALTER TABLE private.billing ENABLE ROW LEVEL SECURITY;
--   -- No policies needed — service_role only
--   REVOKE ALL ON private.billing FROM anon, authenticated, public;
--
-- Then add a trigger on public.users that forwards plan/credits lookups to
-- private.billing. This makes it physically impossible for users to modify
-- their billing data even if RLS is somehow bypassed.
-- =============================================================================
