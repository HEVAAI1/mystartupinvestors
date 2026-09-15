import "server-only";

import { Resend } from "resend";
import { renderEmailEvent } from "@/lib/email/templates";
import { markEmailAttemptFailed, markEmailSent } from "@/lib/email/outbox";
import type { EmailOutboxEvent } from "@/lib/email/types";

export type DispatchResult = "sent" | "retryable_failure" | "permanent_failure";

function getResendClient(): Resend {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY is not configured");
    }

    return new Resend(apiKey);
}

// Resend 4xx configuration errors (bad from address, invalid recipient,
// disabled domain, etc.) will never succeed on retry. Everything else
// (429 rate limit, 5xx, network failure) is worth retrying.
const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403, 404, 422]);

function isRetryable(statusCode: number | null): boolean {
    if (statusCode === null) {
        // Network/unknown failure — assume transient.
        return true;
    }

    return !NON_RETRYABLE_STATUS_CODES.has(statusCode);
}

function recipientFor(event: EmailOutboxEvent): { to: string | string[]; replyTo?: string } {
    // Internal notices can target multiple support recipients, stored as a
    // comma-separated address list.
    const to = event.recipient_email.includes(",")
        ? event.recipient_email.split(",").map((address) => address.trim())
        : event.recipient_email;

    if (event.event_type === "internal_contact_request" && typeof event.payload.replyTo === "string") {
        return { to, replyTo: event.payload.replyTo };
    }

    return { to };
}

export async function dispatchEmailEvent(event: EmailOutboxEvent): Promise<DispatchResult> {
    if (event.status === "sent") {
        return "sent";
    }

    const { subject, html, text } = renderEmailEvent(event);
    const from = process.env.CONTACT_FROM_EMAIL;
    if (!from) {
        await markEmailAttemptFailed(event.id, "CONTACT_FROM_EMAIL is not configured", false);
        return "permanent_failure";
    }

    const { to, replyTo } = recipientFor(event);

    let sendResult;
    try {
        sendResult = await getResendClient().emails.send({
            from,
            to,
            replyTo,
            subject,
            html,
            text,
        });
    } catch (error) {
        // Unexpected network/client failure — retryable.
        await markEmailAttemptFailed(event.id, error instanceof Error ? error.message : "unknown send error", true);
        return "retryable_failure";
    }

    if (sendResult.error) {
        const retryable = isRetryable(sendResult.error.statusCode);
        await markEmailAttemptFailed(event.id, sendResult.error.message, retryable);
        return retryable ? "retryable_failure" : "permanent_failure";
    }

    if (!sendResult.data?.id) {
        await markEmailAttemptFailed(event.id, "Resend response missing email id", true);
        return "retryable_failure";
    }

    await markEmailSent(event.id, sendResult.data.id);
    return "sent";
}
