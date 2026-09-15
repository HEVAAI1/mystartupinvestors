import "server-only";

import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { claimPendingEmailEvents } from "@/lib/email/outbox";
import { dispatchEmailEvent } from "@/lib/email/dispatcher";

const CLAIM_LIMIT = 25;

function isAuthorized(request: NextRequest): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return false;
    }

    const header = request.headers.get("authorization") ?? "";
    const expected = `Bearer ${secret}`;

    const headerBuffer = Buffer.from(header);
    const expectedBuffer = Buffer.from(expected);
    if (headerBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return timingSafeEqual(headerBuffer, expectedBuffer);
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await claimPendingEmailEvents(CLAIM_LIMIT);

    let sent = 0;
    let retryableFailures = 0;
    let permanentFailures = 0;

    // No per-event try/catch: a thrown dispatch aborts the rest of this
    // batch, but any row left in 'sending' is reclaimed by the next
    // invocation via claim_pending_email_events' 15-minute lease, so
    // nothing is stranded — just retried on the next run instead of later
    // in this one.
    for (const event of events) {
        const result = await dispatchEmailEvent(event);
        if (result === "sent") {
            sent += 1;
        } else if (result === "retryable_failure") {
            retryableFailures += 1;
        } else {
            permanentFailures += 1;
        }
    }

    return NextResponse.json({
        processed: events.length,
        sent,
        retryableFailures,
        permanentFailures,
    });
}
