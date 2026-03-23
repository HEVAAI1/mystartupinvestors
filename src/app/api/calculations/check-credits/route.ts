import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Get user from session
        const { data: { user } } = await supabaseAdmin.auth.getUser(
            request.headers.get("Authorization")?.replace("Bearer ", "") || ""
        );

        // CASE 1: Anonymous User
        if (!user) {
            const weekId = getWeekId();
            const cookieName = `calc_count_${weekId}`;

            // Get IP address for secondary tracking
            const forwarded = request.headers.get("x-forwarded-for");
            const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
            const ipCookieName = `calc_ip_${weekId}_${ip.replace(/\./g, "_")}`;

            // Check both cookie and IP-based count
            const cookieCount = parseInt(cookieStore.get(cookieName)?.value || "0");
            const ipCount = parseInt(cookieStore.get(ipCookieName)?.value || "0");
            const currentCount = Math.max(cookieCount, ipCount);

            return NextResponse.json({
                userState: "anonymous",
                remaining: Math.max(0, 3 - currentCount),
                limit: 3,
                canCalculate: currentCount < 3,
                message: currentCount >= 3
                    ? "Create a free account to get 3 calculations every week"
                    : `${3 - currentCount} free calculations remaining this week`,
            });
        }

        // CASE 2 & 3: Authenticated User
        const { data: userData, error: userError } = await supabaseAdmin
            .from("users")
            .select("plan, calculation_credits, weekly_calculation_credits, last_calculation_reset_at")
            .eq("id", user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json(
                { error: "USER_NOT_FOUND" },
                { status: 404 }
            );
        }

        // CASE 2: Free User
        if (userData.plan === "free") {
            let weeklyCredits = userData.weekly_calculation_credits || 0;
            let lastResetAt = userData.last_calculation_reset_at;

            // Check if reset is needed
            if (needsWeeklyReset(lastResetAt)) {
                weeklyCredits = 3;
                lastResetAt = new Date().toISOString();
            }

            const resetDate = new Date(new Date(lastResetAt).getTime() + 7 * 24 * 60 * 60 * 1000);

            return NextResponse.json({
                userState: "free",
                remaining: weeklyCredits,
                limit: 3,
                canCalculate: weeklyCredits > 0,
                resetDate: resetDate.toISOString(),
                message: weeklyCredits > 0
                    ? `${weeklyCredits} calculations left this week`
                    : "Upgrade to get more calculation credits",
            });
        }

        // CASE 3: Paid User
        const calculationCredits = userData.calculation_credits;

        // Enterprise (unlimited)
        if (calculationCredits === null) {
            return NextResponse.json({
                userState: "paid",
                plan: userData.plan,
                unlimited: true,
                canCalculate: true,
                message: "Unlimited calculations",
            });
        }

        return NextResponse.json({
            userState: "paid",
            plan: userData.plan,
            remaining: calculationCredits,
            canCalculate: calculationCredits > 0,
            message: calculationCredits > 0
                ? `${calculationCredits} calculation credits remaining`
                : "Purchase more credits to continue",
        });

    } catch (error) {
        console.error("Error in check-credits API:", error);
        return NextResponse.json(
            { error: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}
