import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const supabaseAdmin = createSupabaseAdminClient();

// Helper to get week ID for anonymous tracking
function getWeekId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil(
        ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
    );
    return `${year}-W${week}`;
}

// Helper to check if weekly reset is needed
function needsWeeklyReset(lastResetAt: string | null): boolean {
    if (!lastResetAt) return true;

    const lastReset = new Date(lastResetAt);
    const now = new Date();
    const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceReset >= 7;
}

type CreditColumn = "weekly_calculation_credits" | "calculation_credits";

// Atomically decrements a credit column, retrying if a concurrent request
// already consumed the previously-read value. Returns the authoritative
// post-update balance, or null if there were no credits left to spend.
async function consumeCredit(
    column: CreditColumn,
    userId: string,
    current: number
): Promise<number | null> {
    let credits = current;

    for (let attempt = 0; attempt < 3; attempt++) {
        if (credits <= 0) {
            return null;
        }

        const { data: updated } = await supabaseAdmin
            .from("users")
            .update({ [column]: credits - 1 })
            .eq("id", userId)
            .eq(column, credits)
            .gt(column, 0)
            .select(column);

        if (updated && updated.length > 0) {
            return (updated[0] as unknown as Record<CreditColumn, number>)[column];
        }

        const { data: userData } = await supabaseAdmin
            .from("users")
            .select(column)
            .eq("id", userId)
            .single();

        credits = (userData as unknown as Record<CreditColumn, number> | null)?.[column] ?? 0;
    }

    return null;
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Get user from session
        const { data: { user } } = await supabaseAdmin.auth.getUser(
            request.headers.get("Authorization")?.replace("Bearer ", "") || ""
        );

        // CASE 1: Anonymous User (cookie + server-side IP tracking)
        if (!user) {
            const weekId = getWeekId();
            const cookieName = `calc_count_${weekId}`;
            const cookieCount = parseInt(cookieStore.get(cookieName)?.value || "0");

            // ponytail: the cookie count alone resets whenever cookies are
            // cleared. The IP bucket is a server-side (in-memory) counter
            // keyed by a safely-derived IP, not a client-resettable cookie
            // name, so clearing cookies no longer resets the limit. Ceiling:
            // resets on server cold start, and a spoofed/rotated IP still
            // bypasses this — inherent to unauthenticated rate limiting.
            const ip = getClientIp(request);
            const ipRateLimit = checkRateLimit(`calc:${weekId}:${ip}`, 3, 7 * 24 * 60 * 60);
            const ipCount = 3 - ipRateLimit.remaining;
            const currentCount = Math.max(cookieCount, ipCount);

            if (currentCount >= 3 || !ipRateLimit.allowed) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "LIMIT_REACHED",
                        message: "You've used all 3 free calculations this week. Create a free account to continue.",
                        userState: "anonymous",
                        remaining: 0,
                        limit: 3,
                    },
                    { status: 403 }
                );
            }

            // Increment counter
            const newCount = currentCount + 1;
            const response = NextResponse.json({
                success: true,
                userState: "anonymous",
                remaining: 3 - newCount,
                limit: 3,
                message: `${3 - newCount} free calculations remaining this week`,
            });

            response.cookies.set(cookieName, newCount.toString(), {
                maxAge: 7 * 24 * 60 * 60,
                httpOnly: true,
                sameSite: "lax",
            });

            return response;
        }

        // CASE 2 & 3: Authenticated User
        const { data: userData, error: userError } = await supabaseAdmin
            .from("users")
            .select("plan, calculation_credits, weekly_calculation_credits, last_calculation_reset_at")
            .eq("id", user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json(
                { success: false, error: "USER_NOT_FOUND" },
                { status: 404 }
            );
        }

        // CASE 2: Free User (Weekly reset logic)
        if (userData.plan === "free") {
            let weeklyCredits = userData.weekly_calculation_credits || 0;
            let lastResetAt = userData.last_calculation_reset_at;

            // Check if reset is needed (lazy evaluation)
            if (needsWeeklyReset(lastResetAt)) {
                const newResetAt = new Date().toISOString();

                let resetQuery = supabaseAdmin
                    .from("users")
                    .update({
                        weekly_calculation_credits: 3,
                        last_calculation_reset_at: newResetAt,
                    })
                    .eq("id", user.id);

                resetQuery = lastResetAt
                    ? resetQuery.eq("last_calculation_reset_at", lastResetAt)
                    : resetQuery.is("last_calculation_reset_at", null);

                const { data: resetRows } = await resetQuery.select();

                if (resetRows && resetRows.length > 0) {
                    weeklyCredits = 3;
                    lastResetAt = newResetAt;
                } else {
                    const { data: freshUserData } = await supabaseAdmin
                        .from("users")
                        .select("weekly_calculation_credits, last_calculation_reset_at")
                        .eq("id", user.id)
                        .single();

                    weeklyCredits = freshUserData?.weekly_calculation_credits || 0;
                    lastResetAt = freshUserData?.last_calculation_reset_at ?? lastResetAt;
                }
            }

            // Check if credits available
            if (weeklyCredits <= 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "CREDITS_EXHAUSTED",
                        message: "You've used all your free calculations this week. Upgrade for more!",
                        userState: "free",
                        remaining: 0,
                        limit: 3,
                        resetDate: new Date(new Date(lastResetAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                    { status: 403 }
                );
            }

            // Consume 1 credit
            const newWeeklyCredits = await consumeCredit("weekly_calculation_credits", user.id, weeklyCredits);

            if (newWeeklyCredits === null) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "CREDITS_EXHAUSTED",
                        message: "You've used all your free calculations this week. Upgrade for more!",
                        userState: "free",
                        remaining: 0,
                        limit: 3,
                        resetDate: new Date(new Date(lastResetAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                    { status: 403 }
                );
            }

            return NextResponse.json({
                success: true,
                userState: "free",
                remaining: newWeeklyCredits,
                limit: 3,
                message: `${newWeeklyCredits} calculations left this week`,
                resetDate: new Date(new Date(lastResetAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }

        // CASE 3: Paid User (Persistent credits)
        const calculationCredits = userData.calculation_credits;

        // Enterprise (unlimited)
        if (calculationCredits === null) {
            return NextResponse.json({
                success: true,
                userState: "paid",
                plan: userData.plan,
                unlimited: true,
                message: "Unlimited calculations",
            });
        }

        // Check if credits available
        if (calculationCredits <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "CREDITS_EXHAUSTED",
                    message: "You've used all your calculation credits. Contact support to purchase more.",
                    userState: "paid",
                    plan: userData.plan,
                    remaining: 0,
                },
                { status: 403 }
            );
        }

        // Consume 1 credit
        const newCalculationCredits = await consumeCredit("calculation_credits", user.id, calculationCredits);

        if (newCalculationCredits === null) {
            return NextResponse.json(
                {
                    success: false,
                    error: "CREDITS_EXHAUSTED",
                    message: "You've used all your calculation credits. Contact support to purchase more.",
                    userState: "paid",
                    plan: userData.plan,
                    remaining: 0,
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            userState: "paid",
            plan: userData.plan,
            remaining: newCalculationCredits,
            message: `${newCalculationCredits} calculation credits remaining`,
        });

    } catch (error) {
        console.error("Error in use-credit API:", error);
        return NextResponse.json(
            { success: false, error: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}
