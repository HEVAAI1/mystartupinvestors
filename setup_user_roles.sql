-- =====================================================
-- User Role Setup for Route Protection
-- =====================================================
-- This script ensures the 'role' column exists and sets up
-- proper defaults for route protection to work correctly.
-- =====================================================

-- Step 1: Add role column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Step 2: Update any existing users with NULL role to 'user'
UPDATE public.users 
SET role = 'user' 
WHERE role IS NULL;

-- Step 3: Add a check constraint to ensure only valid roles
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin'));

-- Step 4: Create an index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- =====================================================
-- Optional: Set up an admin user
-- =====================================================
-- Replace 'your-email@example.com' with the actual admin email

-- Option 1: Set admin by email
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';

-- Option 2: Set admin by user ID
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = 'your-user-uuid-here';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if role column exists and has correct type
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Count users by role
SELECT role, COUNT(*) as count
FROM public.users
GROUP BY role;

-- List all admin users
SELECT id, name, email, role, created_at
FROM public.users
WHERE role = 'admin';

-- Check for any users with NULL role (should be none)
SELECT COUNT(*) as null_role_count
FROM public.users
WHERE role IS NULL;
