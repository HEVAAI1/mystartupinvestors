"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

const navLinkClass =
  "px-4 py-2 text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] transition-colors rounded-full hover:bg-black/5";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const sectionHref = (section: string) => (isHomePage ? `#${section}` : `/#${section}`);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleGoogleLogin = async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) console.error("Google Login Error:", error);
  };

  return (
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
        <div className="flex items-center justify-between h-16 lg:h-20 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6">
          <Link href="/" className="flex items-center gap-2 md:justify-self-start">
            <Image src="/Logo.svg" alt="MyFundingList" width={130} height={40} className="h-[36px] w-auto" />
          </Link>

          <div className="hidden md:flex items-center justify-center gap-1 md:justify-self-center">
            <Link href="/tools-for-founders" className={navLinkClass}>
              Tools for Founders
            </Link>
            <a href={sectionHref("features")} className={navLinkClass}>
              Features
            </a>
            <a href={sectionHref("pricing")} className={navLinkClass}>
              Pricing
            </a>
            <a href={sectionHref("testimonials")} className={navLinkClass}>
              Testimonials
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3 md:justify-self-end">
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

          <div className="flex md:hidden items-center gap-2 md:justify-self-end">
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

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-black/5"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              <Link
                href="/tools-for-founders"
                className="py-2 text-sm font-inter text-[#31372B]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tools for Founders
              </Link>
              <a
                href={sectionHref("features")}
                className="py-2 text-sm font-inter text-[#31372B]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href={sectionHref("pricing")}
                className="py-2 text-sm font-inter text-[#31372B]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href={sectionHref("testimonials")}
                className="py-2 text-sm font-inter text-[#31372B]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGoogleLogin();
                }}
                className="py-2 text-sm font-inter text-[#31372B] text-left"
              >
                Add My Startup
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGoogleLogin();
                }}
                className="py-2.5 text-sm font-inter font-semibold bg-[#1E1E1E] text-white rounded-full mt-1 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
