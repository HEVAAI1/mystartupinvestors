# Critical Bug Fix - Credits Reset on Login

## 🔴 CRITICAL BUG FIXED

### The Problem
**Credits were being reset to 0 every time a user logged in!**

This was extremely frustrating because:
- Users would lose all their credit usage history
- The system couldn't track actual credit consumption
- Users appeared to have full credits even after using them

### Root Cause

In the auth callback (`src/app/auth/callback/page.tsx`), the code was using `upsert()` which:
1. **Inserts** a new record if the user doesn't exist
2. **Updates** the entire record if the user exists

The problem was that it was setting `credits_used: 0` in the upsert data, which meant:
- ✅ New users: Got `credits_used: 0` (correct)
- ❌ Existing users: Had their `credits_used` reset to 0 on every login (WRONG!)

### The Fix

Changed from `upsert()` to a **check-then-insert-or-update** pattern:

```typescript
// OLD CODE (BROKEN):
await supabase.from("users").upsert({
  id: user.id,
  credits_used: 0,  // ❌ This resets credits on every login!
  // ... other fields
});

// NEW CODE (FIXED):
const { data: existingUser } = await supabase
  .from("users")
  .select("id, credits_used, name, email")
  .eq("id", user.id)
  .single();

if (existingUser) {
  // Existing user - only update last_login, DON'T touch credits
  await supabase.from("users").update({ 
    last_login: new Date().toISOString(),
    // ... update profile info only
  });
} else {
  // New user - create with default credits
  await supabase.from("users").insert({
    credits_used: 0,  // ✅ Only set for new users
    // ... other fields
  });
}
```

### What Changed

**For New Users (First Login):**
- Creates a new record with `credits_used: 0`
- Sets all default values
- ✅ Works correctly

**For Existing Users (Subsequent Logins):**
- Only updates `last_login` timestamp
- Updates profile info (name, email, picture) if changed
- **Does NOT touch `credits_used` or `credits_allocated`**
- ✅ Credits are preserved!

### Files Modified

- ✅ `src/app/auth/callback/page.tsx` - Fixed both the initial session check and the `onAuthStateChange` listener

### Testing

1. **Test with New User:**
   - Sign up with a new account
   - Check database: `credits_used` should be 0
   - View some investors
   - Check database: `credits_used` should increase

2. **Test with Existing User (THE CRITICAL TEST):**
   - Use an account that has already used some credits
   - Note the current `credits_used` value in database
   - Log out
   - Log back in
   - Check database: `credits_used` should be **THE SAME** (not reset to 0!)

3. **Test Credit Usage After Login:**
   - Log in
   - View an investor profile
   - Credits should decrease correctly
   - Log out and log back in
   - Credits should still show the decreased amount

### Console Logs

You'll now see different messages:

**For existing users:**
```
Session found, checking/creating user: [user-id]
Existing user found, updating last_login only
User last_login updated successfully
```

**For new users:**
```
Session found, checking/creating user: [user-id]
New user, creating with default credits
New user successfully created in database
```

### Impact

This fix ensures:
- ✅ Credit tracking is accurate
- ✅ Users don't lose their usage history
- ✅ The system can properly enforce credit limits
- ✅ Analytics on credit usage are reliable

### Related Issues

This bug was introduced when fixing the "user not created on first login" issue. The original fix used `upsert()` to ensure users were created, but didn't account for the fact that `upsert()` would overwrite existing data.

**Lesson learned:** Use `upsert()` carefully! For user records where you want to preserve certain fields (like credits, usage stats, etc.), use a check-then-insert-or-update pattern instead.

---

## Summary of All Auth Fixes

1. ✅ **User Creation Bug** - Users now created on first login
2. ✅ **Logout Race Condition** - Logout now works reliably with spinner
3. ✅ **Credit Update Race Condition** - Credits update atomically
4. ✅ **Credits Reset Bug** - Credits no longer reset on login

Your auth flow is now solid! 🎉
