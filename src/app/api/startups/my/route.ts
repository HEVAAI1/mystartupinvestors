import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ startup: null });
    }

    const { data, error } = await supabase
      .from("startup_leads")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) return NextResponse.json({ startup: null });
    return NextResponse.json({ startup: data });
  } catch {
    return NextResponse.json({ startup: null });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { field, value, id } = await request.json();

    const { error } = await supabase
      .from("startup_leads")
      .update({ [field]: value })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating startup:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
