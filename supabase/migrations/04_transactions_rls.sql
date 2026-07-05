-- =============================================================================
-- 04_transactions_rls.sql — Transactions table Row Level Security
--
-- Vulnerabilities fixed:
--   - Browser clients could query payment/transaction data
--   - No restriction on which transactions a user can read
--   - Other users' payment history potentially visible
--
-- Strategy:
--   - Enable RLS on public.transactions
--   - Users can SELECT only their own transactions
--   - INSERT and UPDATE blocked for authenticated role
--   - Only service_role (webhook handler) can INSERT/UPDATE
--   - This ensures transaction data is only created by payment webhooks
-- =============================================================================

-- =============================================================================
-- 4.1 Enable RLS on transactions table
-- =============================================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- 4.2 Drop existing policies
-- =============================================================================
DROP POLICY IF EXISTS "Enable select for authenticated" ON public.transactions;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.transactions;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.transactions;
DROP POLICY IF EXISTS select_own_transactions ON public.transactions;
DROP POLICY IF EXISTS admin_all_transactions ON public.transactions;
DROP POLICY IF EXISTS block_insert_update ON public.transactions;

-- =============================================================================
-- 4.3 POLICY: SELECT — users see only their own transactions
-- =============================================================================
CREATE POLICY select_own_transactions ON public.transactions
  FOR SELECT
  USING (user_id = auth.uid());

COMMENT ON POLICY select_own_transactions ON public.transactions IS 'Users can only SELECT their own transaction records (matched by user_id).';

-- =============================================================================
-- 4.4 POLICY: INSERT/UPDATE/DELETE blocked for all non-admin roles
--
-- Transactions are created exclusively by the DodoPayments webhook handler
-- which uses service_role (bypasses RLS). No authenticated user should
-- ever INSERT, UPDATE, or DELETE transaction records.
-- =============================================================================
CREATE POLICY block_insert_update ON public.transactions
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY block_delete ON public.transactions
  FOR DELETE
  USING (false);

-- UPDATE is implicitly blocked (no UPDATE policy = no access)

COMMENT ON POLICY block_insert_update ON public.transactions IS 'INSERT is blocked for all non-service_role users. Transactions are created only by the payment webhook.';
COMMENT ON POLICY block_delete ON public.transactions IS 'DELETE is blocked for all non-service_role users.';

-- =============================================================================
-- 4.5 POLICY: admin full access
-- =============================================================================
CREATE POLICY admin_all_transactions ON public.transactions
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON POLICY admin_all_transactions ON public.transactions IS 'Admin users have full access to all transaction records.';

-- =============================================================================
-- 4.6 Grant table access to authenticated role
-- =============================================================================
GRANT SELECT ON TABLE public.transactions TO authenticated;
-- Note: INSERT/UPDATE/DELETE not granted to authenticated role.
-- Service_role handles all writes via webhook.

-- =============================================================================
-- 4.7 Also secure affiliate financial tables
-- These tables contain payment-related data and should follow the same pattern.
-- =============================================================================

-- Affiliates table
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_affiliate ON public.affiliates;
DROP POLICY IF EXISTS admin_all_affiliates ON public.affiliates;

CREATE POLICY select_own_affiliate ON public.affiliates
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY admin_all_affiliates ON public.affiliates
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

GRANT SELECT ON TABLE public.affiliates TO authenticated;

-- Commissions table
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_commissions ON public.commissions;
DROP POLICY IF EXISTS admin_all_commissions ON public.commissions;

-- Users can see commissions on their own affiliate account
-- (via affiliate_id -> affiliates.user_id join)
CREATE POLICY select_own_commissions ON public.commissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = commissions.affiliate_id
        AND affiliates.user_id = auth.uid()
    )
  );

CREATE POLICY admin_all_commissions ON public.commissions
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

GRANT SELECT ON TABLE public.commissions TO authenticated;

-- Withdrawal requests table
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_withdrawals ON public.withdrawal_requests;
DROP POLICY IF EXISTS admin_all_withdrawals ON public.withdrawal_requests;

CREATE POLICY select_own_withdrawals ON public.withdrawal_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = withdrawal_requests.affiliate_id
        AND affiliates.user_id = auth.uid()
    )
  );

CREATE POLICY admin_all_withdrawals ON public.withdrawal_requests
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

GRANT SELECT ON TABLE public.withdrawal_requests TO authenticated;
