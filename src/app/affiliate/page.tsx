"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function AffiliateLandingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // Capture ?ref= from URL and save to localStorage with 24h expiry
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      localStorage.setItem("mfl_ref_code", ref);
      localStorage.setItem("mfl_ref_expiry", String(expiry));
    }
  }, []);

  const handleGetLink = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push("/affiliate/dashboard");
    } else {
      localStorage.setItem("mfl_next_path", "/affiliate/dashboard");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) console.error("Google Login Error:", error);
    }
  };

  const steps = [
    {
      number: "01",
      title: "Share Your Link",
      description: "Get your unique referral link and share it with founders you know.",
    },
    {
      number: "02",
      title: "They Sign Up & Pay",
      description: "When someone visits through your link and makes a purchase, we track it.",
    },
    {
      number: "03",
      title: "Earn 25% Commission",
      description: "You earn 25% of every payment they ever make — for life.",
    },
  ];

  const benefits = [
    {
      icon: "♾️",
      title: "Lifetime Commissions",
      description: "Once a user is referred, every future payment they make generates commission for you.",
    },
    {
      icon: "💰",
      title: "No Earnings Cap",
      description: "There's no limit. Refer 1 founder or 1,000 — you earn on every single one.",
    },
    {
      icon: "⚡",
      title: "Fast Manual Payouts",
      description: "Request a withdrawal anytime. Our team processes payouts quickly.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAF7EE] font-[Arial]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[rgba(250,247,238,0.95)] border-b border-[rgba(49,55,43,0.1)] backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <Image src="/Logo.svg" alt="MyFundingList" width={100} height={38} className="h-[38px] w-auto" />
        </Link>
        <div className="flex gap-3">
          <Link href="/" className="text-sm font-medium text-[#31372B] hover:opacity-70 transition">
            Back to Home
          </Link>
          <button
            onClick={handleGetLink}
            className="bg-[#31372B] text-[#FAF7EE] text-sm font-bold px-4 py-2 rounded-lg hover:bg-black transition cursor-pointer"
          >
            Get Your Link
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[rgba(49,55,43,0.08)] border border-[rgba(49,55,43,0.1)] rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#C6FF55]"></div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#31372B]">Affiliate Program</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-[#31372B] leading-tight mb-6 font-funnel-display">
          Earn with<br />
          <span className="text-[#31372B] relative">MyFundingList</span>
        </h1>

        <p className="text-[#717182] text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
          Invite startup founders to MyFundingList and earn{" "}
          <span className="font-bold text-[#31372B]">25% commission</span> on every successful payment —{" "}
          <span className="font-bold text-[#31372B]">for life</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGetLink}
            className="bg-[#31372B] text-[#FAF7EE] font-bold px-8 py-4 rounded-xl text-base hover:bg-black transition cursor-pointer shadow-lg"
          >
            Become an Affiliate →
          </button>
          <a
            href="#how-it-works"
            className="border border-[#31372B]/30 text-[#31372B] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#EDF4E5] transition"
          >
            How It Works
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-3 gap-8 w-full max-w-lg border border-[#31372B]/10 bg-white rounded-2xl px-8 py-6 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#31372B] font-funnel-display">25%</div>
            <div className="text-xs text-[#717182] mt-1">Commission</div>
          </div>
          <div className="text-center border-x border-[#31372B]/10">
            <div className="text-2xl font-bold text-[#31372B] font-funnel-display">Forever</div>
            <div className="text-xs text-[#717182] mt-1">Lifetime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#31372B] font-funnel-display">$0</div>
            <div className="text-xs text-[#717182] mt-1">To Join</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#31372B] font-funnel-display mb-4">How It Works</h2>
            <p className="text-[#717182] text-base">Three simple steps to start earning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-[#FAF7EE] rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300 border border-[#31372B]/10"
              >
                <div className="text-5xl font-bold text-[#C6FF55] font-funnel-display mb-4 leading-none" style={{ WebkitTextStroke: '2px #31372B' }}>
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-[#31372B] mb-2">{step.title}</h3>
                <p className="text-[#717182] text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#FAF7EE] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#31372B] font-funnel-display mb-4">Why Partner With Us</h2>
            <p className="text-[#717182] text-base">Built for people who genuinely want to help founders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-2xl p-8 border border-[#31372B]/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-[#31372B] mb-2">{benefit.title}</h3>
                <p className="text-[#717182] text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#31372B] py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-funnel-display mb-4">
            Start Earning Today
          </h2>
          <p className="text-white/70 text-base mb-10 leading-relaxed">
            Join our affiliate program, get your unique link, and start earning lifetime commissions.
            It&apos;s completely free to join.
          </p>
          <button
            onClick={handleGetLink}
            className="bg-[#C6FF55] text-[#31372B] font-bold px-10 py-4 rounded-xl text-base hover:brightness-110 transition shadow-[0_0_30px_rgba(198,255,85,0.3)] cursor-pointer"
          >
            Get Your Referral Link →
          </button>
          <p className="text-white/40 text-xs mt-4">
            Free to join · No approval needed · Instant access
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#31372B] border-t border-white/10 py-6 px-4 text-center">
        <p className="text-white/30 text-xs">
          © 2024 MyFundingList · Questions?{" "}
          <a href="mailto:hi@eaglegrowthpartners.com" className="hover:text-white/60 transition underline">
            hi@eaglegrowthpartners.com
          </a>
        </p>
      </footer>
    </main>
  );
}
