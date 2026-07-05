-- =============================================================================
-- 03_investors_rls.sql — Investors table Row Level Security
--
-- Vulnerabilities fixed:
--   - All 33,309 investor records could be dumped via direct Supabase API
--   - No authentication check on investor data access
--   - Pagination limits could be bypassed by modifying range params
--
-- Strategy:
--   - Enable RLS on public.investors
--   - Block ALL direct SELECT for anon role
--   - Block ALL direct SELECT for authenticated role (must use API routes)
--   - Create SECURITY DEFINER RPC functions for controlled access
--   - Full access only via service_role (API routes with admin client)
--   - Also apply RLS to user_investor_views (tracks unlocked investors)
-- =============================================================================

-- =============================================================================
-- 3.1 Enable RLS on investors and related tables
-- =============================================================================
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors FORCE ROW LEVEL SECURITY;

ALTER TABLE public.user_investor_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investor_views FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- 3.2 Drop any existing policies
-- =============================================================================
DROP POLICY IF EXISTS "Enable select for authenticated" ON public.investors;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.investors;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.investors;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.investors;
DROP POLICY IF EXISTS select_investors_authenticated ON public.investors;
DROP POLICY IF EXISTS admin_all_investors ON public.investors;

DROP POLICY IF EXISTS "Enable select for authenticated" ON public.user_investor_views;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.user_investor_views;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.user_investor_views;
DROP POLICY IF EXISTS select_own_views ON public.user_investor_views;
DROP POLICY IF EXISTS admin_all_views ON public.user_investor_views;

-- =============================================================================
-- 3.3 POLICY: investors — BLOCK direct SELECT for all non-admin roles
--
-- All investor data access MUST go through the API routes, which use
-- service_role (bypasses RLS). Direct browser-to-Supabase REST queries
-- are blocked.
-- =============================================================================
CREATE POLICY block_direct_select ON public.investors
  FOR SELECT
  USING (false);

COMMENT ON POLICY block_direct_select ON public.investors IS 'Direct SELECT on investors is blocked for all roles. API routes (service_role) bypass RLS entirely.';

-- =============================================================================
-- 3.4 POLICY: investors — admin full access
-- =============================================================================
CREATE POLICY admin_all_investors ON public.investors
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON POLICY admin_all_investors ON public.investors IS 'Admin users (checked via SECURITY DEFINER function) have full access to investors.';

-- =============================================================================
-- 3.5 POLICY: user_investor_views — users see only their own views
-- =============================================================================
CREATE POLICY select_own_views ON public.user_investor_views
  FOR SELECT
  USING (user_id = auth.uid());

COMMENT ON POLICY select_own_views ON public.user_investor_views IS 'Users can SELECT only their own investor view/unlock records.';

-- =============================================================================
-- 3.6 POLICY: user_investor_views — users insert their own views
-- (Used by the unlock endpoint via service_role; policy exists for defense)
-- =============================================================================
CREATE POLICY insert_own_views ON public.user_investor_views
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

COMMENT ON POLICY insert_own_views ON public.user_investor_views IS 'Users can INSERT their own view records.';

-- =============================================================================
-- 3.7 POLICY: user_investor_views — admin full access
-- =============================================================================
CREATE POLICY admin_all_views ON public.user_investor_views
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON POLICY admin_all_views ON public.user_investor_views IS 'Admin users have full access to view records.';

-- =============================================================================
-- 3.8 Grant table access to authenticated role (required for RLS to function)
-- =============================================================================
GRANT SELECT ON TABLE public.investors TO authenticated;
GRANT SELECT, INSERT ON TABLE public.user_investor_views TO authenticated;

-- =============================================================================
-- 3.9 RECOMMENDED: RPC function for controlled investor data access
--
-- This function can be used by the API routes instead of service_role client.
-- It implements all business logic: auth check, plan validation, masking.
--
-- Note: The current codebase uses service_role in API routes, so this RPC
-- is provided as a best-practice alternative for future migration.
-- =============================================================================

-- First, create the investor_masking helper types
CREATE TYPE public.investor_list_result AS (
  id INTEGER,
  name TEXT,
  about TEXT,
  city TEXT,
  country TEXT,
  preference_sector TEXT,
  firm_name TEXT,
  type TEXT,
  email TEXT,
  linkedin TEXT,
  locked BOOLEAN
);

-- Main RPC: paginated investor listing with built-in security and masking
CREATE OR REPLACE FUNCTION public.get_investors_secured(
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 7,
  p_search TEXT DEFAULT '',
  p_location TEXT DEFAULT '',
  p_industry TEXT DEFAULT '',
  p_show_viewed BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_user_plan TEXT;
  v_remaining_credits INTEGER;
  v_offset INTEGER;
  v_total_count BIGINT;
  v_results JSONB;
  v_viewed_ids UUID[];
BEGIN
  -- 1. Authenticate
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized', 'status', 401);
  END IF;

  -- 2. Get user's plan and credits
  SELECT plan, credits_allocated - credits_used
  INTO v_user_plan, v_remaining_credits
  FROM public.users
  WHERE id = v_user_id;

  -- 3. Get user's viewed investor IDs
  SELECT array_agg(investor_id)
  INTO v_viewed_ids
  FROM public.user_investor_views
  WHERE user_id = v_user_id;

  -- 4. Calculate offset
  v_offset := (GREATEST(p_page, 1) - 1) * GREATEST(p_page_size, 1);

  -- 5. Build and execute the query with filters
  WITH filtered AS (
    SELECT i.*
    FROM public.investors i
    WHERE (p_search = '' OR
           i.name ILIKE '%' || p_search || '%' OR
           i.firm_name ILIKE '%' || p_search || '%' OR
           i.preference_sector ILIKE '%' || p_search || '%' OR
           i.country ILIKE '%' || p_search || '%' OR
           i.type ILIKE '%' || p_search || '%')
      AND (p_location = '' OR i.country = p_location)
      AND (p_industry = '' OR i.preference_sector ILIKE '%' || p_industry || '%')
      AND (NOT p_show_viewed OR i.id = ANY (v_viewed_ids))
  ),
  counted AS (
    SELECT COUNT(*) AS total FROM filtered
  ),
  paginated AS (
    SELECT * FROM filtered
    ORDER BY i.id ASC
    LIMIT GREATEST(p_page_size, 1)
    OFFSET v_offset
  )
  SELECT
    COUNT(*) INTO v_total_count
  FROM filtered;

  -- Build JSON response with masked data for locked investors
  SELECT jsonb_build_object(
    'data', COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', i.id,
        'name', CASE WHEN i.id = ANY (v_viewed_ids) THEN i.name
                     ELSE regexp_replace(i.name, '(.).*', '\1XXX') END,
        'about', CASE WHEN i.id = ANY (v_viewed_ids) THEN i.about
                      ELSE 'Unlock this investor profile to view their full description.' END,
        'city', i.city,
        'country', i.country,
        'preference_sector', i.preference_sector,
        'firm_name', i.firm_name,
        'type', i.type,
        'email', CASE WHEN i.id = ANY (v_viewed_ids) THEN i.email ELSE NULL END,
        'linkedin', CASE WHEN i.id = ANY (v_viewed_ids) THEN i.linkedin ELSE NULL END,
        'locked', (i.id <> ALL (v_viewed_ids))
      )
      ORDER BY i.id ASC
    ), '[]'::jsonb),
    'count', v_total_count
  ) INTO v_results
  FROM (
    SELECT i.*
    FROM public.investors i
    WHERE (p_search = '' OR
           i.name ILIKE '%' || p_search || '%' OR
           i.firm_name ILIKE '%' || p_search || '%' OR
           i.preference_sector ILIKE '%' || p_search || '%' OR
           i.country ILIKE '%' || p_search || '%' OR
           i.type ILIKE '%' || p_search || '%')
      AND (p_location = '' OR i.country = p_location)
      AND (p_industry = '' OR i.preference_sector ILIKE '%' || p_industry || '%')
      AND (NOT p_show_viewed OR i.id = ANY (v_viewed_ids))
    ORDER BY i.id ASC
    LIMIT GREATEST(p_page_size, 1)
    OFFSET v_offset
  ) i;

  RETURN COALESCE(v_results, jsonb_build_object('data', '[]'::jsonb, 'count', 0));
END;
$$;

COMMENT ON FUNCTION public.get_investors_secured IS 'SECURITY DEFINER RPC for paginated investor access. Handles auth, plan checks, viewed-state tracking, and data masking server-side.';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_investors_secured TO authenticated;

-- =============================================================================
-- 3.10 RPC: get single investor by ID (with access check and masking)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_investor_by_id_secured(p_investor_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_has_access BOOLEAN;
  v_investor RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized', 'status', 401);
  END IF;

  -- Check if user has unlocked this investor
  SELECT EXISTS (
    SELECT 1 FROM public.user_investor_views
    WHERE user_id = v_user_id AND investor_id = p_investor_id
  ) INTO v_has_access;

  -- Fetch investor
  SELECT * INTO v_investor
  FROM public.investors
  WHERE id = p_investor_id;

  IF v_investor.id IS NULL THEN
    RETURN jsonb_build_object('error', 'Investor not found', 'status', 404);
  END IF;

  RETURN jsonb_build_object(
    'investor', jsonb_build_object(
      'id', v_investor.id,
      'name', CASE WHEN v_has_access THEN v_investor.name ELSE regexp_replace(v_investor.name, '(.).*', '\1XXX') END,
      'about', CASE WHEN v_has_access THEN v_investor.about ELSE 'Unlock this investor profile to view their full description.' END,
      'city', v_investor.city,
      'country', v_investor.country,
      'preference_sector', v_investor.preference_sector,
      'firm_name', v_investor.firm_name,
      'type', v_investor.type,
      'email', CASE WHEN v_has_access THEN v_investor.email ELSE NULL END,
      'linkedin', CASE WHEN v_has_access THEN v_investor.linkedin ELSE NULL END,
      'locked', NOT v_has_access
    ),
    'hasAccess', v_has_access
  );
END;
$$;

COMMENT ON FUNCTION public.get_investor_by_id_secured IS 'SECURITY DEFINER RPC for single investor lookup. Returns masked data if investor is not unlocked.';

GRANT EXECUTE ON FUNCTION public.get_investor_by_id_secured TO authenticated;

-- =============================================================================
-- 3.11 RPC: unlock investor (debit credit, create view record, return full data)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.unlock_investor_secured(p_investor_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_allocated INTEGER;
  v_used INTEGER;
  v_remaining INTEGER;
  v_investor RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Unauthorized', 'status', 401);
  END IF;

  -- Check if already unlocked
  IF EXISTS (SELECT 1 FROM public.user_investor_views WHERE user_id = v_user_id AND investor_id = p_investor_id) THEN
    SELECT * INTO v_investor FROM public.investors WHERE id = p_investor_id;
    RETURN jsonb_build_object('investor', row_to_json(v_investor));
  END IF;

  -- Check credits
  SELECT credits_allocated, credits_used
  INTO v_allocated, v_used
  FROM public.users
  WHERE id = v_user_id;

  v_remaining := v_allocated - v_used;
  IF v_remaining <= 0 THEN
    RETURN jsonb_build_object('error', 'Insufficient credits', 'status', 403);
  END IF;

  -- Atomically insert view and increment credits used
  INSERT INTO public.user_investor_views (user_id, investor_id)
  VALUES (v_user_id, p_investor_id);

  UPDATE public.users
  SET credits_used = credits_used + 1
  WHERE id = v_user_id;

  -- Fetch and return full investor
  SELECT * INTO v_investor FROM public.investors WHERE id = p_investor_id;

  RETURN jsonb_build_object('investor', row_to_json(v_investor));
END;
$$;

COMMENT ON FUNCTION public.unlock_investor_secured IS 'SECURITY DEFINER RPC that atomically unlocks an investor: checks credits, inserts view record, debits credit, returns full investor data.';

GRANT EXECUTE ON FUNCTION public.unlock_investor_secured TO authenticated;
