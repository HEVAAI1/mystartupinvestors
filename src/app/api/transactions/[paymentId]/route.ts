import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const { paymentId } = await params;
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("payment_id", paymentId)
      .single();

    if (error) return NextResponse.json({ transaction: null });
    return NextResponse.json({ transaction: data });
  } catch {
    return NextResponse.json({ transaction: null });
  }
}
