-- =====================================================
-- Fix missing REVOKE ... FROM anon (migrations 08, 09)
-- =====================================================
-- Supabase's default privileges auto-grant EXECUTE to anon/authenticated
-- on every new function. Migrations 08 and 09 only revoked from PUBLIC
-- and authenticated, leaving anon with EXECUTE on three service_role-only
-- RPCs — meaning an unauthenticated caller could invoke them directly via
-- PostgREST (/rest/v1/rpc/...) and bypass every check in the API routes
-- that wrap them.
--
-- Idempotent: safe to re-run against an existing DB.
-- =====================================================

REVOKE ALL ON FUNCTION public.unlock_investor(UUID, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.request_withdrawal(UUID, NUMERIC, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.set_withdrawal_status(UUID, TEXT) FROM anon;
