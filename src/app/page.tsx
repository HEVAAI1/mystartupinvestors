"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Dot, Download, Filter, Zap } from "lucide-react";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";


export default function Home() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const supabase = createSupabaseBrowserClient();

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
        className="w-full flex justify-between items-center px-8 py-4 bg-[#FFFFFE] border-b border-black/10 fixed top-0 z-50"
      >
        <div className="flex items-center gap-2">
          <Image
            src="/Logo.png"
            alt="Logo"
            width={100}
            height={40}
            className="h-[38px] w-auto"
          />
        </div>

        <button className="bg-[#31372B] text-[#FAF7EE] px-6 py-2 rounded-lg font-bold shadow hover:opacity-90 transition cursor-pointer" onClick={handleGoogleLogin}>
          Sign In
        </button>
      </motion.nav>

      {/* Hero Section */}

      <section className="bg-[#FAFAFA] flex flex-col items-center text-center px-6 md:px-12 lg:px-24 pt-28 pb-24 font-[var(--font-funnel-display)]">
        {/* Trusted Tag */}
        <div className="bg-[#1E1E1E]/10 border border-[#1E1E1E]/20] text-[#3C3C43] rounded-full px-5 py-2 text-sm font-medium mb-6 shadow-sm">
          Trusted by 500+ startups
        </div>

        {/* Heading */}
        <h1 className="text-[40px] md:text-[48px] leading-tight font-bold text-[#000] tracking-[-1px] max-w-3xl">
          4000+ Investors’ Access to get <br className="hidden md:block" /> your startup funded
        </h1>

        {/* Subtext */}
        <p className="text-[#6B6B6B] text-lg md:text-[20px] leading-[32px] max-w-2xl mt-4">
          Connect with investors across all sectors & geographies.
        </p>

        {/* CTA */}
        <a
          href="#"
          className="mt-8 inline-flex items-center justify-center bg-gradient-to-r from-[#000] to-[#434343] text-white font-semibold text-[18px] rounded-[18px] px-8 py-4 shadow-md hover:opacity-90 transition"
        >
          Start Connecting Today →
        </a>

        {/* Stats */}
        {/* Stats */}
        <div className="flex gap-16 md:gap-24 mt-10">
          {/* Stat 1 */}
          <div className="flex flex-col items-center">
            <h3 className="text-[32px] md:text-[40px] font-bold text-black">4000+</h3>
            <p className="text-[#6B6B6B] text-sm md:text-base mt-1">Verified Investors</p>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center">
            <h3 className="text-[32px] md:text-[40px] font-bold text-black">$2.5B+</h3>
            <p className="text-[#6B6B6B] text-sm md:text-base mt-1">Funding Raised</p>
          </div>
        </div>

        <div className="relative w-full flex justify-center mt-[30px]">
          <div
            className="
      relative
      bg-[#1E1E1E]
      w-[1437px]
      h-[555px]
      rounded-[22px]
      shadow-[inset_2px_2px_6.2px_rgba(255,255,255,0.11),inset_-2px_2px_9.2px_rgba(255,255,255,0.10)]
      overflow-hidden
    "
          >
            <div
              className="absolute top-[67px] left-[172px] right-[61px] bottom-0 bg-no-repeat bg-center bg-contain"
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
              "/KhoslaLogo.png",
              "/AntlerLogo.png",
              "/TigerLogo.png",
              "/CombinatorLogo.png",
              "/LightspeedLogo.png",
              "/BlumeLogo.png",
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
          <h2 className="text-[46px] font-bold leading-[54px]">
            We&apos;ve Fixed Fundraising Frustration
          </h2>
          <p className="text-[18px] text-white/60 mt-3">
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
          group relative p-10 rounded-[24px]
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
          <h2 className="text-[50px] font-bold leading-[68px] tracking-[-0.9px] text-[#31372B]">
            From Idea to Investment
          </h2>
          <p className="text-[20px] mt-3 text-[#31372B]">
            Everything you need to fuel your startup journey.
          </p>
        </div>

        {/* Cards Container */}
        <div className="relative z-10 grid md:grid-cols-3 gap-8 max-w-[1450px] mx-auto">

          {/* Card 1: The List You Need */}
          <div className="bg-white border border-[rgba(49,55,43,0.12)] shadow-sm rounded-[24px] p-8 flex flex-col text-left h-full">
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
          <div className="bg-white border border-[rgba(49,55,43,0.12)] shadow-sm rounded-[24px] p-8 flex flex-col text-left h-full">
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
          <div className="bg-white border border-[rgba(49,55,43,0.12)] shadow-sm rounded-[24px] p-8 flex flex-col text-left h-full">
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
                  Submit your startup details and we'll connect you with relevant investors
                </p>
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
            <p className="font-bold text-sm">Global Investor Network</p>
          </div>

          <h2 className="text-[54px] font-bold leading-[1.3] max-w-[850px]">
            Your Gateway to 5,000+ Investors
          </h2>
          <p className="text-[20px] text-white/80">
            Access verified investor contacts across industries and global locations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="relative bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col justify-between w-[360px] sm:w-[500px] h-[220px] transition-transform hover:-translate-y-1 hover:bg-white/15">
            <div className="flex items-center justify-center w-[52px] h-[52px] bg-[#EDF4E5] rounded-xl border border-[#31372B]/10 shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#31372B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="1.6" d="M17 20v-2a4 4 0 00-3-3.87M9 9a4 4 0 110-8 4 4 0 010 8zm-6 11v-2a4 4 0 013-3.87" />
              </svg>
            </div>
            <div className="mt-4">
              <h3 className="text-[48px] font-bold leading-none">5,000+</h3>
              <p className="font-semibold text-[16px] mt-2">Verified Investors</p>
              <p className="text-[14px] text-white/70">Worldwide</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col justify-between w-[360px] sm:w-[500px] h-[220px] transition-transform hover:-translate-y-1 hover:bg-white/15">
            <div className="flex items-center justify-center w-[52px] h-[52px] bg-[#EDF4E5] rounded-xl border border-[#31372B]/10 shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#31372B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </div>
            <div className="mt-4">
              <h3 className="text-[48px] font-bold leading-none">4,850</h3>
              <p className="font-semibold text-[16px] mt-2">Verified Emails</p>
              <p className="text-[14px] text-white/70">Direct contacts</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col justify-between w-[360px] sm:w-[500px] h-[220px] transition-transform hover:-translate-y-1 hover:bg-white/15">
            <div className="flex items-center justify-center w-[52px] h-[52px] bg-[#EDF4E5] rounded-xl border border-[#31372B]/10 shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#31372B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="1.6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <div className="mt-4">
              <h3 className="text-[48px] font-bold leading-none">120+</h3>
              <p className="font-semibold text-[16px] mt-2">Global Locations</p>
              <p className="text-[14px] text-white/70">Cities covered</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="relative bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl rounded-2xl p-8 flex flex-col justify-between w-[360px] sm:w-[500px] h-[220px] transition-transform hover:-translate-y-1 hover:bg-white/15">
            <div className="flex items-center justify-center w-[52px] h-[52px] bg-[#EDF4E5] rounded-xl border border-[#31372B]/10 shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#31372B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 3h2a2 2 0 012 2v2H4V5a2 2 0 012-2h2" />
              </svg>
            </div>
            <div className="mt-4">
              <h3 className="text-[48px] font-bold leading-none">25+</h3>
              <p className="font-semibold text-[16px] mt-2">Investment Fields</p>
              <p className="text-[14px] text-white/70">Industries</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="relative z-10 flex flex-col items-center mt-16 gap-6">
          <button className="bg-[#C6FF55] text-[#31372B] px-8 py-4 font-bold text-lg rounded-xl border border-[#31372B]/20 shadow-[0_0_34px_rgba(198,255,85,0.3)] flex items-center gap-2 hover:scale-105 transition-transform">
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
      <section className="relative bg-[#F5F5F5] py-28 text-[#31372B] overflow-hidden">
        <div className="text-center mb-20">
          <h2 className="text-[46px] font-bold leading-[68px] tracking-[-0.5px]">Simple, Transparent Pricing</h2>
          <p className="text-[18px] text-[#717182] mt-2">
            Choose the plan that fits your fundraising needs
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {/* Starter */}
          <div className="bg-white border border-[#D8D8D8]/60 rounded-[20px] p-10 text-center shadow-[0_10px_15px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
            <h3 className="text-[20px] font-bold mb-3">Starter</h3>
            <h4 className="text-[48px] font-bold mb-1">Free</h4>
            <p className="text-[16px] text-[#717182] mb-6 leading-[24px]">
              Get started with basics<br />Perfect for exploring our investor database
            </p>
            <ul className="text-left text-[16px] text-[#31372B]/90 mb-10 space-y-2 flex-1">
              {[
                "Access to 100 investors",
                "Basic search filters",
                "View investor profiles",
                "Limited to 5 searches/day",
                "Email support",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#C6FF55" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#EDF4E5] text-[#31372B] font-bold rounded-[10px] py-3 hover:bg-black hover:text-white transition-colors">
              Get started
            </button>
          </div>

          {/* Professional */}
          <div className="relative bg-white border border-[#31372B]/20 rounded-[20px] p-10 text-center shadow-[0_10px_15px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
            {/* Tag */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#C6FF55] text-[#31372B] text-xs font-bold px-5 py-1.5 rounded-full border border-[#31372B]/20 shadow-md">
              MOST POPULAR
            </div>
            <h3 className="text-[20px] font-bold mb-3">Professional</h3>
            <div className="flex justify-center items-end gap-1 mb-1">
              <h4 className="text-[48px] font-bold leading-[1]">$15</h4>
            </div>
            <p className="text-[16px] text-[#717182] mb-6">60 credits<br />Unlock verified investor contacts</p>
            <ul className="text-left text-[16px] text-[#31372B]/90 mb-10 space-y-2 flex-1">
              {[
                "Everything in Starter",
                "60 investor contact unlocks",
                "Verified email addresses",
                "Advanced search filters",
                "Export to CSV",
                "Priority email support",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#C6FF55" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#C6FF55] text-[#31372B] font-bold rounded-[10px] py-3 hover:brightness-110 transition-all">
              Get started
            </button>
          </div>

          {/* Growth */}
          <div className="bg-white border border-[#D8D8D8]/60 rounded-[20px] p-10 text-center shadow-[0_10px_15px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
            <h3 className="text-[20px] font-bold mb-3">Growth</h3>
            <div className="flex justify-center items-end gap-1 mb-1">
              <h4 className="text-[48px] font-bold leading-[1]">$49</h4>
            </div>
            <p className="text-[16px] text-[#717182] mb-6">300 credits<br />Scale your fundraising outreach</p>
            <ul className="text-left text-[16px] text-[#31372B]/90 mb-10 space-y-2 flex-1">
              {[
                "Everything in Professional",
                "300 investor contact unlocks",
                "Unlimited searches",
                "Save investor lists",
                "Track outreach activity",
                "Dedicated account manager",
                "API access",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#C6FF55" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#EDF4E5] text-[#31372B] font-bold rounded-[10px] py-3 hover:bg-black hover:text-white transition-colors">
              Get started
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-white border border-[#D8D8D8]/60 rounded-[20px] p-10 text-center shadow-[0_10px_15px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
            <h3 className="text-[20px] font-bold mb-3">Enterprise</h3>
            <div className="flex justify-center items-end gap-1 mb-1">
              <h4 className="text-[48px] font-bold leading-[1]">$999</h4>
            </div>
            <p className="text-[16px] text-[#717182] mb-6 leading-[24px]">
              Unlimited credits<br />For serious fundraisers
            </p>
            <ul className="text-left text-[16px] text-[#31372B]/90 mb-10 space-y-2 flex-1">
              {[
                "Everything in Growth",
                "Unlimited contact unlocks",
                "Multi-user accounts",
                "Custom integrations",
                "White-label options",
                "Dedicated support team",
                "Custom contract terms",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#C6FF55" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#EDF4E5] text-[#31372B] font-bold rounded-[10px] py-3 hover:bg-black hover:text-white transition-colors">
              Get started
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-[14px] text-[#717182] mt-10">
          All plans include access to our verified investor database. <span className="font-bold text-[#31372B]">Credits never expire.</span>
        </p>
      </section>
      {/* ✅ Trusted by Indian Founders Section */}
      <section
        className="relative mt-[-7vw] flex flex-col items-start isolate bg-[#FAF7EE]"
        style={{
          padding: "6.31vw 7.9vw 0 7.9vw",
          gap: "4.21vw",
        }}
      >
        {/* Badge */}
        <div
          className="absolute flex items-center"
          style={{
            top: "5.04vw",
            left: "44.3vw",
            background: "rgba(49,55,43,0.12)",
            border: "0.05vw solid rgba(49,55,43,0.1)",
            borderRadius: "100vw",
            padding: "0.75vw 1.4vw",
            gap: "0.93vw",
          }}
        >
          <div
            style={{
              width: "0.53vw",
              height: "0.53vw",
              borderRadius: "50%",
              background: "#C6FF55",
              opacity: 0.94,
            }}
          ></div>
          <span
            className="font-bold uppercase tracking-wide text-[#31372B]"
            style={{ fontSize: "0.92vw", letterSpacing: "0.02vw" }}
          >
            Testimonials
          </span>
        </div>

        {/* Headings */}
        <div className="text-center w-full" style={{ marginTop: "vw" }}>
          <h2
            className="font-bold text-[#31372B]"
            style={{
              fontSize: "2.89vw",
              lineHeight: "4.35vw",
              letterSpacing: "-0.06vw",
            }}
          >
            Trusted by Indian Founders
          </h2>
          <p
            className="text-[#717182]"
            style={{ fontSize: "1.18vw", lineHeight: "1.9vw", marginTop: "0.7vw" }}
          >
            See how founders are accelerating their fundraising journey with
            <span className="font-semibold text-[#31372B]"> MyFundingList</span>
          </p>
        </div>

        {/* Masonry Grid */}
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: "55.6vw 27vw",
            gap: "1.8vw",
            width: "100%",
            marginTop: "-1.5vw",
          }}
        >
          {/* Left Large Card */}
          <div
            className="flex flex-col justify-between bg-white border border-[#31372B]/10 shadow-md rounded-[1.58vw] p-[2.7vw]"
            style={{ gridRow: "1 / span 2" }}
          >
            <div
              style={{
                width: "2.63vw",
                height: "2.1vw",
                background:
                  "linear-gradient(90deg, rgba(198,255,85,0.3) 50%, rgba(198,255,85,0.3) 50%)",
                marginBottom: "1.6vw",
              }}
            ></div>
            <p
              className="font-bold text-[#31372B]"
              style={{ fontSize: "1.58vw", lineHeight: "2.38vw" }}
            >
              MyFundingList connected us with 15 VCs in our first month. The verified
              emails and direct contact info saved us months of cold outreach.
            </p>
            <div className="flex items-center gap-[1.05vw] mt-[1.3vw]">
              <div
                className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full"
                style={{ width: "3.16vw", height: "3.16vw", fontSize: "0.92vw" }}
              >
                PS
              </div>
              <div>
                <p
                  className="font-bold text-[#31372B]"
                  style={{ fontSize: "1.05vw" }}
                >
                  Priya Sharma
                </p>
                <p className="text-[#717182]" style={{ fontSize: "0.92vw" }}>
                  CEO, TechFlow
                </p>
              </div>
            </div>
          </div>

          {/* Right Top */}
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-[1.58vw] p-[2.7vw] flex flex-col justify-between">
            <h3
              className="font-bold text-[#31372B]"
              style={{ fontSize: "1.58vw", lineHeight: "2vw" }}
            >
              We’ve 5x’d our investor meetings
            </h3>
            <p className="text-[#717182]" style={{ fontSize: "0.99vw" }}>
              The quality of contacts is unmatched.
            </p>
            <div className="flex items-center gap-[1.05vw] mt-[1.3vw]">
              <div
                className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full"
                style={{ width: "3.16vw", height: "3.16vw", fontSize: "0.92vw" }}
              >
                RV
              </div>
              <div>
                <p
                  className="font-bold text-[#31372B]"
                  style={{ fontSize: "1.05vw" }}
                >
                  Rahul Verma
                </p>
                <p className="text-[#717182]" style={{ fontSize: "0.92vw" }}>
                  Founder, FinNext
                </p>
              </div>
            </div>
          </div>

          {/* Right Middle (Green) */}
          <div className="bg-[#EDF4E5] border border-[#31372B]/10 shadow-md rounded-[1.58vw] p-[2.7vw]">
            <h3
              className="font-bold text-[#31372B]"
              style={{ fontSize: "1.32vw", lineHeight: "2vw" }}
            >
              How GrowthLabs raised $2M in 90 days
            </h3>
            <button
              className="mt-[1.3vw] px-[1.5vw] py-[0.5vw] rounded-full font-bold text-[#31372B] shadow-sm border border-[#31372B]/20 hover:scale-105 transition"
              style={{
                fontSize: "0.92vw",
                background: "#C6FF55",
              }}
            >
              Read the case study here →
            </button>
          </div>
        </div>

        {/* ✅ Bottom Row — Fixed */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.1vw",
            width: "100%",
            marginTop: "-3vw",
          }}
        >
          {/* Bottom Left */}
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-[1.58vw] p-[2.7vw] flex flex-col justify-between">
            <p
              className="text-[#31372B]"
              style={{ fontSize: "1.1vw", lineHeight: "1.8vw" }}
            >
              “Before MyFundingList, our team spent weeks researching investors. Now
              we focus on what matters — building our product.”
            </p>
            <div className="flex items-center gap-[1.05vw] mt-[1.3vw]">
              <div
                className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full"
                style={{ width: "3.16vw", height: "3.16vw", fontSize: "0.92vw" }}
              >
                AM
              </div>
              <div>
                <p
                  className="font-bold text-[#31372B]"
                  style={{ fontSize: "1.05vw" }}
                >
                  Anjali Mehta
                </p>
                <p className="text-[#717182]" style={{ fontSize: "0.92vw" }}>
                  Co-founder, HealthTech Solutions
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Middle */}
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-[1.58vw] p-[2.7vw] flex flex-col justify-between">
            <p
              className="font-bold text-[#31372B]"
              style={{ fontSize: "1.18vw", lineHeight: "1.8vw" }}
            >
              “MyFundingList landed us some of our top investor partnerships!”
            </p>
            <div className="flex items-center gap-[1.05vw] mt-[1.3vw]">
              <div
                className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full"
                style={{ width: "3.16vw", height: "3.16vw", fontSize: "0.92vw" }}
              >
                VS
              </div>
              <div>
                <p
                  className="font-bold text-[#31372B]"
                  style={{ fontSize: "1.05vw" }}
                >
                  Vikram Singh
                </p>
                <p className="text-[#717182]" style={{ fontSize: "0.92vw" }}>
                  CEO, E-commerce startup
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Right */}
          <div className="bg-white border border-[#31372B]/10 shadow-md rounded-[1.58vw] p-[2.7vw] flex flex-col justify-between">
            <h3
              className="font-bold text-[#31372B]"
              style={{ fontSize: "1.58vw", lineHeight: "2vw" }}
            >
              Closed our seed round in 60 days
            </h3>
            <p className="text-[#717182]" style={{ fontSize: "0.99vw" }}>
              The database is comprehensive and always up-to-date.
            </p>
            <div className="flex items-center gap-[1.05vw] mt-[1.3vw]">
              <div
                className="flex items-center justify-center bg-[#31372B] text-[#FAF7EE] font-bold rounded-full"
                style={{ width: "3.16vw", height: "3.16vw", fontSize: "0.92vw" }}
              >
                DK
              </div>
              <div>
                <p
                  className="font-bold text-[#31372B]"
                  style={{ fontSize: "1.05vw" }}
                >
                  Deepak Kumar
                </p>
                <p className="text-[#717182]" style={{ fontSize: "0.92vw" }}>
                  Founder, AI Innovations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center w-full mt-[-1.5vw] mb-[2.5vw] text-[#717182]"
          style={{ fontSize: "0.92vw" }}
        >
          Join hundreds of founders who&apos;ve successfully raised funding.
          <span className="font-bold text-[#31372B] ml-[0.3vw]">
            Start your journey today.
          </span>
        </div>
      </section>
      {/* FAQ Section */}
      <section
        id="faq"
        className="w-full bg-white flex flex-col items-center"
        style={{ padding: "6vw 0" }}
      >
        {/* Title */}
        <h2
          className="font-bold text-[#31372B]"
          style={{
            fontSize: "2.4vw",
            marginBottom: "1vw",
            letterSpacing: "-0.03vw",
          }}
        >
          FAQs
        </h2>

        {/* Divider */}
        <div
          style={{
            width: "82vw",
            height: "1px",
            background: "rgba(49,55,43,0.15)",
            marginBottom: "2vw",
          }}
        />

        {/* FAQ List */}
        <div
          className="flex flex-col"
          style={{ width: "82vw", gap: "1vw" }}
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
              q: "Can I get a refund if I don’t use my credits?",
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
                className="w-full flex justify-between items-center py-[1.4vw] text-left"
              >
                <span
                  className="text-[#31372B]"
                  style={{ fontSize: "1.25vw" }}
                >
                  {faq.q}
                </span>

                <motion.span
                  animate={{ rotate: activeIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-[#31372B] font-bold"
                  style={{ fontSize: "1.6vw", lineHeight: "0" }}
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
                  className="text-[#717182]"
                  style={{
                    fontSize: "1.1vw",
                    paddingBottom: activeIndex === i ? "1.4vw" : "0",
                    width: "90%",
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
        className="relative flex flex-col items-center justify-center overflow-hidden bg-[#1E1E1E] text-center"
        style={{ height: "37.78vw" }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: "25.24vw",
            height: "25.24vw",
            left: "25vw",
            top: "9.45vw",
            background: "rgba(198,255,85,0.1)",
            filter: "blur(4.21vw)",
          }}
        ></div>

        <div
          className="absolute rounded-full"
          style={{
            width: "25.24vw",
            height: "25.24vw",
            left: "49.8vw",
            top: "3.08vw",
            background: "rgba(255,255,255,0.05)",
            filter: "blur(4.21vw)",
          }}
        ></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-[59vw] text-center">
          <h2
            className="font-bold text-white"
            style={{
              fontSize: "3.68vw",
              lineHeight: "4.06vw",
              letterSpacing: "-0.11vw",
              marginBottom: "2vw",
            }}
          >
            Ready to accelerate your fundraising?
          </h2>

          <p
            className="text-white/80"
            style={{
              fontSize: "1.32vw",
              lineHeight: "2.08vw",
              marginBottom: "3vw",
              maxWidth: "44vw",
            }}
          >
            Join hundreds of founders who&apos;ve successfully raised funding <br />
            with <span className="font-semibold text-white">MyFundingList</span>
          </p>

          <button
            className="font-bold text-[#31372B] bg-[#C6FF55] shadow-[0_0_1.98vw_rgba(198,255,85,0.3)] border border-[#31372B]/20 rounded-[1.05vw] hover:scale-105 transition px-[2.74vw] py-[1vw]"
            style={{
              fontSize: "1.18vw",
            }}
          >
            Start connecting with investors
          </button>
        </div>
      </section>

      <footer
        className="flex items-center justify-between bg-white text-[#717182]"
        style={{
          fontSize: "0.92vw",
          padding: "1vw 7.9vw",
        }}
      >
        <div>© 2025 MyFundingList. All rights reserved.</div>
        <div className="flex gap-[2vw]">
          <a href="#" className="hover:text-[#31372B]">
            Refund Policy
          </a>
          <a href="#" className="hover:text-[#31372B]">
            Terms & Conditions
          </a>
          <a href="#" className="hover:text-[#31372B]">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-[#31372B]">
            Blog
          </a>
        </div>
      </footer>

    </main>
  );
}
