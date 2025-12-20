"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[rgba(49,55,43,0.12)] mt-16 py-8 px-6 text-[#717182] text-[14px] font-[Arial]">
      <div className="max-w-[1472px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2025 MyFundingList. All rights reserved.</p>

        <div className="flex gap-6">
          <a href="/refund" className="hover:underline">
            Refund Policy
          </a>
          <Link href="/terms" className="hover:underline">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
        </div>
      </div>
    </footer>
  );
}
