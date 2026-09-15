import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

type EnqueueInput = { eventType: string; payload: Record<string, unknown> };
const enqueueEmailEvent = vi.fn(async (input: EnqueueInput) => ({ event_type: input.eventType }));
vi.mock("@/lib/email/outbox", () => ({
    enqueueEmailEvent: (input: EnqueueInput) => enqueueEmailEvent(input),
}));

vi.mock("@/lib/rate-limit", () => ({
    checkRateLimit: () => ({ allowed: true, remaining: 4, retryAfterSeconds: 0 }),
    getClientIp: () => "127.0.0.1",
    rateLimitResponse: () => new Response(null, { status: 429 }),
}));

const { POST } = await import("@/app/api/contact/route");

function contactRequest(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
    });
}

const validBody = {
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Question about pricing",
    message: "Hello, I have a question.",
};

describe("POST /api/contact", () => {
    beforeEach(() => {
        enqueueEmailEvent.mockClear();
        process.env.RESEND_API_KEY = "test-key";
        process.env.CONTACT_FROM_EMAIL = "MyFundingList <hello@myfundinglist.com>";
    });

    it("enqueues one contact_received and one internal_contact_request event for a valid submission", async () => {
        const response = await POST(contactRequest(validBody));

        expect(response.status).toBe(200);
        expect(enqueueEmailEvent).toHaveBeenCalledTimes(2);

        const eventTypes = enqueueEmailEvent.mock.calls.map(([input]) => (input as { eventType: string }).eventType);
        expect(eventTypes).toEqual(["contact_received", "internal_contact_request"]);

        const internalCall = enqueueEmailEvent.mock.calls[1][0] as EnqueueInput;
        expect(internalCall.payload.replyTo).toBe("jane@example.com");
    });

    it("rejects an invalid submission without enqueueing anything", async () => {
        const response = await POST(contactRequest({ ...validBody, email: "not-an-email" }));

        expect(response.status).toBe(400);
        expect(enqueueEmailEvent).not.toHaveBeenCalled();
    });

    it("rejects a honeypot-filled submission without enqueueing anything", async () => {
        const response = await POST(contactRequest({ ...validBody, company: "I am a bot" }));

        expect(response.status).toBe(400);
        expect(enqueueEmailEvent).not.toHaveBeenCalled();
    });

    it("returns 500 without enqueueing when email is not configured", async () => {
        delete process.env.CONTACT_FROM_EMAIL;

        const response = await POST(contactRequest(validBody));

        expect(response.status).toBe(500);
        expect(enqueueEmailEvent).not.toHaveBeenCalled();
    });
});
