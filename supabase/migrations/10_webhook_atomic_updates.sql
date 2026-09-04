-- =============================================================================
-- 10_webhook_atomic_updates.sql — Fix TOCTOU race in dodo webhook (vuln-0010)
--
-- Problem: src/app/api/webhooks/dodo/route.ts did a read-then-compute-then-
-- unconditional-UPDATE on users.credits_allocated/calculation_credits and on
-- affiliates.total_earned. Two concurrent webhook deliveries (duplicate
-- delivery, or two purchases close together) can race: the second overwrites
-- the first's computed value, silently losing purchased credits/commission.
-- The transaction dedup check (select-then-insert) was itself racy for the
-- same reason.
--
-- Fix: atomic relative UPDATE ... SET col = col + n RPCs (no read-modify-write
-- window), plus UNIQUE constraints so a duplicate insert fails fast with
-- 23505 instead of relying on a racy existence check.
-- =============================================================================

-- =============================================================================
-- 10.1 Idempotency: unique constraints so duplicate webhook deliveries fail
-- the INSERT (23505) instead of racing a SELECT-then-INSERT check.
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_transaction_id_key'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_transaction_id_key UNIQUE (transaction_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'commissions' AND column_name = 'payment_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commissions_payment_id_key'
  ) THEN
    ALTER TABLE public.commissions
      ADD CONSTRAINT commissions_payment_id_key UNIQUE (payment_id);
  END IF;
END $$;

-- =============================================================================
-- 10.2 add_purchase_credits — atomic credit grant on successful payment
-- =============================================================================
CREATE OR REPLACE FUNCTION public.add_purchase_credits(
  p_user_id uuid,
  p_credits int,
  p_plan text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'add_purchase_credits: not authorized';
  END IF;

  UPDATE public.users
  SET credits_allocated = credits_allocated + p_credits,
      calculation_credits = COALESCE(calculation_credits, 0) + p_credits,
      plan = p_plan,
      has_paid = true
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'add_purchase_credits: user not found';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_purchase_credits(uuid, int, text) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.add_purchase_credits(uuid, int, text) TO service_role;

COMMENT ON FUNCTION public.add_purchase_credits(uuid, int, text) IS
'Atomically adds p_credits to credits_allocated and calculation_credits, sets plan and has_paid. service_role only (webhook handler). No read-modify-write window.';

-- =============================================================================
-- 10.3 add_commission — atomic affiliate commission accrual
-- =============================================================================
CREATE OR REPLACE FUNCTION public.add_commission(
  p_affiliate_id uuid,
  p_amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'add_commission: not authorized';
  END IF;

  UPDATE public.affiliates
  SET total_earned = total_earned + p_amount
  WHERE id = p_affiliate_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'add_commission: affiliate not found';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_commission(uuid, numeric) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.add_commission(uuid, numeric) TO service_role;

COMMENT ON FUNCTION public.add_commission(uuid, numeric) IS
'Atomically adds p_amount to affiliates.total_earned. service_role only (webhook handler). No read-modify-write window.';
