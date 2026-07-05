import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ user: null }, { status: 200 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
