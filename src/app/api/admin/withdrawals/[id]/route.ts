import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await params;
    const { status } = await request.json();
    const supabase = createSupabaseAdminClient();

    // Atomic RPC: locks the withdrawal row, validates the status transition,
    // and increments affiliates.total_paid in the same transaction when
    // paying out — prevents re-processing an already-paid/rejected request.
    const { data: withdrawal, error } = await supabase
      .rpc("set_withdrawal_status", { p_withdrawal_id: id, p_status: status })
      .single();

    if (error) {
      const message = error.message || "Failed to update withdrawal";
      const isInvalidTransition =
        message.includes("already") ||
        message.includes("Invalid status") ||
        message.includes("Cannot revert") ||
        message.includes("not found");
      return NextResponse.json(
        { error: message },
        { status: isInvalidTransition ? 400 : 500 }
      );
    }

    return NextResponse.json({ success: true, withdrawal });
  } catch (error) {
    console.error("Error updating withdrawal:", error);
    return NextResponse.json({ error: "Failed to update withdrawal" }, { status: 500 });
  }
}
