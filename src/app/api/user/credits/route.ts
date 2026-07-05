import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ credits: 0 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("credits_allocated, credits_used")
      .eq("id", user.id)
      .single();

    if (error || !data) return NextResponse.json({ credits: 0 });

    const credits = (data.credits_allocated || 0) - (data.credits_used || 0);
    return NextResponse.json({ credits });
  } catch {
    return NextResponse.json({ credits: 0 });
  }
}
