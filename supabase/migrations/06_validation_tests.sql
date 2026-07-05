-- =============================================================================
-- 06_validation_tests.sql — Security validation test queries
--
-- Run these queries AFTER applying migrations 01-05 to verify that:
--   1. Normal users cannot modify credits/plan/role
--   2. Users cannot read other users' rows
--   3. Investors table cannot be dumped
--   4. Transactions are private to each user
--   5. Admin users still have full access
--   6. Auth callback can still create/update user rows
--
-- NOTE: These tests use the Supabase REST API context.
-- Run them from the Supabase Dashboard SQL Editor as a non-service-role user
-- (i.e., as an authenticated user via the anon key) to verify RLS behavior.
-- =============================================================================

-- =============================================================================
-- TEST 1: Normal user cannot modify sensitive fields
-- =============================================================================

-- 1a. Attempt to update plan (should FAIL)
-- Run as authenticated user (NOT service_role)
-- BEGIN;
--   UPDATE public.users
--   SET plan = 'growth', credits_allocated = 999999
--   WHERE id = auth.uid();
-- ROLLBACK;
-- Expected: ERROR: new row violates row-level security policy for table "users"
-- OR: 0 rows affected (if policy silently blocks)

-- 1b. Attempt to update role (should FAIL)
-- BEGIN;
--   UPDATE public.users
--   SET role = 'admin'
--   WHERE id = auth.uid();
-- ROLLBACK;
-- Expected: ERROR from trigger: "Only admins can change user roles"

-- 1c. Attempt to update has_paid (should FAIL)
-- BEGIN;
--   UPDATE public.users
--   SET has_paid = true
--   WHERE id = auth.uid();
-- ROLLBACK;
-- Expected: 0 rows affected

-- 1d. Attempt to update credits_allocated (should FAIL)
-- BEGIN;
--   UPDATE public.users
--   SET credits_allocated = 100
--   WHERE id = auth.uid();
-- ROLLBACK;
-- Expected: 0 rows affected

-- 1e. Attempt to update credits_used (should FAIL)
-- BEGIN;
--   UPDATE public.users
--   SET credits_used = 0
--   WHERE id = auth.uid();
-- ROLLBACK;
-- Expected: 0 rows affected

-- 1f. Allow safe field update (name, email, last_login) (should SUCCEED)
-- BEGIN;
--   UPDATE public.users
--   SET last_login = NOW()
--   WHERE id = auth.uid();
-- ROLLBACK;
-- Expected: 1 row affected

-- =============================================================================
-- TEST 2: Users cannot read other users' rows
-- =============================================================================

-- 2a. Try to read all users (should return only own row)
-- SELECT id, email, role, plan, credits_allocated FROM public.users;
-- Expected: Only 1 row returned (the current user's own row)

-- 2b. Try to select a specific other user (should return empty)
-- SELECT id, email, role FROM public.users WHERE id != auth.uid();
-- Expected: 0 rows returned (RLS blocks other users' rows)

-- =============================================================================
-- TEST 3: Investors table cannot be dumped
-- =============================================================================

-- 3a. Try to read all investors (should return 0 rows)
-- SELECT COUNT(*) FROM public.investors;
-- Expected: 0 rows returned (block_direct_select policy blocks all)
-- NOTE: This test confirms that direct table access is blocked.
-- Investor data MUST be accessed via API routes (service_role) or RPC.

-- 3b. Try RPC access (if configured) (should work)
-- SELECT * FROM public.get_investors_secured(1, 7, '', '', '', false);
-- Expected: JSON with paginated, masked investor data

-- 3c. Admin can bypass (if the current user is admin)
-- SELECT COUNT(*) FROM public.investors;
-- Expected: Returns full count (admin bypasses RLS)

-- =============================================================================
-- TEST 4: Transactions are private
-- =============================================================================

-- 4a. Try to read all transactions (should return only own rows)
-- SELECT * FROM public.transactions;
-- Expected: Only transactions WHERE user_id = auth.uid() are returned

-- 4b. Try to read another user's transactions (should return empty)
-- SELECT * FROM public.transactions WHERE user_id != auth.uid();
-- Expected: 0 rows returned

-- 4c. Try to insert a fake transaction (should FAIL)
-- BEGIN;
--   INSERT INTO public.transactions (user_id, transaction_id, amount, plan_type, status)
--   VALUES (auth.uid(), 'fake_txn', 999.99, 'growth', 'succeeded');
-- ROLLBACK;
-- Expected: ERROR: new row violates row-level security policy for table "transactions"
-- (the block_insert_update policy rejects all INSERT attempts)

-- =============================================================================
-- TEST 5: Admin access verification
-- =============================================================================

-- 5a. Check if is_admin() function works
-- SELECT public.is_admin();
-- Expected: true if current user is admin, false otherwise

-- 5b. Admin can read all users (run as admin)
-- SELECT id, email, role, plan FROM public.users;
-- Expected: All users visible (admin_all policy bypasses restrictions)

-- 5c. Admin can read all investors (run as admin)
-- SELECT COUNT(*) FROM public.investors;
-- Expected: Full count of investors

-- 5d. Admin can read all transactions (run as admin)
-- SELECT COUNT(*) FROM public.transactions;
-- Expected: Full count of transactions

-- =============================================================================
-- TEST 6: Auth callback functionality (must work for signup)
-- =============================================================================

-- 6a. User can insert their own row (simulates auth callback for new user)
-- BEGIN;
--   -- This requires auth.uid() to match the id being inserted
--   INSERT INTO public.users (id, name, email, plan, credits_allocated, credits_used, role)
--   VALUES (auth.uid(), 'Test User', 'test@example.com', 'free', 5, 0, 'user')
--   ON CONFLICT (id) DO NOTHING;
-- ROLLBACK;
-- Expected: 1 row affected (insert_own_user policy allows it)

-- 6b. User can update their own safe fields (simulates auth callback for returning user)
-- BEGIN;
--   UPDATE public.users
--   SET name = 'Updated Name', last_login = NOW()
--   WHERE id = auth.uid();
-- ROLLBACK;
-- Expected: 1 row affected

-- =============================================================================
-- TEST 7: RLS is properly enabled on all tables
-- =============================================================================
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled,
  CASE WHEN relrowsecurity THEN '✅ SECURE' ELSE '❌ INSECURE' END AS status
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relname IN (
    'users', 'investors', 'user_investor_views',
    'transactions', 'startup_leads', 'affiliates',
    'commissions', 'withdrawal_requests', 'referrals'
  )
ORDER BY relname;

-- =============================================================================
-- TEST 8: Confirm no anon role has table access
-- =============================================================================
SELECT
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon'
  AND table_schema = 'public'
ORDER BY table_name, privilege_type;
-- Expected: 0 rows (anon role has no table access)

-- =============================================================================
-- TEST 9: Verify all RLS policies are in place
-- =============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd AS command,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- TEST 10: Integration test — full unlock flow via RPC
-- =============================================================================

-- 10a. Create a test investor if needed
-- INSERT INTO public.investors (id, name, about, city, country, preference_sector, firm_name, email, linkedin)
-- VALUES (999999, 'Test Investor', 'About text with sensitive info', 'Test City', 'Test Country',
--         'Tech, SaaS', 'Test Firm', 'test@investor.com', 'https://linkedin.com/test')
-- ON CONFLICT (id) DO NOTHING;

-- 10b. Get investor via RPC (should return masked data)
-- SELECT public.get_investor_by_id_secured(999999);
-- Expected: locked=true, name=masked, about=censored, email=null

-- 10c. Unlock investor via RPC (should check credits, create view)
-- SELECT public.unlock_investor_secured(999999);
-- Expected: Full investor data returned, credits_used incremented

-- 10d. Get investor again (should now be unlocked)
-- SELECT public.get_investor_by_id_secured(999999);
-- Expected: locked=false, full data visible

-- =============================================================================
-- SUMMARY: Expected behavior matrix
-- =============================================================================
--
-- | Scenario                              | Role           | Expected Result                |
-- |---------------------------------------|----------------|--------------------------------|
-- | SELECT own user row                   | authenticated  | ✅ Row returned                |
-- | SELECT another user's row             | authenticated  | ❌ Empty result                |
-- | UPDATE own safe fields (name,email)   | authenticated  | ✅ 1 row affected              |
-- | UPDATE own plan/credits/role          | authenticated  | ❌ 0 rows affected / error     |
-- | INSERT own row (auth callback)        | authenticated  | ✅ 1 row affected              |
-- | SELECT all investors (direct table)   | authenticated  | ❌ 0 rows returned             |
-- | RPC: get_investors_secured            | authenticated  | ✅ Paginated, masked data      |
-- | RPC: unlock_investor_secured          | authenticated  | ✅ Full data, credit debited   |
-- | SELECT own transactions               | authenticated  | ✅ Own transactions only       |
-- | SELECT another's transactions         | authenticated  | ❌ 0 rows returned             |
-- | INSERT fake transaction               | authenticated  | ❌ Error / 0 rows              |
-- | All operations                        | service_role   | ✅ Always works (bypasses RLS) |
-- | All operations                        | admin          | ✅ Always works (admin policy) |
-- | Change own role to admin              | authenticated  | ❌ Blocked by trigger          |
-- | Read all data (users,investors,txns)  | admin          | ✅ Full access                 |
-- =============================================================================
