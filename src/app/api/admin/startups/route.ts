import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let query = supabase.from("startup_leads").select("*", { count: "exact" });

    if (search) {
      query = query.or(
        `startup_name.ilike.%${search}%,` +
        `founder_name.ilike.%${search}%,` +
        `email.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [], count: count || 0 });
  } catch (error) {
    console.error("Error fetching startups:", error);
    return NextResponse.json({ error: "Failed to fetch startups" }, { status: 500 });
  }
}
