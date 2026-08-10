import { describe, expect, it, vi, beforeEach } from "vitest";
import { Webhook } from "standardwebhooks";

process.env.DODO_PAYMENTS_API_KEY ??= "test_api_key";
process.env.DODO_PAYMENTS_WEBHOOK_SECRET ??= "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";

const transactionsInsert = vi.fn(async () => ({ error: null }));
const transactionsMaybeSingle = vi.fn(async () => ({ data: null }));
const usersSingle = vi.fn(async () => ({ data: { credits_allocated: 0, calculation_credits: 0 } }));
const usersUpdateEq = vi.fn(async () => ({ error: null }));
const referralsMaybeSingle = vi.fn(async () => ({ data: null }));
const adminFrom = vi.fn();

vi.mock("@/lib/supabaseServer", () => ({
  createSupabaseAdminClient: () => ({ from: adminFrom }),
}));

function configureAdminFrom() {
  adminFrom.mockImplementation((table: string) => {
    if (table === "transactions") {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: transactionsMaybeSingle,
          }),
        }),
        insert: transactionsInsert,
      };
    }

    if (table === "users") {
      return {
        select: () => ({
          eq: () => ({
            single: usersSingle,
          }),
        }),
        update: () => ({
          eq: usersUpdateEq,
        }),
      };
    }

    if (table === "referrals") {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: referralsMaybeSingle,
          }),
        }),
      };
    }

    throw new Error(`unexpected table: ${table}`);
  });
}

const { POST } = await import("@/app/api/webhooks/dodo/route");

const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET!;
const wh = new Webhook(webhookSecret);

function paymentSucceededPayload() {
  return JSON.stringify({
    business_id: "biz_1",
    type: "payment.succeeded",
    timestamp: new Date().toISOString(),
    data: {
      payload_type: "Payment",
      payment_id: "pay_1",
      metadata: { user_id: "user-1" },
      product_cart: [{ product_id: "pdt_0NbbbqCdfuGTpxX9KDNwm" }],
      billing: { country: "US" },
    },
  });
}

function signedHeaders(payload: string, overrides: Partial<Record<string, string>> = {}) {
  const id = "msg_1";
  const timestamp = new Date();
  const signature = wh.sign(id, timestamp, payload);

  return {
    "webhook-id": id,
    "webhook-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
    "webhook-signature": signature,
    ...overrides,
  };
}

function makeRequest(payload: string, headers: Record<string, string>) {
  return new Request("http://localhost/api/webhooks/dodo", {
    method: "POST",
    body: payload,
    headers,
  }) as unknown as Parameters<typeof POST>[0];
}

function allWritesUncalled() {
  expect(transactionsInsert).not.toHaveBeenCalled();
  expect(usersUpdateEq).not.toHaveBeenCalled();
}

beforeEach(() => {
  transactionsInsert.mockClear();
  transactionsMaybeSingle.mockClear();
  usersSingle.mockClear();
  usersUpdateEq.mockClear();
  referralsMaybeSingle.mockClear();
  adminFrom.mockReset();
  configureAdminFrom();
});

describe("POST /api/webhooks/dodo signature verification", () => {
  it("rejects a request with no signature headers and performs no writes", async () => {
    const payload = paymentSucceededPayload();
    const request = makeRequest(payload, {});

    const response = await POST(request);

    expect(response.status).toBe(401);
    allWritesUncalled();
  });

  it("rejects a malformed signature and performs no writes", async () => {
    const payload = paymentSucceededPayload();
    const headers = signedHeaders(payload, { "webhook-signature": "not-a-real-signature" });
    const request = makeRequest(payload, headers);

    const response = await POST(request);

    expect(response.status).toBe(401);
    allWritesUncalled();
  });

  it("rejects a signature produced with the wrong key and performs no writes", async () => {
    const payload = paymentSucceededPayload();
    const wrongKeyWh = new Webhook("whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaAA");
    const id = "msg_1";
    const timestamp = new Date();
    const badSignature = wrongKeyWh.sign(id, timestamp, payload);

    const request = makeRequest(payload, {
      "webhook-id": id,
      "webhook-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
      "webhook-signature": badSignature,
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    allWritesUncalled();
  });

  it("accepts a correctly signed payload and processes it", async () => {
    const payload = paymentSucceededPayload();
    const headers = signedHeaders(payload);
    const request = makeRequest(payload, headers);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(transactionsInsert).toHaveBeenCalledTimes(1);
    expect(usersUpdateEq).toHaveBeenCalledTimes(1);
  });
});
