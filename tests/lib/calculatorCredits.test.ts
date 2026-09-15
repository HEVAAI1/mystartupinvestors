import { describe, expect, it } from "vitest";
import {
    FREE_WEEKLY_LIMIT,
    formatResetIn,
    getUtcWeekKey,
    getUtcWeekStart,
    getWeekResetAt,
    isKnownPlan,
    isPaidPlan,
} from "@/lib/calculatorCredits";

describe("calculatorCredits week boundary", () => {
    it("anchors to Monday 00:00 UTC for every day of the week", () => {
        // 2026-09-16 is a Wednesday (UTC).
        const wed = new Date("2026-09-16T13:45:00Z");
        expect(getUtcWeekStart(wed).toISOString()).toBe("2026-09-14T00:00:00.000Z"); // Monday

        // Sunday rolls back to the Monday that started that week, not forward.
        const sun = new Date("2026-09-20T23:59:59Z");
        expect(getUtcWeekStart(sun).toISOString()).toBe("2026-09-14T00:00:00.000Z");

        // Exactly on the boundary: Monday 00:00:00 is its own week start.
        const mon = new Date("2026-09-14T00:00:00Z");
        expect(getUtcWeekStart(mon).toISOString()).toBe("2026-09-14T00:00:00.000Z");

        // One millisecond earlier falls into the previous week.
        const justBefore = new Date("2026-09-13T23:59:59.999Z");
        expect(getUtcWeekStart(justBefore).toISOString()).toBe("2026-09-07T00:00:00.000Z");
    });

    it("resetAt is always the following Monday 00:00 UTC", () => {
        const wed = new Date("2026-09-16T13:45:00Z");
        expect(getWeekResetAt(wed).toISOString()).toBe("2026-09-21T00:00:00.000Z");
    });

    it("week key changes exactly at the Monday boundary", () => {
        expect(getUtcWeekKey(new Date("2026-09-13T23:59:59.999Z"))).toBe("2026-09-07");
        expect(getUtcWeekKey(new Date("2026-09-14T00:00:00.000Z"))).toBe("2026-09-14");
    });
});

describe("formatResetIn", () => {
    it("shows days+hours when more than a day remains", () => {
        const now = new Date("2026-09-16T00:00:00Z");
        const resetAt = new Date("2026-09-18T06:00:00Z");
        expect(formatResetIn(resetAt, now)).toBe("2d 6h");
    });

    it("shows only hours under a day, rounding up", () => {
        const now = new Date("2026-09-16T00:00:00Z");
        const resetAt = new Date("2026-09-16T00:30:00Z");
        expect(formatResetIn(resetAt, now)).toBe("1h");
    });
});

describe("plan fail-closed helpers", () => {
    it("treats null/unknown plans as neither paid nor a known plan", () => {
        expect(isKnownPlan(null)).toBe(false);
        expect(isKnownPlan(undefined)).toBe(false);
        expect(isKnownPlan("enterprize")).toBe(false); // typo
        expect(isPaidPlan(null)).toBe(false);
        expect(isPaidPlan("free")).toBe(false);
    });

    it("recognizes exactly the known plans", () => {
        expect(isKnownPlan("free")).toBe(true);
        expect(isPaidPlan("professional")).toBe(true);
        expect(isPaidPlan("growth")).toBe(true);
        expect(isPaidPlan("enterprise")).toBe(true);
    });

    it("free weekly limit is the single canonical value (5, not the old 3)", () => {
        expect(FREE_WEEKLY_LIMIT).toBe(5);
    });
});
