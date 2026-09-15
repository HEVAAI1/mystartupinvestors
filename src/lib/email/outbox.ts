import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import type {
    EmailOutboxEvent,
    EmailOutboxPayload,
    EnqueueEmailEventInput,
} from "@/lib/email/types";

const SENSITIVE_PAYOUT_KEY = /(account|ifsc|bank|contact_number)/i;
const MAX_ERROR_LENGTH = 1_000;

function hasSensitivePayoutField(value: EmailOutboxPayload | EmailOutboxPayload[keyof EmailOutboxPayload]): boolean {
    if (Array.isArray(value)) {
        return value.some((item) => hasSensitivePayoutField(item));
    }

    if (value !== null && typeof value === "object") {
        return Object.entries(value).some(([key, nestedValue]) => (
            SENSITIVE_PAYOUT_KEY.test(key) || hasSensitivePayoutField(nestedValue)
        ));
    }

    return false;
}

function toError(error: { message?: string } | null, operation: string): Error {
    return new Error(error?.message || `email outbox ${operation} failed`);
}

export async function enqueueEmailEvent(input: EnqueueEmailEventInput): Promise<EmailOutboxEvent> {
    if (hasSensitivePayoutField(input.payload)) {
        throw new Error("sensitive payout fields are not allowed");
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("email_outbox")
        .insert({
            event_key: input.eventKey,
            event_type: input.eventType,
            user_id: input.userId ?? null,
            recipient_email: input.recipientEmail,
            payload: input.payload,
        })
        .select()
        .maybeSingle();

    if (!error) {
        if (!data) {
            throw new Error("email outbox insert returned no event");
        }

        return data as EmailOutboxEvent;
    }

    if (error.code !== "23505") {
        throw toError(error, "enqueue");
    }

    const { data: existingEvent, error: existingEventError } = await supabase
        .from("email_outbox")
        .select()
        .eq("event_key", input.eventKey)
        .maybeSingle();

    if (existingEventError || !existingEvent) {
        throw toError(existingEventError, "duplicate lookup");
    }

    return existingEvent as EmailOutboxEvent;
}

export async function claimPendingEmailEvents(limit: number): Promise<EmailOutboxEvent[]> {
    const boundedLimit = Math.max(0, Math.min(Math.floor(limit), 100));
    const { data, error } = await createSupabaseAdminClient()
        .rpc("claim_pending_email_events", { p_limit: boundedLimit });

    if (error) {
        throw toError(error, "claim");
    }

    return (data ?? []) as EmailOutboxEvent[];
}

export async function markEmailSent(id: string, resendEmailId: string): Promise<void> {
    const { error } = await createSupabaseAdminClient()
        .from("email_outbox")
        .update({
            status: "sent",
            resend_email_id: resendEmailId,
            sent_at: new Date().toISOString(),
            last_error: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("status", "sending");

    if (error) {
        throw toError(error, "mark sent");
    }
}

export async function markEmailAttemptFailed(id: string, message: string, retryable: boolean): Promise<void> {
    const { error } = await createSupabaseAdminClient()
        .from("email_outbox")
        .update({
            status: retryable ? "pending" : "failed",
            last_error: message.slice(0, MAX_ERROR_LENGTH),
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("status", "sending");

    if (error) {
        throw toError(error, "mark failed");
    }
}
