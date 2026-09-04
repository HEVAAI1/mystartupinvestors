-- =============================================================================
-- 09: Atomic affiliate withdrawal RPCs
-- Fixes TOCTOU double-spend on withdrawal creation (vuln-0001) and the
-- missing total_paid increment on payout (vuln-0007/0008) by moving both
-- operations into SECURITY DEFINER functions that lock the relevant row
-- and do the read-check-write inside a single transaction.
-- service_role only — called from the admin Supabase client in route
-- handlers that have already authenticated/authorized the caller.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 9.1 RPC: request_withdrawal
-- Locks the affiliate row, recomputes available balance under that lock,
-- and inserts the withdrawal request atomically so concurrent requests
-- cannot each read the same "available" balance and over-withdraw.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_affiliate_id UUID,
  p_amount NUMERIC,
  p_details JSONB
)
RETURNS public.withdrawal_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total_earned NUMERIC;
  v_total_paid NUMERIC;
  v_open NUMERIC;
  v_available NUMERIC;
  v_withdrawal public.withdrawal_requests;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount' USING ERRCODE = '22023';
  END IF;

  -- Lock the affiliate row so concurrent withdrawal requests serialize.
  SELECT total_earned, total_paid
  INTO v_total_earned, v_total_paid
  FROM public.affiliates
  WHERE id = p_affiliate_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Affiliate not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT COALESCE(SUM(amount), 0)
  INTO v_open
  FROM public.withdrawal_requests
  WHERE affiliate_id = p_affiliate_id
    AND status IN ('pending', 'approved');

  v_available := (v_total_earned - v_total_paid) - v_open;

  IF p_amount > v_available THEN
    RAISE EXCEPTION 'Withdrawal amount exceeds available balance of %', v_available
      USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.withdrawal_requests (
    affiliate_id, amount, name, account_number, ifsc_code,
    account_holder_name, contact_number, email_id, country, additional_details
  )
  VALUES (
    p_affiliate_id,
    p_amount,
    p_details->>'name',
    p_details->>'account_number',
    p_details->>'ifsc_code',
    p_details->>'account_holder_name',
    p_details->>'contact_number',
    p_details->>'email_id',
    p_details->>'country',
    p_details->>'additional_details'
  )
  RETURNING * INTO v_withdrawal;

  RETURN v_withdrawal;
END;
$$;

COMMENT ON FUNCTION public.request_withdrawal IS 'SECURITY DEFINER RPC that atomically recomputes available affiliate balance under a row lock and inserts a withdrawal request. Prevents TOCTOU double-spend across concurrent requests.';

REVOKE ALL ON FUNCTION public.request_withdrawal(UUID, NUMERIC, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.request_withdrawal(UUID, NUMERIC, JSONB) FROM authenticated;
REVOKE ALL ON FUNCTION public.request_withdrawal(UUID, NUMERIC, JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(UUID, NUMERIC, JSONB) TO service_role;

-- -----------------------------------------------------------------------------
-- 9.2 RPC: set_withdrawal_status
-- Locks the withdrawal_requests row, validates the status transition, and
-- when transitioning to 'paid' atomically increments affiliates.total_paid
-- in the same transaction so payout and balance debit can never diverge.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_withdrawal_status(
  p_withdrawal_id UUID,
  p_status TEXT
)
RETURNS public.withdrawal_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_withdrawal public.withdrawal_requests;
BEGIN
  IF p_status NOT IN ('pending', 'approved', 'rejected', 'paid') THEN
    RAISE EXCEPTION 'Invalid status' USING ERRCODE = '22023';
  END IF;

  -- Lock the withdrawal row so it cannot be processed twice concurrently.
  SELECT *
  INTO v_withdrawal
  FROM public.withdrawal_requests
  WHERE id = p_withdrawal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal request not found' USING ERRCODE = 'P0002';
  END IF;

  -- A terminal request (paid or rejected) can never be re-processed.
  IF v_withdrawal.status IN ('paid', 'rejected') THEN
    RAISE EXCEPTION 'Withdrawal request is already %', v_withdrawal.status
      USING ERRCODE = '22023';
  END IF;

  -- From here status is 'pending' or 'approved'; only allow moving forward
  -- to approved/paid/rejected, never back to pending.
  IF p_status = 'pending' THEN
    RAISE EXCEPTION 'Cannot revert withdrawal request to pending' USING ERRCODE = '22023';
  END IF;

  IF p_status = 'paid' THEN
    UPDATE public.affiliates
    SET total_paid = total_paid + v_withdrawal.amount
    WHERE id = v_withdrawal.affiliate_id;
  END IF;

  UPDATE public.withdrawal_requests
  SET status = p_status,
      processed_at = now()
  WHERE id = p_withdrawal_id
  RETURNING * INTO v_withdrawal;

  RETURN v_withdrawal;
END;
$$;

COMMENT ON FUNCTION public.set_withdrawal_status IS 'SECURITY DEFINER RPC that atomically validates a withdrawal status transition and, when paying out, increments affiliates.total_paid in the same transaction. Prevents infinite re-payout of the same withdrawal.';

REVOKE ALL ON FUNCTION public.set_withdrawal_status(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_withdrawal_status(UUID, TEXT) FROM authenticated;
REVOKE ALL ON FUNCTION public.set_withdrawal_status(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_withdrawal_status(UUID, TEXT) TO service_role;
