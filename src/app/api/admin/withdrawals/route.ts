import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    let query = supabase.from("withdrawal_requests").select("*", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, count, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [], count: count || 0 });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}
