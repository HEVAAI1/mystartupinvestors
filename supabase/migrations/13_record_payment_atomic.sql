-- =============================================================================
-- 13_record_payment_atomic.sql — make credit grant recoverable on webhook retry
--
-- Problem: the Dodo webhook handler inserted the transaction row and granted
-- credits (add_purchase_credits) as two separate statements. If the credit
-- RPC failed after the transaction insert succeeded, a retried webhook
-- delivery hit the transaction's UNIQUE(transaction_id) constraint (23505)
-- and short-circuited as "duplicate, already handled" — silently never
-- granting credits for that payment. Also, a `purchase_receipt` email must
-- only be enqueued once the credit grant is durably complete, which the two-
-- step version couldn't guarantee.
--
-- Fix: one SECURITY DEFINER function that inserts the transaction row and
-- grants credits in a single Postgres transaction. Either both happen or
-- neither does, so a retry after a mid-way failure redoes both instead of
-- getting stuck on the duplicate-transaction short-circuit.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.record_payment_and_grant_credits(
  p_user_id uuid,
  p_transaction_id text,
  p_amount numeric,
  p_plan_type text,
  p_credits int,
  p_location text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_inserted_id bigint;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'record_payment_and_grant_credits: not authorized';
  END IF;

  INSERT INTO public.transactions (user_id, transaction_id, amount, plan_type, status, location)
  VALUES (p_user_id, p_transaction_id, p_amount, p_plan_type, 'succeeded', p_location)
  ON CONFLICT (transaction_id) DO NOTHING
  RETURNING id INTO v_inserted_id;

  IF v_inserted_id IS NULL THEN
    -- Duplicate delivery of an already-fully-processed payment: the earlier
    -- delivery's insert+grant already committed together, so there is
    -- nothing left to do here. The caller still enqueues the receipt email
    -- (its own event_key dedup makes that safe) in case only the email step
    -- was missed on the earlier delivery.
    RETURN jsonb_build_object('granted', false, 'duplicate', true);
  END IF;

  UPDATE public.users
  SET credits_allocated = credits_allocated + p_credits,
      calculation_credits = COALESCE(calculation_credits, 0) + p_credits,
      plan = p_plan_type,
      has_paid = true
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'record_payment_and_grant_credits: user % not found', p_user_id;
  END IF;

  RETURN jsonb_build_object('granted', true, 'duplicate', false);
END;
$$;

REVOKE ALL ON FUNCTION public.record_payment_and_grant_credits(uuid, text, numeric, text, int, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_payment_and_grant_credits(uuid, text, numeric, text, int, text) TO service_role;

COMMENT ON FUNCTION public.record_payment_and_grant_credits(uuid, text, numeric, text, int, text) IS
'Atomically records a successful payment transaction and grants its credits in one transaction, so a retried webhook delivery after a partial failure redoes both instead of being blocked by the transaction''s uniqueness constraint. service_role only (webhook handler). Replaces the separate transactions-insert + add_purchase_credits call pair on the payment.succeeded path; add_purchase_credits itself is left in place unused rather than dropped, since dropping a function is a breaking migration best done deliberately.';
