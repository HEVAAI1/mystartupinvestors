import { beforeEach, describe, expect, it, vi } from "vitest";

type InsertRow = {
    event_key: string;
    event_type: string;
    recipient_email: string;
    payload: Record<string, unknown>;
};

const rows: InsertRow[] = [];

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
};

vi.mock("@/lib/supabaseServer", () => ({
    createSupabaseAdminClient: () => ({
        from: (table: string) => {
            if (table !== "email_outbox") {
                throw new Error(`unexpected table: ${table}`);
            }

            return emailOutboxTable;
        },
    }),
}));

const { enqueueEmailEvent } = await import("@/lib/email/outbox");

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
});
