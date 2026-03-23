-- Add calculation credit columns to users table
-- This migration adds support for dual credit system (investor + calculation credits)
-- Run this manually in Supabase SQL Editor

-- Add new columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS calculation_credits INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS weekly_calculation_credits INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS last_calculation_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Set initial values for existing free users
UPDATE public.users
SET 
  weekly_calculation_credits = 3,
  last_calculation_reset_at = NOW()
WHERE plan = 'free';

-- For paid users, set calculation_credits based on their plan
-- Professional plan ($15)
UPDATE public.users
SET calculation_credits = 60
WHERE plan = 'professional';

-- Growth plan ($49)
UPDATE public.users
SET calculation_credits = 300
WHERE plan = 'growth';

-- Enterprise plan ($999) - unlimited = NULL
UPDATE public.users
SET calculation_credits = NULL
WHERE plan = 'enterprise';

-- Add comments for documentation
COMMENT ON COLUMN public.users.calculation_credits IS 'Persistent calculation credits for paid users. NULL = unlimited (enterprise)';
COMMENT ON COLUMN public.users.weekly_calculation_credits IS 'Weekly calculation credits for free users (resets to 3 every 7 days)';
COMMENT ON COLUMN public.users.last_calculation_reset_at IS 'Timestamp of last weekly credit reset for free users';

-- Verify the changes
SELECT 
  plan,
  COUNT(*) as user_count,
  AVG(calculation_credits) as avg_calc_credits,
  AVG(weekly_calculation_credits) as avg_weekly_credits
FROM public.users
GROUP BY plan;
