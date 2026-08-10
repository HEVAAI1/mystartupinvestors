import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const supabase = createSupabaseAdminClient();

    const [users, investors, startups, transactions] = await Promise.all([
      supabase.from("users").select("id, role, plan, created_at", { count: "exact", head: false }),
      supabase.from("investors").select("id, country, preference_sector, created_at", { count: "exact", head: false }),
      supabase.from("startup_leads").select("id, industry, created_at", { count: "exact", head: false }),
      supabase.from("transactions").select("id, amount, plan_type, status, created_at", { count: "exact", head: false }),
    ]);

    return NextResponse.json({
      users: users.data || [],
      investors: investors.data || [],
      startups: startups.data || [],
      transactions: transactions.data || [],
      counts: {
        users: users.count ?? 0,
        investors: investors.count ?? 0,
        startups: startups.count ?? 0,
        transactions: transactions.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Error fetching visualization data:", error);
    return NextResponse.json(
      { error: "Failed to fetch visualization data" },
      { status: 500 }
    );
  }
}
