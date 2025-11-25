# Route Protection - Quick Setup Guide

## ✅ What Was Implemented

**Complete route protection system with 3 layers of security:**

1. ✅ **Middleware** - Server-side protection (first line of defense)
2. ✅ **User Layout** - Protects user routes from unauthenticated users and admins
3. ✅ **Admin Layout** - Protects admin routes from regular users

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Run the SQL Script

Run this in your Supabase SQL Editor:

```sql
-- Add role column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Update existing users
UPDATE public.users 
SET role = 'user' 
WHERE role IS NULL;
```

**Or run the file:** `setup_user_roles.sql`

### Step 2: Set Up an Admin User (Optional)

```sql
-- Replace with your admin email
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-admin@example.com';
```

---

## 🧪 Test It

### Test 1: Unauthenticated Access
1. Log out
2. Try to access `/dashboard`
3. ✅ Should redirect to `/` (home page)

### Test 2: Regular User → Admin
1. Log in as regular user
2. Try to access `/admin/dashboard`
3. ✅ Should redirect to `/dashboard`

### Test 3: Admin → User Dashboard
1. Log in as admin (via `/admin`)
2. Try to access `/dashboard`
3. ✅ Should redirect to `/admin/dashboard`

---

## 📋 Protection Rules

| User Type | Can Access `/dashboard`? | Can Access `/admin`? |
|-----------|-------------------------|---------------------|
| **Not logged in** | ❌ → `/` | ✅ (login page) |
| **Regular user** | ✅ | ❌ → `/dashboard` |
| **Admin** | ❌ → `/admin/dashboard` | ✅ |

---

## 🔍 Debugging

### Check Console Logs:

**Unauthenticated user trying to access `/dashboard`:**
```
[Middleware] Unauthenticated user trying to access /dashboard, redirecting to /
```

**Admin trying to access `/dashboard`:**
```
Admin user detected - redirecting to admin dashboard
```

**Regular user trying to access `/admin/dashboard`:**
```
[Admin Layout] Regular user trying to access admin, redirecting to /dashboard
```

---

## 📁 Files Created/Modified

1. ✅ `src/middleware.ts` (NEW) - Main route protection
2. ✅ `src/app/(app)/layout.tsx` - User route protection
3. ✅ `src/app/admin/layout.tsx` - Admin route protection
4. ✅ `setup_user_roles.sql` - Database setup
5. ✅ `ROUTE_PROTECTION.md` - Full documentation

---

## ⚠️ Important Notes

- The `role` column is **required** in the `users` table
- Default role is `'user'` for all new users
- Admin role must be manually assigned via SQL
- Protection works on both server and client side

---

## 🎉 Status: Ready to Use!

Your app now has:
- ✅ Secure route protection
- ✅ Role-based access control
- ✅ Proper redirects
- ✅ Loading states
- ✅ Console logging for debugging

**See `ROUTE_PROTECTION.md` for complete documentation.**
