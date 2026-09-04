-- =====================================================
-- Harden increment_credits_used (CVSS 8.1)
-- =====================================================
-- Prior grants let ANY authenticated user call this RPC directly with
-- another user's UUID and drain their credits. This RPC is only ever
-- called server-side (unlock route) via the service_role admin client,
-- so it has no business being callable from the browser at all.
--
-- Fix:
--   1. REVOKE EXECUTE from authenticated/anon — service_role only.
--   2. Defense-in-depth: the function body itself rejects any call
--      that isn't service_role or the credit owner, so even a
--      misconfigured grant (or a future regression) can't be abused.
--
-- Idempotent: safe to re-run against an existing DB.
-- =====================================================

CREATE OR REPLACE FUNCTION public.increment_credits_used(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Defense-in-depth: only service_role (server-side API routes) or the
  -- credit owner themselves may increment. This holds even if EXECUTE
  -- is ever accidentally re-granted to authenticated/anon.
  IF NOT (auth.role() = 'service_role' OR auth.uid() = user_id) THEN
    RAISE EXCEPTION 'increment_credits_used: not authorized to modify this user''s credits';
  END IF;

  UPDATE public.users
  SET credits_used = credits_used + 1,
      last_login = NOW()
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'increment_credits_used: user not found';
  END IF;
END;
$$;

-- Only server-side code using the service_role client may call this RPC.
REVOKE EXECUTE ON FUNCTION public.increment_credits_used(UUID) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_credits_used(UUID) TO service_role;

COMMENT ON FUNCTION public.increment_credits_used IS
'Atomically increments credits_used for the given user. service_role only (server-side unlock route); guarded against cross-user manipulation via auth.role()/auth.uid() check even if grants regress.';
