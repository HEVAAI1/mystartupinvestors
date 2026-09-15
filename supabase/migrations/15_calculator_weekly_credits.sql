-- =============================================================================
-- 13. Calendar-week calculator credits — replaces the lazy rolling 7-day
-- window with a real UTC-Monday-anchored calendar week, and moves
-- consumption into a single idempotent, fail-closed RPC.
--
-- Prior bugs (src/app/api/calculations/use-credit/route.ts, check-credits
-- route.ts, before this migration):
--   - "Weekly" reset was `now - last_reset >= 7 days`, a rolling window
--     that drifts with every reset instead of anchoring to a real week.
--   - Free allowance was 3 in an old, never-applied ad-hoc migration
--     (database_migration_calculation_credits.sql) vs 5 in the live route
--     — no single source of truth.
--   - Any plan value other than the literal string 'free' fell through to
--     the "paid, unlimited" branch — including NULL/unknown plans. Fail
--     OPEN on bad data, a real gap, not cosmetic.
--   - Consumption was a read-then-conditional-update loop in application
--     code with no request-level idempotency, so a retried/duplicated
--     request could double-decrement.
--
-- Fix: weekly_credit_week_key/weekly_credits_used track usage against the
-- current calendar week (Monday 00:00 UTC), consume_calculator_credit()
-- row-locks the user, is idempotent per (user_id, request_id) via a unique
-- ledger table (same ON CONFLICT DO NOTHING pattern as unlock_investor in
-- 08_unlock_investor_rpc.sql), and RAISEs (fails closed) on any plan that
-- isn't in the known allow-list — null/typo'd plans included.
--
-- Old weekly_calculation_credits / last_calculation_reset_at columns are
-- left in place (other code may still reference them) but are no longer
-- read or written by the calculator-credit path after this migration.
--
-- Idempotent: safe to re-run against an existing DB.
-- Does NOT touch investor credits (credits_allocated/credits_used) or the
-- unlock_investor RPC — separate, non-expiring system.
-- =============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS weekly_credit_week_key DATE,
  ADD COLUMN IF NOT EXISTS weekly_credits_used INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.users.weekly_credit_week_key IS
  'Monday (UTC) of the calendar week weekly_credits_used is counted against. NULL/stale (not the current week) means the counter has not been used yet this week.';
COMMENT ON COLUMN public.users.weekly_credits_used IS
  'Free-plan calculator uses consumed in the week identified by weekly_credit_week_key. Reset happens lazily in consume_calculator_credit() when the stored key is not the current week.';

-- Idempotency ledger: one row per successfully-processed request. A
-- retried/duplicated request with the same (user_id, request_id) hits the
-- unique index and is a no-op re-read instead of a second decrement.
CREATE TABLE IF NOT EXISTS public.calculator_credit_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  week_key DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT calculator_credit_events_user_request_uidx UNIQUE (user_id, request_id)
);

ALTER TABLE public.calculator_credit_events ENABLE ROW LEVEL SECURITY;
-- No policies: only the SECURITY DEFINER function below (running as its
-- owner) can read/write this table. No direct grants to anon/authenticated.
REVOKE ALL ON public.calculator_credit_events FROM PUBLIC, authenticated, anon;

COMMENT ON TABLE public.calculator_credit_events IS
  'Idempotency ledger for consume_calculator_credit(): one row per processed request_id, so a retried/duplicated call cannot double-decrement a user''s weekly credits.';

-- =============================================================================
-- consume_calculator_credit: atomically consumes one free-plan calculator
-- use for the current UTC calendar week, or reports unlimited for a known
-- paid plan. Fails closed (raises) on any plan not in the allow-list.
--
-- p_request_id must be a stable, caller-generated UUID for one logical
-- calculation attempt — retried calls with the same id are idempotent.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.consume_calculator_credit(
  p_user_id UUID,
  p_plan TEXT,
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_week_start DATE;
  v_reset_at TIMESTAMPTZ;
  v_stored_week DATE;
  v_used INTEGER;
  v_inserted_id BIGINT;
  v_limit CONSTANT INTEGER := 5; -- keep in sync with FREE_WEEKLY_LIMIT (src/lib/calculatorCredits.ts)
BEGIN
  -- Only service_role (server-side API routes) or the credit owner may call
  -- this — matches increment_credits_used's defense-in-depth, even though
  -- EXECUTE is also revoked from authenticated/anon below.
  IF NOT (auth.role() = 'service_role' OR auth.uid() = p_user_id) THEN
    RAISE EXCEPTION 'consume_calculator_credit: not authorized for this user';
  END IF;

  -- Fail CLOSED: unknown/null plan never resolves to unlimited use.
  IF p_plan IS NULL OR p_plan NOT IN ('free', 'professional', 'growth', 'enterprise') THEN
    RAISE EXCEPTION 'consume_calculator_credit: unknown or missing plan (%)', p_plan
      USING ERRCODE = 'P0001';
  END IF;

  IF p_plan <> 'free' THEN
    -- Known paid plan: unlimited, no row touched, no ledger entry.
    RETURN jsonb_build_object('unlimited', true, 'success', true, 'remaining', NULL, 'resetAt', NULL);
  END IF;

  v_week_start := date_trunc('week', (now() AT TIME ZONE 'utc'))::date; -- Monday, UTC
  v_reset_at := (v_week_start + INTERVAL '7 days') AT TIME ZONE 'utc';

  -- Row-lock so concurrent/duplicate calls for the same user serialize here.
  SELECT weekly_credit_week_key, weekly_credits_used
  INTO v_stored_week, v_used
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'consume_calculator_credit: user % not found', p_user_id;
  END IF;

  -- Stale (or never-set) week counter: this is the first use of the new week.
  IF v_stored_week IS DISTINCT FROM v_week_start THEN
    v_used := 0;
  END IF;

  -- Idempotency check: has this exact request already been processed?
  INSERT INTO public.calculator_credit_events (user_id, request_id, week_key)
  VALUES (p_user_id, p_request_id, v_week_start)
  ON CONFLICT (user_id, request_id) DO NOTHING
  RETURNING id INTO v_inserted_id;

  IF v_inserted_id IS NULL THEN
    -- Duplicate/retried request: return the current state, no decrement.
    RETURN jsonb_build_object(
      'unlimited', false,
      'success', true,
      'duplicate', true,
      'remaining', GREATEST(v_limit - v_used, 0),
      'limit', v_limit,
      'resetAt', v_reset_at
    );
  END IF;

  IF v_used >= v_limit THEN
    -- Exhausted: normalize the stored week key so a stale value doesn't
    -- keep forcing this branch every call, but do not grant a use.
    UPDATE public.users
    SET weekly_credit_week_key = v_week_start
    WHERE id = p_user_id AND weekly_credit_week_key IS DISTINCT FROM v_week_start;

    RETURN jsonb_build_object(
      'unlimited', false,
      'success', false,
      'remaining', 0,
      'limit', v_limit,
      'resetAt', v_reset_at
    );
  END IF;

  v_used := v_used + 1;

  UPDATE public.users
  SET weekly_credit_week_key = v_week_start,
      weekly_credits_used = v_used
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'unlimited', false,
    'success', true,
    'remaining', v_limit - v_used,
    'limit', v_limit,
    'resetAt', v_reset_at
  );
END;
$$;

COMMENT ON FUNCTION public.consume_calculator_credit(UUID, TEXT, UUID) IS
  'Atomically consumes one free-plan calculator use for the current UTC calendar week (Monday-anchored), idempotent per (user_id, request_id) via calculator_credit_events. Fails closed (raises) on any plan not in the known allow-list. service_role only.';

REVOKE ALL ON FUNCTION public.consume_calculator_credit(UUID, TEXT, UUID) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.consume_calculator_credit(UUID, TEXT, UUID) TO service_role;
