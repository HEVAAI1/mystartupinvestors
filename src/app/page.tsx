"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Footer from "@/components/Footer";
import { FiMenu, FiX } from "react-icons/fi";


export default function Home() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if user is admin
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
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
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
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
    <main className="min-h-screen bg-[#FAF7EE] font-[Arial] text-[#31372B] relative overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full flex justify-between items-center px-6 md:px-8 py-4 bg-[#FFFFFE] border-b border-black/10 fixed top-0 z-50"
      >
        <div className="flex items-center gap-2">
          <Image
            src="/Logo.svg"
            alt="Logo"
            width={100}
            height={40}
            className="h-[38px] w-auto"
          />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/tools-for-founders"
            className="bg-[#F5F5F5] text-[#31372B] border border-[#E5E5E5] px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-[#EBEBEB] transition cursor-pointer"
          >
            Tools for Founders
          </a>
          <button
            onClick={handleGoogleLogin}
            className="bg-[#F5F5F5] text-[#31372B] border border-[#E5E5E5] px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-[#EBEBEB] transition cursor-pointer"
          >
            Add My Startup
          </button>
          <button
            className="bg-[#31372B] text-[#FAF7EE] px-6 py-2 rounded-lg font-bold shadow hover:opacity-90 transition cursor-pointer"
            onClick={handleGoogleLogin}
          >
            Sign In
          </button>
        </div>

        {/* Mobile: Sign In + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            className="bg-[#31372B] text-[#FAF7EE] px-4 py-2 rounded-lg text-[14px] font-bold shadow hover:opacity-90 transition cursor-pointer"
            onClick={handleGoogleLogin}
          >
            Sign In
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex justify-center items-center w-9 h-9 rounded-md hover:bg-[#EDF4E5] transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={22} color="#31372B" /> : <FiMenu size={22} color="#31372B" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-black/10">
              <span className="font-bold text-[#31372B]">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#EDF4E5] rounded-md transition"
              >
                <FiX size={20} color="#31372B" />
              </button>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <a
                href="/tools-for-founders"
                className="w-full text-left px-4 py-3 bg-[#F5F5F5] text-[#31372B] border border-[#E5E5E5] rounded-md text-[14px] font-medium hover:bg-[#EBEBEB] transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tools for Founders
              </a>
              <button
                onClick={() => { setMobileMenuOpen(false); handleGoogleLogin(); }}
                className="w-full text-left px-4 py-3 bg-[#F5F5F5] text-[#31372B] border border-[#E5E5E5] rounded-md text-[14px] font-medium hover:bg-[#EBEBEB] transition"
              >
                Add My Startup
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleGoogleLogin(); }}
                className="w-full text-left px-4 py-3 bg-[#31372B] text-[#FAF7EE] rounded-md text-[14px] font-bold mt-2 hover:opacity-90 transition"
              >
                Sign In
              </button>
            </div>
          </div>
        </>
      )}


      {/* Hero Section */}

      <section className="bg-[#FAFAFA] flex flex-col items-center text-center px-6 md:px-12 lg:px-24 pt-28 pb-24">
        {/* Trusted Tag */}
        <div className="bg-[#1E1E1E]/10 border border-[#1E1E1E]/20] text-[#3C3C43] rounded-full font-bold px-5 py-2 text-sm mb-6 shadow-sm">
          TRUSTED BY 500+ STARTUPS
        </div>

        {/* Heading */}
        <h1 className="text-[40px] md:text-[48px] leading-tight font-bold text-[#000] tracking-[-1px] max-w-3xl font-funnel-display">
          30,000+ Investors&apos; Access to get <br className="hidden md:block" /> your startup funded
        </h1>

        {/* Subtext */}
        <p className="text-[#6B6B6B] text-lg md:text-[20px] leading-[32px] max-w-2xl mt-4 font-[Arial]">          Connect with investors across all sectors & geographies.
        </p>

        {/* CTA */}
        <button
          onClick={handleGoogleLogin}
          className="mt-8 inline-flex items-center justify-center bg-gradient-to-r from-[#000] to-[#434343] text-white font-semibold text-[18px] rounded-[18px] px-8 py-4 shadow-md hover:opacity-90 transition cursor-pointer"
        >
          Start Connecting Today →
        </button>

        {/* Stats */}
        {/* Stats */}
        <div className="flex gap-16 md:gap-24 mt-10">
          {/* Stat 1 */}
          <div className="flex flex-col items-center">
            <h3 className="text-[32px] md:text-[40px] font-bold text-black">5000+</h3>
            <p className="text-[#6B6B6B] text-sm md:text-base mt-1">Verified Investors</p>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center">
            <h3 className="text-[32px] md:text-[40px] font-bold text-black">$25Bn+</h3>
            <p className="text-[#6B6B6B] text-sm md:text-base mt-1">Investable Capital</p>
          </div>
        </div>

        <div className="relative w-full hidden md:flex justify-center mt-[30px] px-4">
          <div
            className="
      relative
      bg-[#1E1E1E]
      w-full
      max-w-[1437px]
      aspect-[1437/555]
      md:h-[555px]
      md:aspect-auto
      rounded-[22px]
      shadow-[inset_2px_2px_6.2px_rgba(255,255,255,0.11),inset_-2px_2px_9.2px_rgba(255,255,255,0.10)]
      overflow-hidden
    "
          >
            <div
              className="absolute inset-0 md:top-[67px] md:left-[172px] md:right-[61px] md:bottom-0 bg-no-repeat bg-center bg-contain p-4 md:p-0"
              style={{ backgroundImage: "url('/LandingPagePhoto.png')" }}
            />
          </div>
        </div>
      </section>



      {/* Investors Carousel */}

      <section className="py-20 text-center bg-[#F5F5F5] overflow-hidden relative">
        <h2 className="text-[24px] font-bold mb-10 text-[#1E1E1E]">
          Connect with top investors from
        </h2>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#FAF7EE] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#FAF7EE] to-transparent z-10"></div>

        {/* Marquee wrapper */}
        <div className="relative flex overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-12">

            {/* ---- FIRST LOOP ---- */}
            {[
              "/KhoslaLogo.svg",
              "/AntlerLogo.svg",
              "/TigerLogo.svg",
              "/CombinatorLogo.svg",
              "/LightspeedLogo.svg",
              "/BlumeLogo.svg",
            ].map((src, i) => (
              <div
                key={i}
                className="
            flex items-center justify-center 
            bg-white border border-black/20 
            shadow-sm rounded-xl 
            w-[200px] h-[90px] 
            p-4
            md:w-[200px] md:h-[90px]
            sm:w-[170px] sm:h-[80px]
            xs:w-[150px] xs:h-[70px]
          "
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-contain" />
              </div>
            ))}

            {/* ---- SECOND LOOP (duplicate for infinite scroll) ---- */}
            {[
              "/KhoslaLogo.png",
              "/AntlerLogo.png",
              "/TigerLogo.png",
              "/CombinatorLogo.png",
              "/LightspeedLogo.png",
              "/BlumeLogo.png",
            ].map((src, i) => (
              <div
                key={`dup-${i}`}
                className="
            flex items-center justify-center 
            bg-white border border-black/20 
            shadow-sm rounded-xl 
            w-[200px] h-[90px] 
            p-4
            md:w-[200px] md:h-[90px]
            sm:w-[170px] sm:h-[80px]
            xs:w-[150px] xs:h-[70px]
          "
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* We Fixed Fundraising Frustration */}

      <section className="bg-[#1E1E1E] py-24 text-white">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-[46px] font-bold leading-[54px] font-funnel-display">
            We&apos;ve Fixed Fundraising Frustration
          </h2>
          <p className="text-[18px] text-white/60 mt-3 font-[Arial]">
            Stop pitching blind. Start pitching smart.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* CARD COMPONENT */}
          {[
            {
              step: "STEP 01",
              title: "The Problem",
              desc: "Finding investors takes months of wasted research and guesswork.",
              icon: "/ProblemIcon.svg",
              hoverIcon: "/ProblemIconHover.svg",
            },
            {
              step: "STEP 02",
              title: "The Solution",
              desc: "We built a reliable, easy-to-use database of verified investors.",
              icon: "/SolutionIcon.svg",
              hoverIcon: "/SolutionIconHover.svg",
            },
            {
              step: "STEP 03",
              title: "The Outcome",
              desc: "You connect faster, pitch smarter, and raise sooner.",
              icon: "/OutcomeIcon.svg",
              hoverIcon: "/OutcomeIconHover.svg",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="
          group relative w-[90%] md:w-auto mx-auto p-10 rounded-[24px]
          bg-white/[0.10] border border-white/10
          transition-all duration-300
          hover:border-[#C6FF55]/40
        "
            >
              {/* Step badge */}
              <div className="
          absolute top-6 left-6
          bg-white/10 text-white text-xs font-semibold tracking-wide
          px-4 py-1.5 rounded-full
        ">
                {card.step}
              </div>

              {/* ICON with hover swap */}
              <div className="flex justify-center mt-16 mb-8 relative">
                {/* Default icon */}
                <Image
                  src={card.icon}
                  alt={card.title}
                  width={120}
                  height={120}
                  className="opacity-80 transition-all duration-300 group-hover:opacity-0 absolute"
                />
                {/* Hover icon */}
                <Image
                  src={card.hoverIcon}
                  alt={card.title}
                  width={120}
                  height={120}
                  className="opacity-0 transition-all duration-300 group-hover:opacity-100"
                />
              </div>

              {/* TEXT */}
              <p className="text-white/60 text-[14px] uppercase tracking-[0.6px] mb-2 transition-colors duration-300 group-hover:text-[#C6FF55]">
                {card.title}
              </p>
              <h3
                className="
            text-[20px] font-semibold leading-[30px]
            group-hover:text-[#C6FF55] transition-colors duration-300
          "
              >
                {card.desc}
              </h3>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center mt-20">
          <div className="
      bg-white/10 border border-white/10 px-8 py-4 rounded-[14px]
      flex items-center gap-3
    ">
            <div className="
        w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
      ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20" height="20"
                fill="none"
                strokeWidth="2.5"
                stroke="#C6FF55"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <p className="text-[17px] font-medium text-white">
              Your fundraising journey, simplified from start to finish
            </p>
          </div>
        </div>
      </section>


      {/* From Idea to Investment Section */}
      <section className="relative bg-[#FAF7EE] py-28 px-6 lg:px-24 text-center overflow-hidden">

        {/* Section Header */}
        <div className="relative z-10 mb-20">
          <h2 className="text-[50px] font-bold leading-[68px] tracking-[-0.9px] text-[#31372B] font-funnel-display">
            From Idea to Investment
          </h2>
          <p className="text-[20px] mt-3 text-[#31372B] font-[Arial]">
            Everything you need to fuel your startup journey.
          </p>
        </div>

        {/* Cards Container */}
        <div className="relative z-10 grid md:grid-cols-3 gap-8 max-w-[1450px] mx-auto">

          {/* Card 1: The List You Need */}
          <div className="w-[90%] md:w-auto mx-auto bg-white border border-[rgba(49,55,43,0.12)] shadow-sm rounded-[24px] p-8 flex flex-col text-left h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] hover:border-black">
            <h3 className="text-[24px] font-bold text-[#31372B] mb-3">
              The List You Need
            </h3>
            <p className="text-[#717182] text-[16px] leading-[26px] mb-8">
              Thousands of investors, angels, and VCs organized for founders who mean business.
            </p>

            {/* Visual */}
            <div className="bg-[#EDF4E5] rounded-[16px] p-4 border border-[rgba(49,55,43,0.08)] flex-1 flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#31372B]">
                  <div className="w-2 h-2 rounded-full bg-[#31372B]"></div>
                  5,000+ Investors
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-[#31372B] rounded-full opacity-40"></div>
                  <div className="w-1 h-1 bg-[#31372B] rounded-full opacity-40"></div>
                  <div className="w-1 h-1 bg-[#31372B] rounded-full opacity-40"></div>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717182]" size={14} />
                <input
                  type="text"
                  placeholder="Search by name, company or email..."
                  className="w-full bg-white border border-[rgba(49,55,43,0.1)] rounded-[8px] pl-10 pr-4 py-2.5 text-[12px] text-[#31372B] placeholder:text-[#717182]/60 focus:outline-none"
                  readOnly
                />
              </div>

              {/* List Items */}
              <div className="space-y-2.5 mb-4">
                {[
                  { initials: "SC", name: "Sarah Chen", email: "sarah.chen@techventures.io", tag: "TechVentures" },
                  { initials: "MR", name: "Michael Rodriguez", email: "m.rodriguez@innovate.vc", tag: "Innovate" },
                  { initials: "PS", name: "Priya Sharma", email: "priya@globaltech.co", tag: "Globaltech" },
                ].map((item, i) => (
                  <div key={i} className="bg-[#FAF7EE] border border-[rgba(49,55,43,0.06)] rounded-[10px] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E1E1E] text-white text-[10px] font-bold flex items-center justify-center">
                        {item.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold text-[#31372B]">{item.name}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#717182]">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                        <div className="text-[10px] text-[#717182]">{item.email}</div>
                      </div>
                    </div>
                    <div className="bg-[#EDF4E5] border border-[rgba(49,55,43,0.1)] text-[#31372B] text-[9px] font-bold px-2 py-1 rounded-full">
                      {item.tag}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-2 text-center text-[11px] font-bold text-[#31372B]/70">
                Showing 3 of 5,000+ verified investors
              </div>
            </div>
          </div>

          {/* Card 2: Connect directly via Email */}
          <div className="w-[90%] md:w-auto mx-auto bg-white border border-[rgba(49,55,43,0.12)] shadow-sm rounded-[24px] p-8 flex flex-col text-left h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] hover:border-black">
            <h3 className="text-[24px] font-bold text-[#31372B] mb-3">
              Connect directly via Email
            </h3>
            <p className="text-[#717182] text-[16px] leading-[26px] mb-8">
              Connect directly with investors, introduce your startups & send your pitch deck.
            </p>

            {/* Visual */}
            <div className="bg-[#EDF4E5] rounded-[16px] p-4 border border-[rgba(49,55,43,0.08)] flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#31372B] mb-4 px-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Direct Email Access
              </div>

              {/* List Items */}
              <div className="space-y-3 flex-1">
                {[
                  { initials: "SC", name: "Sarah Chen", email: "sarah.chen@techventures.io" },
                  { initials: "MR", name: "Michael Rodriguez", email: "m.rodriguez@innovate.vc" },
                ].map((item, i) => (
                  <div key={i} className="bg-white border border-[rgba(49,55,43,0.1)] rounded-[12px] p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-[8px] bg-[#31372B] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                        {item.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-[#31372B] mb-1">{item.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-[#717182]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          <span className="truncate">{item.email}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto cursor-pointer opacity-50 hover:opacity-100">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Add your startup */}
          <div className="w-[90%] md:w-auto mx-auto bg-white border border-[rgba(49,55,43,0.12)] shadow-sm rounded-[24px] p-8 flex flex-col text-left h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] hover:border-black">
            <h3 className="text-[24px] font-bold text-[#31372B] mb-3">
              Add your startup
            </h3>
            <p className="text-[#717182] text-[16px] leading-[26px] mb-8">
              Fill out the form. If your startup is exceptional, we will also manually help you raise funds.
            </p>

            {/* Visual */}
            <div className="bg-[#EDF4E5] rounded-[16px] p-4 border border-[rgba(49,55,43,0.08)] flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#31372B] mb-4 px-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Add your startup
              </div>

              {/* Upload Area */}
              <div className="bg-white border border-[rgba(49,55,43,0.1)] rounded-[12px] flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EDF4E5] flex items-center justify-center mb-4 text-[#31372B]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-[12px] text-[#717182] leading-[18px] max-w-[200px]">
                  Submit your startup details and we&apos;ll connect you with relevant investors                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Signup Bar */}
        <div className="relative z-10 mt-16 flex justify-center">
          <div className="bg-[#EDF4E5] border border-[rgba(49,55,43,0.2)] rounded-[14px] px-8 py-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <Zap size={18} strokeWidth={1.5} className="text-[#31372B]" />
            <span className="font-bold text-[#31372B] text-[16px]">
              Get instant access to all features when you sign up
            </span>
          </div>
        </div>
      </section>

      {/* InvestorDataShowcase Section */}
      <section className="relative overflow-hidden bg-[#1E1E1E] text-white py-24 flex flex-col items-center">
        {/* Background Blurs */}
        <div className="absolute w-[550px] h-[550px] bg-[#C6FF55]/10 blur-[70px] rounded-full top-0 left-1/4"></div>
        <div className="absolute w-[550px] h-[550px] bg-[#EDF4E5]/5 blur-[70px] rounded-full bottom-0 right-1/4"></div>

        {/* Section Header */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="px-5 py-1 rounded-full border border-[#EDF4E5]/30 bg-[#EDF4E5]/20 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C6FF55]"></div>
            <p className="font-bold text-sm font-[Arial]">GLOBAL INVESTOR NETWORK</p>
          </div>

          <h2 className="text-[54px] font-bold leading-[1.3] max-w-[850px] font-funnel-display">
            Your Gateway to 5,000+ Investors
          </h2>
          <p className="text-[20px] text-white/80 font-[Arial]">
            Access verified investor contacts across industries and global locations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 - Verified Investors */}
          <div className="relative bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col justify-between w-[360px] sm:w-[500px] h-[220px] transition-transform hover:-translate-y-1 hover:bg-white/15">
            <div className="flex items-center justify-center w-[52px] h-[52px] bg-[#EDF4E5] rounded-xl border border-[#31372B]/10 shadow">
              <Image src="/UsersIcon.svg" alt="Users" width={24} height={24} className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <h3 className="text-[48px] font-bold leading-none font-funnel-display">5,000+</h3>
              <p className="font-semibold text-[16px] mt-2 font-[Arial]">Verified Investors</p>
              <p className="text-[14px] text-white/70 font-[Arial]">Worldwide</p>
            </div>
          </div>

          {/* Card 2 - Verified Emails */}
          <div className="relative bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col justify-between w-[360px] sm:w-[500px] h-[220px] transition-transform hover:-translate-y-1 hover:bg-white/15">
            <div className="flex items-center justify-center w-[52px] h-[52px] bg-[#EDF4E5] rounded-xl border border-[#31372B]/10 shadow">
              <Image src="/MailIcon.svg" alt="Mail" width={24} height={24} className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <h3 className="text-[48px] font-bold leading-none font-funnel-display">4,850</h3>
              <p className="font-semibold text-[16px] mt-2 font-[Arial]">Verified Emails</p>
              <p className="text-[14px] text-white/70 font-[Arial]">Direct contacts</p>
            </div>
          </div>

          {/* Card 3 - Global Locations */}
          <div className="relative bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col justify-between w-[360px] sm:w-[500px] h-[220px] transition-transform hover:-translate-y-1 hover:bg-white/15">
            <div className="flex items-center justify-center w-[52px] h-[52px] bg-[#EDF4E5] rounded-xl border border-[#31372B]/10 shadow">
              <Image src="/MapPinIcon.svg" alt="Map" width={24} height={24} className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <h3 className="text-[48px] font-bold leading-none font-funnel-display">120+</h3>
              <p className="font-semibold text-[16px] mt-2 font-[Arial]">Global Locations</p>
              <p className="text-[14px] text-white/70 font-[Arial]">Cities covered</p>
            </div>
          </div>

          {/* Card 4 - Investment Fields */}
          <div className="relative bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col justify-between w-[360px] sm:w-[500px] h-[220px] transition-transform hover:-translate-y-1 hover:bg-white/15">
            <div className="flex items-center justify-center w-[52px] h-[52px] bg-[#EDF4E5] rounded-xl border border-[#31372B]/10 shadow">
              <Image src="/BriefCaseIcon.svg" alt="Briefcase" width={24} height={24} className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <h3 className="text-[48px] font-bold leading-none font-funnel-display">25+</h3>
              <p className="font-semibold text-[16px] mt-2 font-[Arial]">Investment Fields</p>
              <p className="text-[14px] text-white/70 font-[Arial]">Industries</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="relative z-10 flex flex-col items-center mt-16 gap-6">
          <button onClick={handleGoogleLogin} className="bg-[#C6FF55] text-[#31372B] px-8 py-4 font-bold text-lg rounded-xl border border-[#31372B]/20 shadow-[0_0_34px_rgba(198,255,85,0.3)] flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
            Explore Investor Database
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <p className="text-white/70 text-[16px]">
            Start connecting with verified investors today
          </p>
        </div>

        {/* Bottom Banner */}
        <div className="relative z-10 mt-12 bg-[#EDF4E5]/10 border border-[#EDF4E5]/20 rounded-xl px-6 py-4 max-w-[900px] flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#C6FF55]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            <p className="font-bold">All contacts include verified email addresses</p>
          </div>
          <span className="text-white/60">• Direct access to decision-makers</span>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative bg-[#FFFFFF] py-28 text-[#31372B] overflow-hidden">
        <div className="text-center mb-20">
          <h2 className="text-[46px] font-bold leading-[68px] tracking-[-0.5px] font-funnel-display">Simple, Transparent Pricing</h2>
          <p className="text-[18px] text-[#717182] mt-2 font-[Arial]">
            Choose the plan that fits your fundraising needs
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 items-stretch">
          {/* Starter */}
          <div className="bg-white border border-[#D8D8D8]/60 rounded-[20px] p-8 text-left shadow-[0_10px_15px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform duration-300 flex flex-col">
            <h3 className="text-[18px] font-bold mb-2 font-[Arial]">Starter</h3>
            <h4 className="text-[44px] font-bold mb-1 font-funnel-display">Free</h4>
            <p className="text-[14px] text-[#717182] mb-5 leading-[22px] font-[Arial] min-h-[44px]">
              Get started with basics<br />Explore our investor database
            </p>
            <ul className="text-left text-[15px] text-[#31372B]/90 mb-8 space-y-2 flex-1 font-[Arial]">
              {[
                "Access 5 investors per month",
                "Basic search filters",
                "View investor profiles",
                "Basic Email Support",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-[22px] h-[22px] bg-[#EDF4E5] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" strokeWidth="3" stroke="#31372B" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={handleGoogleLogin} className="w-full bg-[#EDF4E5] text-[#31372B] font-bold rounded-[10px] py-3 hover:bg-black hover:text-white transition-colors cursor-pointer font-[Arial] mt-auto">
              Get Started
            </button>
          </div>

          {/* Professional */}
          <div className="relative bg-white border-2 border-black rounded-[20px] p-8 text-left shadow-[0_10px_15px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-transform duration-300 flex flex-col">
            {/* Tag */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#C6FF55] text-[#31372B] text-xs font-bold px-5 py-1.5 rounded-full border border-[#31372B]/20 shadow-md">
              MOST POPULAR
            </div>
            <h3 className="text-[18px] font-bold mb-2 font-[Arial]">Professional</h3>
            <div className="flex justify-start items-end gap-1 mb-1">
              <h4 className="text-[44px] font-bold leading-[1] font-funnel-display">$19</h4>
            </div>
            <p className="text-[14px] text-[#717182] mb-5 font-[Arial] min-h-[44px]">60 credits<br />Unlock verified investor contacts</p>
            <ul className="text-left text-[15px] text-[#31372B]/90 mb-8 space-y-2 flex-1 font-[Arial]">
              {[
                "Everything in Starter",
                "60 investor contact unlocks",
                "60 startup tool credits",
                "Verified email addresses",
                "Advanced search filters",
                "Export to CSV",
                "Priority email support",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-[22px] h-[22px] bg-[#EDF4E5] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" strokeWidth="3" stroke="#31372B" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={handleGoogleLogin} className="w-full bg-[#C6FF55] text-[#31372B] font-bold rounded-[10px] py-3 hover:brightness-110 transition-all cursor-pointer font-[Arial] mt-auto">
              Get Started
            </button>
          </div>

          {/* Growth */}
          <div className="bg-white border border-[#D8D8D8]/60 rounded-[20px] p-8 text-left shadow-[0_10px_15px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform duration-300 flex flex-col">
            <h3 className="text-[18px] font-bold mb-2 font-[Arial]">Growth</h3>
            <div className="flex justify-start items-end gap-1 mb-1">
              <h4 className="text-[44px] font-bold leading-[1] font-funnel-display">$99</h4>
            </div>
            <p className="text-[14px] text-[#717182] mb-5 font-[Arial] min-h-[44px]">300 credits<br />Scale your fundraising outreach</p>
            <ul className="text-left text-[15px] text-[#31372B]/90 mb-8 space-y-2 flex-1 font-[Arial]">
              {[
                "Everything in Professional",
                "300 investor contact unlocks",
                "300 startup tool credits",
                "Unlimited searches",
                "Save investor lists",
                "Dedicated Investment Banking service (add-on $499)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-[22px] h-[22px] bg-[#EDF4E5] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" strokeWidth="3" stroke="#31372B" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={handleGoogleLogin} className="w-full bg-[#EDF4E5] text-[#31372B] font-bold rounded-[10px] py-3 hover:bg-black hover:text-white transition-colors cursor-pointer font-[Arial] mt-auto">
              Get Started
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-white border border-[#D8D8D8]/60 rounded-[20px] p-8 text-left shadow-[0_10px_15px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform duration-300 flex flex-col">
            <h3 className="text-[18px] font-bold mb-2 font-[Arial]">Enterprise</h3>
            <div className="flex justify-start items-end gap-1 mb-1">
              <h4 className="text-[44px] font-bold leading-[1] font-funnel-display">$999</h4>
            </div>
            <p className="text-[14px] text-[#717182] mb-5 leading-[22px] font-[Arial] min-h-[44px]">
              4,000 credits<br />For serious fundraisers
            </p>
            <ul className="text-left text-[15px] text-[#31372B]/90 mb-8 space-y-2 flex-1 font-[Arial]">
              {[
                "Everything in Growth",
                "4,000 investor contact unlocks",
                "4,000 startup tool credits",
                "Dedicated support team",
                "Dedicated Investment Banking service (add-on $499)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-[22px] h-[22px] bg-[#EDF4E5] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" strokeWidth="3" stroke="#31372B" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={handleGoogleLogin} className="w-full bg-[#EDF4E5] text-[#31372B] font-bold rounded-[10px] py-3 hover:bg-black hover:text-white transition-colors cursor-pointer font-[Arial] mt-auto">
              Get Started
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-[14px] text-[#717182] mt-10 mb-10">
          All plans include access to our verified investor database. <span className="font-bold text-[#31372B]">Credits never expire.</span>
        </p>
      </section>
      {/* ✅ Trusted by Indian Founders Section */}
      <section
        className="relative mt-0 md:mt-[-7vw] flex flex-col items-center md:items-start isolate bg-[#FAF7EE] px-4 md:px-[7.9vw] py-12 md:py-[6.31vw] gap-8 md:gap-[4.21vw]"
      >
        {/* Badge */}
        <div
          className="flex items-center mx-auto md:mx-0 md:absolute bg-[rgba(49,55,43,0.12)] border border-[rgba(49,55,43,0.1)] rounded-full px-4 py-2 md:px-[1.4vw] md:py-[0.75vw] gap-2 md:gap-[0.93vw]"
          style={{
            top: "5.04vw",
            left: "44.3vw",
          }}
        >
          <div
            className="w-2 h-2 md:w-[0.53vw] md:h-[0.53vw] rounded-full bg-[#C6FF55] opacity-94"
          ></div>
          <span
            className="font-bold uppercase tracking-wide text-[#31372B] text-xs md:text-[0.92vw]"
          >
            Testimonials
          </span>
        </div>

        {/* Headings */}
        <div className="text-center w-full mt-4 md:mt-[2vw]">
          <h2
            className="font-bold text-[#31372B] text-3xl md:text-[2.89vw] leading-tight md:leading-[4.35vw] font-funnel-display"
          >
            Trusted by Indian Founders
          </h2>
          <p
            className="text-[#717182] text-base md:text-[1.18vw] leading-relaxed md:leading-[1.9vw] mt-2 md:mt-[0.7vw] font-[Arial]"
          >
            See how founders are accelerating their fundraising journey with
            <span className="font-semibold text-[#31372B] font-[Arial]"> MyFundingList</span>
          </p>
        </div>

        {/* Masonry Grid */}
        <div
          className="relative grid grid-cols-1 md:grid-cols-[55.6vw_27vw] gap-4 md:gap-[1.8vw] w-full mt-0 md:mt-[-1.5vw]"
        >
          {/* Left Large Card */}
          <div
            className="flex flex-col justify-between bg-white border border-[#31372B]/10 shadow-md rounded-2xl md:rounded-[1.58vw] p-6 md:p-[2.7vw] md:row-span-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-[#31372B]/30"
          >
            <div
              className="w-10 h-8 md:w-[2.63vw] md:h-[2.1vw] bg-gradient-to-r from-[rgba(198,255,85,0.3)] to-[rgba(198,255,85,0.3)] mb-4 md:mb-[1.6vw]"
            ></div>
            <p
              className="font-bold text-[#31372B] text-lg md:text-[1.58vw] leading-relaxed md:leading-[2.38vw]"
            >
              MyFundingList connected us with the right investors almost instantly. The verified contacts and detailed profiles made our outreach incredibly targeted and effective.
            </p>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div
                className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw]"
              >
                SD
              </div>
              <div>
                <p
                  className="font-bold text-[#31372B] text-base md:text-[1.05vw]"
                >
                  Soumyajit Dasgupta
                </p>
                <p className="text-[#717182] text-sm md:text-[0.92vw]">
                  Founder, Hexstar Universe
                </p>
              </div>
            </div>
          </div>

          {/* Right Top */}
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-2xl md:rounded-[1.58vw] p-6 md:p-[2.7vw] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-[#31372B]/30">
            <h3
              className="font-bold text-[#31372B] text-lg md:text-[1.58vw] leading-snug md:leading-[2vw]"
            >
              We&apos;ve 5x&apos;d our investor meetings
            </h3>
            <p className="text-[#717182] text-sm md:text-[0.99vw]">
              The quality of contacts is unmatched.
            </p>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div
                className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw]"
              >
                DC
              </div>
              <div>
                <p
                  className="font-bold text-[#31372B] text-base md:text-[1.05vw]"
                >
                  Deep Chakraborty
                </p>
                <p className="text-[#717182] text-sm md:text-[0.92vw]">
                  Founder, Hive Dynamics
                </p>
              </div>
            </div>
          </div>

          {/* Right Middle — CTA */}
          <div className="bg-[#31372B] border border-[#31372B]/10 shadow-md rounded-2xl md:rounded-[1.58vw] p-6 md:p-[2.7vw] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.20)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-[#C6FF55] flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#31372B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-base md:text-[1.32vw] leading-snug md:leading-[2vw] mb-2">
                Ready to find your investors?
              </h3>
              <p className="text-white/60 text-sm md:text-[0.92vw]">
                Join 500+ founders already using MyFundingList to raise smarter.
              </p>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="mt-4 md:mt-[1.3vw] px-4 py-2 md:px-[1.5vw] md:py-[0.5vw] rounded-full font-bold text-[#31372B] shadow-sm border border-[#C6FF55]/40 hover:scale-105 transition text-sm md:text-[0.92vw] bg-[#C6FF55] cursor-pointer"
            >
              Get started free →
            </button>
          </div>
        </div>

        {/* ✅ Bottom Row — Fixed */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[1.1vw] w-full mt-0 md:mt-[-3vw]"
        >
          {/* Bottom Left — Deepak Kumar */}
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-2xl md:rounded-[1.58vw] p-6 md:p-[2.7vw] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-[#31372B]/30">
            <p className="text-[#31372B] text-base md:text-[1.1vw] leading-relaxed md:leading-[1.8vw]">
              &quot;Closed our seed round in 60 days. The database is comprehensive and always up-to-date.&quot;
            </p>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw]">
                DK
              </div>
              <div>
                <p className="font-bold text-[#31372B] text-base md:text-[1.05vw]">Deepak Kumar</p>
                <p className="text-[#717182] text-sm md:text-[0.92vw]">Founder, Wah Puchka</p>
              </div>
            </div>
          </div>

          {/* Bottom Middle — Marcus Thompson */}
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-2xl md:rounded-[1.58vw] p-6 md:p-[2.7vw] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-[#31372B]/30">
            <p className="font-bold text-[#31372B] text-base md:text-[1.18vw] leading-relaxed md:leading-[1.8vw]">
              &quot;The investor data is more accurate than anything we found elsewhere. We booked 8 meetings in our first week of outreach.&quot;
            </p>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw]">
                MT
              </div>
              <div>
                <p className="font-bold text-[#31372B] text-base md:text-[1.05vw]">Marcus Thompson</p>
                <p className="text-[#717182] text-sm md:text-[0.92vw]">CEO, Stackr Labs</p>
              </div>
            </div>
          </div>

          {/* Bottom Right — Ashley Rivera */}
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-2xl md:rounded-[1.58vw] p-6 md:p-[2.7vw] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-[#31372B]/30">
            <h3 className="font-bold text-[#31372B] text-lg md:text-[1.58vw] leading-snug md:leading-[2vw]">
              This is the unfair advantage every founder needs
            </h3>
            <p className="text-[#717182] text-sm md:text-[0.99vw]">
              We raised our pre-seed in under 45 days. Couldn&apos;t have done it without this platform.
            </p>
            <div className="flex items-center gap-3 md:gap-[1.05vw] mt-4 md:mt-[1.3vw]">
              <div className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full w-12 h-12 md:w-[3.16vw] md:h-[3.16vw] text-sm md:text-[0.92vw]">
                AR
              </div>
              <div>
                <p className="font-bold text-[#31372B] text-base md:text-[1.05vw]">Ashley Rivera</p>
                <p className="text-[#717182] text-sm md:text-[0.92vw]">Co-founder, NovaBridge</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center w-full mt-0 md:mt-[-1.5vw] mb-4 md:mb-[2.5vw] text-[#717182] text-sm md:text-[0.92vw]"
        >
          Join hundreds of founders who&apos;ve successfully raised funding.
          <span className="font-bold text-[#31372B] ml-1 md:ml-[0.3vw]">
            Start your journey today.
          </span>
        </div>
      </section>
      {/* FAQ Section */}
      <section
        id="faq"
        className="w-full bg-white flex flex-col items-center px-4 py-12 md:py-[6vw]"
      >
        {/* Title */}
        <h2
          className="font-bold text-[#31372B] text-3xl md:text-[2.4vw] mb-4 md:mb-[1vw] font-funnel-display"
        >
          FAQs
        </h2>

        {/* Divider */}
        <div
          className="w-full max-w-5xl md:w-[82vw] h-px bg-[rgba(49,55,43,0.15)] mb-6 md:mb-[2vw]"
        />

        {/* FAQ List */}
        <div
          className="flex flex-col w-full max-w-5xl md:w-[82vw] gap-2 md:gap-[1vw]"
        >
          {[
            {
              q: "How do credits work?",
              a: "Each credit lets you unlock one verified investor contact. Use credits anytime to reveal verified emails and direct contact info.",
            },
            {
              q: "What types of investors are in your database?",
              a: "Our database includes angels, VCs, syndicates, funds, and strategic investors across industries and stages.",
            },
            {
              q: "How often is the investor data updated?",
              a: "Our investor database is updated weekly with verified information to ensure accuracy.",
            },
            {
              q: "Do credits expire?",
              a: "No. Credits never expire — you can use them anytime.",
            },
            {
              q: "Can I get a refund if I don't use my credits?",
              a: "Unused credits are non-refundable, but they remain valid forever.",
            },
          ].map((faq, i) => (
            <motion.div
              key={i}
              className="border-b border-[#31372B]/20"
              initial={false}
            >
              <button
                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                className="w-full flex justify-between items-center py-4 md:py-[1.4vw] text-left"
              >
                <span
                  className="text-[#31372B] text-base md:text-[1.25vw] font-medium"
                >
                  {faq.q}
                </span>

                <motion.span
                  animate={{ rotate: activeIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-[#31372B] font-bold text-2xl md:text-[1.6vw] leading-none"
                >
                  +
                </motion.span>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: activeIndex === i ? "auto" : 0,
                  opacity: activeIndex === i ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p
                  className="text-[#717182] text-sm md:text-[1.1vw] w-11/12 md:w-9/10"
                  style={{
                    paddingBottom: activeIndex === i ? "1rem" : "0",
                  }}
                >
                  {faq.a}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section
        id="cta"
        className="relative flex flex-col items-center justify-center overflow-hidden bg-[#1E1E1E] text-center px-4 py-20 md:py-0 min-h-[400px] md:h-[37.78vw]"
      >
        <div
          className="absolute rounded-full w-64 h-64 md:w-[25.24vw] md:h-[25.24vw] left-1/4 md:left-[25vw] top-20 md:top-[9.45vw] bg-[rgba(198,255,85,0.1)] blur-[60px] md:blur-[4.21vw]"
        ></div>

        <div
          className="absolute rounded-full w-64 h-64 md:w-[25.24vw] md:h-[25.24vw] left-1/2 md:left-[49.8vw] top-10 md:top-[3.08vw] bg-[rgba(255,255,255,0.05)] blur-[60px] md:blur-[4.21vw]"
        ></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl md:w-[59vw] text-center">
          <h2
            className="font-bold text-white text-3xl md:text-[3.68vw] leading-tight md:leading-[4.06vw] mb-6 md:mb-[2vw] font-funnel-display"
          >
            Ready to accelerate your fundraising?
          </h2>

          <p
            className="text-white/80 text-base md:text-[1.32vw] leading-relaxed md:leading-[2.08vw] mb-8 md:mb-[3vw] max-w-2xl md:max-w-[44vw] font-[Arial]"
          >
            Join hundreds of founders who&apos;ve successfully raised funding <br className="hidden md:block" />
            with <span className="font-semibold text-white font-[Arial]">MyFundingList</span>
          </p>

          <button
            onClick={handleGoogleLogin}
            className="font-bold text-[#31372B] bg-[#C6FF55] shadow-[0_0_30px_rgba(198,255,85,0.3)] md:shadow-[0_0_1.98vw_rgba(198,255,85,0.3)] border border-[#31372B]/20 rounded-xl md:rounded-[1.05vw] hover:scale-105 transition px-8 py-3 md:px-[2.74vw] md:py-[1vw] text-base md:text-[1.18vw] cursor-pointer"
          >
            Start connecting with investors
          </button>
        </div>
      </section>

      <Footer />

    </main>
  );
}
