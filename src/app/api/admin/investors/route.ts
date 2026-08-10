import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextRequest, NextResponse } from "next/server";

function escapePostgrestFilterValue(value: string) {
  return value.replace(/[,.()%]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let query = supabase.from("investors").select("*", { count: "exact" });

    if (search) {
      const escapedSearch = escapePostgrestFilterValue(search);
      query = query.or(
        `name.ilike.%${escapedSearch}%,` +
        `firm_name.ilike.%${escapedSearch}%,` +
        `country.ilike.%${escapedSearch}%,` +
        `type.ilike.%${escapedSearch}%`
      );
    }

    const { data, count, error } = await query.order("id", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data: data || [], count: count || 0 });
  } catch (error) {
    console.error("Error fetching investors:", error);
    return NextResponse.json({ error: "Failed to fetch investors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const body = await request.json();
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase.from("investors").insert(body).select().single();
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error creating investor:", error);
    return NextResponse.json({ error: "Failed to create investor" }, { status: 500 });
  }
}
