\set ON_ERROR_STOP on
set myfundinglist.test_role = 'service_role';

insert into public.users (id, credits_allocated, calculation_credits, plan, has_paid)
values ('11111111-1111-1111-1111-111111111111', 0, 0, 'free', false);

-- 1. First delivery: grants credits and records the transaction.
select public.record_payment_and_grant_credits(
  '11111111-1111-1111-1111-111111111111', 'pay_1', 19, 'professional', 60, 'US'
);
do $$
declare
  allocated int;
  granted boolean;
begin
  select credits_allocated into allocated from public.users where id = '11111111-1111-1111-1111-111111111111';
  if allocated <> 60 then raise exception 'expected 60 credits allocated, got %', allocated; end if;

  select (public.record_payment_and_grant_credits(
    '11111111-1111-1111-1111-111111111111', 'pay_1', 19, 'professional', 60, 'US'
  )->>'granted')::boolean into granted;
  if granted <> false then raise exception 'expected duplicate delivery to report granted=false'; end if;

  select credits_allocated into allocated from public.users where id = '11111111-1111-1111-1111-111111111111';
  if allocated <> 60 then raise exception 'duplicate delivery must not grant credits twice, got %', allocated; end if;

  raise notice 'PASS: first delivery grants credits once, retried duplicate delivery does not double-grant';
end $$;

-- 2. A failed credit grant (unknown user) must roll back the transaction
-- insert too, so a retry is not blocked by a stray duplicate-key row.
do $$
begin
  begin
    perform public.record_payment_and_grant_credits(
      '22222222-2222-2222-2222-222222222222', 'pay_2', 19, 'professional', 60, 'US'
    );
    raise exception 'expected an exception for unknown user';
  exception when others then
    if sqlerrm not like '%not found%' and sqlerrm not like '%foreign key%' then
      raise exception 'unexpected error: %', sqlerrm;
    end if;
  end;
end $$;

do $$
declare
  cnt int;
begin
  select count(*) into cnt from public.transactions where transaction_id = 'pay_2';
  if cnt <> 0 then
    raise exception 'expected the transaction insert to roll back with the failed credit grant, found % rows', cnt;
  end if;
  raise notice 'PASS: a failed credit grant rolls back the transaction insert too, so retry is recoverable';
end $$;

-- Retry after fixing the user now succeeds cleanly.
insert into public.users (id, credits_allocated, calculation_credits, plan, has_paid)
values ('22222222-2222-2222-2222-222222222222', 0, 0, 'free', false);
select public.record_payment_and_grant_credits(
  '22222222-2222-2222-2222-222222222222', 'pay_2', 19, 'professional', 60, 'US'
);
do $$
declare
  allocated int;
begin
  select credits_allocated into allocated from public.users where id = '22222222-2222-2222-2222-222222222222';
  if allocated <> 60 then raise exception 'expected retry to grant 60 credits, got %', allocated; end if;
  raise notice 'PASS: retry after fixing the underlying issue grants credits correctly';
end $$;

-- 3. Only service_role may call this.
set myfundinglist.test_role = 'authenticated';
do $$
begin
  begin
    perform public.record_payment_and_grant_credits(
      '11111111-1111-1111-1111-111111111111', 'pay_3', 19, 'professional', 60, 'US'
    );
    raise exception 'expected authorization failure';
  exception when others then
    if sqlerrm like '%not authorized%' then
      raise notice 'PASS: record_payment_and_grant_credits rejects non-service_role caller';
    else
      raise exception 'unexpected error: %', sqlerrm;
    end if;
  end;
end $$;
reset myfundinglist.test_role;

\echo ALL ASSERTIONS PASSED
