import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, count, error } = await supabase
      .from("affiliates")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [], count: count || 0 });
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    return NextResponse.json({ error: "Failed to fetch affiliates" }, { status: 500 });
  }
}
