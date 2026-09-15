import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { getClientIp, peekRateLimit } from "@/lib/rate-limit";
import { FREE_WEEKLY_LIMIT, formatCreditMessage, getUtcWeekKey, getWeekResetAt, isPaidPlan } from "@/lib/calculatorCredits";

const supabaseAdmin = createSupabaseAdminClient();

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Get user from session
        const { data: { user } } = await supabaseAdmin.auth.getUser(
            request.headers.get("Authorization")?.replace("Bearer ", "") || ""
        );

        const resetAt = getWeekResetAt();

        // CASE 1: Anonymous User
        if (!user) {
            const weekKey = getUtcWeekKey();
            const cookieName = `calc_count_${weekKey}`;
            const cookieCount = parseInt(cookieStore.get(cookieName)?.value || "0");

            // Same server-side IP bucket used by use-credit; peek only, no increment.
            const ip = getClientIp(request);
            const ipRateLimit = peekRateLimit(`calc:${weekKey}:${ip}`, FREE_WEEKLY_LIMIT, 7 * 24 * 60 * 60);
            const ipCount = FREE_WEEKLY_LIMIT - ipRateLimit.remaining;
            const currentCount = Math.max(cookieCount, ipCount);
            const remaining = Math.max(0, FREE_WEEKLY_LIMIT - currentCount);

            return NextResponse.json({
                userState: "anonymous",
                remaining,
                limit: FREE_WEEKLY_LIMIT,
                canCalculate: currentCount < FREE_WEEKLY_LIMIT,
                resetDate: resetAt.toISOString(),
                message: currentCount >= FREE_WEEKLY_LIMIT
                    ? "Create a free account to get 5 calculations every week"
                    : formatCreditMessage(remaining, resetAt),
            });
        }

        // CASE 2 & 3: Authenticated User. Read-only — safe to compute the
        // week rollover in JS here since nothing is written; the
        // authoritative, concurrency-safe write path is
        // consume_calculator_credit() in use-credit/route.ts.
        const { data: userData, error: userError } = await supabaseAdmin
            .from("users")
            .select("plan, weekly_credit_week_key, weekly_credits_used")
            .eq("id", user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json(
                { error: "USER_NOT_FOUND" },
                { status: 404 }
            );
        }

        // Fail CLOSED: an unrecognized/null plan is never treated as unlimited.
        if (userData.plan === "free" || !isPaidPlan(userData.plan)) {
            // Postgres DATE columns come back from supabase-js as "YYYY-MM-DD",
            // the same format getUtcWeekKey() produces, so this compares directly.
            const currentWeekKey = getUtcWeekKey();
            const used = userData.weekly_credit_week_key === currentWeekKey ? (userData.weekly_credits_used ?? 0) : 0;
            const remaining = Math.max(0, FREE_WEEKLY_LIMIT - used);

            return NextResponse.json({
                userState: "free",
                remaining,
                limit: FREE_WEEKLY_LIMIT,
                canCalculate: remaining > 0,
                resetDate: resetAt.toISOString(),
                message: remaining > 0
                    ? formatCreditMessage(remaining, resetAt)
                    : "Upgrade to get more calculation credits",
            });
        }

        // CASE 3: Known paid plan — unlimited tool calculations.
        return NextResponse.json({
            userState: "paid",
            plan: userData.plan,
            unlimited: true,
            canCalculate: true,
            message: "Unlimited calculations",
        });

    } catch (error) {
        console.error("Error in check-credits API:", error);
        return NextResponse.json(
            { error: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}
