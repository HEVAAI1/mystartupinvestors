import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(`signin:${ip}`, 5, 900);
    if (!allowed) {
      return rateLimitResponse(retryAfterSeconds);
    }

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
