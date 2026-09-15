# MyFundingList — Session Handoff (2026-09-16)

## Current Objective

Build the approved transactional/product-triggered email lifecycle on an isolated branch, using Vercel + Supabase + Resend only. No marketing or re-engagement campaigns are in scope.

## Branches and Workspaces

- Main workspace: `/Users/saqlainrashid/Developer/Personal/MyFundingList/mystartupinvestors`
  - Branch: `main`
  - User-owned/pre-existing uncommitted changes: `package.json`, `package-lock.json`.
  - Agent-created but uncommitted local contact/template work: `src/app/api/contact/route.ts`, `src/lib/transactional-email.ts`, `tests/api/contact.test.ts`, `tests/lib/transactional-email.test.ts`, `.lavish/`.
- Isolated implementation worktree: `/Users/saqlainrashid/Developer/Personal/MyFundingList/mystartupinvestors/.worktrees/transactional-email-lifecycle`
  - Branch: `feat/transactional-email-lifecycle`
  - Remote branch exists: `origin/feat/transactional-email-lifecycle`.
  - The branch was pushed at plan baseline; it is now ahead locally by the Task 1 commit.

## What Is Committed and Pushed

1. `77b30b7 docs: define transactional email lifecycle`
   - Design/spec: `docs/superpowers/specs/2026-09-16-transactional-email-lifecycle-design.md`.
2. `2e05c2e docs: plan transactional email lifecycle`
   - Execution plan: `docs/superpowers/plans/2026-09-16-transactional-email-lifecycle.md`.
3. `2bbd862 chore: ignore local worktrees`
   - Adds `.worktrees/` to `.gitignore`.
4. `2f9d120 feat: add durable email outbox`
   - Present only locally on `feat/transactional-email-lifecycle` until the review fix is committed and the branch is pushed.

## Verification Already Completed

- Clean isolated baseline: `npm test` = 17 tests passing; `npm run lint` passed.
- Isolated production build passed when root `.env` and `.env.local` were sourced read-only:
  ```bash
  cd .worktrees/transactional-email-lifecycle
  set -a; source ../../.env; source ../../.env.local; set +a; npm run build
  ```
- Resend sender test succeeded. A branded-template test was accepted by Resend to `saqlain@marslab.studio` with delivery ID `427ae03e-55bd-4be0-a6a6-ac0761b8357e`; the user confirmed it looked good.

## Email Plan Completion Status

### Product/design plan: complete

The user approved 15 customer emails and 2 internal notices:

- Welcome, startup submitted, contact acknowledgement.
- Purchase receipt and payment failure.
- Investor-credit low/zero, calculator-credit low/zero.
- Affiliate ready, referral joined, commission earned, $76 withdrawal-ready, withdrawal requested, withdrawal status.
- Internal contact and startup-review notices.

The plan explicitly excludes refunds until a reliable refund event exists, and excludes all marketing/re-engagement sequences.

### Production implementation: not complete

No new lifecycle email is yet active in the deployed app. The durable outbox foundation is the only implementation task started.

#### Task 1: durable outbox — implementation under review fix

Initial commit `2f9d120` added:

- `supabase/migrations/12_email_outbox.sql`
- `src/lib/email/types.ts`
- `src/lib/email/outbox.ts`
- `tests/lib/email/outbox.test.ts`

Initial focused verification passed: 2 tests + `npx tsc --noEmit`.

The independent review found these blockers:

1. Critical: claimed `sending` events can be stranded forever if a process dies before final status update; add a lease/reclaim path.
2. Important: prohibit bank/IFSC/account/contact payload keys in the SQL/RPC boundary, not only TypeScript.
3. Important: add `import "server-only"` to outbox helper.
4. Minor: detect zero-row/invalid state transitions, and test claim/reclaim transitions.

The review remediation is now committed as `afbf1c2 fix: harden durable email outbox` in the isolated worktree. It adds a 15-minute reclaim lease, database/RPC payout-payload protection, server-only enforcement, strict transition checks, six focused tests, and a disposable PostgreSQL migration test. A fresh independent re-review is still required before starting Task 2 or pushing these commits.

## Exact Next Steps

1. Generate a new Task 1 review package from `2bbd862` to `afbf1c2` and run a fresh task reviewer. Do not start Task 2 until review passes.
3. Push the branch after Task 1 review passes.
4. Execute plan Tasks 2–7 in order using fresh implementation agents and task reviews. Task 5 and Task 6 both edit the Dodo webhook, so they must be sequential.
5. Run full `npm test`, `npm run lint`, and production build before claiming completion. Deploy/database migration work must be explicitly coordinated; migrations have not been applied to live Supabase.

## Separate Product Issues — Audited, Not Implemented

These are deliberately not mixed into the email branch:

### 1. Contact page shows false `0 credits`

- Cause: `/contact` uses `SmartNavbar`; authenticated navbar reads `CreditsContext` fallback of 0 because the public page lacks the real investor `CreditsProvider`.
- Small scoped fix: add `hideCreditUi?: boolean` to authenticated navbar/SmartNavbar and pass it only from `/contact`; hide desktop/mobile investor badge and purchase CTA, not profile/menu. Keep tools pages unchanged because they use calculator-status UI.
- Audit agent: `/root/contact_credit_audit`.

### 2. All calculator buttons lack loading and double-click protection

- Cause: all 10 calculators use `isLoading` only for initial credit status fetch; `consumeCredit()` does not set a submission pending state. Fast double-clicks can consume two legitimate credits.
- Recommended fix: a reusable single-flight `useCalculationSubmission` hook with a synchronous ref lock plus React pending state. Disable all calculation buttons with `aria-busy` and `Calculating…` during the request.
- Audit agent: `/root/calculator_loader_audit`.

### 3. Weekly calculator/site credit system

- Current issues: rolling lazy seven-day reset, 3-versus-5 credit inconsistency, unstable reset display, anonymous off-by-one use bug, null/unknown plan fails open to unlimited.
- Recommended model: UTC Monday calendar-week entitlement, free = 5 calculator uses/week, paid = unlimited, explicit `remaining` and `resetAt`, server-side idempotent consumption. Investor credits remain non-expiring and separate.
- This requires its own versioned migration/RPC/API/UI/test project. It is architectural and should be specified/planned as a separate branch after email lifecycle work.
- Audit agent: `/root/weekly_credit_audit`.

## Safety Notes

- `.env.local` and `.env` contain credentials. Never commit, print, or copy them into a worktree.
- Live Vercel still needs `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and later `CRON_SECRET`; `.env.local` does not deploy automatically.
- Use `gh-axi`/Git only for intended repository operations. Do not push unfinished Task 1 until the review fix is approved.
