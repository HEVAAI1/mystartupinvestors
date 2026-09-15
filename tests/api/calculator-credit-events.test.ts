import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

const enqueueEmailEvent = vi.fn<(input: { eventType: string }) => Promise<Record<string, unknown>>>(async () => ({}));
vi.mock("@/lib/email/outbox", () => ({
    enqueueEmailEvent: (input: { eventType: string }) => enqueueEmailEvent(input),
}));

vi.mock("@/lib/rate-limit", () => ({
    checkRateLimit: () => ({ allowed: true, remaining: 10, retryAfterSeconds: 0 }),
    getClientIp: () => "127.0.0.1",
}));

vi.mock("next/headers", () => ({
    cookies: async () => ({ get: () => undefined, set: () => {} }),
}));

let authUser: { id: string; email: string } | null;
let userRow: {
    plan: string;
    calculation_credits: number;
    weekly_calculation_credits: number;
    last_calculation_reset_at: string;
};

vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseAdminClient: () => ({
        auth: { getUser: async () => ({ data: { user: authUser } }) },
        from: (table: string) => {
            if (table !== "users") throw new Error(`unexpected table ${table}`);
            return {
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: userRow, error: null }),
                    }),
                }),
                update: (patch: Record<string, unknown>) => {
                    const query = {
                        eq: (column: string, value: unknown) => {
                            if (column === "id") return query;
                            // Column-value guard used by consumeCredit's optimistic check.
                            if (userRow[column as keyof typeof userRow] !== value) {
                                return { ...query, gt: () => ({ select: async () => ({ data: [] }) }), select: async () => ({ data: [] }) };
                            }
                            return query;
                        },
                        gt: () => ({
                            select: async () => {
                                Object.assign(userRow, patch);
                                return { data: [{ ...patch }] };
                            },
                        }),
                        is: () => ({
                            select: async () => {
                                Object.assign(userRow, patch);
                                return { data: [{ ...patch }] };
                            },
                        }),
                        select: async () => {
                            Object.assign(userRow, patch);
                            return { data: [{ ...patch }] };
                        },
                    };
                    return query;
                },
            };
        },
    }),
}));

const { POST } = await import("@/app/api/calculations/use-credit/route");

function eventTypes() {
    return enqueueEmailEvent.mock.calls.map(([input]) => (input as { eventType: string }).eventType);
}

function useCreditRequest() {
    return new NextRequest("http://localhost/api/calculations/use-credit", {
        method: "POST",
        headers: { authorization: "Bearer test-token" },
    });
}

describe("calculator credit-level emails", () => {
    beforeEach(() => {
        enqueueEmailEvent.mockClear();
        authUser = { id: "user-1", email: "free@example.com" };
        userRow = {
            plan: "free",
            calculation_credits: 0,
            weekly_calculation_credits: 2,
            last_calculation_reset_at: new Date().toISOString(),
        };
    });

    it("enqueues calculator_credits_low when one weekly use remains after a successful use", async () => {
        userRow.weekly_calculation_credits = 2;
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual(["calculator_credits_low"]);
    });

    it("enqueues calculator_credits_zero when the last weekly use is spent", async () => {
        userRow.weekly_calculation_credits = 1;
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual(["calculator_credits_zero"]);
    });

    it("does not enqueue anything for a failed insufficient-credit attempt", async () => {
        userRow.weekly_calculation_credits = 0;
        userRow.last_calculation_reset_at = new Date().toISOString();

        const response = await POST(useCreditRequest());

        expect(response.status).toBe(403);
        expect(eventTypes()).toEqual([]);
    });

    it("does not enqueue anything for a paid user", async () => {
        userRow.plan = "professional";
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual([]);
    });

    it("does not enqueue anything for an anonymous user", async () => {
        authUser = null;
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual([]);
    });

    it("does not enqueue anything with plenty of weekly credits remaining", async () => {
        userRow.weekly_calculation_credits = 5;
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual([]);
    });
});
