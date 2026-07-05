import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SignOut error:", error);
    return NextResponse.json({ error: "Sign out failed" }, { status: 500 });
  }
}
