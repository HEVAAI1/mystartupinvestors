import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ submitted: false });
    }

    const { data, error } = await supabase
      .from("users")
      .select("startup_form_submitted")
      .eq("id", user.id)
      .single();

    if (error || !data) return NextResponse.json({ submitted: false });

    return NextResponse.json({ submitted: data.startup_form_submitted ?? false });
  } catch {
    return NextResponse.json({ submitted: false });
  }
}
