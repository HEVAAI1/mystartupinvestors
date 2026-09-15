import { describe, expect, it, vi } from "vitest";
import type { EmailOutboxEvent } from "@/lib/email/types";

vi.mock("server-only", () => ({}));

const { renderEmailEvent } = await import("@/lib/email/templates");

function baseEvent(overrides: Partial<EmailOutboxEvent>): EmailOutboxEvent {
    return {
        id: "event-1",
        event_key: "test:1",
        event_type: "purchase_receipt",
        user_id: null,
        recipient_email: "buyer@example.com",
        payload: {},
        status: "sending",
        attempt_count: 1,
        claimed_at: null,
        last_error: null,
        resend_email_id: null,
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}

describe("renderEmailEvent", () => {
    it("renders a purchase receipt with plan, amount, credits and dashboard CTA", () => {
        const email = renderEmailEvent(baseEvent({
            event_type: "purchase_receipt",
            payload: { plan: "professional", amountUsd: 19, credits: 60, paymentId: "pay_1" },
        }));

        expect(email.subject).toBe("Your 60 MyFundingList credits are ready");
        expect(email.html).toContain("$19.00");
        expect(email.html).toContain("https://www.myfundinglist.com/dashboard");
        expect(email.text).toContain("support@myfundinglist.com");
    });

    it("escapes user-provided content in the internal contact notice", () => {
        const email = renderEmailEvent(baseEvent({
            event_type: "internal_contact_request",
            payload: {
                name: "<script>alert(1)</script>",
                subject: "Hello & welcome",
                message: "line one\n<b>line two</b>",
            },
        }));

        expect(email.html).not.toContain("<script>alert(1)</script>");
        expect(email.html).toContain("&lt;script&gt;");
        expect(email.html).toContain("&amp;");
        expect(email.html).not.toContain("<b>line two</b>");
    });

    it("never sends bank/IFSC details in withdrawal-status content", () => {
        const email = renderEmailEvent(baseEvent({
            event_type: "withdrawal_status",
            payload: { status: "paid", amountUsd: 100 },
        }));

        expect(email.html.toLowerCase()).not.toContain("ifsc");
        expect(email.html.toLowerCase()).not.toContain("account_number");
        expect(email.html).toContain("$100.00");
    });

    it("provides a plain-text fallback for every rendered email", () => {
        const email = renderEmailEvent(baseEvent({ event_type: "welcome" }));
        expect(email.text.length).toBeGreaterThan(0);
        expect(email.text).not.toContain("<");
    });

    it("throws for an unregistered event type", () => {
        expect(() => renderEmailEvent(baseEvent({ event_type: "not_a_real_event" as never })))
            .toThrow("no renderer registered");
    });
});
