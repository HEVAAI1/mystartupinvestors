import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
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

    const { id: investorId } = await params;
    const invId = parseInt(investorId);
    if (isNaN(invId)) {
      return NextResponse.json({ error: "Invalid investor ID" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // Check if already unlocked
    const { data: existingView } = await admin
      .from("user_investor_views")
      .select("id")
      .eq("user_id", user.id)
      .eq("investor_id", invId)
      .maybeSingle();

    if (existingView) {
      // Already unlocked — return full investor without charging
      const { data: investor } = await admin
        .from("investors")
        .select("*")
        .eq("id", invId)
        .single();

      if (!investor) {
        return NextResponse.json({ error: "Investor not found" }, { status: 404 });
      }

      return NextResponse.json({ investor });
    }

    // Check remaining credits
    const { data: userData } = await admin
      .from("users")
      .select("credits_allocated, credits_used")
      .eq("id", user.id)
      .single();

    const allocated = userData?.credits_allocated ?? 0;
    const used = userData?.credits_used ?? 0;
    const remaining = allocated - used;

    if (remaining <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // Atomically insert view and increment credits
    const [viewResult, creditResult] = await Promise.allSettled([
      admin.from("user_investor_views").insert({
        user_id: user.id,
        investor_id: invId,
      }),
      admin.rpc("increment_credits_used", { user_id: user.id }),
    ]);

    if (viewResult.status === "rejected" || viewResult.value.error) {
      throw viewResult.status === "rejected" ? viewResult.reason : viewResult.value.error;
    }

    if (creditResult.status === "rejected" || creditResult.value?.error) {
      // Fallback: manually increment
      const { error: updateError } = await admin
        .from("users")
        .update({ credits_used: used + 1 })
        .eq("id", user.id);

      if (updateError) throw updateError;
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
