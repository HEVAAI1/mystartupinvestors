import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Please upload a deck smaller than 15MB." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `startup-decks/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("startup-decks")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = await supabase.storage
      .from("startup-decks")
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData?.publicUrl || "",
      path: filePath,
    });
  } catch (error) {
    console.error("Error uploading deck:", error);
    return NextResponse.json({ error: "Failed to upload deck" }, { status: 500 });
  }
}
