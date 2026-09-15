-- Durable transactional email events. Product mutations enqueue exactly once;
-- a separate dispatcher owns all delivery attempts.
CREATE OR REPLACE FUNCTION public.email_payload_has_sensitive_payout_field(p_payload jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = 'pg_catalog'
AS $$
  WITH RECURSIVE payload_values(value) AS (
    SELECT p_payload

    UNION ALL

    SELECT child.value
    FROM payload_values
    CROSS JOIN LATERAL (
      SELECT object_entry.value
      FROM jsonb_each(
        CASE WHEN jsonb_typeof(payload_values.value) = 'object'
          THEN payload_values.value
          ELSE '{}'::jsonb
        END
      ) AS object_entry

      UNION ALL

      SELECT array_entry.value
      FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(payload_values.value) = 'array'
          THEN payload_values.value
          ELSE '[]'::jsonb
        END
      ) AS array_entry(value)
    ) AS child
  )
  SELECT EXISTS (
    SELECT 1
    FROM payload_values
    CROSS JOIN LATERAL jsonb_object_keys(
      CASE WHEN jsonb_typeof(payload_values.value) = 'object'
        THEN payload_values.value
        ELSE '{}'::jsonb
      END
    ) AS payload_key(key)
    WHERE payload_key.key ~* '(account|ifsc|bank|contact_number)'
  );
$$;

CREATE TABLE public.email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL UNIQUE,
  event_type text NOT NULL CHECK (event_type IN (
    'welcome',
    'startup_submitted',
    'internal_startup_submitted',
    'contact_received',
    'internal_contact_request',
    'purchase_receipt',
    'payment_failed',
    'investor_credits_low',
    'investor_credits_zero',
    'calculator_credits_low',
    'calculator_credits_zero',
    'affiliate_ready',
    'affiliate_referral_joined',
    'affiliate_commission_earned',
    'affiliate_withdrawal_available',
    'withdrawal_requested',
    'withdrawal_status'
  )),
  user_id uuid REFERENCES public.users(id),
  recipient_email text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempt_count integer NOT NULL DEFAULT 0,
  claimed_at timestamptz,
  last_error text,
  resend_email_id text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_outbox_payload_no_sensitive_payout_fields
    CHECK (NOT public.email_payload_has_sensitive_payout_field(payload))
);

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_outbox FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.email_outbox FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.email_outbox TO service_role;

-- Keeps enqueue idempotent even if application callers retry after a timeout.
CREATE OR REPLACE FUNCTION public.enqueue_email_event(
  p_event_key text,
  p_event_type text,
  p_user_id uuid,
  p_recipient_email text,
  p_payload jsonb
)
RETURNS public.email_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_event public.email_outbox;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'enqueue_email_event: not authorized';
  END IF;

  IF public.email_payload_has_sensitive_payout_field(p_payload) THEN
    RAISE EXCEPTION 'sensitive payout fields are not allowed';
  END IF;

  INSERT INTO public.email_outbox (
    event_key,
    event_type,
    user_id,
    recipient_email,
    payload
  )
  VALUES (
    p_event_key,
    p_event_type,
    p_user_id,
    p_recipient_email,
    COALESCE(p_payload, '{}'::jsonb)
  )
  ON CONFLICT (event_key) DO NOTHING
  RETURNING * INTO v_event;

  IF v_event.id IS NULL THEN
    SELECT * INTO v_event
    FROM public.email_outbox
    WHERE event_key = p_event_key;
  END IF;

  RETURN v_event;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_email_event(text, text, uuid, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email_event(text, text, uuid, text, jsonb) TO service_role;

-- Claiming is atomic so concurrent Cron invocations cannot send the same row.
-- A stalled worker's 15-minute lease is reclaimed by the next invocation.
CREATE OR REPLACE FUNCTION public.claim_pending_email_events(p_limit integer)
RETURNS SETOF public.email_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'claim_pending_email_events: not authorized';
  END IF;

  RETURN QUERY
  WITH claimed AS (
    SELECT id
    FROM public.email_outbox
    WHERE status = 'pending'
      OR (
        status = 'sending'
        AND COALESCE(claimed_at, updated_at, created_at) <= now() - interval '15 minutes'
      )
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 0), 0), 100)
  )
  UPDATE public.email_outbox AS outbox
  SET status = 'sending',
      attempt_count = outbox.attempt_count + 1,
      claimed_at = now(),
      last_error = CASE
        WHEN outbox.status = 'sending' THEN COALESCE(outbox.last_error, 'email delivery lease expired')
        ELSE outbox.last_error
      END,
      updated_at = now()
  FROM claimed
  WHERE outbox.id = claimed.id
  RETURNING outbox.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_pending_email_events(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pending_email_events(integer) TO service_role;
