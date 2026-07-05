import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("investors")
      .select("country, preference_sector")
      .range(0, 1999);

    if (error) throw error;

    if (data) {
      const locations = Array.from(
        new Set(data.map((item) => item.country).filter(Boolean))
      ).sort();

      const industries = Array.from(
        new Set(
          data
            .flatMap((item) =>
              item.preference_sector
                ?.split(",")
                .map((sector: string) => sector.trim())
            )
            .filter(Boolean)
        )
      ).sort();

      return NextResponse.json({ locations, industries });
    }

    return NextResponse.json({ locations: [], industries: [] });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json({ locations: [], industries: [] });
  }
}
