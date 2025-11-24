import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  // cookies() must be awaited in Next.js 15
  const cookieStore = await cookies();

  const access_token = cookieStore.get("sb-access-token")?.value;
  const refresh_token = cookieStore.get("sb-refresh-token")?.value;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          ...(access_token && { Authorization: `Bearer ${access_token}` }),
        },
      },
      auth: {
        persistSession: false,
      },
    }
  );
}
