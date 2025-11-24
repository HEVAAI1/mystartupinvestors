"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { FiUser } from "react-icons/fi";

export default function AuthenticatedNavbar({ credits = 0 }: { credits?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [startupFormSubmitted, setStartupFormSubmitted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const getButtonClasses = (path: string) => {
    const isActive = pathname === path;
    return isActive
      ? "flex justify-center items-center px-4 py-2 rounded-md bg-[#31372B] text-[#FAF7EE] font-[Arial] text-[14px] leading-[20px] cursor-pointer whitespace-nowrap transition"
      : "flex justify-center items-center px-4 py-2 rounded-md hover:bg-[#F5F5F5] text-[#31372B] font-[Arial] text-[14px] leading-[20px] cursor-pointer whitespace-nowrap transition";
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

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();

    await supabase.auth.signOut();

    router.push("/");
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 bg-[rgba(255,255,255,0.95)] border-b border-[rgba(49,55,43,0.12)] backdrop-blur-md"
      style={{ height: "68.8px", padding: "16px 24px 0.8px" }}
    >
      <div
        className="flex justify-between items-center mx-auto"
        style={{ maxWidth: "1472.8px", height: "36px" }}
      >
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={() => router.push("/dashboard")}
        >
          <Image
            src="/Logo.svg"
            alt="MyFundingList Logo"
            width={60}
            height={60}
            style={{ objectFit: "contain", display: "block" }}
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-[12px]" style={{ height: "36px" }}>
          <button
            onClick={() => router.push(startupFormSubmitted ? "/view-startup" : "/add-startup")}
            className={getButtonClasses(startupFormSubmitted ? "/view-startup" : "/add-startup")}
            style={{ minWidth: "132.86px", height: "36px", padding: "0 16px" }}
          >
            {startupFormSubmitted ? "View My Startup" : "Add My Startup"}
          </button>

          <button
            onClick={() => router.push("/pricing")}
            className={getButtonClasses("/pricing")}
            style={{ width: "140.14px", height: "36px" }}
          >
            Get More Credits
          </button>

          <div
            className="flex items-center gap-2 bg-[#F5F5F5] border border-[rgba(49,55,43,0.12)] rounded-md px-2"
            style={{ height: "29.59px" }}
          >
            <Image src="/CreditIcon.png" alt="Credits Icon" width={12} height={12} />
            <span className="font-[Arial] text-[12px] leading-[16px] text-[#31372B]">
              {credits}
            </span>
          </div>

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex justify-center items-center rounded-md hover:bg-[#F5F5F5] cursor-pointer transition"
              style={{ width: "36px", height: "36px" }}
              onClick={() => setOpen((prev) => !prev)}
            >
              <FiUser size={20} color="#31372B" />
            </div>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border border-[#31372B1F] rounded-md text-sm font-[Arial] py-2 animate-fadeIn z-50">
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#F5F5F5] transition"
                >
                  My Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-[#F5F5F5] transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-in-out;
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
      `}</style>
    </nav>
  );
}
