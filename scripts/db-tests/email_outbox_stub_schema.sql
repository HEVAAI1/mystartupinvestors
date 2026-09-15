-- Minimal stand-in for the pieces of a real Supabase project that
-- 13_email_outbox.sql assumes exist (extensions, auth.role(), public.users,
-- and the anon/authenticated/service_role roles). Lets the real migration
-- run unmodified against a disposable Postgres container.
create extension if not exists pgcrypto;

create schema if not exists auth;
create or replace function auth.role() returns text language sql stable as $$
  select current_setting('myfundinglist.test_role', true);
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid()
);

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
end $$;
