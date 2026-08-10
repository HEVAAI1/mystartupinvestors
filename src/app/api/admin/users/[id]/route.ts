import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = ["name", "email", "startup_form_submitted"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) updates[field] = body[field];
    }
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("users").update(updates).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
