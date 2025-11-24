"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Building2, Database, LogOut } from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("adminAuth");
        router.push("/admin");
    };

    const menuItems = [
        {
            name: "Data Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Startup List",
            path: "/admin/startup-list",
            icon: Building2,
        },
        {
            name: "User List",
            path: "/admin/user-list",
            icon: Users,
        },
        {
            name: "Investor Table",
            path: "/admin/investor-list",
            icon: Database,
        },
    ];

    return (
        <div className="w-64 bg-white border-r border-[#31372B1F] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#31372B1F]">
                <h1 className="text-[20px] font-bold text-[#31372B]">Admin Panel</h1>
                <p className="text-[12px] text-[#717182] mt-1">MyStartupInvestors</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${isActive
                                    ? "bg-[#31372B] text-white"
                                    : "text-[#31372B] hover:bg-[#F5F5F5]"
                                }`}
                        >
                            <Icon size={20} />
                            <span className="text-[14px] font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-[#31372B1F]">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
                >
                    <LogOut size={20} />
                    <span className="text-[14px] font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
