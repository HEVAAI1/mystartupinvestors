# Transactional Email Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver durable, branded transactional and product-triggered emails for account, billing, credit, startup, contact, and affiliate events.

**Architecture:** Product mutations enqueue immutable, uniquely keyed `email_outbox` records only after their durable state changes succeed. A shared dispatcher renders a single MyFundingList template and sends through Resend; a protected Vercel Cron route retries pending events. Business routes never duplicate delivery on request or webhook retries.

**Tech Stack:** Next.js App Router, TypeScript, Supabase SQL/RPC, Resend, Vercel Cron, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-16-transactional-email-lifecycle-design.md`

## Global Constraints

- Build transactional and product-triggered mail only; no newsletters, campaigns, inactivity, or re-engagement sequences.
- Use `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and protected `CRON_SECRET`; never expose their values in client code or logs.
- Use one shared renderer with MyFundingList logo, warm cream/white/dark-olive visual system, support footer, escaped content, and plain-text fallback.
- Enqueue only after the authoritative mutation succeeds; delivery failures never reverse business state.
- Every email has a unique immutable `event_key`; no repeated sends on duplicate webhook delivery, repeated unlock, or browser retry.
- Never include contact-message bodies, bank account numbers, IFSC, or other sensitive payout details in stored payloads or outbound affiliate mail.
- Receipt events occur only after credits are durably granted. Refund mail is explicitly excluded.

---

## File Structure

| File | Responsibility |
|---|---|
| `supabase/migrations/13_email_outbox.sql` | Outbox schema, RLS, event-key uniqueness, atomic enqueue RPC. |
| `src/lib/email/types.ts` | Event type, payload, status, and dispatcher interfaces. |
| `src/lib/email/templates.ts` | Shared branded renderer and typed template variants. |
| `src/lib/email/outbox.ts` | Server-only enqueue/read/claim/send-result helpers. |
| `src/lib/email/dispatcher.ts` | Resolves one pending event into a template and sends via Resend. |
| `src/app/api/cron/email-dispatch/route.ts` | CRON_SECRET-protected retry endpoint. |
| `vercel.json` | Daily/periodic Cron schedule for retrying pending events. |
| Existing API routes | Enqueue lifecycle events at post-mutation boundaries. |
| `tests/lib/email/*.test.ts`, `tests/api/*.test.ts` | Renderer, outbox, dispatcher, and route behavior tests. |

### Task 1: Durable email outbox and server interfaces

**Files:**
- Create: `supabase/migrations/13_email_outbox.sql`
- Create: `src/lib/email/types.ts`
- Create: `src/lib/email/outbox.ts`
- Test: `tests/lib/email/outbox.test.ts`

**Interfaces:**
- Produces `EmailEventType`, `EmailOutboxPayload`, `enqueueEmailEvent(input)`, `claimPendingEmailEvents(limit)`, `markEmailSent(id, resendEmailId)`, and `markEmailAttemptFailed(id, message, retryable)`.
- Consumed by dispatcher and all product-event routes.

- [ ] **Step 1: Write failing outbox tests**

```ts
it("enqueues one event for a repeated event key", async () => {
  await enqueueEmailEvent(receiptInput("purchase_receipt:pay_1"));
  await enqueueEmailEvent(receiptInput("purchase_receipt:pay_1"));
  expect(insertedRows()).toHaveLength(1);
});

it("does not persist withdrawal bank fields in payload", async () => {
  await expect(enqueueEmailEvent({ ...withdrawalInput, payload: { account_number: "123" } }))
    .rejects.toThrow("sensitive payout fields are not allowed");
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- tests/lib/email/outbox.test.ts`

Expected: the module/import is missing.

- [ ] **Step 3: Add the SQL migration and typed helpers**

```sql
create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  user_id uuid references public.users(id),
  recipient_email text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  attempt_count integer not null default 0,
  last_error text,
  resend_email_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Implement `enqueueEmailEvent` as an `insert(...).select().maybeSingle()` call that treats unique-key conflict as an existing event, not an error. Reject payload keys matching `account`, `ifsc`, `bank`, or `contact_number`.

- [ ] **Step 4: Run the outbox tests and TypeScript check**

Run: `npm test -- tests/lib/email/outbox.test.ts && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/13_email_outbox.sql src/lib/email/types.ts src/lib/email/outbox.ts tests/lib/email/outbox.test.ts
git commit -m "feat: add durable email outbox"
```

### Task 2: Branded template variants and dispatcher

**Files:**
- Create: `src/lib/email/templates.ts`
- Create: `src/lib/email/dispatcher.ts`
- Modify: `src/app/api/contact/route.ts`
- Test: `tests/lib/email/templates.test.ts`
- Test: `tests/lib/email/dispatcher.test.ts`

**Interfaces:**
- Consumes `EmailOutboxEvent` from Task 1.
- Produces `renderEmailEvent(event): { subject, html, text }` and `dispatchEmailEvent(event): Promise<'sent'|'retryable_failure'|'permanent_failure'>`.

- [ ] **Step 1: Write failing renderer and dispatcher tests**

```ts
it("renders a purchase receipt with plan, amount, credits and dashboard CTA", () => {
  const email = renderEmailEvent(receiptEvent({ plan: "professional", amountUsd: 19, credits: 60 }));
  expect(email.subject).toBe("Your 60 MyFundingList credits are ready");
  expect(email.html).toContain("$19.00");
  expect(email.html).toContain("https://www.myfundinglist.com/dashboard");
  expect(email.text).toContain("support@myfundinglist.com");
});

it("marks a successful provider result as sent and never sends a sent event", async () => {
  await dispatchEmailEvent(pendingEvent());
  await dispatchEmailEvent(sentEvent());
  expect(resendSend).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- tests/lib/email/templates.test.ts tests/lib/email/dispatcher.test.ts`

Expected: missing renderer/dispatcher modules.

- [ ] **Step 3: Implement renderer and dispatcher**

Use the existing visual template as the base layout. Add typed variants for all spec event types; each variant supplies precise title, greeting, body, CTA, and only permitted structured fields. The dispatcher maps Resend `invalid_from_address`/other 4xx configuration failures to permanent failure, and 429/5xx/network failures to retryable failure. It writes the provider email ID on success.

- [ ] **Step 4: Move contact mail onto the dispatcher**

For a valid contact request, enqueue both `contact_received:{request_id}` to the submitter and `internal_contact_request:{request_id}` to the support recipients. Use the original submitter as `replyTo` only for the internal event. Preserve honeypot, Zod validation, and rate limiting.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- tests/lib/email/templates.test.ts tests/lib/email/dispatcher.test.ts tests/api/contact.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/email/templates.ts src/lib/email/dispatcher.ts src/app/api/contact/route.ts tests/lib/email/templates.test.ts tests/lib/email/dispatcher.test.ts tests/api/contact.test.ts
git commit -m "feat: add branded email dispatcher"
```

### Task 3: Vercel retry delivery path

**Files:**
- Create: `src/app/api/cron/email-dispatch/route.ts`
- Create or modify: `vercel.json`
- Test: `tests/api/email-dispatch-cron.test.ts`

**Interfaces:**
- Consumes `claimPendingEmailEvents(25)` and `dispatchEmailEvent`.
- Produces a protected scheduled route returning `{ processed, sent, retryableFailures, permanentFailures }`.

- [ ] **Step 1: Write failing Cron authorization and retry tests**

```ts
it("rejects a request without the CRON_SECRET bearer token", async () => {
  expect((await GET(new Request("http://localhost/api/cron/email-dispatch"))).status).toBe(401);
});

it("dispatches each claimed pending event and reports delivery counts", async () => {
  const response = await GET(cronRequest());
  expect(await response.json()).toEqual({ processed: 2, sent: 1, retryableFailures: 1, permanentFailures: 0 });
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- tests/api/email-dispatch-cron.test.ts`

Expected: route import missing.

- [ ] **Step 3: Implement protected bounded dispatcher route and schedule**

Require `Authorization: Bearer ${process.env.CRON_SECRET}` with a timing-safe string comparison. Claim at most 25 events per invocation. Add Vercel Cron at `/api/cron/email-dispatch` every 15 minutes. Do not expose event payloads in the HTTP response.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- tests/api/email-dispatch-cron.test.ts tests/lib/email/dispatcher.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/cron/email-dispatch/route.ts vercel.json tests/api/email-dispatch-cron.test.ts
git commit -m "feat: retry transactional email delivery"
```

### Task 4: Account, startup, and credit lifecycle events

**Files:**
- Modify: `src/app/auth/callback/complete/route.ts`
- Modify: `src/app/api/startups/route.ts`
- Modify: `src/app/api/investors/[id]/unlock/route.ts`
- Modify: `src/app/api/calculations/use-credit/route.ts`
- Test: `tests/api/email-account-credit-events.test.ts`

**Interfaces:**
- Consumes Task 1 enqueue helper and Task 2 template event payloads.
- Produces `welcome`, `startup_submitted`, `internal_startup_submitted`, investor low/zero, and calculator low/zero outbox events.

- [ ] **Step 1: Write failing route behavior tests**

```ts
it("enqueues welcome only when the OAuth callback creates a new user", async () => {
  await completeCallback(newUserFixture());
  await completeCallback(existingUserFixture());
  expect(enqueuedTypes()).toEqual(["welcome"]);
});

it("enqueues paid investor low-credit once when a first unlock leaves ten credits", async () => {
  await unlockInvestor({ remaining: 10, alreadyUnlocked: false });
  expect(enqueuedTypes()).toEqual(["investor_credits_low"]);
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- tests/api/email-account-credit-events.test.ts`

Expected: events are absent.

- [ ] **Step 3: Enqueue post-mutation events**

After new-user upsert, startup persistence, returned first-unlock balance, and authenticated free calculator decrement, enqueue the exact event keys from the spec. Use paid low threshold 10, free investor low threshold 2, calculator low threshold 1, and zero threshold 0. Skip anonymous, paid calculator users, repeated unlocks, failed unlocks, and existing OAuth users.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- tests/api/email-account-credit-events.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/auth/callback/complete/route.ts src/app/api/startups/route.ts src/app/api/investors/[id]/unlock/route.ts src/app/api/calculations/use-credit/route.ts tests/api/email-account-credit-events.test.ts
git commit -m "feat: notify account and credit lifecycle events"
```

### Task 5: Payment receipt and failed-payment events

**Files:**
- Modify: `src/app/api/webhooks/dodo/route.ts`
- Modify: `src/app/(app)/payment-success/page.tsx`
- Test: `tests/api/payment-email-events.test.ts`

**Interfaces:**
- Consumes product data from `DODO_PRODUCT_MAP`, user profile email/name, and Task 1 outbox.
- Produces post-credit `purchase_receipt:{payment_id}` and durable `payment_failed:{payment_id}` events.

- [ ] **Step 1: Write failing webhook tests**

```ts
it("enqueues one receipt only after successful credit allocation", async () => {
  const response = await POST(signedSuccessWebhook());
  expect(response.status).toBe(200);
  expect(enqueuedEvent().event_key).toBe("purchase_receipt:pay_1");
});

it("does not enqueue a receipt when the credit RPC fails", async () => {
  await POST(signedSuccessWebhookWithCreditFailure());
  expect(enqueuedEvents()).toEqual([]);
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- tests/api/payment-email-events.test.ts`

Expected: receipt event is absent.

- [ ] **Step 3: Repair idempotent webhook sequencing and add events**

Fetch buyer email/name through the server-side user profile after signature verification. Persist/handle the payment idempotently, grant credits, then enqueue the receipt. If the current transaction-first sequence makes credit retry unrecoverable, move transaction and credit update into one Supabase RPC before enqueueing. Enqueue failed-payment mail only after a durable failed transaction record; update the success UI so it promises a receipt only when this flow exists.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- tests/api/payment-email-events.test.ts tests/api/webhook-signature.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/webhooks/dodo/route.ts src/app/(app)/payment-success/page.tsx tests/api/payment-email-events.test.ts
git commit -m "feat: send payment lifecycle receipts"
```

### Task 6: Affiliate lifecycle and withdrawal events

**Files:**
- Modify: `src/app/api/affiliate/register/route.ts`
- Modify: `src/app/api/affiliate/link-referral/route.ts`
- Modify: `src/app/api/affiliate/withdraw/route.ts`
- Modify: `src/app/api/admin/withdrawals/[id]/route.ts`
- Modify: `src/app/api/webhooks/dodo/route.ts`
- Test: `tests/api/affiliate-email-events.test.ts`

**Interfaces:**
- Consumes Task 1 outbox and affiliate/commission/withdrawal records.
- Produces affiliate registration, referral, commission, $76 threshold, withdrawal request, and withdrawal-status events.

- [ ] **Step 1: Write failing lifecycle tests**

```ts
it("enqueues a withdrawal-available event only when commission balance crosses $76", async () => {
  await recordCommission({ previousBalance: 70, commission: 6 });
  await recordCommission({ previousBalance: 76, commission: 5 });
  expect(enqueuedTypes()).toEqual(["affiliate_withdrawal_available"]);
});

it("does not put account number or IFSC in withdrawal email payload", async () => {
  await requestWithdrawal(withdrawalFixture());
  expect(enqueuedEvent().payload).not.toHaveProperty("account_number");
  expect(enqueuedEvent().payload).not.toHaveProperty("ifsc_code");
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- tests/api/affiliate-email-events.test.ts`

Expected: events are absent.

- [ ] **Step 3: Add post-mutation affiliate events**

Enqueue affiliate-ready after registration; referral-joined after single attribution; commission-earned after both commission insert and balance update; withdrawal-available only when balance crosses from below $76; withdrawal-requested after creation; withdrawal-status after the atomic admin transition. Use status-specific event keys and payloads containing only amount, reference, status, and dashboard links.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- tests/api/affiliate-email-events.test.ts tests/lib/affiliate-commission.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/affiliate/register/route.ts src/app/api/affiliate/link-referral/route.ts src/app/api/affiliate/withdraw/route.ts src/app/api/admin/withdrawals/[id]/route.ts src/app/api/webhooks/dodo/route.ts tests/api/affiliate-email-events.test.ts
git commit -m "feat: notify affiliate lifecycle events"
```

### Task 7: Integration, visual QA, and operational handoff

**Files:**
- Modify: `README.md`
- Test: `tests/api/contact.test.ts`
- Test: all email test files

**Interfaces:**
- Consumes all prior tasks.
- Produces deployment instructions and verified email previews.

- [ ] **Step 1: Add environment and Cron setup documentation**

Document `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CRON_SECRET` by variable name only. State that `.env.local` does not deploy to Vercel and list the live Vercel configuration requirement.

- [ ] **Step 2: Run the full automated suite**

Run: `npm test && npm run lint && npm run build`

Expected: all tests, lint, type checks, and production build pass.

- [ ] **Step 3: Send visual QA previews**

Send the shared-template payment receipt, low-credit alert, affiliate commission, and withdrawal-paid preview emails only to `saqlain@marslab.studio`. Record Resend delivery IDs in the task report, not source code.

- [ ] **Step 4: Commit**

```bash
git add README.md tests
git commit -m "docs: document transactional email operations"
```
