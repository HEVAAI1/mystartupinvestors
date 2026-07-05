import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return NextResponse.json({ session: null }, { status: 200 });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ session: null }, { status: 200 });
  }
}
