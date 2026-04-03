-- =====================================================
-- MyFundingList — Affiliate System Schema
-- Run this in the Supabase SQL Editor (in order)
-- =====================================================

-- 1. Affiliates table: one row per affiliate user
CREATE TABLE IF NOT EXISTS public.affiliates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    referral_code text UNIQUE NOT NULL,
    total_earned numeric(10,2) DEFAULT 0 NOT NULL,
    total_paid numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON public.affiliates(referral_code);

-- 2. Referrals table: which affiliate referred which user (one referral per referred user)
CREATE TABLE IF NOT EXISTS public.referrals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    referred_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);

-- 3. Commissions table: one row per payment that generated a commission
CREATE TABLE IF NOT EXISTS public.commissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    payment_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    commission_amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid')),
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON public.commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);

-- 4. Withdrawal requests table: affiliate payout requests
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    amount numeric(10,2) NOT NULL CHECK (amount > 0),
    status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    created_at timestamptz DEFAULT now() NOT NULL,
    processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_affiliate_id ON public.withdrawal_requests(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- =====================================================
-- Verification — run after the above to confirm
-- =====================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('affiliates', 'referrals', 'commissions', 'withdrawal_requests')
ORDER BY table_name;
