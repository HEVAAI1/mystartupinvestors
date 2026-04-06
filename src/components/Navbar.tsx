"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { FiUser, FiMenu, FiX } from "react-icons/fi";
import { Calculator } from "lucide-react";
import { useCredits } from "@/context/CreditsContext";
import { useCalculationCredits } from "@/context/CalculationCreditsContext";

export default function AuthenticatedNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [startupFormSubmitted, setStartupFormSubmitted] = useState(false);
  const { credits } = useCredits(); // Investor credits from context

  // Use calculation credits from context (now available in both layouts)
  const { creditStatus } = useCalculationCredits();

  // Check if we're on tools-for-founders pages
  const isToolsPage = pathname?.startsWith("/tools-for-founders");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const getButtonClasses = (path: string) => {
    const isActive = pathname === path || (path === "/tools-for-founders" && pathname?.startsWith("/tools-for-founders"));
    return isActive
      ? "flex justify-center items-center px-4 py-2 rounded-lg bg-[#31372B] text-[#FAF7EE] font-[Arial] text-[14px] font-bold cursor-pointer whitespace-nowrap shadow hover:opacity-90 transition"
      : "flex justify-center items-center px-4 py-2 rounded-lg bg-[#F5F5F5] text-[#31372B] border border-[#E5E5E5] font-[Arial] text-[14px] font-medium cursor-pointer whitespace-nowrap hover:bg-[#EBEBEB] transition";
  };

  const getMobileButtonClasses = (path: string) => {
    const isActive = pathname === path || (path === "/tools-for-founders" && pathname?.startsWith("/tools-for-founders"));
    return isActive
      ? "w-full text-left px-4 py-3 rounded-md bg-[#31372B] text-[#FAF7EE] font-[Arial] text-[14px] font-bold shadow hover:opacity-90 transition mb-2"
      : "w-full text-left px-4 py-3 rounded-md bg-[#F5F5F5] text-[#31372B] border border-[#E5E5E5] font-[Arial] text-[14px] font-medium hover:bg-[#EBEBEB] transition mb-2";
  };

  // Fetch user's startup form submission status
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

        if (data) {
          setStartupFormSubmitted(data.startup_form_submitted ?? false);
        }
      }
    };
    fetchUserStatus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return; // Prevent double-clicks

    setLoggingOut(true);
    setOpen(false);
    setMobileMenuOpen(false);
    const supabase = createSupabaseBrowserClient();

    try {
      console.log("Logging out user...");
      const signOutTimeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Logout timed out. Please try again.")), 10000);
      });
      const { error } = await Promise.race([
        supabase.auth.signOut(),
        signOutTimeout,
      ]);

      if (error) {
        console.error("Error during logout:", error);
        throw error;
      }

      console.log("Logout successful, redirecting...");
      window.location.assign("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      alert(error instanceof Error ? error.message : "Logout failed. Please try again.");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[rgba(255,255,255,0.95)] border-b border-[rgba(49,55,43,0.12)] backdrop-blur-md px-4 md:px-6 py-4">
        <div className="flex justify-between items-center mx-auto max-w-[1472.8px]">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => router.push("/dashboard")}
          >
            <Image
              src="/Logo.svg"
              alt="MyFundingList Logo"
              width={50}
              height={50}
              className="md:w-[60px] md:h-[60px]"
              style={{ objectFit: "contain", display: "block" }}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => router.push(startupFormSubmitted ? "/view-startup" : "/add-startup")}
              className={getButtonClasses(startupFormSubmitted ? "/view-startup" : "/add-startup")}
            >
              {startupFormSubmitted ? "View My Startup" : "Add My Startup"}
            </button>

            <button
              onClick={() => router.push("/tools-for-founders")}
              className={getButtonClasses("/tools-for-founders")}
            >
              Tools for Founders
            </button>

            <button
              onClick={() => router.push("/pricing")}
              className={getButtonClasses("/pricing")}
            >
              Get More Credits
            </button>

            {/* Credits Display - Desktop */}
            <div className="flex items-center gap-2 bg-[#F5F5F5] border border-[rgba(49,55,43,0.12)] rounded-md px-2 py-1.5">
              {isToolsPage ? (
                <>
                  <Calculator className="w-3 h-3 text-[#31372B]" />
                  <span className="font-[Arial] text-[12px] text-[#31372B]">
                    {creditStatus.unlimited ? "∞" : creditStatus.remaining}
                  </span>
                </>
              ) : (
                <>
                  <Image src="/CreditIcon.png" alt="Credits Icon" width={12} height={12} />
                  <span className="font-[Arial] text-[12px] text-[#31372B]">
                    {credits}
                  </span>
                </>
              )}
            </div>

            {/* Profile - Desktop */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex justify-center items-center w-9 h-9 rounded-md hover:bg-[#F5F5F5] cursor-pointer transition"
                onClick={() => setOpen((prev) => !prev)}
              >
                <FiUser size={20} color="#31372B" />
              </div>

              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg border border-[#31372B1F] rounded-md text-sm font-[Arial] py-2 animate-fadeIn z-50">
                  <button
                    onClick={() => {
                      router.push("/affiliate/dashboard");
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[#31372B] hover:bg-[#F5F5F5] transition flex items-center gap-2"
                  >
                    Become an Affiliate
                  </button>
                  <a
                    href="mailto:hi@eaglegrowthpartners.com"
                    className="w-full text-left px-4 py-2 text-[#31372B] hover:bg-[#F5F5F5] transition flex items-center gap-2"
                  >
                    Contact Us
                  </a>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-[#F5F5F5] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loggingOut && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Credits + Hamburger */}
          <div className="flex md:hidden items-center gap-3">
            {/* Credits Display - Mobile */}
            <div className="flex items-center gap-2 bg-[#F5F5F5] border border-[rgba(49,55,43,0.12)] rounded-md px-2 py-1.5">
              {isToolsPage ? (
                <>
                  <Calculator className="w-3 h-3 text-[#31372B]" />
                  <span className="font-[Arial] text-[12px] text-[#31372B]">
                    {creditStatus.unlimited ? "∞" : creditStatus.remaining}
                  </span>
                </>
              ) : (
                <>
                  <Image src="/CreditIcon.png" alt="Credits Icon" width={12} height={12} />
                  <span className="font-[Arial] text-[12px] text-[#31372B]">
                    {credits}
                  </span>
                </>
              )}
            </div>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex justify-center items-center w-9 h-9 rounded-md hover:bg-[#F5F5F5] transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={24} color="#31372B" /> : <FiMenu size={24} color="#31372B" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden animate-slideIn flex flex-col">
            {/* Sidebar Header */}
            <div className="flex justify-between items-center p-4 border-b border-[rgba(49,55,43,0.12)]">
              <span className="font-bold text-[#31372B]">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#F5F5F5] rounded-md transition"
              >
                <FiX size={20} color="#31372B" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-2 p-4">
              <button
                onClick={() => router.push("/dashboard")}
                className={getMobileButtonClasses("/dashboard")}
              >
                Dashboard
              </button>

              <button
                onClick={() => router.push(startupFormSubmitted ? "/view-startup" : "/add-startup")}
                className={getMobileButtonClasses(startupFormSubmitted ? "/view-startup" : "/add-startup")}
              >
                {startupFormSubmitted ? "View My Startup" : "Add My Startup"}
              </button>

              <button
                onClick={() => router.push("/tools-for-founders")}
                className={getMobileButtonClasses("/tools-for-founders")}
              >
                Tools for Founders
              </button>

              <button
                onClick={() => router.push("/pricing")}
                className={getMobileButtonClasses("/pricing")}
              >
                Get More Credits
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mt-2 border-t border-[rgba(49,55,43,0.12)] pt-4"
              >
                {loggingOut && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-in-out;
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
