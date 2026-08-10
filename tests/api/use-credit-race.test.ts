import { describe, expect, it, vi } from "vitest";

const STARTING_CREDITS = 1;

function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

// Simulates two concurrent requests both reaching the conditional update
// with the same stale read, the way two overlapping Postgres transactions
// would. Only the request whose WHERE clause (id + previous value) still
// matches when it runs gets to write; Postgres serializes the two UPDATEs,
// so the loser's predicate no longer matches and it returns zero rows.
function createUsersTable(initialCredits: number) {
    let credits = initialCredits;
    let barrierArrivals = 0;
    let releaseFirst: (() => void) | null = null;
    let barrierArmed = true;
    const firstArrived = new Promise<void>((resolve) => {
        releaseFirst = resolve;
    });

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
                                        plan: "paid",
                                        calculation_credits: credits,
                                        weekly_calculation_credits: null,
                                        last_calculation_reset_at: null,
                                    },
                                    error: null,
                                }),
                            }),
                        };
                    }

                    // Re-fetch used inside consumeCredit's retry path.
                    return {
                        eq: () => ({
                            single: async () => ({
                                data: { calculation_credits: credits },
                                error: null,
                            }),
                        }),
                    };
                },
                update(patch: Record<string, number>) {
                    const nextValue = patch.calculation_credits;

                    return {
                        eq() {
                            return {
                                eq(matchCol: string, matchValue: number) {
                                    return {
                                        gt() {
                                            return {
                                                async select(selectCol: string) {
                                                    if (matchCol !== "calculation_credits") {
                                                        throw new Error(`unexpected match column: ${matchCol}`);
                                                    }

                                                    // Hold the first two callers here until both
                                                    // concurrent requests have reached the update, so
                                                    // both evaluate their predicate against the same
                                                    // pre-write balance instead of running one at a
                                                    // time. Later retries pass straight through.
                                                    if (barrierArmed) {
                                                        barrierArrivals += 1;
                                                        if (barrierArrivals === 1) {
                                                            await firstArrived;
                                                        } else {
                                                            barrierArmed = false;
                                                            releaseFirst?.();
                                                        }
                                                    }

                                                    const observed = credits;
                                                    await nextTick();

                                                    if (credits !== matchValue || observed <= 0) {
                                                        return { data: [], error: null };
                                                    }

                                                    credits = nextValue;
                                                    return {
                                                        data: [{ [selectCol]: credits }],
                                                        error: null,
                                                    };
                                                },
                                            };
                                        },
                                    };
                                },
                            };
                        },
                    };
                },
            };
        },
        getCredits: () => credits,
    };
}

const table = createUsersTable(STARTING_CREDITS);

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

describe("use-credit race", () => {
    it("lets exactly one of two concurrent requests spend the last credit", async () => {
        const [first, second] = await Promise.all([
            POST(makeRequest()),
            POST(makeRequest()),
        ]);

        const [firstBody, secondBody] = await Promise.all([first.json(), second.json()]);

        const results = [
            { status: first.status, body: firstBody },
            { status: second.status, body: secondBody },
        ];

        const winners = results.filter((r) => r.body.success === true);
        const losers = results.filter((r) => r.body.success === false);

        expect(winners).toHaveLength(1);
        expect(losers).toHaveLength(1);

        expect(winners[0].status).toBe(200);
        expect(winners[0].body.remaining).toBe(0);

        expect(losers[0].status).toBe(403);
        expect(losers[0].body.error).toBe("CREDITS_EXHAUSTED");

        expect(table.getCredits()).toBe(0);
        expect(table.getCredits()).toBeGreaterThanOrEqual(0);
    });
});
