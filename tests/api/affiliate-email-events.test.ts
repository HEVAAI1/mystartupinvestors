import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

type EnqueueInput = { eventKey: string; eventType: string; recipientEmail: string; payload: Record<string, unknown> };
const enqueueEmailEvent = vi.fn<(input: EnqueueInput) => Promise<Record<string, unknown>>>(async () => ({}));
vi.mock("@/lib/email/outbox", () => ({
    enqueueEmailEvent: (input: EnqueueInput) => enqueueEmailEvent(input),
}));

function eventTypes() {
    return enqueueEmailEvent.mock.calls.map(([input]) => input.eventType);
}

function lastEvent() {
    return enqueueEmailEvent.mock.calls[enqueueEmailEvent.mock.calls.length - 1]?.[0];
}

let authUser: { id: string; email: string } = { id: "user-1", email: "affiliate@example.com" };
let existingAffiliate: { id: string; referral_code: string; total_earned: number; total_paid: number } | null = null;
let referralCodeConflict = false;
let insertedAffiliateId = "aff-1";
let affiliateByCode: { id: string; user_id: string } | null = { id: "aff-2", user_id: "affiliate-owner" };
let alreadyReferred: { id: string } | null = null;
let affiliateOwnerRow: { user_id: string } | null = { user_id: "affiliate-owner" };
let ownerUserRow: { email: string } | null = { email: "owner@example.com" };
let requestWithdrawalResult: { data: { id: string; amount: number } | null; error: { message: string } | null } = {
    data: { id: "wd-1", amount: 100 },
    error: null,
};
let setWithdrawalStatusResult: {
    data: { id: string; affiliate_id: string; amount: number; status: string } | null;
    error: { message: string } | null;
} = { data: { id: "wd-1", affiliate_id: "aff-2", amount: 100, status: "approved" }, error: null };

vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseServerClient: async () => ({
        auth: { getUser: async () => ({ data: { user: authUser } }) },
    }),
    createSupabaseAdminClient: () => ({
        from: (table: string) => {
            if (table === "affiliates") {
                return {
                    select: (columns: string) => ({
                        eq: (column: string) => ({
                            maybeSingle: async () => {
                                if (column === "user_id" && columns.includes("referral_code")) {
                                    return { data: existingAffiliate };
                                }
                                if (column === "referral_code" && columns === "id") {
                                    return { data: referralCodeConflict ? { id: "conflict" } : null };
                                }
                                if (column === "referral_code" && columns.includes("user_id")) {
                                    return { data: affiliateByCode };
                                }
                                if (column === "user_id" && columns === "id") {
                                    return { data: { id: "aff-2" } };
                                }
                                if (column === "id" && columns === "user_id") {
                                    return { data: affiliateOwnerRow };
                                }
                                return { data: null };
                            },
                        }),
                    }),
                    insert: () => ({
                        select: () => ({
                            single: async () => ({ data: { id: insertedAffiliateId, referral_code: "ABC12345" }, error: null }),
                        }),
                    }),
                };
            }
            if (table === "referrals") {
                return {
                    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: alreadyReferred }) }) }),
                    insert: async () => ({ error: null }),
                };
            }
            if (table === "users") {
                return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: ownerUserRow }) }) }) };
            }
            if (table === "withdrawal_requests") {
                return { select: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) }) };
            }
            throw new Error(`unexpected table: ${table}`);
        },
        rpc: (fn: string) => {
            if (fn === "request_withdrawal") {
                return { single: async () => requestWithdrawalResult };
            }
            if (fn === "set_withdrawal_status") {
                return { single: async () => setWithdrawalStatusResult };
            }
            throw new Error(`unexpected rpc: ${fn}`);
        },
    }),
}));

vi.mock("@/lib/requireAdmin", () => ({
    requireAdmin: async () => ({ ok: true }),
}));

const { POST: registerPOST } = await import("@/app/api/affiliate/register/route");
const { POST: linkReferralPOST } = await import("@/app/api/affiliate/link-referral/route");
const { POST: withdrawPOST } = await import("@/app/api/affiliate/withdraw/route");
const { PATCH: adminWithdrawPATCH } = await import("@/app/api/admin/withdrawals/[id]/route");

function withdrawalBody() {
    return {
        amount: 100,
        name: "Jane",
        account_number: "123456789",
        ifsc_code: "ABCD0123456",
        account_holder_name: "Jane Doe",
        contact_number: "+1 555 0100",
        email_id: "payout@example.com",
        country: "US",
    };
}

describe("affiliate lifecycle emails", () => {
    beforeEach(() => {
        enqueueEmailEvent.mockClear();
        authUser = { id: "user-1", email: "affiliate@example.com" };
        existingAffiliate = null;
        referralCodeConflict = false;
        insertedAffiliateId = "aff-1";
        affiliateByCode = { id: "aff-2", user_id: "affiliate-owner" };
        alreadyReferred = null;
        affiliateOwnerRow = { user_id: "affiliate-owner" };
        ownerUserRow = { email: "owner@example.com" };
        requestWithdrawalResult = { data: { id: "wd-1", amount: 100 }, error: null };
        setWithdrawalStatusResult = { data: { id: "wd-1", affiliate_id: "aff-2", amount: 100, status: "approved" }, error: null };
    });

    it("enqueues affiliate_ready only for a brand-new affiliate registration", async () => {
        existingAffiliate = null;
        await registerPOST();
        expect(eventTypes()).toEqual(["affiliate_ready"]);

        enqueueEmailEvent.mockClear();
        existingAffiliate = { id: "aff-1", referral_code: "ABC12345", total_earned: 0, total_paid: 0 };
        await registerPOST();
        expect(eventTypes()).toEqual([]);
    });

    it("enqueues affiliate_referral_joined only on a new attribution, not an already-linked one", async () => {
        alreadyReferred = null;
        await linkReferralPOST(
            new NextRequest("http://localhost/api/affiliate/link-referral", {
                method: "POST",
                body: JSON.stringify({ referral_code: "ABC12345" }),
            })
        );
        expect(eventTypes()).toEqual(["affiliate_referral_joined"]);

        enqueueEmailEvent.mockClear();
        alreadyReferred = { id: "existing" };
        await linkReferralPOST(
            new NextRequest("http://localhost/api/affiliate/link-referral", {
                method: "POST",
                body: JSON.stringify({ referral_code: "ABC12345" }),
            })
        );
        expect(eventTypes()).toEqual([]);
    });

    it("does not put account number or IFSC in the withdrawal-request email payload", async () => {
        await withdrawPOST(
            new NextRequest("http://localhost/api/affiliate/withdraw", {
                method: "POST",
                body: JSON.stringify(withdrawalBody()),
            })
        );

        expect(eventTypes()).toEqual(["withdrawal_requested"]);
        const event = lastEvent();
        expect(event?.payload).not.toHaveProperty("account_number");
        expect(event?.payload).not.toHaveProperty("ifsc_code");
        expect(event?.payload).not.toHaveProperty("contact_number");
        expect(event?.recipientEmail).toBe("affiliate@example.com");
    });

    it("does not enqueue a withdrawal-requested email when the RPC rejects the request", async () => {
        requestWithdrawalResult = { data: null, error: { message: "exceeds available balance" } };

        await withdrawPOST(
            new NextRequest("http://localhost/api/affiliate/withdraw", {
                method: "POST",
                body: JSON.stringify(withdrawalBody()),
            })
        );

        expect(eventTypes()).toEqual([]);
    });

    it("enqueues withdrawal_status with the new status after an admin transition", async () => {
        setWithdrawalStatusResult = { data: { id: "wd-1", affiliate_id: "aff-2", amount: 100, status: "paid" }, error: null };

        await adminWithdrawPATCH(
            new Request("http://localhost/api/admin/withdrawals/wd-1", {
                method: "PATCH",
                body: JSON.stringify({ status: "paid" }),
            }),
            { params: Promise.resolve({ id: "wd-1" }) }
        );

        expect(eventTypes()).toEqual(["withdrawal_status"]);
        const event = lastEvent();
        expect(event?.eventKey).toBe("withdrawal_status:wd-1:paid");
        expect(event?.payload).not.toHaveProperty("account_number");
    });

    it("does not enqueue a withdrawal_status email when the transition is rejected", async () => {
        setWithdrawalStatusResult = { data: null, error: { message: "Withdrawal request is already paid" } };

        await adminWithdrawPATCH(
            new Request("http://localhost/api/admin/withdrawals/wd-1", {
                method: "PATCH",
                body: JSON.stringify({ status: "paid" }),
            }),
            { params: Promise.resolve({ id: "wd-1" }) }
        );

        expect(eventTypes()).toEqual([]);
    });
});
