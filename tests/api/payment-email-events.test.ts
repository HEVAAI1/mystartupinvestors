import { beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "standardwebhooks";

process.env.DODO_PAYMENTS_API_KEY ??= "test_api_key";
process.env.DODO_PAYMENTS_WEBHOOK_SECRET ??= "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";

vi.mock("server-only", () => ({}));

type EnqueueInput = { eventKey: string; eventType: string };
const enqueueEmailEvent = vi.fn<(input: EnqueueInput) => Promise<Record<string, unknown>>>(async () => ({}));
vi.mock("@/lib/email/outbox", () => ({
    enqueueEmailEvent: (input: EnqueueInput) => enqueueEmailEvent(input),
}));

let recordRpcResult: { data: { granted: boolean; duplicate: boolean } | null; error: { message: string } | null } = {
    data: { granted: true, duplicate: false },
    error: null,
};
let userRow: { email: string; name: string } | null = { email: "buyer@example.com", name: "Buyer" };

const adminRpc = vi.fn(async (fn: string) => {
    if (fn === "record_payment_and_grant_credits") return recordRpcResult;
    if (fn === "add_commission") return { error: null };
    throw new Error(`unexpected rpc: ${fn}`);
});

const adminFrom = vi.fn((table: string) => {
    if (table === "users") {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: userRow }) }) }) };
    }
    if (table === "referrals") {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) };
    }
    if (table === "transactions") {
        return { insert: async () => ({ error: null }) };
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

function failedPayload(paymentId: string) {
    return JSON.stringify({
        business_id: "biz_1",
        type: "payment.failed",
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

function enqueuedEvent() {
    return enqueueEmailEvent.mock.calls[0]?.[0];
}

describe("Dodo webhook payment email events", () => {
    beforeEach(() => {
        enqueueEmailEvent.mockClear();
        adminRpc.mockClear();
        recordRpcResult = { data: { granted: true, duplicate: false }, error: null };
        userRow = { email: "buyer@example.com", name: "Buyer" };
    });

    it("enqueues one receipt only after successful credit allocation", async () => {
        const response = await POST(signedRequest(succeededPayload("pay_1")));

        expect(response.status).toBe(200);
        expect(adminRpc).toHaveBeenCalledWith(
            "record_payment_and_grant_credits",
            expect.objectContaining({ p_transaction_id: "pay_1" })
        );
        expect(enqueuedEvent()?.eventKey).toBe("purchase_receipt:pay_1");
        expect(enqueuedEvent()?.eventType).toBe("purchase_receipt");
    });

    it("does not enqueue a receipt when the credit RPC fails", async () => {
        recordRpcResult = { data: null, error: { message: "db error" } };

        const response = await POST(signedRequest(succeededPayload("pay_2")));

        expect(response.status).toBe(500);
        expect(enqueueEmailEvent).not.toHaveBeenCalled();
    });

    it("still enqueues a receipt on a duplicate delivery of an already-processed payment", async () => {
        recordRpcResult = { data: { granted: false, duplicate: true }, error: null };

        const response = await POST(signedRequest(succeededPayload("pay_3")));

        expect(response.status).toBe(200);
        expect(enqueuedEvent()?.eventKey).toBe("purchase_receipt:pay_3");
    });

    it("does not enqueue a receipt when the buyer has no email on file", async () => {
        userRow = null;

        const response = await POST(signedRequest(succeededPayload("pay_4")));

        expect(response.status).toBe(200);
        expect(enqueueEmailEvent).not.toHaveBeenCalled();
    });

    it("enqueues payment_failed for a durable failed transaction", async () => {
        const response = await POST(signedRequest(failedPayload("pay_5")));

        expect(response.status).toBe(200);
        expect(enqueuedEvent()?.eventKey).toBe("payment_failed:pay_5");
        expect(enqueuedEvent()?.eventType).toBe("payment_failed");
    });
});
