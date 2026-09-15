import { beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "standardwebhooks";

process.env.DODO_PAYMENTS_API_KEY ??= "test_api_key";
process.env.DODO_PAYMENTS_WEBHOOK_SECRET ??= "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";

vi.mock("server-only", () => ({}));

type EnqueueInput = { eventKey: string; eventType: string; payload: Record<string, unknown> };
const enqueueEmailEvent = vi.fn<(input: EnqueueInput) => Promise<Record<string, unknown>>>(async () => ({}));
vi.mock("@/lib/email/outbox", () => ({
    enqueueEmailEvent: (input: EnqueueInput) => enqueueEmailEvent(input),
}));

let affiliateBalance: { total_earned: number; total_paid: number } = { total_earned: 0, total_paid: 0 };
const affiliateOwnerUserId = "affiliate-owner";
let ownerEmail: string | null = "affiliate-owner@example.com";
let existingCommissionForPayment = false;
let openWithdrawals: Array<{ amount: number }> = [];

const adminRpc = vi.fn(async (fn: string) => {
    if (fn === "record_payment_and_grant_credits") return { data: { granted: true, duplicate: false }, error: null };
    if (fn === "add_commission") {
        // The real RPC atomically increments total_earned; mirror that here.
        affiliateBalance = { ...affiliateBalance, total_earned: affiliateBalance.total_earned };
        return { error: null };
    }
    throw new Error(`unexpected rpc: ${fn}`);
});

const adminFrom = vi.fn((table: string) => {
    if (table === "users") {
        return {
            select: (columns: string) => ({
                eq: () => ({
                    maybeSingle: async () => {
                        if (columns.includes("email") && !columns.includes("name")) {
                            // affiliate-recipients.ts's owner-email lookup
                            return { data: ownerEmail ? { email: ownerEmail } : null };
                        }
                        return { data: { email: "buyer@example.com", name: "Buyer" } };
                    },
                }),
            }),
        };
    }
    if (table === "referrals") {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { affiliate_id: "aff-1" } }) }) }) };
    }
    if (table === "affiliates") {
        return {
            select: (columns: string) => ({
                eq: (column: string) => ({
                    maybeSingle: async () => {
                        if (columns === "user_id") return { data: { user_id: affiliateOwnerUserId } };
                        if (columns.includes("total_earned")) return { data: { ...affiliateBalance } };
                        throw new Error(`unexpected affiliates select: ${columns} eq ${column}`);
                    },
                }),
            }),
        };
    }
    if (table === "transactions") {
        return { insert: async () => ({ error: null }) };
    }
    if (table === "commissions") {
        return {
            insert: async () => (existingCommissionForPayment ? { error: { code: "23505" } } : { error: null }),
        };
    }
    if (table === "withdrawal_requests") {
        return { select: () => ({ eq: () => ({ in: async () => ({ data: openWithdrawals, error: null }) }) }) };
    }
    throw new Error(`unexpected table: ${table}`);
});

vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseAdminClient: () => ({ from: adminFrom, rpc: adminRpc }),
}));

const { POST } = await import("@/app/api/webhooks/dodo/route");

const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET!;
const wh = new Webhook(webhookSecret);

function succeededPayload(paymentId: string) {
    return JSON.stringify({
        business_id: "biz_1",
        type: "payment.succeeded",
        timestamp: new Date().toISOString(),
        data: {
            payload_type: "Payment",
            payment_id: paymentId,
            metadata: { user_id: "user-1" },
            product_cart: [{ product_id: "pdt_0NbbbqCdfuGTpxX9KDNwm" }],
            billing: { country: "US" },
        },
    });
}

function signedRequest(payload: string) {
    const id = "msg_1";
    const timestamp = new Date();
    const signature = wh.sign(id, timestamp, payload);

    return new Request("http://localhost/api/webhooks/dodo", {
        method: "POST",
        body: payload,
        headers: {
            "webhook-id": id,
            "webhook-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
            "webhook-signature": signature,
        },
    }) as unknown as Parameters<typeof POST>[0];
}

function affiliateEventTypes() {
    return enqueueEmailEvent.mock.calls
        .map(([input]) => input.eventType)
        .filter((eventType) => eventType.startsWith("affiliate_"));
}

describe("Dodo webhook affiliate commission emails", () => {
    beforeEach(() => {
        enqueueEmailEvent.mockClear();
        existingCommissionForPayment = false;
        ownerEmail = "affiliate-owner@example.com";
        openWithdrawals = [];
    });

    it("enqueues a withdrawal-available event only when commission balance crosses $76", async () => {
        // pdt_0NbbbqCdfuGTpxX9KDNwm -> professional plan, price $19 (see
        // src/lib/dodo-config.ts) -> 25% commission = $4.75 per payment.
        affiliateBalance = { total_earned: 65.2, total_paid: 0 }; // below $76
        await POST(signedRequest(succeededPayload("pay_1")));
        expect(affiliateEventTypes()).toEqual(["affiliate_commission_earned"]);

        enqueueEmailEvent.mockClear();
        affiliateBalance = { total_earned: 71.25, total_paid: 0 }; // + 4.75 = 76.00, crosses
        await POST(signedRequest(succeededPayload("pay_2")));
        expect(affiliateEventTypes()).toEqual(["affiliate_commission_earned", "affiliate_withdrawal_available"]);
    });

    it("does not enqueue affiliate_commission_earned twice for a duplicate commission delivery", async () => {
        existingCommissionForPayment = true;
        affiliateBalance = { total_earned: 100, total_paid: 0 };

        await POST(signedRequest(succeededPayload("pay_dup")));

        expect(affiliateEventTypes()).toEqual([]);
    });

    it("does not enqueue commission emails when the affiliate has no resolvable email", async () => {
        ownerEmail = null;
        affiliateBalance = { total_earned: 100, total_paid: 0 };

        await POST(signedRequest(succeededPayload("pay_3")));

        expect(affiliateEventTypes()).toEqual([]);
    });

    it("excludes open (pending/approved) withdrawal amounts from the emailed available balance", async () => {
        affiliateBalance = { total_earned: 100, total_paid: 0 };
        openWithdrawals = [{ amount: 80 }];

        await POST(signedRequest(succeededPayload("pay_4")));

        const commissionEvent = enqueueEmailEvent.mock.calls.find(
            ([input]) => input.eventType === "affiliate_commission_earned"
        )?.[0];
        // (100 - 0 - 80 open) + 4.75 commission = 24.75, not 104.75.
        expect(commissionEvent?.payload.availableBalanceUsd).toBe(24.75);
    });
});
