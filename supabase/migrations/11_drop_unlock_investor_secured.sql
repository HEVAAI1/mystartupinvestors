-- =============================================================================
-- Drop unused, race-prone unlock_investor_secured RPC
-- =============================================================================
-- This function (originally defined in 03_investors_rls.sql) had the same
-- TOCTOU race between the credit check and the credit debit that
-- 08_unlock_investor_rpc.sql fixed via the new public.unlock_investor RPC.
-- It was never called from the application (no references in src/), but it
-- remained GRANTed to `authenticated`, leaving it as live attack surface.
-- Use public.unlock_investor instead.

DROP FUNCTION IF EXISTS public.unlock_investor_secured(INTEGER);
