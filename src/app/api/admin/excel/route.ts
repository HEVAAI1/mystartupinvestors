import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("investors").select("*").order("id", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Error exporting investors:", error);
    return NextResponse.json({ error: "Failed to export investors" }, { status: 500 });
  }
}
