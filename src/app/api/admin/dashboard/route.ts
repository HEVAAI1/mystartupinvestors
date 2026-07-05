import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const [users, investors, startups, transactions] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("investors").select("*", { count: "exact", head: true }),
      supabase.from("startup_leads").select("*", { count: "exact", head: true }),
      supabase.from("transactions").select("*", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      usersCount: users.count || 0,
      investorsCount: investors.count || 0,
      startupsCount: startups.count || 0,
      transactionsCount: transactions.count || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
