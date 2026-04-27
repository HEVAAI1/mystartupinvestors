"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { FiUser, FiMenu, FiX } from "react-icons/fi";
import { Calculator, Menu, X } from "lucide-react";
import { useCredits } from "@/context/CreditsContext";
import { useCalculationCredits } from "@/context/CalculationCreditsContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthenticatedNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [startupFormSubmitted, setStartupFormSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { credits } = useCredits();
  const { creditStatus } = useCalculationCredits();
  const isToolsPage = pathname?.startsWith("/tools-for-founders");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll effect for frosted glass
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getNavLinkClasses = (path: string) => {
    const isActive =
      pathname === path ||
      (path === "/tools-for-founders" && pathname?.startsWith("/tools-for-founders"));
    return isActive
      ? "px-4 py-2 rounded-full text-sm font-inter font-semibold bg-[#1E1E1E] text-white transition-all cursor-pointer whitespace-nowrap shadow-sm"
      : "px-4 py-2 rounded-full text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] hover:bg-black/5 transition-all cursor-pointer whitespace-nowrap";
  };

  const getMobileNavClasses = (path: string) => {
    const isActive =
      pathname === path ||
      (path === "/tools-for-founders" && pathname?.startsWith("/tools-for-founders"));
    return isActive
      ? "w-full text-left px-4 py-3 rounded-2xl bg-[#1E1E1E] text-white font-inter font-semibold text-sm transition mb-1 cursor-pointer"
      : "w-full text-left px-4 py-3 rounded-2xl bg-black/[0.04] text-[#31372B] font-inter font-medium text-sm hover:bg-black/[0.07] transition mb-1 cursor-pointer";
  };

  // Fetch startup form submission status
  useEffect(() => {
    const fetchUserStatus = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("startup_form_submitted")
          .eq("id", user.id)
          .single();
        if (data) setStartupFormSubmitted(data.startup_form_submitted ?? false);
      }
    };
    fetchUserStatus();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setOpen(false);
    setMobileMenuOpen(false);
    const supabase = createSupabaseBrowserClient();
    try {
      const signOutTimeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Logout timed out. Please try again.")), 10000);
      });
      const { error } = await Promise.race([supabase.auth.signOut(), signOutTimeout]);
      if (error) throw error;
      window.location.assign("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      alert(error instanceof Error ? error.message : "Logout failed. Please try again.");
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            : "bg-white/95 backdrop-blur-md border-b border-black/[0.06]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer select-none"
              onClick={() => router.push("/dashboard")}
            >
              <Image
                src="/Logo.svg"
                alt="MyFundingList Logo"
                width={110}
                height={40}
                className="h-[34px] w-auto"
                style={{ objectFit: "contain", display: "block" }}
              />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => router.push("/dashboard")}
                className={getNavLinkClasses("/dashboard")}
              >
                Dashboard
              </button>
              <button
                onClick={() =>
                  router.push(startupFormSubmitted ? "/view-startup" : "/add-startup")
                }
                className={getNavLinkClasses(
                  startupFormSubmitted ? "/view-startup" : "/add-startup"
                )}
              >
                {startupFormSubmitted ? "View My Startup" : "Add My Startup"}
              </button>
              <button
                onClick={() => router.push("/tools-for-founders")}
                className={getNavLinkClasses("/tools-for-founders")}
              >
                Tools for Founders
              </button>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Credits badge */}
              <div className="flex items-center gap-1.5 bg-black/[0.05] border border-black/[0.06] rounded-full px-3 py-1.5">
                {isToolsPage ? (
                  <>
                    <Calculator className="w-3.5 h-3.5 text-[#31372B]" />
                    <span className="font-inter text-[12px] font-medium text-[#31372B]">
                      {creditStatus.unlimited ? "∞" : creditStatus.remaining}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#C6FF55]" />
                    <span className="font-inter text-[12px] font-medium text-[#31372B]">
                      {credits} credits
                    </span>
                  </>
                )}
              </div>

              {/* Get more credits button */}
              <button
                onClick={() => router.push("/pricing")}
                className="px-4 py-2 text-sm font-inter font-semibold bg-[#1E1E1E] text-white rounded-full hover:bg-[#333] transition-all shadow-lg shadow-black/10 cursor-pointer"
              >
                Get Credits
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex justify-center items-center w-9 h-9 rounded-full bg-black/[0.05] hover:bg-black/[0.09] cursor-pointer transition border border-black/[0.06]"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <FiUser size={17} color="#31372B" />
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl shadow-xl border border-black/[0.06] rounded-2xl py-2 z-50"
                    >
                      <button
                        onClick={() => { router.push("/affiliate/dashboard"); setOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-inter text-[#31372B] hover:bg-black/[0.04] transition"
                      >
                        Become an Affiliate
                      </button>
                      <a
                        href="mailto:hi@eaglegrowthpartners.com"
                        className="block px-4 py-2.5 text-sm font-inter text-[#31372B] hover:bg-black/[0.04] transition"
                      >
                        Contact Us
                      </a>
                      <div className="mx-3 my-1 h-px bg-black/[0.06]" />
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full text-left px-4 py-2.5 text-sm font-inter text-red-500 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loggingOut && (
                          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile: Credits + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/[0.05] border border-black/[0.06] rounded-full px-3 py-1.5">
                {isToolsPage ? (
                  <>
                    <Calculator className="w-3 h-3 text-[#31372B]" />
                    <span className="font-inter text-[11px] font-medium text-[#31372B]">
                      {creditStatus.unlimited ? "∞" : creditStatus.remaining}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C6FF55]" />
                    <span className="font-inter text-[11px] font-medium text-[#31372B]">
                      {credits}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex justify-center items-center w-9 h-9 rounded-full bg-black/[0.05] hover:bg-black/[0.09] transition border border-black/[0.06]"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={18} color="#31372B" /> : <Menu size={18} color="#31372B" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-50 md:hidden flex flex-col border-l border-black/[0.06]"
            style={{ animation: "slideInRight 0.25s ease-out" }}
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-black/[0.06]">
              <span className="font-space font-bold text-[#1E1E1E] text-sm">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 hover:bg-black/[0.05] rounded-full transition"
              >
                <X size={18} color="#31372B" />
              </button>
            </div>

            <div className="flex flex-col gap-1 p-4 flex-1">
              <button onClick={() => router.push("/dashboard")} className={getMobileNavClasses("/dashboard")}>
                Dashboard
              </button>
              <button
                onClick={() => router.push(startupFormSubmitted ? "/view-startup" : "/add-startup")}
                className={getMobileNavClasses(startupFormSubmitted ? "/view-startup" : "/add-startup")}
              >
                {startupFormSubmitted ? "View My Startup" : "Add My Startup"}
              </button>
              <button onClick={() => router.push("/tools-for-founders")} className={getMobileNavClasses("/tools-for-founders")}>
                Tools for Founders
              </button>
              <button onClick={() => router.push("/pricing")} className={getMobileNavClasses("/pricing")}>
                Get More Credits
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); router.push("/affiliate/dashboard"); }}
                className="w-full text-left px-4 py-3 rounded-2xl bg-black/[0.04] text-[#31372B] font-inter font-medium text-sm hover:bg-black/[0.07] transition mb-1 cursor-pointer"
              >
                Become an Affiliate
              </button>
            </div>

            <div className="p-4 border-t border-black/[0.06]">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full px-4 py-3 rounded-2xl text-red-500 font-inter font-medium text-sm hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loggingOut && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
