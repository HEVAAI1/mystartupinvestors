# User Creation Bug Fix

## Problem
When users logged in for the first time, entries were not being created in the Supabase `users` table.

## Root Causes Identified

### 1. **Race Condition**
The original code had this flow:
```typescript
const { data: listener } = supabase.auth.onAuthStateChange(...)
if (session) router.replace("/dashboard");
```

The problem: If a session already existed, the code would redirect to `/dashboard` **immediately** before the `onAuthStateChange` listener could fire and create the user entry.

### 2. **No Error Handling**
The upsert operation had no error handling:
```typescript
await supabase.from("users").upsert({...});
```

If this failed (due to RLS policies, network issues, or other reasons), it would fail silently with no indication of what went wrong.

### 3. **Missing Await with Error Checking**
The upsert wasn't properly awaited with destructured error checking, so we couldn't detect failures.

### 4. **No Logging**
There was no console logging to help debug what was happening during the auth flow.

## Solution Implemented

### Changes Made:

1. **Fixed Race Condition**: Now checks if a session exists first, creates/updates the user in the database, and **then** redirects:
```typescript
if (session) {
  const { data, error } = await supabase.from("users").upsert({...});
  if (error) {
    console.error("Error creating/updating user in database:", error);
  }
  router.replace("/dashboard");
}
```

2. **Added Error Handling**: Both the initial session check and the auth state change listener now properly handle errors.

3. **Added Logging**: Console logs at key points to help debug:
   - When session is found
   - When user is created/updated
   - When errors occur
   - When auth state changes

4. **Added onConflict**: Explicitly specified `onConflict: "id"` to ensure proper upsert behavior.

5. **Wrapped in Try-Catch**: The entire `handleAuth` function is now wrapped in a try-catch block.

## Testing Instructions

To verify the fix works:

1. **Clear existing session**: Log out completely
2. **Open browser console**: Press F12 to see console logs
3. **Sign in with Google**: Click "Sign In" button
4. **Check console logs**: You should see:
   - "Session found, creating/updating user: [user-id]"
   - "User successfully created/updated in database"
5. **Check Supabase**: Verify the user entry exists in the `users` table

## Potential Additional Issues

If users still aren't being created after this fix, check:

1. **Row Level Security (RLS) Policies**: Ensure the `users` table has a policy allowing authenticated users to insert/update their own records:
   ```sql
   CREATE POLICY "Users can insert their own record"
   ON public.users
   FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update their own record"
   ON public.users
   FOR UPDATE
   TO authenticated
   USING (auth.uid() = id);
   ```

2. **Foreign Key Constraint**: The schema has `FOREIGN KEY (id) REFERENCES auth.users (id)`. Ensure the user exists in `auth.users` before trying to insert into `public.users`.

3. **Database Permissions**: Verify the anon key has proper permissions to write to the `users` table.

## Files Modified
- `src/app/auth/callback/page.tsx`

---

## ⚠️ CRITICAL UPDATE - Credits Reset Bug

**A critical bug was introduced in the initial fix and has been resolved.**

### The Issue
The original fix used `upsert()` which was resetting `credits_used` to 0 on every login for existing users.

### The Resolution
Changed to a check-then-insert-or-update pattern:
- **New users**: Get default `credits_used: 0`
- **Existing users**: Only `last_login` is updated, credits are preserved

**See `CREDITS_RESET_BUG_FIX.md` for full details.**

### Current Status
✅ Users are created on first login  
✅ Credits are NOT reset on subsequent logins  
✅ Only `last_login` is updated for existing users

