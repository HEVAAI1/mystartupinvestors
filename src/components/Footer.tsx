"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[rgba(49,55,43,0.12)] py-8 px-6 text-[#717182] text-sm font-inter">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
        <p>&copy; 2025 MyFundingList. All rights reserved.</p>

        <div className="flex gap-6">
          <Link href="/policies" className="hover:underline">
            Policies
          </Link>
          <Link href="/affiliate" className="hover:underline">
            Affiliate Program
          </Link>
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
        </div>
      </div>
    </footer>
  );
}
