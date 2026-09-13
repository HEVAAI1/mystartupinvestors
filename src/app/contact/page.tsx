"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import SmartNavbar from "@/components/SmartNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          company: data.get("company"),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF7EE] font-[Arial] text-[#31372B]">
      <SmartNavbar />

      <div className="max-w-[700px] mx-auto pt-28 pb-20 px-6">
        <div className="mb-10">
          <h1 className="text-[40px] md:text-[48px] font-bold text-[#31372B] mb-3">
            Contact Us
          </h1>
          <p className="text-[#717182] text-lg leading-relaxed">
            Have a question, feedback, or need help with your account? Send us a message and
            we&apos;ll get back to you as soon as we can.
          </p>
        </div>

        <div className="bg-white border border-[#31372B1F] rounded-2xl p-6 md:p-8 shadow-sm">
          {status === "success" ? (
            <p className="text-[#31372B] font-semibold">
              Thank you for reaching out! Your message has been sent. We&apos;ll be in touch soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Honeypot field, hidden from real users */}
              <div className="hidden" aria-hidden="true">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required maxLength={200} disabled={status === "submitting"} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required maxLength={320} disabled={status === "submitting"} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required maxLength={200} disabled={status === "submitting"} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required maxLength={5000} rows={6} disabled={status === "submitting"} />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              <Button
                type="submit"
                disabled={status === "submitting"}
                className="bg-[#31372B] text-[#FAF7EE] hover:bg-[#31372B]/90 w-fit px-6"
              >
                {status === "submitting" ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
