import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { maskInvestor } from "@/lib/investor-masking.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ hasAccess: false, investor: null });
    }

    const { searchParams } = new URL(request.url);
    const investorId = searchParams.get("investorId") || "";

    if (!investorId) {
      return NextResponse.json({ hasAccess: false, investor: null });
    }

    const admin = createSupabaseAdminClient();

    const [investorResult, viewResult] = await Promise.all([
      admin.from("investors").select("*").eq("id", investorId).single(),
      admin
        .from("user_investor_views")
        .select("*")
        .eq("user_id", user.id)
        .eq("investor_id", investorId)
        .maybeSingle(),
    ]);

    if (investorResult.error) throw investorResult.error;

    const hasAccess = !!viewResult.data;
    const investor = maskInvestor(investorResult.data, hasAccess);

    return NextResponse.json({
      investor,
      hasAccess,
    });
  } catch (error) {
    console.error("Error fetching investor access:", error);
    return NextResponse.json({ error: "Failed to fetch investor" }, { status: 500 });
  }
}
