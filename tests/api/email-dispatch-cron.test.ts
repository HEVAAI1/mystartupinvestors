import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { EmailOutboxEvent } from "@/lib/email/types";

vi.mock("server-only", () => ({}));

const claimPendingEmailEvents = vi.fn<(limit: number) => Promise<EmailOutboxEvent[]>>();
vi.mock("@/lib/email/outbox", () => ({
    claimPendingEmailEvents: (limit: number) => claimPendingEmailEvents(limit),
}));

const dispatchEmailEvent = vi.fn<(event: EmailOutboxEvent) => Promise<"sent" | "retryable_failure" | "permanent_failure">>();
vi.mock("@/lib/email/dispatcher", () => ({
    dispatchEmailEvent: (event: EmailOutboxEvent) => dispatchEmailEvent(event),
}));

const { GET } = await import("@/app/api/cron/email-dispatch/route");

function eventFixture(id: string): EmailOutboxEvent {
    return {
        id,
        event_key: `welcome:${id}`,
        event_type: "welcome",
        user_id: null,
        recipient_email: "user@example.com",
        payload: {},
        status: "sending",
        attempt_count: 1,
        claimed_at: new Date().toISOString(),
        last_error: null,
        resend_email_id: null,
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}

function cronRequest(secret = "test-secret") {
    return new NextRequest("http://localhost/api/cron/email-dispatch", {
        headers: secret ? { authorization: `Bearer ${secret}` } : {},
    });
}

describe("GET /api/cron/email-dispatch", () => {
    beforeEach(() => {
        claimPendingEmailEvents.mockReset();
        dispatchEmailEvent.mockReset();
        process.env.CRON_SECRET = "test-secret";
    });

    it("rejects a request without the CRON_SECRET bearer token", async () => {
        const response = await GET(new NextRequest("http://localhost/api/cron/email-dispatch"));
        expect(response.status).toBe(401);
    });

    it("rejects a request with the wrong bearer token", async () => {
        const response = await GET(cronRequest("wrong-secret"));
        expect(response.status).toBe(401);
    });

    it("rejects every request when CRON_SECRET is not configured", async () => {
        delete process.env.CRON_SECRET;
        const response = await GET(cronRequest("anything"));
        expect(response.status).toBe(401);
    });

    it("dispatches each claimed pending event and reports delivery counts", async () => {
        claimPendingEmailEvents.mockResolvedValue([eventFixture("1"), eventFixture("2")]);
        dispatchEmailEvent
            .mockResolvedValueOnce("sent")
            .mockResolvedValueOnce("retryable_failure");

        const response = await GET(cronRequest());

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ processed: 2, sent: 1, retryableFailures: 1, permanentFailures: 0 });
        expect(claimPendingEmailEvents).toHaveBeenCalledWith(25);
    });

    it("does not include event payloads in the response", async () => {
        claimPendingEmailEvents.mockResolvedValue([eventFixture("1")]);
        dispatchEmailEvent.mockResolvedValue("sent");

        const response = await GET(cronRequest());
        const body = await response.text();

        expect(body).not.toContain("user@example.com");
    });
});
