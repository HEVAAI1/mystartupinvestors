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
    rateLimitResponse: () => new Response(null, { status: 429 }),
}));

function eventTypes() {
    return enqueueEmailEvent.mock.calls.map(([input]) => (input as { eventType: string }).eventType);
}

let existingUserRow: { id: string; role: string; name: string; email: string } | null = null;

vi.mock("@supabase/ssr", () => ({
    createServerClient: () => ({
        auth: {
            exchangeCodeForSession: async () => ({ error: null }),
            getUser: async () => ({
                data: { user: { id: "user-1", email: "new@example.com", user_metadata: { full_name: "New User" } } },
                error: null,
            }),
        },
        from: (table: string) => {
            if (table !== "users") throw new Error(`unexpected table ${table}`);
            return {
                select: () => ({
                    eq: () => ({
                        maybeSingle: async () => ({ data: existingUserRow, error: null }),
                    }),
                }),
                update: () => ({ eq: async () => ({ error: null }) }),
                insert: async () => ({ error: null }),
            };
        },
    }),
}));

let usersRow: { plan: string; credits_allocated: number } = { plan: "free", credits_allocated: 5 };
let unlockRpcResult: { unlocked: boolean; alreadyUnlocked: boolean; remaining: number } = {
    unlocked: true,
    alreadyUnlocked: false,
    remaining: 5,
};

vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseServerClient: async () => ({
        auth: { getUser: async () => ({ data: { user: { id: "user-1", email: "buyer@example.com" } }, error: null }) },
    }),
    createSupabaseAdminClient: () => ({
        rpc: async () => ({ data: unlockRpcResult, error: null }),
        from: (table: string) => {
            if (table === "users") {
                return { select: () => ({ eq: () => ({ single: async () => ({ data: usersRow, error: null }) }) }) };
            }
            if (table === "investors") {
                return { select: () => ({ eq: () => ({ single: async () => ({ data: { id: 1, name: "Investor" }, error: null }) }) }) };
            }
            throw new Error(`unexpected table ${table}`);
        },
    }),
}));

const { GET } = await import("@/app/auth/callback/complete/route");
const { POST } = await import("@/app/api/investors/[id]/unlock/route");

describe("auth callback welcome email", () => {
    beforeEach(() => {
        enqueueEmailEvent.mockClear();
        existingUserRow = null;
    });

    it("enqueues welcome only when the OAuth callback creates a new user", async () => {
        existingUserRow = null;
        await GET(new NextRequest("http://localhost/auth/callback/complete?code=abc"));
        expect(eventTypes()).toEqual(["welcome"]);

        enqueueEmailEvent.mockClear();
        existingUserRow = { id: "user-1", role: "user", name: "New User", email: "new@example.com" };
        await GET(new NextRequest("http://localhost/auth/callback/complete?code=abc"));
        expect(eventTypes()).toEqual([]);
    });
});

describe("investor unlock credit-level emails", () => {
    beforeEach(() => {
        enqueueEmailEvent.mockClear();
    });

    it("enqueues paid investor low-credit once when a first unlock leaves ten credits", async () => {
        usersRow = { plan: "professional", credits_allocated: 100 };
        unlockRpcResult = { unlocked: true, alreadyUnlocked: false, remaining: 10 };

        await POST(new NextRequest("http://localhost/api/investors/1/unlock", { method: "POST" }), {
            params: Promise.resolve({ id: "1" }),
        });

        expect(eventTypes()).toEqual(["investor_credits_low"]);
    });

    it("enqueues investor zero-credit when a first unlock leaves zero credits", async () => {
        usersRow = { plan: "free", credits_allocated: 5 };
        unlockRpcResult = { unlocked: true, alreadyUnlocked: false, remaining: 0 };

        await POST(new NextRequest("http://localhost/api/investors/1/unlock", { method: "POST" }), {
            params: Promise.resolve({ id: "1" }),
        });

        expect(eventTypes()).toEqual(["investor_credits_zero"]);
    });

    it("does not enqueue anything for a repeated unlock of an already-unlocked investor", async () => {
        usersRow = { plan: "free", credits_allocated: 5 };
        unlockRpcResult = { unlocked: true, alreadyUnlocked: true, remaining: 1 };

        await POST(new NextRequest("http://localhost/api/investors/1/unlock", { method: "POST" }), {
            params: Promise.resolve({ id: "1" }),
        });

        expect(eventTypes()).toEqual([]);
    });

    it("does not enqueue a low/zero email above threshold", async () => {
        usersRow = { plan: "professional", credits_allocated: 100 };
        unlockRpcResult = { unlocked: true, alreadyUnlocked: false, remaining: 50 };

        await POST(new NextRequest("http://localhost/api/investors/1/unlock", { method: "POST" }), {
            params: Promise.resolve({ id: "1" }),
        });

        expect(eventTypes()).toEqual([]);
    });
});
