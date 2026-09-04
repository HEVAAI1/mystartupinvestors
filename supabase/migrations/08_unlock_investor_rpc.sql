-- =============================================================================
-- 08. Atomic unlock_investor RPC — fixes TOCTOU race in /api/investors/[id]/unlock
--
-- Prior flow (app code): read credits_used in JS, check remaining > 0, then
-- fire an INSERT into user_investor_views and an RPC credit-increment via
-- Promise.allSettled(). Concurrent requests could all pass the JS check
-- before any charge landed, letting one credit unlock many investors.
--
-- Fix: a single SECURITY DEFINER function that row-locks the user's credit
-- balance, checks it, and inserts the view row with ON CONFLICT DO NOTHING —
-- only charging a credit when the insert actually happens (first unlock).
-- Callable only by service_role, since the route already uses the admin
-- client and passes an explicit p_user_id (not auth.uid()).
-- =============================================================================

-- Idempotent unlock: unique index so a duplicate unlock is a no-op, not a
-- double charge. Required for the ON CONFLICT clause below.
CREATE UNIQUE INDEX IF NOT EXISTS user_investor_views_user_investor_uidx
  ON public.user_investor_views (user_id, investor_id);

CREATE OR REPLACE FUNCTION public.unlock_investor(p_user_id UUID, p_investor_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_allocated INTEGER;
  v_used INTEGER;
  v_inserted_id BIGINT;
BEGIN
  -- Row-lock the user's credit balance for the duration of this transaction
  -- so concurrent unlock calls for the same user serialize here.
  SELECT credits_allocated, credits_used
  INTO v_allocated, v_used
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'unlock_investor: user % not found', p_user_id;
  END IF;

  -- Already unlocked? Insert is a no-op, no charge, no re-check needed —
  -- the row already exists regardless of current balance.
  INSERT INTO public.user_investor_views (user_id, investor_id)
  VALUES (p_user_id, p_investor_id)
  ON CONFLICT (user_id, investor_id) DO NOTHING
  RETURNING id INTO v_inserted_id;

  IF v_inserted_id IS NULL THEN
    -- Already had access — no charge.
    RETURN jsonb_build_object(
      'unlocked', true,
      'alreadyUnlocked', true,
      'remaining', v_allocated - v_used
    );
  END IF;

  -- New unlock: must have had at least one credit remaining.
  IF v_allocated - v_used <= 0 THEN
    RAISE EXCEPTION 'unlock_investor: insufficient credits for user %', p_user_id
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.users
  SET credits_used = credits_used + 1
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'unlocked', true,
    'alreadyUnlocked', false,
    'remaining', v_allocated - v_used - 1
  );
END;
$$;

COMMENT ON FUNCTION public.unlock_investor(UUID, INTEGER) IS
  'Atomically unlocks an investor for a user: row-locks the credit balance, inserts the view record (idempotent via ON CONFLICT DO NOTHING), and charges a credit only on first unlock. service_role only — called from the admin client in the unlock API route.';

-- service_role only: this function trusts p_user_id as given, so it must
-- never be reachable by an authenticated end user directly.
REVOKE ALL ON FUNCTION public.unlock_investor(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.unlock_investor(UUID, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_investor(UUID, INTEGER) TO service_role;
