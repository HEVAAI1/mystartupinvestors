-- =====================================================
-- Atomic Credit Increment Function
-- =====================================================
-- This function prevents race conditions when updating credits_used
-- by performing the increment atomically at the database level.
--
-- Usage: supabase.rpc('increment_credits_used', { user_id: userId })
-- =====================================================

CREATE OR REPLACE FUNCTION increment_credits_used(user_id UUID)
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
      last_login = NOW()  -- Also update last_login timestamp
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'increment_credits_used: user not found';
  END IF;
END;
$$;

-- This RPC is only ever called server-side (unlock route) via the
-- service_role admin client — never directly by a logged-in browser
-- client — so EXECUTE is restricted to service_role only.
REVOKE EXECUTE ON FUNCTION increment_credits_used(UUID) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_credits_used(UUID) TO service_role;

-- Optional: Add a comment to document the function
COMMENT ON FUNCTION increment_credits_used(UUID) IS
'Atomically increments credits_used by 1 for the specified user. service_role only; guarded against cross-user manipulation via auth.role()/auth.uid() check even if grants regress.';


-- =====================================================
-- Optional: Create an index for better performance
-- =====================================================
-- If you have a large users table, this index can help
-- with the WHERE id = user_id lookup

CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);


-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the function was created successfully:
-- SELECT proname, proargnames, prosrc 
-- FROM pg_proc 
-- WHERE proname = 'increment_credits_used';
