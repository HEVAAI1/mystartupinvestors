import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("investors").update(body).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating investor:", error);
    return NextResponse.json({ error: "Failed to update investor" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("investors").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting investor:", error);
    return NextResponse.json({ error: "Failed to delete investor" }, { status: 500 });
  }
}
