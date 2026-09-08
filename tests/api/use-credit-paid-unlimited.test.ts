import { describe, expect, it, vi } from "vitest";

// Any paid plan should get unlimited tool calculations with no credit
// tracking at all — verifies the route never even inspects
// calculation_credits for a paid user, and that concurrent requests don't
// contend with each other the way the free tier's weekly credits do.
function createUsersTable() {
    return {
        from(table: string) {
            if (table !== "users") {
                throw new Error(`unexpected table: ${table}`);
            }

            return {
                select(columns: string) {
                    if (columns === "plan, calculation_credits, weekly_calculation_credits, last_calculation_reset_at") {
                        return {
                            eq: () => ({
                                single: async () => ({
                                    data: {
                                        plan: "growth",
                                        calculation_credits: 0,
                                        weekly_calculation_credits: null,
                                        last_calculation_reset_at: null,
                                    },
                                    error: null,
                                }),
                            }),
                        };
                    }
                    throw new Error(`unexpected select: ${columns}`);
                },
                update() {
                    throw new Error("a paid user's calculation_credits should never be written to");
                },
            };
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
    it("is unlimited even with calculation_credits at 0, for any number of concurrent requests", async () => {
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
