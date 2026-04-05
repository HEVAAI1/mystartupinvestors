"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FAF7EE]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 min-h-screen">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white border border-[#31372B1F] shadow-sm text-[#31372B]"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        {children}
      </div>
    </div>
  );
}
