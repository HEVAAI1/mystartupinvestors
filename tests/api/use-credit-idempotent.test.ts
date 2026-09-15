import { describe, expect, it, vi } from "vitest";

// In-memory double of consume_calculator_credit()
// (supabase/migrations/13_calculator_weekly_credits.sql). This repo has no
// local/disposable Postgres to run the real SQL against, so this mock
// mirrors its documented contract (idempotent per (user_id, request_id),
// fails closed on unknown plan) to prove the API route's wiring against
// that contract. The SQL itself is reviewed by hand before being applied.
function createFakeRpc() {
    const ledger = new Set<string>();
    let used = 0;
    const limit = 5;
    const resetAt = "2026-09-21T00:00:00.000Z";

    return {
        consume(userId: string, plan: string | null, requestId: string) {
            if (!plan || !["free", "professional", "growth", "enterprise"].includes(plan)) {
                throw new Error("consume_calculator_credit: unknown or missing plan");
            }
            if (plan !== "free") {
                return { unlimited: true, success: true, remaining: null, resetAt: null };
            }

            const dedupeKey = `${userId}:${requestId}`;
            if (ledger.has(dedupeKey)) {
                return { unlimited: false, success: true, duplicate: true, remaining: limit - used, limit, resetAt };
            }
            ledger.add(dedupeKey);

            if (used >= limit) {
                return { unlimited: false, success: false, remaining: 0, limit, resetAt };
            }
            used += 1;
            return { unlimited: false, success: true, remaining: limit - used, limit, resetAt };
        },
        getUsed: () => used,
    };
}

const fakeRpc = createFakeRpc();

vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseAdminClient: () => ({
        auth: {
            getUser: async () => ({ data: { user: { id: "user-1" } }, error: null }),
        },
        from: (table: string) => {
            if (table !== "users") throw new Error(`unexpected table: ${table}`);
            return {
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: { plan: "free" }, error: null }),
                    }),
                }),
            };
        },
        rpc: (fn: string, args: Record<string, unknown>) => {
            if (fn !== "consume_calculator_credit") throw new Error(`unexpected rpc: ${fn}`);
            try {
                return Promise.resolve({
                    data: fakeRpc.consume(args.p_user_id as string, args.p_plan as string | null, args.p_request_id as string),
                    error: null,
                });
            } catch (e) {
                return Promise.resolve({ data: null, error: e as Error });
            }
        },
    }),
}));

vi.mock("next/headers", () => ({
    cookies: async () => ({ get: () => undefined }),
}));

const { POST } = await import("@/app/api/calculations/use-credit/route");

function makeRequest(requestId: string) {
    return new Request("http://localhost/api/calculations/use-credit", {
        method: "POST",
        headers: { Authorization: "Bearer test-token", "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
    }) as unknown as Parameters<typeof POST>[0];
}

describe("use-credit idempotency", () => {
    it("does not double-decrement when the same request_id is retried", async () => {
        const first = await POST(makeRequest("attempt-1"));
        const firstBody = await first.json();
        expect(firstBody.success).toBe(true);
        expect(firstBody.remaining).toBe(4);

        // Simulated retry of the exact same logical attempt.
        const retry = await POST(makeRequest("attempt-1"));
        const retryBody = await retry.json();
        expect(retryBody.success).toBe(true);
        expect(retryBody.remaining).toBe(4); // unchanged, not 3

        expect(fakeRpc.getUsed()).toBe(1);

        // A genuinely new attempt still decrements normally.
        const next = await POST(makeRequest("attempt-2"));
        const nextBody = await next.json();
        expect(nextBody.remaining).toBe(3);
        expect(fakeRpc.getUsed()).toBe(2);
    });
});
