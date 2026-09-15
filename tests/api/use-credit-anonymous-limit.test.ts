import { describe, expect, it, vi } from "vitest";

// Anonymous users get exactly 5 free calculations, no more, no fewer.
// The previous version called the incrementing rate-limit check before
// deciding whether to allow the request, so its own increment got counted
// twice (once via the IP bucket, once via the `+1` for "this" use) — an
// off-by-one that could grant (or cost) an extra use depending on whether
// the cookie or the IP count was larger. This drives it with no cookie at
// all, so every request is judged purely by the (now peek-then-consume) IP
// bucket.
vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseAdminClient: () => ({
        auth: {
            getUser: async () => ({ data: { user: null }, error: null }),
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
        headers: { "x-forwarded-for": "203.0.113.42" },
    }) as unknown as Parameters<typeof POST>[0];
}

describe("use-credit anonymous limit", () => {
    it("allows exactly 5 uses then blocks the 6th, in order", async () => {
        const results: { status: number; success: boolean; remaining?: number }[] = [];

        for (let i = 0; i < 6; i++) {
            const res = await POST(makeRequest());
            const body = await res.json();
            results.push({ status: res.status, success: body.success, remaining: body.remaining });
        }

        const successes = results.filter((r) => r.success);
        const failures = results.filter((r) => !r.success);

        expect(successes).toHaveLength(5);
        expect(failures).toHaveLength(1);
        expect(results[5].status).toBe(403);

        // Remaining counts down 4,3,2,1,0 across the 5 granted uses.
        expect(successes.map((r) => r.remaining)).toEqual([4, 3, 2, 1, 0]);
    });
});
