import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

function escapePostgrestValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/[,.()%*]/g, (char) => `\\${char}`);
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let query = supabase.from("users").select("id, email, name, role, credits_allocated, credits_used, created_at, startup_form_submitted", { count: "exact" });

    if (search) {
      const safeSearch = escapePostgrestValue(search);
      query = query.or(`email.ilike.%${safeSearch}%,name.ilike.%${safeSearch}%`);
    }

    const { data, count, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [], count: count || 0 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
