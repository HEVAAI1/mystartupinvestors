-- Track whether the user has completed at least one successful payment.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS has_paid boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.users.has_paid IS 'True after the first successful payment webhook is processed.';

-- Optional: mark existing paying users (run once after deploying the column).
-- UPDATE public.users
-- SET has_paid = true
-- WHERE plan IS NOT NULL AND plan <> 'free';
