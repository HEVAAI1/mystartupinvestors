import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { provider, redirectTo } = await request.json();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider || "google",
      options: { redirectTo: redirectTo || `${request.headers.get("origin")}/auth/callback` },
    });
    if (error) throw error;
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("SignIn error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
