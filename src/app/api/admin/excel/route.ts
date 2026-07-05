import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
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
