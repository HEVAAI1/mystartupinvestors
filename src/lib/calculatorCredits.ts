// Shared constants/helpers for the calculator weekly-credit system. Every
// caller (anonymous cookie/IP path, authenticated RPC path, and the
// read-only status check) must use these so the reset boundary and limit
// can never drift apart between callers again.

// Free-tier weekly allowance. This was inconsistently 3 (an old, never-run
// `database_migration_calculation_credits.sql`) vs 5 (the live API routes).
// 5 is the one actually shipped/displayed to users, so it's canonical here.
export const FREE_WEEKLY_LIMIT = 5;

// Plans that map to unlimited calculator use. Anything not in this set
// (including null/undefined/typos) must fail closed — see
// consume_calculator_credit's plan check in the migration.
export const PAID_PLANS = ["professional", "growth", "enterprise"] as const;
export const KNOWN_PLANS = ["free", ...PAID_PLANS] as const;
export type KnownPlan = (typeof KNOWN_PLANS)[number];

export function isKnownPlan(plan: unknown): plan is KnownPlan {
    return typeof plan === "string" && (KNOWN_PLANS as readonly string[]).includes(plan);
}

export function isPaidPlan(plan: unknown): boolean {
    return typeof plan === "string" && (PAID_PLANS as readonly string[]).includes(plan);
}

// UTC-Monday-anchored calendar week (ISO week, but we don't need the ISO
// year-week label — the Monday's own date is a simpler, unambiguous key
// and matches what Postgres computes via date_trunc('week', ...)::date).
export function getUtcWeekStart(date: Date = new Date()): Date {
    const day = date.getUTCDay(); // 0 = Sunday ... 6 = Saturday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    monday.setUTCDate(monday.getUTCDate() + diffToMonday);
    return monday;
}

// "YYYY-MM-DD" of the current week's Monday — the cycle key stored
// alongside usage counts (weekly_credit_week_key in the DB, calc_week
// cookie for anonymous users).
export function getUtcWeekKey(date: Date = new Date()): string {
    return getUtcWeekStart(date).toISOString().slice(0, 10);
}

// The real, stable reset deadline: next UTC Monday 00:00.
export function getWeekResetAt(date: Date = new Date()): Date {
    const start = getUtcWeekStart(date);
    return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
}

// "2d 14h" / "6h" style countdown to a resetAt timestamp, for the shared
// credit-status message shown across every calculator page.
export function formatResetIn(resetAt: string | Date, now: Date = new Date()): string {
    const resetMs = new Date(resetAt).getTime();
    const remainingMs = Math.max(0, resetMs - now.getTime());
    const totalHours = Math.ceil(remainingMs / (60 * 60 * 1000));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) return `${days}d ${hours}h`;
    return `${Math.max(hours, remainingMs > 0 ? 1 : 0)}h`;
}

export function formatCreditMessage(remaining: number, resetAt: string | Date): string {
    return `${remaining} of ${FREE_WEEKLY_LIMIT} remaining · resets in ${formatResetIn(resetAt)}`;
}
