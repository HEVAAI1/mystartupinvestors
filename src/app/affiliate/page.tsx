"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Footer from "@/components/Footer";
import SmartNavbar from "@/components/SmartNavbar";

export default function AffiliateLandingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("mfl_ref_code", ref);
      localStorage.setItem("mfl_ref_expiry", String(expiry));
    }
  }, []);

  const handleGetLink = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      router.push("/affiliate/dashboard");
      return;
    }

    localStorage.setItem("mfl_next_path", "/affiliate/dashboard");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) console.error("Google Login Error:", error);
  };

  const steps = [
    {
      number: "01",
      title: "Share Your Link",
      description: "Get your unique referral link and share it with founders you know.",
    },
    {
      number: "02",
      title: "They Sign Up and Pay",
      description: "When someone visits through your link and makes a purchase, we track it.",
    },
    {
      number: "03",
      title: "Earn 25% Commission",
      description: "You earn 25% of every payment they ever make for life.",
    },
  ];

  const benefits = [
    {
      icon: "$",
      title: "Lifetime Commissions",
      description: "Once a user is referred, every future payment they make generates commission for you.",
    },
    {
      icon: "++",
      title: "No Earnings Cap",
      description: "There is no limit. Refer 1 founder or 1,000 and you earn on every single one.",
    },
    {
      icon: "!",
      title: "Fast Manual Payouts",
      description:
        "Request a withdrawal once you have at least $75 available. Our team processes payouts manually.",
    },
  ];

  return (
    <>
      <SmartNavbar />

      <main className="relative min-h-screen overflow-hidden bg-[#FAF7EE] font-inter text-[#31372B]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] h-80 w-80 rounded-full bg-[#C6FF55]/20 blur-[120px]" />
          <div className="absolute top-[30rem] right-[8%] h-72 w-72 rounded-full bg-white/35 blur-[110px]" />
        </div>

        <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-20 pt-32 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-5 py-2 shadow-sm backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-[#C6FF55]" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#31372B]">
              Affiliate Program
            </span>
          </div>

          <h1 className="mb-6 text-[clamp(42px,7vw,78px)] font-space font-bold leading-[1.02] tracking-[-0.03em] text-[#31372B]">
            Earn with
            <br />
            MyFundingList
          </h1>

          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#6B6B6B] md:text-xl">
            Invite startup founders to MyFundingList and earn <span className="font-bold text-[#31372B]">25% commission</span> on every successful payment <span className="font-bold text-[#31372B]">for life</span>.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={handleGetLink}
              className="cursor-pointer rounded-2xl bg-[#1E1E1E] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-black/15 transition hover:bg-[#333]"
            >
              Become an Affiliate
            </button>
            <a
              href="#how-it-works"
              className="rounded-2xl border border-black/[0.12] bg-white/60 px-8 py-4 text-base font-semibold text-[#31372B] backdrop-blur-sm transition hover:bg-white/80"
            >
              How It Works
            </a>
          </div>

          <div className="mt-16 grid w-full max-w-lg grid-cols-3 gap-8 rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-6 shadow-sm backdrop-blur-sm">
            <div className="text-center">
              <div className="text-2xl font-space font-bold text-[#31372B]">25%</div>
              <div className="mt-1 text-xs text-[#717182]">Commission</div>
            </div>
            <div className="border-x border-[#31372B]/10 text-center">
              <div className="text-2xl font-space font-bold text-[#31372B]">Forever</div>
              <div className="mt-1 text-xs text-[#717182]">Lifetime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-space font-bold text-[#31372B]">$0</div>
              <div className="mt-1 text-xs text-[#717182]">To Join</div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative z-10 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <h2 className="mb-4 text-3xl font-space font-bold text-[#31372B] md:text-4xl">How It Works</h2>
              <p className="text-base text-[#717182]">Three simple steps to start earning</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-3xl border border-black/[0.06] bg-white/70 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C6FF55]/40 hover:shadow-lg"
                >
                  <div className="mb-4 text-5xl font-space font-bold leading-none text-[#C6FF55]" style={{ WebkitTextStroke: "2px #31372B" }}>
                    {step.number}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#31372B]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#717182]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <h2 className="mb-4 text-3xl font-space font-bold text-[#31372B] md:text-4xl">Why Partner With Us</h2>
              <p className="text-base text-[#717182]">Built for people who genuinely want to help founders</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-3xl border border-black/[0.06] bg-white/70 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C6FF55]/40 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF4E5] text-xl font-bold text-[#31372B]">
                    {benefit.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#31372B]">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-[#717182]">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 bg-[#1E1E1E] px-4 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-space font-bold text-white md:text-4xl">Start Earning Today</h2>
            <p className="mb-10 text-base leading-relaxed text-white/70">
              Join our affiliate program, get your unique link, and start earning lifetime commissions. It is completely free to join.
            </p>
            <button
              onClick={handleGetLink}
              className="cursor-pointer rounded-2xl bg-[#C6FF55] px-10 py-4 text-base font-semibold text-[#31372B] shadow-[0_0_30px_rgba(198,255,85,0.3)] transition hover:brightness-110"
            >
              Get Your Referral Link
            </button>
            <p className="mt-4 text-xs text-white/40">Free to join - No approval needed - Instant access</p>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
