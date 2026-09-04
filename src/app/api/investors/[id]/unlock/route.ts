import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

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
