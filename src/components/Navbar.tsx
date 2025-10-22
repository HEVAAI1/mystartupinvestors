"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiUser } from "react-icons/fi";

export default function AuthenticatedNavbar({ credits = 0 }: { credits?: number }) {
  const router = useRouter();

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 bg-[rgba(255,255,255,0.95)] border-b border-[rgba(49,55,43,0.12)] backdrop-blur-md"
      style={{ height: "68.8px", padding: "16px 24px 0.8px" }}
    >
      <div
        className="flex justify-between items-center mx-auto"
        style={{ maxWidth: "1472.8px", height: "36px" }}
      >
        {/* Logo Image */}
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={() => router.push("/dashboard")}
        >
          <Image
            src="/Logo.svg"
            alt="MyFundingList Logo"
            width={60} // adjust width based on actual logo dimensions
            height={60}
            style={{
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-[12px]" style={{ height: "36px" }}>
          {/* Add My Startup */}
          <button
            onClick={() => router.push("/startup-details")}
            className="flex justify-center items-center px-4 py-2 rounded-md hover:bg-[#F5F5F5] text-[#31372B] font-[Arial] text-[14px] leading-[20px] cursor-pointer whitespace-nowrap"
            style={{ width: "132.86px", height: "36px" }}
          >
            Add My Startup
          </button>

          {/* Get More Credits */}
          <button
            onClick={() => router.push("/pricing")}
            className="flex justify-center items-center px-4 py-2 rounded-md hover:bg-[#F5F5F5] text-[#31372B] font-[Arial] text-[14px] leading-[20px] cursor-pointer whitespace-nowrap"
            style={{ width: "140.14px", height: "36px" }}
          >
            Get More Credits
          </button>

          {/* Credits Badge */}
          <div
            className="relative flex items-center justify-center bg-[#F5F5F5] border border-[rgba(49,55,43,0.12)] rounded-md cursor-default"
            style={{ width: "54.26px", height: "29.59px" }}
          >
            {/* Credit Icon */}
            <Image
              src="/CreditIcon.png"
              alt="Credits Icon"
              width={12}
              height={12}
              className="absolute left-[12.8px] top-[8.79px]"
            />

            {/* Credit Count */}
            <span
              className="absolute font-[Arial] text-[12px] leading-[16px] text-[#31372B]"
              style={{ left: "34.8px", top: "5.8px" }}
            >
              {credits}
            </span>
          </div>

          {/* Profile Icon */}
          <button
            onClick={() => router.push("/profile")}
            className="flex justify-center items-center rounded-md hover:bg-[#F5F5F5] cursor-pointer"
            style={{ width: "36px", height: "36px" }}
          >
            <FiUser size={20} color="#31372B" />
          </button>
        </div>
      </div>
    </nav>
  );
}
