import { beforeEach, describe, expect, it, vi } from "vitest";

type InsertRow = {
    event_key: string;
    event_type: string;
    recipient_email: string;
    payload: Record<string, unknown>;
};

const rows: InsertRow[] = [];
const claimedRows: Record<string, unknown>[] = [];
let eventStatus = "sending";

const emailOutboxTable = {
    insert(row: InsertRow) {
        return {
            select() {
                return {
                    async maybeSingle() {
                        if (rows.some((existing) => existing.event_key === row.event_key)) {
                            return { data: null, error: { code: "23505", message: "duplicate key" } };
                        }

                        rows.push(row);
                        return { data: row, error: null };
                    },
                };
            },
        };
    },
    select() {
        return {
            eq(_column: string, eventKey: string) {
                return {
                    async maybeSingle() {
                        return { data: rows.find((row) => row.event_key === eventKey) ?? null, error: null };
                    },
                };
            },
        };
    },
    update(patch: Record<string, unknown>) {
        const filters: Array<[string, unknown]> = [];
        const query = {
            eq(column: string, value: unknown) {
                filters.push([column, value]);
                return query;
            },
            select() {
                return {
                    async maybeSingle() {
                        const idMatches = filters.some(([column, value]) => column === "id" && value === "event-1");
                        const statusMatches = filters.some(([column, value]) => column === "status" && value === eventStatus);

                        if (!idMatches || !statusMatches) {
                            return { data: null, error: null };
                        }

                        eventStatus = String(patch.status);
                        return { data: { id: "event-1" }, error: null };
                    },
                };
            },
        };

        return query;
    },
};

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseAdminClient: () => ({
        from: (table: string) => {
            if (table !== "email_outbox") {
                throw new Error(`unexpected table: ${table}`);
            }

            return emailOutboxTable;
        },
        rpc: async (functionName: string, parameters: Record<string, unknown>) => {
            if (functionName !== "claim_pending_email_events") {
                throw new Error(`unexpected function: ${functionName}`);
            }

            if (parameters.p_limit !== 25) {
                throw new Error(`unexpected claim limit: ${parameters.p_limit}`);
            }

            return { data: claimedRows, error: null };
        },
    }),
}));

const {
    claimPendingEmailEvents,
    enqueueEmailEvent,
    markEmailAttemptFailed,
    markEmailSent,
} = await import("@/lib/email/outbox");

const receiptInput = (eventKey: string) => ({
    eventKey,
    eventType: "purchase_receipt" as const,
    recipientEmail: "buyer@example.com",
    payload: { plan: "professional", amountUsd: 19, credits: 60 },
});

const withdrawalInput = {
    eventKey: "withdrawal_requested:withdrawal_1",
    eventType: "withdrawal_requested" as const,
    recipientEmail: "affiliate@example.com",
};

describe("enqueueEmailEvent", () => {
    beforeEach(() => {
        rows.splice(0, rows.length);
        claimedRows.splice(0, claimedRows.length);
        eventStatus = "sending";
    });

    it("enqueues one event for a repeated event key", async () => {
        await enqueueEmailEvent(receiptInput("purchase_receipt:pay_1"));
        await enqueueEmailEvent(receiptInput("purchase_receipt:pay_1"));

        expect(rows).toHaveLength(1);
    });

    it("does not persist withdrawal bank fields in payload", async () => {
        await expect(enqueueEmailEvent({
            ...withdrawalInput,
            payload: { account_number: "123" },
        })).rejects.toThrow("sensitive payout fields are not allowed");
    });

    it("does not persist nested IFSC payout fields in payload", async () => {
        await expect(enqueueEmailEvent({
            ...withdrawalInput,
            payload: { payout: { ifsc_code: "ABCD0123456" } },
        })).rejects.toThrow("sensitive payout fields are not allowed");

        expect(rows).toHaveLength(0);
    });

    it("returns events reclaimed from an interrupted worker lease", async () => {
        claimedRows.push({
            id: "event-1",
            event_key: "purchase_receipt:pay_1",
            status: "sending",
            attempt_count: 2,
        });

        const events = await claimPendingEmailEvents(25);

        expect(events).toEqual(claimedRows);
    });

    it("rejects marking sent when the event is no longer sending", async () => {
        eventStatus = "sent";

        await expect(markEmailSent("event-1", "resend-1"))
            .rejects.toThrow("email outbox mark sent did not update a sending event");
    });

    it("rejects marking failed when the event is no longer sending", async () => {
        eventStatus = "failed";

        await expect(markEmailAttemptFailed("event-1", "temporary provider failure", true))
            .rejects.toThrow("email outbox mark failed did not update a sending event");
    });
});
