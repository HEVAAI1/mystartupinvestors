import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const { paymentId } = await params;
    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ transaction: null }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("payment_id", paymentId)
      .eq("user_id", user.id)
      .single();

    if (error) return NextResponse.json({ transaction: null }, { status: 404 });
    return NextResponse.json({ transaction: data });
  } catch {
    return NextResponse.json({ transaction: null });
  }
}
