import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = [
  "company_name",
  "designation",
  "company_website",
  "profile",
  "industry",
  "current_arr",
  "looking_to_raise",
  "pre_money_valuation",
  "funding_status",
  "previous_funding_amount",
  "referral_source",
  "additional_notes",
] as const;

export async function GET() {
  try {
    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ startup: null });
    }

    const supabase = createSupabaseAdminClient();
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
    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { field, value, id } = await request.json();

    if (!EDITABLE_FIELDS.includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("startup_leads")
      .update({ [field]: value })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating startup:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
