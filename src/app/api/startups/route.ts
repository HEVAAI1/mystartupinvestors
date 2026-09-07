import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { error: insertError } = await supabase
      .from("startup_leads")
      .insert({ ...body.data, user_id: user.id });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "Failed to submit startup" }, { status: 500 });
    }

    if (body.updateUserFlag) {
      await supabase
        .from("users")
        .update({ startup_form_submitted: true })
        .eq("id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Startup submission error:", error);
    return NextResponse.json({ error: "Failed to submit startup" }, { status: 500 });
  }
}
