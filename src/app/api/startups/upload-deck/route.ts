import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

// Pitch decks only. Maps allowed extension -> the MIME type(s) browsers send
// for it, so we never trust either signal alone.
const ALLOWED_DECK_TYPES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  key: ["application/x-iwork-keynote-sffkey", "application/octet-stream"],
};

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

    // Extension is derived from a fixed allowlist (never from the raw
    // filename) so it can't be used for a path-traversal storage key, and
    // the client-sent Content-Type must match what that extension expects.
    const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowedMimeTypes = ALLOWED_DECK_TYPES[rawExt];
    if (!allowedMimeTypes || !allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, PPT, PPTX, or Keynote deck." },
        { status: 400 }
      );
    }
    const fileExt = rawExt;

    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

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
