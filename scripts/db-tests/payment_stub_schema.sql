create extension if not exists pgcrypto;
create schema if not exists auth;
create or replace function auth.role() returns text language sql stable as $$
  select current_setting('myfundinglist.test_role', true);
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role; end if;
end $$;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  credits_allocated int not null default 0,
  calculation_credits int not null default 0,
  plan text not null default 'free',
  has_paid boolean not null default false
);

create table public.transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id),
  transaction_id text not null unique,
  amount numeric not null,
  plan_type text not null,
  status text not null,
  location text
);
