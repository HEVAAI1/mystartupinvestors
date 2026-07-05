import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const [users, investors, startups, transactions] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("investors").select("*"),
      supabase.from("startup_leads").select("*"),
      supabase.from("transactions").select("*"),
    ]);

    return NextResponse.json({
      users: users.data || [],
      investors: investors.data || [],
      startups: startups.data || [],
      transactions: transactions.data || [],
    });
  } catch (error) {
    console.error("Error fetching visualization data:", error);
    return NextResponse.json(
      { error: "Failed to fetch visualization data" },
      { status: 500 }
    );
  }
}
