import { describe, expect, it, vi } from "vitest";

// Any known paid plan should get unlimited tool calculations, delegated
// entirely to consume_calculator_credit(), which returns { unlimited: true }
// without touching weekly_credits_used at all.
function createUsersTable() {
    return {
        from(table: string) {
            if (table !== "users") {
                throw new Error(`unexpected table: ${table}`);
            }

            return {
                select(columns: string) {
                    if (columns === "plan") {
                        return {
                            eq: () => ({
                                single: async () => ({ data: { plan: "growth" }, error: null }),
                            }),
                        };
                    }
                    throw new Error(`unexpected select: ${columns}`);
                },
                update() {
                    throw new Error("a paid user's row should never be written to by this route");
                },
            };
        },
        rpc(fn: string, args: Record<string, unknown>) {
            if (fn !== "consume_calculator_credit") throw new Error(`unexpected rpc: ${fn}`);
            expect(args.p_plan).toBe("growth");
            return Promise.resolve({
                data: { unlimited: true, success: true, remaining: null, resetAt: null },
                error: null,
            });
        },
    };
}

const table = createUsersTable();

vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseAdminClient: () => ({
        auth: {
            getUser: async () => ({ data: { user: { id: "user-1" } }, error: null }),
        },
        from: table.from.bind(table),
        rpc: table.rpc.bind(table),
    }),
}));

vi.mock("next/headers", () => ({
    cookies: async () => ({
        get: () => undefined,
    }),
}));

const { POST } = await import("@/app/api/calculations/use-credit/route");

function makeRequest() {
    return new Request("http://localhost/api/calculations/use-credit", {
        method: "POST",
        headers: { Authorization: "Bearer test-token" },
    }) as unknown as Parameters<typeof POST>[0];
}

describe("use-credit paid plan", () => {
    it("is unlimited for any number of concurrent requests", async () => {
        const [first, second, third] = await Promise.all([
            POST(makeRequest()),
            POST(makeRequest()),
            POST(makeRequest()),
        ]);

        for (const res of [first, second, third]) {
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.unlimited).toBe(true);
            expect(body.userState).toBe("paid");
        }
    });
});
