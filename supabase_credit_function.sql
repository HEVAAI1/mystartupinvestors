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
AS $$
BEGIN
  UPDATE public.users
  SET credits_used = credits_used + 1,
      last_login = NOW()  -- Also update last_login timestamp
  WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_credits_used(UUID) TO authenticated;

-- Optional: Add a comment to document the function
COMMENT ON FUNCTION increment_credits_used(UUID) IS 
'Atomically increments credits_used by 1 for the specified user. This prevents race conditions that can occur with read-modify-write patterns.';


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
