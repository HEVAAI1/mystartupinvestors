export type EmailEventType =
    | "welcome"
    | "startup_submitted"
    | "internal_startup_submitted"
    | "contact_received"
    | "internal_contact_request"
    | "purchase_receipt"
    | "payment_failed"
    | "investor_credits_low"
    | "investor_credits_zero"
    | "calculator_credits_low"
    | "calculator_credits_zero"
    | "affiliate_ready"
    | "affiliate_referral_joined"
    | "affiliate_commission_earned"
    | "affiliate_withdrawal_available"
    | "withdrawal_requested"
    | "withdrawal_status";

export type EmailPayloadValue =
    | string
    | number
    | boolean
    | null
    | EmailPayloadValue[]
    | { [key: string]: EmailPayloadValue };

export type EmailOutboxPayload = Record<string, EmailPayloadValue>;

export type EmailOutboxStatus = "pending" | "sending" | "sent" | "failed";

export type EmailOutboxEvent = {
    id: string;
    event_key: string;
    event_type: EmailEventType;
    user_id: string | null;
    recipient_email: string;
    payload: EmailOutboxPayload;
    status: EmailOutboxStatus;
    attempt_count: number;
    claimed_at: string | null;
    last_error: string | null;
    resend_email_id: string | null;
    sent_at: string | null;
    created_at: string;
    updated_at: string;
};

export type EnqueueEmailEventInput = {
    eventKey: string;
    eventType: EmailEventType;
    userId?: string | null;
    recipientEmail: string;
    payload: EmailOutboxPayload;
};
