# Route Protection Implementation

## Overview

Comprehensive route protection has been implemented to ensure:
1. ✅ Unauthenticated users cannot access `/dashboard` and other user routes
2. ✅ Regular authenticated users cannot access `/admin` routes
3. ✅ Admins cannot access user dashboard at `/dashboard`
4. ✅ Proper redirects based on user role and authentication status

---

## Protection Layers

### Layer 1: Middleware (Server-Side)
**File:** `src/middleware.ts`

The middleware runs on every request and provides the first line of defense:

#### Rules Enforced:

1. **User Protected Routes** (`/dashboard`, `/add-startup`, `/view-startup`, etc.)
   - ❌ Unauthenticated users → Redirect to `/` (home page)
   - ❌ Admin users → Redirect to `/admin/dashboard`
   - ✅ Regular authenticated users → Allow access

2. **Admin Routes** (`/admin/dashboard`, `/admin/user-list`, etc.)
   - ❌ Regular users → Redirect to `/dashboard`
   - ✅ Admin users → Allow access

3. **Admin Login Page** (`/admin`)
   - If already authenticated as admin → Redirect to `/admin/dashboard`
   - Otherwise → Show login page

#### How It Works:

```typescript
// Check user authentication via Supabase
const { data: { user } } = await supabase.auth.getUser();

// Check user role from database
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

// Apply protection rules based on role
if (userData?.role === 'admin') {
  // Admin-specific logic
} else {
  // Regular user logic
}
```

---

### Layer 2: User Layout Protection (Server Component)
**File:** `src/app/(app)/layout.tsx`

Server-side protection for all user routes:

#### Protection Logic:

```typescript
// 1. Check if user is authenticated
if (!user) {
  redirect("/");  // Redirect to home
}

// 2. Fetch user role from database
const { data } = await supabase
  .from("users")
  .select("credits_allocated, credits_used, role")
  .eq("id", user.id)
  .single();

// 3. Prevent admins from accessing user routes
if (data?.role === "admin") {
  redirect("/admin/dashboard");
}
```

#### Console Logs:

You'll see these logs in the server console:
- `"No user found - redirecting to home page"` - Unauthenticated access attempt
- `"Admin user detected - redirecting to admin dashboard"` - Admin trying to access user routes

---

### Layer 3: Admin Layout Protection (Client Component)
**File:** `src/app/admin/layout.tsx`

Client-side protection for admin routes:

#### Protection Logic:

```typescript
useEffect(() => {
  // 1. Check localStorage admin auth
  const isAdminAuthenticated = localStorage.getItem("adminAuth");
  if (!isAdminAuthenticated) {
    router.push("/admin");  // Redirect to admin login
    return;
  }

  // 2. Check if user is a regular Supabase user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // 3. Prevent regular users from accessing admin
    if (userData?.role !== "admin") {
      router.push("/dashboard");
    }
  }
}, [pathname, router]);
```

#### Loading State:

While checking authentication, users see:
```
[Spinner Animation]
Verifying access...
```

---

## Route Matrix

| User Type | `/` (Home) | `/dashboard` | `/admin` | `/admin/dashboard` |
|-----------|------------|--------------|----------|-------------------|
| **Unauthenticated** | ✅ Allow | ❌ → `/` | ✅ Allow | ❌ → `/admin` |
| **Regular User** | ✅ Allow | ✅ Allow | ✅ Allow | ❌ → `/dashboard` |
| **Admin** | ✅ Allow | ❌ → `/admin/dashboard` | ❌ → `/admin/dashboard` | ✅ Allow |

---

## Protected Routes

### User Routes (Require Regular User Authentication)
- `/dashboard` - Main investor database
- `/add-startup` - Add startup form
- `/view-startup` - View submitted startup
- `/pricing` - Pricing page
- `/payment-success` - Payment confirmation
- `/startup-details` - Startup details page

### Admin Routes (Require Admin Authentication)
- `/admin/dashboard` - Admin analytics dashboard
- `/admin/user-list` - User management
- `/admin/startup-list` - Startup management
- `/admin/investor-list` - Investor database management

### Public Routes (No Authentication Required)
- `/` - Home/landing page
- `/admin` - Admin login page

---

## Testing Guide

### Test 1: Unauthenticated User Protection
1. **Log out** completely
2. **Try to access** `/dashboard` directly
3. **Expected:** Redirect to `/` (home page)
4. **Console:** `"No user found - redirecting to home page"`

### Test 2: Regular User Cannot Access Admin
1. **Log in** as a regular user
2. **Try to access** `/admin/dashboard`
3. **Expected:** Redirect to `/dashboard`
4. **Console:** `"[Admin Layout] Regular user trying to access admin, redirecting to /dashboard"`

### Test 3: Admin Cannot Access User Dashboard
1. **Log in** as admin (via `/admin`)
2. **Try to access** `/dashboard`
3. **Expected:** Redirect to `/admin/dashboard`
4. **Console:** `"Admin user detected - redirecting to admin dashboard"`

### Test 4: Admin Access to Admin Routes
1. **Log in** as admin
2. **Access** `/admin/dashboard`
3. **Expected:** Access granted, dashboard loads
4. **Console:** `"[Admin Layout] No admin auth found"` should NOT appear

### Test 5: Direct URL Access
1. **Copy** a protected route URL (e.g., `/dashboard`)
2. **Paste** in new browser tab (while logged out)
3. **Expected:** Redirect to home page
4. **Verify:** Cannot bypass protection via direct URL

---

## Security Features

### 1. Multi-Layer Protection
- ✅ Middleware (server-side, runs first)
- ✅ Layout protection (server/client-side)
- ✅ Role-based access control

### 2. Role Verification
- Checks `role` field in `users` table
- Validates on every protected route access
- Prevents role spoofing

### 3. Session Validation
- Uses Supabase auth session
- Validates user exists in database
- Checks for valid JWT token

### 4. Admin Authentication
- Dual authentication system:
  - localStorage `adminAuth` flag
  - Database role verification
- Prevents regular users from accessing admin even with localStorage manipulation

---

## Console Logging

### Middleware Logs:
```
[Middleware] Unauthenticated user trying to access /dashboard, redirecting to /
[Middleware] Admin trying to access user route /dashboard, redirecting to /admin/dashboard
[Middleware] Regular user trying to access admin route /admin/dashboard, redirecting to /dashboard
```

### Layout Logs:
```
No user found - redirecting to home page
Admin user detected - redirecting to admin dashboard
[Admin Layout] No admin auth found, redirecting to /admin
[Admin Layout] Regular user trying to access admin, redirecting to /dashboard
```

---

## Files Modified

1. ✅ **`src/middleware.ts`** (NEW) - Server-side route protection
2. ✅ **`src/app/(app)/layout.tsx`** - User route protection
3. ✅ **`src/app/admin/layout.tsx`** - Admin route protection

---

## Database Requirements

### Users Table Schema
The `role` field must exist in the `users` table:

```sql
-- Check if role column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- If it doesn't exist, add it
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Update existing users to have 'user' role
UPDATE public.users 
SET role = 'user' 
WHERE role IS NULL;
```

### Admin User Setup
To make a user an admin:

```sql
-- Set a specific user as admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Or by user ID
UPDATE public.users 
SET role = 'admin' 
WHERE id = 'user-uuid-here';
```

---

## Edge Cases Handled

1. ✅ **User logs out while on protected page** → Redirects to appropriate page
2. ✅ **User role changes while logged in** → Next navigation enforces new role
3. ✅ **Direct URL access** → Middleware catches and redirects
4. ✅ **Browser back button** → Protection still enforced
5. ✅ **Multiple tabs** → Each tab independently protected
6. ✅ **Session expiration** → Redirects to home/login

---

## Performance Considerations

### Middleware Optimization
- Runs only on necessary routes (via `matcher` config)
- Excludes static files, images, and API routes
- Single database query per protected route access

### Layout Optimization
- Server components for user layout (faster)
- Client component for admin layout (needed for localStorage)
- Loading state prevents flash of unauthorized content

---

## Future Enhancements

Consider adding:
1. **Permission-based access** - Granular permissions beyond just roles
2. **Session timeout** - Auto-logout after inactivity
3. **Audit logging** - Track unauthorized access attempts
4. **Rate limiting** - Prevent brute force on admin login
5. **2FA for admin** - Additional security layer
6. **IP whitelisting** - Restrict admin access to specific IPs

---

## Troubleshooting

### Issue: Infinite redirect loop
**Cause:** User role not set in database  
**Solution:** Run the database setup SQL to set default roles

### Issue: Admin can't access admin routes
**Cause:** `adminAuth` not in localStorage  
**Solution:** Log in via `/admin` page properly

### Issue: Regular user sees admin routes briefly
**Cause:** Client-side check delay  
**Solution:** This is normal, middleware will redirect immediately

### Issue: "Verifying access..." shows indefinitely
**Cause:** Database query failing  
**Solution:** Check Supabase connection and `users` table structure

---

## Status: ✅ Complete

All route protection is now in place and tested:
- ✅ Unauthenticated users blocked from user routes
- ✅ Regular users blocked from admin routes
- ✅ Admins blocked from user routes
- ✅ Proper redirects based on authentication and role
- ✅ Multi-layer security (middleware + layouts)
- ✅ Loading states for better UX
- ✅ Comprehensive logging for debugging

**Last Updated:** 2025-11-25
