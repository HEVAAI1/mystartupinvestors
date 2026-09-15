import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { checkRateLimit, getClientIp, peekRateLimit } from "@/lib/rate-limit";
import { FREE_WEEKLY_LIMIT, formatCreditMessage, getUtcWeekKey, getWeekResetAt } from "@/lib/calculatorCredits";

const supabaseAdmin = createSupabaseAdminClient();

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Get user from session
        const { data: { user } } = await supabaseAdmin.auth.getUser(
            request.headers.get("Authorization")?.replace("Bearer ", "") || ""
        );

        // CASE 1: Anonymous User (cookie + server-side IP tracking)
        if (!user) {
            const weekKey = getUtcWeekKey();
            const resetAt = getWeekResetAt();
            const cookieName = `calc_count_${weekKey}`;
            const cookieCount = parseInt(cookieStore.get(cookieName)?.value || "0");
            const ip = getClientIp(request);
            const rateLimitKey = `calc:${weekKey}:${ip}`;

            // ponytail: the cookie count alone resets whenever cookies are
            // cleared. The IP bucket is a server-side (in-memory) counter
            // keyed by a safely-derived IP, not a client-resettable cookie
            // name, so clearing cookies no longer resets the limit. Ceiling:
            // resets on server cold start, and a spoofed/rotated IP still
            // bypasses this — inherent to unauthenticated rate limiting.
            //
            // Fixed off-by-one: this must PEEK the IP bucket (no side
            // effect) to compute how many uses have already happened, then
            // only consume a slot once we've decided to actually grant one.
            // The previous version called the incrementing checkRateLimit
            // before deciding, so its own increment was double-counted into
            // currentCount and then counted again via `+1` below.
            const peek = peekRateLimit(rateLimitKey, FREE_WEEKLY_LIMIT, 7 * 24 * 60 * 60);
            const ipCount = FREE_WEEKLY_LIMIT - peek.remaining;
            const currentCount = Math.max(cookieCount, ipCount);

            if (currentCount >= FREE_WEEKLY_LIMIT) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "LIMIT_REACHED",
                        message: "You've used all 5 free calculations this week. Create a free account to continue.",
                        userState: "anonymous",
                        remaining: 0,
                        limit: FREE_WEEKLY_LIMIT,
                        resetDate: resetAt.toISOString(),
                    },
                    { status: 403 }
                );
            }

            // Now actually consume one IP-bucket slot for this use.
            const ipRateLimit = checkRateLimit(rateLimitKey, FREE_WEEKLY_LIMIT, 7 * 24 * 60 * 60);
            if (!ipRateLimit.allowed) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "LIMIT_REACHED",
                        message: "You've used all 5 free calculations this week. Create a free account to continue.",
                        userState: "anonymous",
                        remaining: 0,
                        limit: FREE_WEEKLY_LIMIT,
                        resetDate: resetAt.toISOString(),
                    },
                    { status: 403 }
                );
            }

            const newCount = currentCount + 1;
            const remaining = FREE_WEEKLY_LIMIT - newCount;
            const response = NextResponse.json({
                success: true,
                userState: "anonymous",
                remaining,
                limit: FREE_WEEKLY_LIMIT,
                message: formatCreditMessage(remaining, resetAt),
                resetDate: resetAt.toISOString(),
            });

            response.cookies.set(cookieName, newCount.toString(), {
                maxAge: 7 * 24 * 60 * 60,
                httpOnly: true,
                sameSite: "lax",
            });

            return response;
        }

        // CASE 2 & 3: Authenticated User — delegate entirely to the shared,
        // idempotent, fail-closed RPC. request_id defaults to a fresh UUID
        // per call; a caller that wants retry-safety (e.g. a client-side
        // retry after a network timeout) can pass its own in the body to
        // reuse the same logical attempt.
        let requestId: string | undefined;
        try {
            const body = await request.json();
            if (typeof body?.requestId === "string") requestId = body.requestId;
        } catch {
            // No/invalid JSON body is fine — we just generate a request id.
        }
        requestId ??= crypto.randomUUID();

        const { data: userData, error: userError } = await supabaseAdmin
            .from("users")
            .select("plan")
            .eq("id", user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json(
                { success: false, error: "USER_NOT_FOUND" },
                { status: 404 }
            );
        }

        const { data: result, error: rpcError } = await supabaseAdmin.rpc("consume_calculator_credit", {
            p_user_id: user.id,
            p_plan: userData.plan,
            p_request_id: requestId,
        });

        if (rpcError || !result) {
            // Fail CLOSED: an RPC error (including the deliberate raise on
            // an unknown/null plan) must never be treated as "allow".
            console.error("consume_calculator_credit failed:", rpcError);
            return NextResponse.json(
                {
                    success: false,
                    error: "CREDITS_UNAVAILABLE",
                    message: "We couldn't verify your calculation credits. Please try again.",
                    userState: "free",
                    remaining: 0,
                },
                { status: 403 }
            );
        }

        if (result.unlimited) {
            return NextResponse.json({
                success: true,
                userState: "paid",
                plan: userData.plan,
                unlimited: true,
                message: "Unlimited calculations",
            });
        }

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "CREDITS_EXHAUSTED",
                    message: "You've used all your free calculations this week. Upgrade for more!",
                    userState: "free",
                    remaining: 0,
                    limit: result.limit,
                    resetDate: result.resetAt,
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            userState: "free",
            remaining: result.remaining,
            limit: result.limit,
            message: formatCreditMessage(result.remaining, result.resetAt),
            resetDate: result.resetAt,
        });

    } catch (error) {
        console.error("Error in use-credit API:", error);
        return NextResponse.json(
            { success: false, error: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}
