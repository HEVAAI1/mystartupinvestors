"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, ArrowRight, Sparkles, Users, DollarSign, Menu, X, Check, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Footer from "@/components/Footer";

export default function Home() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const investorLogos = [
    { src: "/KhoslaLogo.svg", name: "Khosla" },
    { src: "/AntlerLogo.svg", name: "Antler" },
    { src: "/TigerLogo.svg", name: "Tiger Global" },
    { src: "/CombinatorLogo.svg", name: "Y Combinator" },
    { src: "/LightspeedLogo.svg", name: "Lightspeed" },
    { src: "/BlumeLogo.svg", name: "Blume" },
  ];
  const marqueeLogos = [...investorLogos, ...investorLogos];
  const softCardReveal = {
    initial: { y: 24, scale: 0.985 },
    whileInView: { y: 0, scale: 1 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  };

  // Scroll effect for navbar glass
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (userData?.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    };
    checkSession();
  }, [router, supabase]);

  // Capture ?ref= from URL and save to localStorage with 24h expiry
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("mfl_ref_code", ref);
      localStorage.setItem("mfl_ref_expiry", String(expiry));
    }
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Google Login Error:", error);
  };

  return (
    <main className="min-h-screen bg-[#FAF7EE] font-inter text-[#31372B] relative overflow-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image src="/Logo.svg" alt="MyFundingList" width={130} height={40} className="h-[36px] w-auto" />
            </div>

            {/* Desktop Nav — center links */}
            <div className="hidden md:flex items-center gap-1">
              <a
                href="/tools-for-founders"
                className="px-4 py-2 text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] transition-colors rounded-full hover:bg-black/5"
              >
                Tools for Founders
              </a>
              <a href="#features" className="px-4 py-2 text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] transition-colors rounded-full hover:bg-black/5">
                Features
              </a>
              <a href="#pricing" className="px-4 py-2 text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] transition-colors rounded-full hover:bg-black/5">
                Pricing
              </a>
              <a href="#testimonials" className="px-4 py-2 text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] transition-colors rounded-full hover:bg-black/5">
                Testimonials
              </a>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleGoogleLogin}
                className="px-4 py-2 text-sm font-inter font-medium text-[#31372B] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              >
                Add My Startup
              </button>
              <button
                onClick={handleGoogleLogin}
                className="px-5 py-2.5 text-sm font-inter font-semibold bg-[#1E1E1E] text-white rounded-full hover:bg-[#333] transition-all shadow-lg shadow-black/10 cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {/* Mobile: Sign In + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={handleGoogleLogin}
                className="bg-[#1E1E1E] text-white px-4 py-2 rounded-full text-[14px] font-bold shadow hover:opacity-90 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full hover:bg-black/5 transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-black/5"
            >
              <div className="px-6 py-4 flex flex-col gap-2">
                <a
                  href="/tools-for-founders"
                  className="py-2 text-sm font-inter text-[#31372B]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tools for Founders
                </a>
                <a href="#features" className="py-2 text-sm font-inter text-[#31372B]" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#pricing" className="py-2 text-sm font-inter text-[#31372B]" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <a href="#testimonials" className="py-2 text-sm font-inter text-[#31372B]" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleGoogleLogin(); }}
                  className="py-2 text-sm font-inter text-[#31372B] text-left"
                >
                  Add My Startup
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleGoogleLogin(); }}
                  className="py-2.5 text-sm font-inter font-semibold bg-[#1E1E1E] text-white rounded-full mt-1 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-[#C6FF55]/20 blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] rounded-full bg-[#C6FF55]/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#e8e4d9]/50 blur-[80px]" />
        </div>
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#1E1E1E 1px, transparent 1px), linear-gradient(to right, #1E1E1E 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-black/[0.08] rounded-full px-5 py-2 mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#1E1E1E]" />
            <span className="text-sm font-inter font-medium text-[#31372B]">Trusted by 500+ startups</span>
            <div className="flex -space-x-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1E1E1E] to-[#555] border-2 border-white" />
              ))}
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(36px,6vw,72px)] font-space font-bold text-[#000] leading-[1.05] tracking-[-0.03em] max-w-4xl mx-auto"
          >
            Access{" "}
            <span className="relative inline-block">
              30,000+
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 2 150 2 198 8" stroke="#C6FF55" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>{" "}
            Investors to Get Your Startup Funded
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl font-inter text-[#6B6B6B] max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            Connect with investors across all sectors &amp; geographies. Stop pitching blind — start pitching smart.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleGoogleLogin}
              className="group relative inline-flex items-center gap-2 bg-[#1E1E1E] text-white font-inter font-semibold text-base rounded-full px-8 py-4 shadow-xl shadow-black/15 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Start Connecting Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-[#31372B] font-inter font-medium text-base hover:text-[#000] transition-colors px-6 py-4"
            >
              See How It Works
              <span className="text-[#C6FF55]">↓</span>
            </a>
          </motion.div>

          {/* Stats pill cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-4"
          >
            {[
              { icon: Users, value: "30,000+", label: "Investors" },
              { icon: DollarSign, value: "$25Bn+", label: "Investable Capital" },
            ].map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-black/[0.06] rounded-2xl px-5 py-3.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C6FF55]/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#1E1E1E]" />
                </div>
                <div>
                  <p className="text-xl font-space font-bold text-[#1E1E1E]">{value}</p>
                  <p className="text-xs font-inter text-[#6B6B6B]">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Product preview — LandingPagePhoto inside browser frame */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 relative max-w-5xl mx-auto hidden md:block"
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-[#C6FF55]/10 via-transparent to-transparent rounded-[32px] blur-xl" />
            <div className="relative bg-[#1E1E1E] rounded-[24px] shadow-2xl shadow-black/20 overflow-hidden p-1">
              <div className="bg-[#1E1E1E] rounded-[20px] overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white/10 rounded-lg px-4 py-1 text-xs text-white/40 font-inter">
                      myfundinglist.com/investors
                    </div>
                  </div>
                </div>
                <div
                  className="aspect-[16/7] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] bg-no-repeat bg-center bg-cover"
                  style={{ backgroundImage: "url('/LandingPagePhoto.png')" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── LOGO MARQUEE ─────────────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden bg-[#F5F2E8]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-inter font-semibold text-[#6B6B6B] uppercase tracking-[0.15em]">
            Connect with top investors from
          </p>
        </motion.div>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#F5F2E8] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#F5F2E8] to-transparent z-10 pointer-events-none" />

        <div className="relative overflow-hidden">
          <div className="flex w-max min-w-full animate-marquee gap-4 pr-4">
            {marqueeLogos.map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                aria-hidden={i >= investorLogos.length}
                className="flex h-24 w-40 flex-shrink-0 items-center justify-center bg-white/70 backdrop-blur-sm border border-black/[0.06] rounded-2xl px-6 py-4 shadow-sm hover:shadow-md hover:border-[#C6FF55]/30 transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.src} alt={logo.name} className="h-11 w-auto max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS SECTION ────────────────────────────────────────── */}
      <section className="relative bg-[#1E1E1E] py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C6FF55]/5 rounded-full blur-[120px]" />
        </div>
        <div className="absolute inset-0 grain-overlay pointer-events-none opacity-50" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-[clamp(32px,4vw,48px)] font-space font-bold text-white leading-tight tracking-[-0.02em]">
              We&apos;ve Fixed Fundraising Frustration
            </h2>
            <p className="text-lg font-inter text-white/50 mt-4">Stop pitching blind. Start pitching smart.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: "01",
                label: "The Problem",
                title: "Finding investors takes months of wasted research and guesswork.",
                icon: "/ProblemIcon.svg",
                hoverIcon: "/ProblemIconHover.svg",
              },
              {
                step: "02",
                label: "The Solution",
                title: "We built a reliable, easy-to-use database of verified investors.",
                icon: "/SolutionIcon.svg",
                hoverIcon: "/SolutionIconHover.svg",
              },
              {
                step: "03",
                label: "The Outcome",
                title: "You connect faster, pitch smarter, and raise sooner.",
                icon: "/OutcomeIcon.svg",
                hoverIcon: "/OutcomeIconHover.svg",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                {...softCardReveal}
                transition={{ ...softCardReveal.transition, delay: i * 0.15 }}
                className="group relative"
              >
                <div className="relative p-8 lg:p-10 rounded-3xl bg-white/[0.05] border border-white/[0.08] transition-all duration-500 hover:bg-white/[0.08] hover:border-[#C6FF55]/30 hover:-translate-y-1">
                  <div className="inline-flex items-center gap-2 bg-white/[0.08] rounded-full px-4 py-1.5 mb-8">
                    <span className="text-xs font-inter font-semibold text-white/60 tracking-wider">STEP {item.step}</span>
                  </div>
                  {/* Icon with hover swap */}
                  <div className="flex justify-center mb-6 relative h-[80px]">
                    <Image src={item.icon} alt={item.label} width={80} height={80} className="opacity-80 transition-all duration-300 group-hover:opacity-0 absolute" />
                    <Image src={item.hoverIcon} alt={item.label} width={80} height={80} className="opacity-0 transition-all duration-300 group-hover:opacity-100 absolute" />
                  </div>
                  <p className="text-sm font-inter font-semibold text-white/50 uppercase tracking-[0.1em] mb-3 group-hover:text-[#C6FF55] transition-colors">
                    {item.label}
                  </p>
                  <h3 className="text-xl font-space font-semibold text-white leading-snug group-hover:text-[#C6FF55] transition-colors">
                    {item.title}
                  </h3>
                  <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-[#C6FF55]/0 to-[#C6FF55]/0 group-hover:from-[#C6FF55]/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-14"
          >
            <div className="bg-white/[0.08] border border-white/[0.10] px-8 py-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C6FF55]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" strokeWidth="2.5" stroke="#C6FF55">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[17px] font-inter font-medium text-white">
                Your fundraising journey, simplified from start to finish
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────── */}
      <section id="features" className="py-28 relative bg-[#FAF7EE]">
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-inter font-semibold text-[#6B6B6B] uppercase tracking-[0.15em] mb-3">
              From Idea to Investment
            </span>
            <h2 className="text-[clamp(28px,4vw,44px)] font-space font-bold text-[#000] leading-tight tracking-[-0.02em]">
              Everything you need to fuel<br className="hidden md:block" /> your startup journey
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: The List You Need */}
            <motion.div
              {...softCardReveal}
              className="group p-7 rounded-3xl border bg-white/60 backdrop-blur-sm border-black/[0.06] hover:border-[#C6FF55]/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
            >
              <h3 className="text-xl font-space font-bold text-[#1E1E1E] mb-2">The List You Need</h3>
              <p className="text-sm font-inter text-[#6B6B6B] leading-relaxed">
                Thousands of investors, angels, and VCs organized for founders who mean business.
              </p>
              <div className="mt-6 space-y-3">
                <div className="bg-[#EDF4E5] rounded-2xl p-4 border border-[rgba(49,55,43,0.08)]">
                  {/* Search bar */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]" size={13} />
                    <input
                      type="text"
                      placeholder="Search by name, company or email..."
                      className="w-full bg-white border border-[rgba(49,55,43,0.1)] rounded-lg pl-9 pr-4 py-2 text-[11px] text-[#31372B] placeholder:text-[#717182]/60 focus:outline-none"
                      readOnly
                    />
                  </div>
                  {[
                    { initials: "SC", name: "Sarah Chen", email: "sarah.chen@techventures.io", tag: "TechVentures" },
                    { initials: "MR", name: "Michael Rodriguez", email: "m.rodriguez@innovate.vc", tag: "Innovate" },
                    { initials: "PS", name: "Priya Sharma", email: "priya@globaltech.co", tag: "Globaltech" },
                  ].map((inv, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-black/[0.04] mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#1E1E1E] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">{inv.initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-inter font-bold text-[#31372B] truncate">{inv.name}</p>
                        <p className="text-[10px] font-inter text-[#6B6B6B] truncate">{inv.email}</p>
                      </div>
                      <span className="ml-auto text-[9px] font-inter text-[#31372B] bg-[#EDF4E5] border border-[rgba(49,55,43,0.1)] px-2 py-0.5 rounded-full flex-shrink-0">{inv.tag}</span>
                    </div>
                  ))}
                  <p className="text-[10px] font-inter text-[#6B6B6B] text-center pt-1">Showing 3 of 30,000+ investors</p>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Connect Directly via Email */}
            <motion.div
              {...softCardReveal}
              transition={{ ...softCardReveal.transition, delay: 0.1 }}
              className="group p-7 rounded-3xl border bg-white/60 backdrop-blur-sm border-black/[0.06] hover:border-[#C6FF55]/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
            >
              <h3 className="text-xl font-space font-bold text-[#1E1E1E] mb-2">Connect Directly via Email</h3>
              <p className="text-sm font-inter text-[#6B6B6B] leading-relaxed">
                Connect directly with investors, introduce your startups &amp; send your pitch deck.
              </p>
              <div className="mt-6 bg-[#EDF4E5] rounded-2xl p-4 border border-[rgba(49,55,43,0.08)] space-y-3">
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#31372B] mb-2">
                  <Mail size={13} />
                  Direct Email Access
                </div>
                {[
                  { initials: "SC", name: "Sarah Chen", email: "sarah.chen@techventures.io" },
                  { initials: "MR", name: "Michael Rodriguez", email: "m.rodriguez@innovate.vc" },
                ].map((inv, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[rgba(49,55,43,0.1)]">
                    <div className="w-9 h-9 rounded-lg bg-[#31372B] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{inv.initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-inter font-bold text-[#31372B] truncate">{inv.name}</p>
                      <p className="text-[10px] font-inter text-[#6B6B6B] truncate">{inv.email}</p>
                    </div>
                    <button className="ml-auto text-[10px] font-inter font-semibold text-[#1E1E1E] bg-[#C6FF55]/50 px-3 py-1.5 rounded-full flex-shrink-0 hover:bg-[#C6FF55]/80 transition-colors">
                      Email
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card 3: Add Your Startup — dark */}
            <motion.div
              {...softCardReveal}
              transition={{ ...softCardReveal.transition, delay: 0.2 }}
              className="group p-7 rounded-3xl border bg-gradient-to-br from-[#1E1E1E] to-[#2d2d2d] border-white/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer md:col-span-2 lg:col-span-1"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
            >
              <h3 className="text-xl font-space font-bold text-white mb-2">Add Your Startup</h3>
              <p className="text-sm font-inter text-white/60 leading-relaxed">
                Fill out the form. If your startup is exceptional, we will also manually help you raise funds.
              </p>
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/[0.08]">
                  <p className="text-sm font-inter text-white/80">Submit your startup details and we&apos;ll connect you with relevant investors</p>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 rounded-2xl bg-[#C6FF55] text-[#1E1E1E] font-inter font-semibold text-sm hover:bg-[#d4ff77] transition-colors cursor-pointer"
                >
                  Add Your Startup →
                </button>
              </div>
            </motion.div>
          </div>

          {/* Signup bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <div className="bg-[#EDF4E5] border border-[rgba(49,55,43,0.2)] rounded-2xl px-8 py-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <Zap size={18} strokeWidth={1.5} className="text-[#31372B]" />
              <span className="font-bold text-[#31372B] text-[16px] font-inter">
                Get instant access to all features when you sign up
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS GATEWAY ────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden bg-[#1E1E1E] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[550px] h-[550px] bg-[#C6FF55]/10 rounded-full blur-[70px]" />
          <div className="absolute bottom-0 right-1/4 w-[550px] h-[550px] bg-white/5 rounded-full blur-[70px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <span className="inline-block text-xs font-inter font-semibold text-[#C6FF55] bg-white/10 px-4 py-2 rounded-full mb-6 uppercase tracking-[0.15em]">
              Global Investor Network
            </span>
            <h2 className="text-[clamp(28px,4vw,54px)] font-space font-bold text-white leading-tight tracking-[-0.02em]">
              Your Gateway to 30,000+ Investors
            </h2>
            <p className="text-lg font-inter text-white/70 mt-4 max-w-xl">
              Access verified investor contacts across industries and global locations
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-14">
            {[
              { imgSrc: "/UsersIcon.svg", value: "30,000+", label: "Investors", sub: "Worldwide" },
              { imgSrc: "/MailIcon.svg", value: "4,850", label: "Verified Emails", sub: "Direct contacts" },
              { imgSrc: "/MapPinIcon.svg", value: "120+", label: "Global Locations", sub: "Cities covered" },
              { imgSrc: "/BriefCaseIcon.svg", value: "25+", label: "Investment Fields", sub: "Industries" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 lg:p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl hover:-translate-y-1 hover:bg-white/15 transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 bg-[#EDF4E5] rounded-xl border border-[#31372B]/10 shadow flex items-center justify-center mx-auto mb-4">
                  <Image src={item.imgSrc} alt={item.label} width={24} height={24} className="w-6 h-6" />
                </div>
                <p className="text-3xl lg:text-4xl font-space font-bold text-white">{item.value}</p>
                <p className="text-sm font-inter font-semibold text-white mt-1">{item.label}</p>
                <p className="text-xs font-inter text-white/60 mt-0.5">{item.sub}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mt-16 gap-4"
          >
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-2 bg-[#C6FF55] text-[#31372B] font-inter font-bold text-base rounded-xl px-8 py-4 shadow-[0_0_34px_rgba(198,255,85,0.3)] hover:scale-105 transition-transform cursor-pointer"
            >
              Explore Investor Database
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-white/70 text-sm font-inter">
              All contacts include verified email addresses • Direct access to decision-makers
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING SECTION ──────────────────────────────────────── */}
      <section id="pricing" className="py-28 relative bg-white">
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-[clamp(28px,4vw,44px)] font-space font-bold text-[#000] leading-tight tracking-[-0.02em]">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg font-inter text-[#6B6B6B] mt-4">
              Choose the plan that fits your fundraising needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: "Starter", price: "Free", subtitle: "Get started with basics",
                description: "Perfect for exploring our investor database",
                features: ["Access 5 investors per month", "Basic search filters", "View investor profiles", "Basic Email Support"],
                popular: false, dark: false,
              },
              {
                name: "Professional", price: "$19", subtitle: "60 credits",
                description: "Unlock verified investor contacts",
                features: ["Everything in Starter", "60 investor contact unlocks", "60 startup tool credits", "Verified email addresses", "Advanced search filters", "Export to CSV", "Priority email support"],
                popular: true, dark: false,
              },
              {
                name: "Growth", price: "$99", subtitle: "300 credits",
                description: "Scale your fundraising outreach",
                features: ["Everything in Professional", "300 investor contact unlocks", "300 startup tool credits", "Unlimited searches", "Save investor lists", "Dedicated Investment Banking service (add-on $499)"],
                popular: false, dark: false,
              },
              {
                name: "Enterprise", price: "$999", subtitle: "4,000 credits",
                description: "For serious fundraisers",
                features: ["Everything in Growth", "4,000 investor contact unlocks", "4,000 startup tool credits", "Dedicated support team", "Dedicated Investment Banking service (add-on $499)"],
                popular: false, dark: true,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                {...softCardReveal}
                transition={{ ...softCardReveal.transition, delay: i * 0.1 }}
            className={`relative group rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                  plan.dark
                    ? "bg-[#1E1E1E] text-white border border-white/10"
                    : plan.popular
                      ? "bg-white border-2 border-[#C6FF55] shadow-xl shadow-[#C6FF55]/10"
                      : "bg-white/60 backdrop-blur-sm border border-black/[0.06] hover:border-[#C6FF55]/30 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C6FF55] text-[#1E1E1E] text-xs font-inter font-bold px-4 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                    ⚡ MOST POPULAR
                  </div>
                )}
                <p className={`text-sm font-inter font-semibold ${plan.dark ? "text-white/60" : "text-[#6B6B6B]"}`}>
                  {plan.name}
                </p>
                <div className="mt-3 mb-1">
                  <span className={`text-4xl font-space font-bold ${plan.dark ? "text-white" : "text-[#000]"}`}>
                    {plan.price}
                  </span>
                </div>
                <p className={`text-xs font-inter ${plan.dark ? "text-white/40" : "text-[#6B6B6B]"}`}>{plan.subtitle}</p>
                <p className={`text-sm font-inter mt-4 ${plan.dark ? "text-white/60" : "text-[#6B6B6B]"}`}>{plan.description}</p>
                <div className="my-6 h-px bg-black/[0.06]" />
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#C6FF55]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className={`w-3 h-3 ${plan.dark ? "text-[#C6FF55]" : "text-[#1E1E1E]"}`} />
                      </div>
                      <span className={`text-sm font-inter ${plan.dark ? "text-white/70" : "text-[#31372B]"}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGoogleLogin}
                  className={`w-full mt-8 py-3.5 rounded-2xl font-inter font-semibold text-sm transition-all duration-300 cursor-pointer ${
                    plan.popular
                      ? "bg-[#1E1E1E] text-white hover:bg-[#333] shadow-lg shadow-black/10"
                      : plan.dark
                        ? "bg-[#C6FF55] text-[#1E1E1E] hover:bg-[#d4ff77]"
                        : "bg-[#1E1E1E]/5 text-[#1E1E1E] hover:bg-[#1E1E1E] hover:text-white"
                  }`}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm font-inter text-[#6B6B6B] mt-10"
          >
            All plans include access to our verified investor database.{" "}
            <span className="font-bold text-[#31372B]">Credits never expire.</span>
          </motion.p>
        </div>
      </section>

      {/* ── TESTIMONIALS — Original Masonry Layout ───────────────── */}
      <section
        id="testimonials"
        className="relative flex flex-col items-center bg-[#FAF7EE] px-4 md:px-[7.9vw] py-12 md:py-[6.31vw] gap-8 md:gap-[4.21vw]"
      >
        <div className="absolute inset-0 grain-overlay pointer-events-none opacity-60" />

        {/* Badge */}
        <div
          className="relative z-10 flex items-center mx-auto md:absolute bg-[rgba(49,55,43,0.12)] border border-[rgba(49,55,43,0.1)] rounded-full px-4 py-2 md:px-[1.4vw] md:py-[0.75vw] gap-2 md:gap-[0.93vw]"
          style={{ top: "5.04vw", left: "44.3vw" }}
        >
          <div className="w-2 h-2 md:w-[0.53vw] md:h-[0.53vw] rounded-full bg-[#C6FF55]" />
          <span className="font-bold uppercase tracking-wide text-[#31372B] text-xs md:text-[0.92vw]">Testimonials</span>
        </div>

        {/* Headings */}
        <div className="relative z-10 text-center w-full mt-4 md:mt-[2vw]">
          <h2 className="font-space font-bold text-[#31372B] text-3xl md:text-[2.89vw] leading-tight md:leading-[4.35vw]">
            Trusted by Indian Founders
          </h2>
          <p className="text-[#6B6B6B] text-base md:text-[1.18vw] leading-relaxed md:leading-[1.9vw] mt-2 md:mt-[0.7vw] font-inter">
            See how founders are accelerating their fundraising journey with{" "}
            <span className="font-semibold text-[#31372B]">MyFundingList</span>
          </p>
        </div>

        {/* Top Masonry Row */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[55.6vw_27vw] gap-4 md:gap-[1.8vw] w-full mt-0 md:mt-[-1.5vw]">
          {/* Left Large Card */}
          <div className="flex flex-col justify-between bg-white border border-[#31372B]/10 shadow-md rounded-3xl p-6 md:p-[2.7vw] md:row-span-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#C6FF55]/30">
            <div>
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} viewBox="0 0 16 16" className="w-4 h-4 fill-[#C6FF55]">
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                  </svg>
                ))}
              </div>
              <p className="font-bold text-[#31372B] text-lg md:text-[1.58vw] leading-relaxed md:leading-[2.38vw]">
                MyFundingList connected us with the right investors almost instantly. The verified contacts and detailed profiles made our outreach incredibly targeted and effective.
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div className="flex items-center justify-center bg-[#1E1E1E] text-white font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw] flex-shrink-0">
                SD
              </div>
              <div>
                <p className="font-bold text-[#31372B] text-base md:text-[1.05vw]">Soumyajit Dasgupta</p>
                <p className="text-[#6B6B6B] text-sm md:text-[0.92vw]">Founder, Hexstar Universe</p>
              </div>
            </div>
          </div>

          {/* Right Top Card */}
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-3xl p-6 md:p-[2.7vw] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#C6FF55]/30">
            <div>
              <h3 className="font-space font-bold text-[#31372B] text-lg md:text-[1.58vw] leading-snug md:leading-[2vw]">
                We&apos;ve 5x&apos;d our investor meetings
              </h3>
              <p className="text-[#6B6B6B] text-sm md:text-[0.99vw] mt-2">The quality of contacts is unmatched.</p>
            </div>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div className="flex items-center justify-center bg-[#1E1E1E] text-white font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw] flex-shrink-0">
                DC
              </div>
              <div>
                <p className="font-bold text-[#31372B] text-base md:text-[1.05vw]">Deep Chakraborty</p>
                <p className="text-[#6B6B6B] text-sm md:text-[0.92vw]">Founder, Hive Dynamics</p>
              </div>
            </div>
          </div>

          {/* Right CTA Card */}
          <div className="bg-[#1E1E1E] border border-white/10 shadow-md rounded-3xl p-6 md:p-[2.7vw] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-[#C6FF55] flex items-center justify-center mb-4">
                <ArrowRight className="w-4 h-4 text-[#31372B]" />
              </div>
              <h3 className="font-space font-bold text-white text-base md:text-[1.32vw] leading-snug md:leading-[2vw] mb-2">
                Ready to find your investors?
              </h3>
              <p className="text-white/60 text-sm md:text-[0.92vw]">
                Join 500+ founders already using MyFundingList to raise smarter.
              </p>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="mt-4 md:mt-[1.3vw] w-fit px-4 py-2 rounded-full font-bold text-[#31372B] border border-[#C6FF55]/40 hover:scale-105 transition text-sm md:text-[0.92vw] bg-[#C6FF55] cursor-pointer"
            >
              Get started free →
            </button>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[1.1vw] w-full mt-0 md:mt-[-3vw]">
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-3xl p-6 md:p-[2.7vw] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#C6FF55]/30">
            <p className="text-[#31372B] text-base md:text-[1.1vw] leading-relaxed md:leading-[1.8vw]">
              &quot;Closed our seed round in 60 days. The database is comprehensive and always up-to-date.&quot;
            </p>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div className="flex items-center justify-center bg-[#1E1E1E] text-white font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw] flex-shrink-0">DK</div>
              <div>
                <p className="font-bold text-[#31372B] text-base md:text-[1.05vw]">Deepak Kumar</p>
                <p className="text-[#6B6B6B] text-sm md:text-[0.92vw]">Founder, Wah Puchka</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-3xl p-6 md:p-[2.7vw] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#C6FF55]/30">
            <p className="font-bold text-[#31372B] text-base md:text-[1.18vw] leading-relaxed md:leading-[1.8vw]">
              &quot;The investor data is more accurate than anything we found elsewhere. We booked 8 meetings in our first week of outreach.&quot;
            </p>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div className="flex items-center justify-center bg-[#1E1E1E] text-white font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw] flex-shrink-0">MT</div>
              <div>
                <p className="font-bold text-[#31372B] text-base md:text-[1.05vw]">Marcus Thompson</p>
                <p className="text-[#6B6B6B] text-sm md:text-[0.92vw]">CEO, Stackr Labs</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-3xl p-6 md:p-[2.7vw] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#C6FF55]/30">
            <div>
              <h3 className="font-space font-bold text-[#31372B] text-lg md:text-[1.58vw] leading-snug md:leading-[2vw]">
                This is the unfair advantage every founder needs
              </h3>
              <p className="text-[#6B6B6B] text-sm md:text-[0.99vw] mt-2">
                We raised our pre-seed in under 45 days. Couldn&apos;t have done it without this platform.
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div className="flex items-center justify-center bg-[#1E1E1E] text-white font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw] flex-shrink-0">AR</div>
              <div>
                <p className="font-bold text-[#31372B] text-base md:text-[1.05vw]">Ashley Rivera</p>
                <p className="text-[#6B6B6B] text-sm md:text-[0.92vw]">Co-founder, NovaBridge</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="relative z-10 text-center w-full mt-0 md:mt-[-1.5vw] mb-4 md:mb-[2.5vw] text-[#6B6B6B] text-sm md:text-[0.92vw] font-inter">
          Join hundreds of founders who&apos;ve successfully raised funding.{" "}
          <span className="font-bold text-[#31372B]">Start your journey today.</span>
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────────────────────── */}
      <section id="faq" className="py-28 relative bg-white">
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-[clamp(28px,4vw,44px)] font-space font-bold text-[#000] leading-tight tracking-[-0.02em]">FAQs</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {[
              { q: "How do credits work?", a: "Each credit lets you unlock one verified investor contact. Use credits anytime to reveal verified emails and direct contact info." },
              { q: "What types of investors are in your database?", a: "Our database includes angels, VCs, syndicates, funds, and strategic investors across industries and stages." },
              { q: "How often is the investor data updated?", a: "Our investor database is updated weekly with verified information to ensure accuracy." },
              { q: "Do credits expire?", a: "No. Credits never expire — you can use them anytime." },
              { q: "Can I get a refund if I don't use my credits?", a: "Unused credits are non-refundable, but they remain valid forever." },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={false}
                className={`bg-white/60 backdrop-blur-sm border rounded-2xl px-6 transition-all duration-300 ${
                  activeIndex === i ? "border-[#C6FF55]/40 shadow-lg shadow-[#C6FF55]/5" : "border-black/[0.06]"
                }`}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                  className="w-full flex justify-between items-center py-5 text-left"
                >
                  <span className="text-[#1E1E1E] font-inter font-semibold text-base">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: activeIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-[#31372B] font-bold text-2xl leading-none flex-shrink-0 ml-4"
                  >
                    +
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: activeIndex === i ? "auto" : 0, opacity: activeIndex === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="font-inter text-[#6B6B6B] text-sm leading-relaxed pb-5">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────── */}
      <section
        id="cta"
        className="relative flex flex-col items-center justify-center overflow-hidden bg-[#1E1E1E] text-center px-4 py-20 md:py-0 min-h-[400px] md:h-[37.78vw]"
      >
        <div className="absolute rounded-full w-64 h-64 md:w-[25.24vw] md:h-[25.24vw] left-1/4 md:left-[25vw] top-20 md:top-[9.45vw] bg-[rgba(198,255,85,0.1)] blur-[60px] md:blur-[4.21vw]" />
        <div className="absolute rounded-full w-64 h-64 md:w-[25.24vw] md:h-[25.24vw] left-1/2 md:left-[49.8vw] top-10 md:top-[3.08vw] bg-[rgba(255,255,255,0.05)] blur-[60px] md:blur-[4.21vw]" />
        <div className="absolute inset-0 grain-overlay pointer-events-none opacity-50" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-space font-bold text-white text-3xl md:text-[3.68vw] leading-tight md:leading-[4.06vw] mb-6 md:mb-[2vw]">
              Ready to accelerate your fundraising?
            </h2>
            <p className="text-white/80 text-base md:text-[1.32vw] leading-relaxed mb-8 md:mb-[3vw] max-w-2xl mx-auto font-inter">
              Join hundreds of founders who&apos;ve successfully raised funding{" "}
              <br className="hidden md:block" />
              with <span className="font-semibold text-white">MyFundingList</span>
            </p>
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-2 font-bold text-[#31372B] bg-[#C6FF55] shadow-[0_0_30px_rgba(198,255,85,0.3)] border border-[#31372B]/20 rounded-xl hover:scale-105 transition px-8 py-4 text-base cursor-pointer"
            >
              Start connecting with investors
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
