import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { enqueueEmailEvent } from "@/lib/email/outbox";

const CONTACT_EMAILS = ["hi@eaglegrowthpartners.com", "saqlain@heva.ai", "fazal@heva.ai"];

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  // Honeypot field: real users never fill this in, bots usually do.
  company: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`contact-form:${clientIp}`, 5, 60);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;

  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM_EMAIL) {
    console.error("RESEND_API_KEY or CONTACT_FROM_EMAIL is not configured");
    return NextResponse.json({ error: "Contact form is not configured." }, { status: 500 });
  }

  const requestId = randomUUID();

  try {
    await enqueueEmailEvent({
      eventKey: `contact_received:${requestId}`,
      eventType: "contact_received",
      recipientEmail: email,
      payload: { subject },
    });

    await enqueueEmailEvent({
      eventKey: `internal_contact_request:${requestId}`,
      eventType: "internal_contact_request",
      recipientEmail: CONTACT_EMAILS.join(","),
      payload: { name, subject, message, replyTo: email },
    });
  } catch (enqueueError) {
    console.error("Failed to enqueue contact email:", enqueueError);
    return NextResponse.json({ error: "Failed to send message." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
