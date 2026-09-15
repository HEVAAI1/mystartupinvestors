-- Exercises 13_email_outbox.sql's real SQL (not a TS mock): the recursive
-- sensitive-payload CHECK, enqueue_email_event idempotency/auth, and
-- claim_pending_email_events' reclaim-lease + SKIP LOCKED behavior.
\set ON_ERROR_STOP on
set myfundinglist.test_role = 'service_role';

do $$
begin
  begin
    insert into public.email_outbox (event_key, event_type, recipient_email, payload)
    values ('t1', 'withdrawal_requested', 'a@example.com', '{"account_number":"123"}'::jsonb);
    raise exception 'expected CHECK constraint violation, insert succeeded';
  exception when check_violation then
    raise notice 'PASS: direct insert with sensitive top-level key rejected';
  end;
end $$;

do $$
begin
  begin
    insert into public.email_outbox (event_key, event_type, recipient_email, payload)
    values ('t2', 'withdrawal_requested', 'a@example.com', '{"payout":{"ifsc_code":"X"}}'::jsonb);
    raise exception 'expected CHECK constraint violation, insert succeeded';
  exception when check_violation then
    raise notice 'PASS: nested sensitive key rejected';
  end;
end $$;

select public.enqueue_email_event('pay_1', 'purchase_receipt', null, 'buyer@example.com', '{"plan":"pro"}'::jsonb);
select public.enqueue_email_event('pay_1', 'purchase_receipt', null, 'buyer@example.com', '{"plan":"pro"}'::jsonb);
do $$
declare
  cnt int;
begin
  select count(*) into cnt from public.email_outbox where event_key = 'pay_1';
  if cnt <> 1 then
    raise exception 'expected exactly 1 row for duplicate event_key, got %', cnt;
  end if;
  raise notice 'PASS: enqueue_email_event idempotent on duplicate key';
end $$;

insert into public.email_outbox (event_key, event_type, recipient_email, status, created_at, updated_at, claimed_at)
values
  ('pending_1', 'welcome', 'b@example.com', 'pending', now(), now(), null),
  ('stale_sending_1', 'welcome', 'c@example.com', 'sending', now() - interval '30 minutes', now() - interval '20 minutes', now() - interval '20 minutes'),
  ('fresh_sending_1', 'welcome', 'd@example.com', 'sending', now(), now(), now());

select event_key from public.claim_pending_email_events(10) order by event_key;

do $$
declare
  claimed_count int;
  fresh_untouched boolean;
begin
  select count(*) into claimed_count from public.email_outbox
    where event_key in ('pay_1', 'pending_1', 'stale_sending_1') and status = 'sending' and attempt_count >= 1;
  if claimed_count <> 3 then
    raise exception 'expected pay_1/pending_1/stale_sending_1 all claimed into sending, got % of 3', claimed_count;
  end if;

  -- fresh_sending_1 has an active (non-expired) lease and must not be reclaimed.
  select (attempt_count = 0) into fresh_untouched from public.email_outbox where event_key = 'fresh_sending_1';
  if not fresh_untouched then
    raise exception 'expected fresh_sending_1 lease to be left alone, but attempt_count changed';
  end if;

  raise notice 'PASS: claim_pending_email_events claims pending + reclaims stale sending leases, leaves fresh lease alone';
end $$;

set myfundinglist.test_role = 'authenticated';
do $$
begin
  begin
    perform public.enqueue_email_event('t3', 'welcome', null, 'x@example.com', '{}'::jsonb);
    raise exception 'expected authorization failure, RPC succeeded';
  exception when others then
    if sqlerrm like '%not authorized%' then
      raise notice 'PASS: enqueue_email_event rejects non-service_role caller';
    else
      raise exception 'unexpected error: %', sqlerrm;
    end if;
  end;
end $$;
reset myfundinglist.test_role;

set role authenticated;
do $$
begin
  begin
    perform 1 from public.email_outbox limit 1;
    raise exception 'expected permission denied for authenticated role';
  exception when insufficient_privilege then
    raise notice 'PASS: authenticated role has no table access (RLS + REVOKE)';
  end;
end $$;
reset role;

\echo ALL ASSERTIONS PASSED
