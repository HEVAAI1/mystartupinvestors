import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { enqueueEmailEvent } from "@/lib/email/outbox";
import { INTERNAL_NOTICE_EMAILS } from "@/lib/email/internal-recipients";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: insertedStartup, error: insertError } = await supabase
      .from("startup_leads")
      .insert({ ...body.data, user_id: user.id })
      .select("id, company_name")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "Failed to submit startup" }, { status: 500 });
    }

    if (body.updateUserFlag) {
      await supabase
        .from("users")
        .update({ startup_form_submitted: true })
        .eq("id", user.id);
    }

    if (insertedStartup) {
      const companyName = typeof insertedStartup.company_name === "string" ? insertedStartup.company_name : "your startup";
      try {
        if (user.email) {
          await enqueueEmailEvent({
            eventKey: `startup_submitted:${insertedStartup.id}`,
            eventType: "startup_submitted",
            userId: user.id,
            recipientEmail: user.email,
            payload: { companyName },
          });
        }
        await enqueueEmailEvent({
          eventKey: `internal_startup_submitted:${insertedStartup.id}`,
          eventType: "internal_startup_submitted",
          recipientEmail: INTERNAL_NOTICE_EMAILS.join(","),
          payload: {
            companyName,
            adminUrl: "https://www.myfundinglist.com/admin/startup-list",
          },
        });
      } catch (emailError) {
        // Never block a durable startup submission on email enqueue failure.
        console.error("Failed to enqueue startup submission emails:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Startup submission error:", error);
    return NextResponse.json({ error: "Failed to submit startup" }, { status: 500 });
  }
}
