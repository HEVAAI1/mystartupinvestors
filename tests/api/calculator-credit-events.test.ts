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
    peekRateLimit: () => ({ allowed: true, remaining: 10, retryAfterSeconds: 0 }),
}));

vi.mock("next/headers", () => ({
    cookies: async () => ({ get: () => undefined, set: () => {} }),
}));

let authUser: { id: string; email: string } | null;
let plan: string;
// Weekly uses remaining BEFORE this call, mirroring consume_calculator_credit's
// stored state — the RPC mock below decrements it exactly like the real SQL.
let remainingBeforeCall: number;

const RESET_AT = "2026-09-21T00:00:00.000Z";
const LIMIT = 5;

vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseAdminClient: () => ({
        auth: { getUser: async () => ({ data: { user: authUser } }) },
        from: (table: string) => {
            if (table !== "users") throw new Error(`unexpected table ${table}`);
            return {
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: { plan }, error: null }),
                    }),
                }),
            };
        },
        rpc: (fn: string, args: Record<string, unknown>) => {
            if (fn !== "consume_calculator_credit") throw new Error(`unexpected rpc ${fn}`);
            if (args.p_plan !== "free") {
                return Promise.resolve({
                    data: { unlimited: true, success: true, remaining: null, limit: null, resetAt: null },
                    error: null,
                });
            }
            if (remainingBeforeCall <= 0) {
                return Promise.resolve({
                    data: { unlimited: false, success: false, remaining: 0, limit: LIMIT, resetAt: RESET_AT },
                    error: null,
                });
            }
            remainingBeforeCall -= 1;
            return Promise.resolve({
                data: { unlimited: false, success: true, remaining: remainingBeforeCall, limit: LIMIT, resetAt: RESET_AT },
                error: null,
            });
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
        plan = "free";
        remainingBeforeCall = 2;
    });

    it("enqueues calculator_credits_low when one weekly use remains after a successful use", async () => {
        remainingBeforeCall = 2;
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual(["calculator_credits_low"]);
    });

    it("enqueues calculator_credits_zero when the last weekly use is spent", async () => {
        remainingBeforeCall = 1;
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual(["calculator_credits_zero"]);
    });

    it("does not enqueue anything for a failed insufficient-credit attempt", async () => {
        remainingBeforeCall = 0;

        const response = await POST(useCreditRequest());

        expect(response.status).toBe(403);
        expect(eventTypes()).toEqual([]);
    });

    it("does not enqueue anything for a paid user", async () => {
        plan = "professional";
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual([]);
    });

    it("does not enqueue anything for an anonymous user", async () => {
        authUser = null;
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual([]);
    });

    it("does not enqueue anything with plenty of weekly credits remaining", async () => {
        remainingBeforeCall = 5;
        await POST(useCreditRequest());
        expect(eventTypes()).toEqual([]);
    });
});
