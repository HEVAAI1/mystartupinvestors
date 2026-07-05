import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { maskInvestor } from "@/lib/investor-masking.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "7");
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const industry = searchParams.get("industry") || "";
    const showViewed = searchParams.get("showViewed") === "true";

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const admin = createSupabaseAdminClient();

    let query = admin
      .from("investors")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,` +
        `firm_name.ilike.%${search}%,` +
        `preference_sector.ilike.%${search}%,` +
        `country.ilike.%${search}%,` +
        `type.ilike.%${search}%`
      );
    }

    if (location) {
      query = query.eq("country", location);
    }

    if (industry) {
      query = query.ilike("preference_sector", `%${industry}%`);
    }

    if (showViewed) {
      const { data: viewedIds } = await admin
        .from("user_investor_views")
        .select("investor_id")
        .eq("user_id", user.id);

      if (viewedIds && viewedIds.length > 0) {
        query = query.in("id", viewedIds.map(v => v.investor_id));
      } else {
        return NextResponse.json({ data: [], count: 0 });
      }
    }

    // Execute the query
    const { data: rawData, count, error } = await query
      .range(from, to)
      .order("id", { ascending: true });

    if (error) throw error;

    // Fetch which investors this user has unlocked
    const rawIds = (rawData || []).map(r => r.id);
    let unlockedIds: Set<number> = new Set();

    if (rawIds.length > 0 && !showViewed) {
      const { data: views } = await admin
        .from("user_investor_views")
        .select("investor_id")
        .eq("user_id", user.id)
        .in("investor_id", rawIds);

      if (views) {
        unlockedIds = new Set(views.map(v => v.investor_id));
      }
    } else if (showViewed) {
      // Already filtered to viewed only, all are unlocked
      unlockedIds = new Set(rawIds);
    }

    const data = (rawData || []).map(inv => maskInvestor(inv, unlockedIds.has(inv.id)));

    return NextResponse.json({ data, count: count || 0 });
  } catch (error) {
    console.error("Error fetching investors:", error);
    return NextResponse.json({ error: "Failed to fetch investors" }, { status: 500 });
  }
}
