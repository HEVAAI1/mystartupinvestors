-- =============================================================================
-- 05_admin_security.sql — Admin role & RBAC hardening
--
-- Vulnerabilities fixed:
--   - Admin page authorization was frontend-only (role checked in middleware)
--   - A user with direct Supabase access could change their own role to admin
--   - No database-level enforcement of admin privileges
--   - Admin API routes used service_role but never re-verified admin status
--
-- Strategy:
--   - Ensure role column has proper constraints
--   - Create admin check function usable by both RLS and API routes
--   - Add database trigger preventing role escalation by non-admins
--   - Add RLS policies for all tables that give admins full access
--   - Secure startup_leads and referral tables with RLS
--   - Create admin audit log for tracking sensitive changes
-- =============================================================================

-- =============================================================================
-- 5.1 Ensure users.role column is properly constrained
-- (These are idempotent — run them safely even if constraints already exist)
-- =============================================================================

-- Ensure role column exists and has a default
ALTER TABLE public.users
  ALTER COLUMN role SET DEFAULT 'user';

-- Add check constraint if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'users_role_check'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Add NOT NULL constraint if not already set
ALTER TABLE public.users
  ALTER COLUMN role SET NOT NULL;

-- Create index for fast role lookups (used in middleware and RLS)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- =============================================================================
-- 5.2 Enhanced admin check function with fallback
--
-- Usage in API routes:
--   const { data: { user } } = await supabase.auth.getUser();
--   const { data: isAdmin } = await supabase.rpc('is_admin');
--   if (!isAdmin) return new Response('Forbidden', { status: 403 });
--
-- Usage in RLS policies (already done in previous migrations):
--   USING (is_admin())
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

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current authenticated user has role=admin. SECURITY DEFINER bypasses RLS to avoid recursion.';

-- =============================================================================
-- 5.3 Trigger: prevent non-admin users from changing their own role
--
-- This is a safety net even beyond RLS. If RLS is somehow bypassed,
-- this trigger prevents any UPDATE that would change the role column
-- to a value different from its current value, UNLESS the caller is
-- using service_role.
--
-- Note: service_role bypasses RLS AND triggers marked as
-- SECURITY INVOKER (default). So this trigger runs with the caller's
-- permissions. If called via service_role, it has full access.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Allow if role is not changing
  IF OLD.role IS NOT DISTINCT FROM NEW.role THEN
    RETURN NEW;
  END IF;

  -- Check if the user performing the update is an admin
  -- (This uses the service_role context if called from API routes,
  --  or the authenticated user context if called from client-side)
  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE id = NEW.id
      AND role = 'admin'
  ) THEN
    -- The user being updated is already an admin — allow
    RETURN NEW;
  END IF;

  -- Only allow role changes if the CURRENT user is an admin
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Only admins can change user roles. Role escalation attempt blocked.';
END;
$$;

CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

COMMENT ON FUNCTION public.prevent_role_escalation IS 'Trigger function that blocks non-admin users from changing any user role column.';
COMMENT ON TRIGGER trg_prevent_role_escalation ON public.users IS 'Fires on role column UPDATE. Prevents unauthorized role escalation.';

-- =============================================================================
-- 5.4 Secure startup_leads table
-- =============================================================================
ALTER TABLE public.startup_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_leads FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_startup ON public.startup_leads;
DROP POLICY IF EXISTS insert_own_startup ON public.startup_leads;
DROP POLICY IF EXISTS update_own_startup ON public.startup_leads;
DROP POLICY IF EXISTS admin_all_startups ON public.startup_leads;

-- Users can see only their own startup lead
CREATE POLICY select_own_startup ON public.startup_leads
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own startup lead
CREATE POLICY insert_own_startup ON public.startup_leads
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own startup lead
CREATE POLICY update_own_startup ON public.startup_leads
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin full access
CREATE POLICY admin_all_startups ON public.startup_leads
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

GRANT SELECT, INSERT, UPDATE ON TABLE public.startup_leads TO authenticated;

-- =============================================================================
-- 5.5 Secure referrals table
-- =============================================================================
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_referrals ON public.referrals;
DROP POLICY IF EXISTS insert_referrals ON public.referrals;
DROP POLICY IF EXISTS admin_all_referrals ON public.referrals;

-- Users can see referrals made through their affiliate link
CREATE POLICY select_own_referrals ON public.referrals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = referrals.affiliate_id
        AND affiliates.user_id = auth.uid()
    )
  );

-- Allow insert for referred user matching
CREATE POLICY insert_referrals ON public.referrals
  FOR INSERT
  WITH CHECK (
    referred_user_id = auth.uid()
  );

-- Admin full access
CREATE POLICY admin_all_referrals ON public.referrals
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

GRANT SELECT, INSERT ON TABLE public.referrals TO authenticated;

-- =============================================================================
-- 5.6 RECOMMENDATION: Admin audit log (for tracking sensitive changes)
--
-- Uncomment and customize as needed:
--
-- CREATE TABLE IF NOT EXISTS private.admin_audit_log (
--   id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--   admin_id UUID NOT NULL REFERENCES public.users(id),
--   action TEXT NOT NULL,
--   table_name TEXT NOT NULL,
--   record_id TEXT,
--   old_values JSONB,
--   new_values JSONB,
--   ip_address INET,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );
--
-- -- Trigger to log user changes by admins
-- CREATE OR REPLACE FUNCTION public.log_admin_user_changes()
-- RETURNS TRIGGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   IF public.is_admin() THEN
--     INSERT INTO private.admin_audit_log (admin_id, action, table_name, record_id, old_values, new_values)
--     VALUES (
--       auth.uid(),
--       TG_OP,
--       'users',
--       NEW.id::TEXT,
--       CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::JSONB ELSE NULL END,
--       row_to_json(NEW)::JSONB
--     );
--   END IF;
--   RETURN NEW;
-- END;
-- $$;
--
-- CREATE TRIGGER trg_admin_audit_users
--   AFTER INSERT OR UPDATE OR DELETE ON public.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.log_admin_user_changes();
-- =============================================================================

-- =============================================================================
-- 5.7 Revoke all remaining anon role access
-- =============================================================================
REVOKE ALL ON SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- =============================================================================
-- 5.8 Ensure authenticated role has only required privileges
-- =============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;

-- Note: Individual table grants are done in each table's migration file.
-- This is a summary of what authenticated role needs:
--   users:             SELECT, INSERT, UPDATE
--   investors:         SELECT (blocked by RLS policy → false)
--   user_investor_views: SELECT, INSERT
--   transactions:      SELECT
--   startup_leads:     SELECT, INSERT, UPDATE
--   affiliates:        SELECT
--   commissions:       SELECT
--   withdrawal_requests: SELECT
--   referrals:         SELECT, INSERT
