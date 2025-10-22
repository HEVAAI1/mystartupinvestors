"use client";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[rgba(49,55,43,0.12)] mt-16 py-8 px-6 text-[#717182] text-[14px] font-[Arial]">
      <div className="max-w-[1472px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2025 MyFundingList. All rights reserved.</p>

        <div className="flex gap-6">
          <a href="#" className="hover:underline">
            Refund Policy
          </a>
          <a href="#" className="hover:underline">
            Terms & Conditions
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Blog
          </a>
        </div>
      </div>
    </footer>
  );
}
