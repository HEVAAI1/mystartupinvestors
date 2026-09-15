# MyFundingList Transactional Email Lifecycle Design

## Goal

Deliver clear, branded, non-marketing emails for material MyFundingList account and product events, without duplicate sends under retries or user refreshes.

## Scope

The system covers transactional and product-triggered messages only. It excludes newsletters, campaigns, inactivity/re-engagement mail, and refunds until a reliable refund event exists.

## Delivery Architecture

1. Product code completes its authoritative database mutation.
2. The same mutation records one durable outbox event with a unique event key.
3. A server-side dispatcher renders the shared MyFundingList transactional template and sends through Resend.
4. The outbox stores the Resend delivery ID, send state, attempts, and error details.
5. A protected Vercel Cron endpoint retries pending, retryable events. It never re-sends a delivered event.

Vercel hosts the dispatcher and Cron route; Supabase stores event/delivery state; Resend sends from the verified `CONTACT_FROM_EMAIL` identity. The live Vercel environment requires `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and a new `CRON_SECRET`.

## Data Model

Create `email_outbox` with:

- `id` UUID primary key
- `event_key` unique text: immutable idempotency key
- `event_type` constrained text
- `user_id` UUID nullable for internal notices
- `recipient_email` text
- `payload` JSONB: non-sensitive template data only
- `status`: `pending`, `sending`, `sent`, `failed`
- `attempt_count`, `last_error`, `resend_email_id`, `sent_at`, `created_at`, `updated_at`

The dispatcher may claim only pending or retryable failed rows. A successful delivery stores `resend_email_id` and `sent_at`. It must not log API keys, full contact messages, bank details, account numbers, or IFSC values.

## Shared Template

`renderTransactionalEmail` is the single renderer. It provides a MyFundingList logo, warm cream background, white content card, dark olive CTA, support link, website link, plain-text fallback, and escaped user-provided content. New template variants add structured receipt/status blocks without creating a second layout system.

## Customer Events

| Event type | Trigger | Recipient | Key / re-arm rule | Content |
|---|---|---|---|---|
| `welcome` | New OAuth user/profile created | User | `welcome:{user_id}` | Account ready, 5 free investor unlocks, explore-investors CTA. |
| `startup_submitted` | Startup lead and submitted flag saved | Founder | `startup_submitted:{startup_id}` | Submission receipt, company name, update-profile CTA. |
| `contact_received` | Valid contact request accepted | Submitter | `contact_received:{request_id}` | Acknowledge subject and reply expectation. |
| `purchase_receipt` | Transaction and credit grant both durable | Buyer | `purchase_receipt:{payment_id}` | Plan, USD amount, credits added, payment ID, dashboard CTA. |
| `payment_failed` | Failed payment record durable | Buyer | `payment_failed:{payment_id}` | Neutral retry/support guidance; never expose decline details. |
| `investor_credits_low` | First unlock leaves paid balance ≤10, free balance ≤2 | User | `investor_credits_low:{user_id}:{credit_cycle}` | Remaining unlocks, explanation, get-credits CTA. |
| `investor_credits_zero` | First unlock leaves balance 0 | User | `investor_credits_zero:{user_id}:{credit_cycle}` | Credits used, get-credits CTA. |
| `calculator_credits_low` | Authenticated free user has 1 weekly calculator use remaining | User | `calculator_credits_low:{user_id}:{reset_at}` | Remaining weekly use, reset context, plans CTA. |
| `calculator_credits_zero` | Authenticated free user has 0 weekly uses remaining | User | `calculator_credits_zero:{user_id}:{reset_at}` | Reset context and plans CTA. |
| `affiliate_ready` | Affiliate registration succeeds | Affiliate | `affiliate_ready:{affiliate_id}` | Unique link, earnings overview. |
| `affiliate_referral_joined` | Referral attribution succeeds | Referring affiliate | `affiliate_referral_joined:{affiliate_id}:{referred_user_id}` | Referral recorded; no sensitive referral data. |
| `affiliate_commission_earned` | Commission row and balance update succeed | Affiliate | `affiliate_commission_earned:{payment_id}` | Commission amount, updated available balance, $76 threshold context. |
| `affiliate_withdrawal_available` | Available balance first reaches $76 | Affiliate | `affiliate_withdrawal_available:{affiliate_id}:{threshold_cycle}` | Available amount, request-withdrawal CTA. |
| `withdrawal_requested` | Withdrawal request persisted | Affiliate | `withdrawal_requested:{withdrawal_id}` | Amount/reference only; never payment-account details. |
| `withdrawal_status` | Admin commits a status transition | Affiliate | `withdrawal_status:{withdrawal_id}:{status}` | Approved/rejected/paid copy, amount, support CTA. |

## Internal Notices

- `internal_contact_request:{request_id}`: existing contact notification, rendered in the shared template with reply-to set to the submitter.
- `internal_startup_submitted:{startup_id}`: review-team notice containing a secure admin/dashboard link, not raw sensitive startup content.

## Boundary Rules

- Do not send email for every investor unlock or calculator use.
- Do not send low/zero email for a failed insufficient-credit attempt or a repeated unlock.
- Do not send calculator messages to anonymous or paid users.
- Re-arm investor credit notices only after a new purchase credit cycle; re-arm calculator notices after a persisted weekly reset.
- Do not add refund mail until a validated Dodo refund event or manual refund state transition is implemented.
- Supabase authentication owns password/reset/verification notices; this system must not duplicate them.

## Reliability and Safety

The current Dodo webhook’s transaction uniqueness does not itself make email idempotent, and its transaction insert precedes credit grant. Receipt outbox insertion must occur only after the credit grant is durably complete. Existing failures must remain retryable without blocking the original business action. Email delivery failures are recorded and retried asynchronously; they do not reverse a completed payment, credit allocation, withdrawal status, or startup submission.

## Verification

- Unit test the shared renderer’s escaped HTML/text output and structured content.
- Route tests prove each event enqueues exactly once under retries/duplicate calls.
- Dispatcher tests cover sent, retryable provider failure, non-retryable provider failure, and no resend after `sent`.
- Migration/RPC tests verify unique event keys and no bank data in withdrawal payloads.
- Send approved branded preview emails to `saqlain@marslab.studio` for visual QA only.
