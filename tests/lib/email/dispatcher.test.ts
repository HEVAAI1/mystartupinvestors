import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmailOutboxEvent } from "@/lib/email/types";

vi.mock("server-only", () => ({}));

const resendSend = vi.fn();
vi.mock("resend", () => ({
    Resend: class {
        emails = { send: resendSend };
    },
}));

const markEmailSent = vi.fn(async (_id: string, _resendEmailId: string) => {});
const markEmailAttemptFailed = vi.fn(async (_id: string, _message: string, _retryable: boolean) => {});
vi.mock("@/lib/email/outbox", () => ({
    markEmailSent: (id: string, resendEmailId: string) => markEmailSent(id, resendEmailId),
    markEmailAttemptFailed: (id: string, message: string, retryable: boolean) => markEmailAttemptFailed(id, message, retryable),
}));

const { dispatchEmailEvent } = await import("@/lib/email/dispatcher");

function sendingEvent(overrides: Partial<EmailOutboxEvent> = {}): EmailOutboxEvent {
    return {
        id: "event-1",
        event_key: "purchase_receipt:pay_1",
        event_type: "purchase_receipt",
        user_id: null,
        recipient_email: "buyer@example.com",
        payload: { plan: "professional", amountUsd: 19, credits: 60 },
        status: "sending",
        attempt_count: 1,
        claimed_at: new Date().toISOString(),
        last_error: null,
        resend_email_id: null,
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}

describe("dispatchEmailEvent", () => {
    beforeEach(() => {
        resendSend.mockReset();
        markEmailSent.mockReset();
        markEmailAttemptFailed.mockReset();
        process.env.RESEND_API_KEY = "test-key";
        process.env.CONTACT_FROM_EMAIL = "MyFundingList <hello@myfundinglist.com>";
    });

    it("marks a successful provider result as sent and never re-sends an already-sent event", async () => {
        resendSend.mockResolvedValue({ data: { id: "resend-1" }, error: null });

        await dispatchEmailEvent(sendingEvent());
        await dispatchEmailEvent(sendingEvent({ status: "sent" }));

        expect(resendSend).toHaveBeenCalledTimes(1);
        expect(markEmailSent).toHaveBeenCalledWith("event-1", "resend-1");
    });

    it("treats a 429 rate-limit response as a retryable failure", async () => {
        resendSend.mockResolvedValue({ data: null, error: { message: "rate limited", statusCode: 429, name: "rate_limit_exceeded" } });

        const result = await dispatchEmailEvent(sendingEvent());

        expect(result).toBe("retryable_failure");
        expect(markEmailAttemptFailed).toHaveBeenCalledWith("event-1", "rate limited", true);
    });

    it("treats a 422 invalid-from-address response as a permanent failure", async () => {
        resendSend.mockResolvedValue({ data: null, error: { message: "invalid from address", statusCode: 422, name: "validation_error" } });

        const result = await dispatchEmailEvent(sendingEvent());

        expect(result).toBe("permanent_failure");
        expect(markEmailAttemptFailed).toHaveBeenCalledWith("event-1", "invalid from address", false);
    });

    it("treats a network exception as retryable", async () => {
        resendSend.mockRejectedValue(new Error("fetch failed"));

        const result = await dispatchEmailEvent(sendingEvent());

        expect(result).toBe("retryable_failure");
        expect(markEmailAttemptFailed).toHaveBeenCalledWith("event-1", "fetch failed", true);
    });
});
