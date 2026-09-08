import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextRequest, NextResponse } from "next/server";

function escapePostgrestFilterValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/[,.()%*]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = 50;

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

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query.order("id", { ascending: true }).range(from, to);

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

    const query = supabase.from("investors").insert(body).select();
    const { data, error } = Array.isArray(body) ? await query : await query.single();
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error creating investor:", error);
    return NextResponse.json({ error: "Failed to create investor" }, { status: 500 });
  }
}
