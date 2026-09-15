import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { enqueueEmailEvent } from "@/lib/email/outbox";

const FREE_LOW_THRESHOLD = 2;
const PAID_LOW_THRESHOLD = 10;

async function notifyInvestorCreditLevel(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  userEmail: string | undefined,
  remaining: number,
) {
  const { data: userRow } = await admin
    .from("users")
    .select("plan, credits_allocated")
    .eq("id", userId)
    .single();

  if (!userRow || !userEmail) {
    return;
  }

  const lowThreshold = userRow.plan === "free" ? FREE_LOW_THRESHOLD : PAID_LOW_THRESHOLD;
  // The current allocation total acts as the "credit cycle" id: it only
  // changes when a new purchase grants more credits, so the same low/zero
  // notice is not re-sent again within the same cycle.
  const creditCycle = userRow.credits_allocated;

  try {
    if (remaining <= 0) {
      await enqueueEmailEvent({
        eventKey: `investor_credits_zero:${userId}:${creditCycle}`,
        eventType: "investor_credits_zero",
        userId,
        recipientEmail: userEmail,
        payload: { remaining: 0 },
      });
    } else if (remaining <= lowThreshold) {
      await enqueueEmailEvent({
        eventKey: `investor_credits_low:${userId}:${creditCycle}`,
        eventType: "investor_credits_low",
        userId,
        recipientEmail: userEmail,
        payload: { remaining },
      });
    }
  } catch (emailError) {
    // Never block the unlock response on email enqueue failure.
    console.error("Failed to enqueue investor credit-level email:", emailError);
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`investors-unlock:${user.id}`, 10, 60);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const { id: investorId } = await params;
    const invId = parseInt(investorId);
    if (isNaN(invId)) {
      return NextResponse.json({ error: "Invalid investor ID" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Atomically check credits, record the unlock, and charge a credit
    // in a single row-locked transaction (see unlock_investor RPC).
    const { data: unlockResult, error: unlockError } = await admin.rpc(
      "unlock_investor",
      { p_user_id: user.id, p_investor_id: invId },
    );

    if (unlockError) {
      if (unlockError.message?.includes("insufficient credits")) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
      }
      throw unlockError;
    }

    if (!unlockResult?.unlocked) {
      return NextResponse.json({ error: "Failed to unlock investor" }, { status: 500 });
    }

    if (!unlockResult.alreadyUnlocked) {
      await notifyInvestorCreditLevel(admin, user.id, user.email, unlockResult.remaining);
    }

    // Return full investor profile
    const { data: investor } = await admin
      .from("investors")
      .select("*")
      .eq("id", invId)
      .single();

    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }

    return NextResponse.json({ investor });
  } catch (error) {
    console.error("Error unlocking investor:", error);
    return NextResponse.json({ error: "Failed to unlock investor" }, { status: 500 });
  }
}
