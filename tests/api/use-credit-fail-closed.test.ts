import { describe, expect, it, vi } from "vitest";

// A null or unrecognized plan must never resolve to unlimited use. The
// route treats an RPC error (which consume_calculator_credit raises for
// exactly this case) as a hard block, not a pass-through.
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
                        // Simulates a user row with a null/never-set plan.
                        single: async () => ({ data: { plan: null }, error: null }),
                    }),
                }),
            };
        },
        rpc: (fn: string) => {
            if (fn !== "consume_calculator_credit") throw new Error(`unexpected rpc: ${fn}`);
            // Mirrors consume_calculator_credit's RAISE on p_plan NOT IN (...).
            return Promise.resolve({
                data: null,
                error: { message: "consume_calculator_credit: unknown or missing plan (null)" },
            });
        },
    }),
}));

vi.mock("next/headers", () => ({
    cookies: async () => ({ get: () => undefined }),
}));

const { POST } = await import("@/app/api/calculations/use-credit/route");

function makeRequest() {
    return new Request("http://localhost/api/calculations/use-credit", {
        method: "POST",
        headers: { Authorization: "Bearer test-token" },
    }) as unknown as Parameters<typeof POST>[0];
}

describe("use-credit fail-closed on unknown plan", () => {
    it("blocks (does not grant unlimited) when the RPC rejects a null plan", async () => {
        const res = await POST(makeRequest());
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.unlimited).toBeUndefined();
    });
});
