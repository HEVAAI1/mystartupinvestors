"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Building2, Database, LogOut, Download } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import * as XLSX from "xlsx";
import { useState } from "react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [exporting, setExporting] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (loggingOut) return; // Prevent double-clicks

        setLoggingOut(true);
        try {
            console.log("Admin logging out...");
            localStorage.removeItem("adminAuth");
            // Small delay to ensure cleanup
            await new Promise(resolve => setTimeout(resolve, 100));
            router.push("/admin");
        } catch (error) {
            console.error("Logout failed:", error);
            setLoggingOut(false);
        }
    };

    const handleExportData = async () => {
        setExporting(true);
        try {
            const supabase = createSupabaseBrowserClient();

            // Fetch all data
            const [usersRes, startupsRes, investorsRes, transactionsRes] = await Promise.all([
                supabase.from("users").select("*"),
                supabase.from("startup_leads").select("*"),
                supabase.from("investors").select("*"),
                supabase.from("transactions").select("*"),
            ]);

            // Create workbook
            const workbook = XLSX.utils.book_new();

            // Add Users sheet
            if (usersRes.data && usersRes.data.length > 0) {
                const usersSheet = XLSX.utils.json_to_sheet(usersRes.data);
                XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");
            }

            // Add Startups sheet
            if (startupsRes.data && startupsRes.data.length > 0) {
                const startupsSheet = XLSX.utils.json_to_sheet(startupsRes.data);
                XLSX.utils.book_append_sheet(workbook, startupsSheet, "Startups");
            }

            // Add Investors sheet
            if (investorsRes.data && investorsRes.data.length > 0) {
                const investorsSheet = XLSX.utils.json_to_sheet(investorsRes.data);
                XLSX.utils.book_append_sheet(workbook, investorsSheet, "Investors");
            }

            // Add Transactions sheet
            if (transactionsRes.data && transactionsRes.data.length > 0) {
                const transactionsSheet = XLSX.utils.json_to_sheet(transactionsRes.data);
                XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");
            }

            // Generate filename with current date
            const date = new Date().toISOString().split('T')[0];
            const filename = `MyFundingList_Export_${date}.xlsx`;

            // Download file
            XLSX.writeFile(workbook, filename);
        } catch (error) {
            console.error("Error exporting data:", error);
            alert("Failed to export data. Please try again.");
        } finally {
            setExporting(false);
        }
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
                <p className="text-[12px] text-[#717182] mt-1">MyFundingList</p>
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

                {/* Export Data Button */}
                <div className="mt-6 pt-6 border-t border-[#31372B1F]">
                    <button
                        onClick={handleExportData}
                        disabled={exporting}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={20} />
                        <span className="text-[14px] font-medium">
                            {exporting ? "Exporting..." : "Export All Data"}
                        </span>
                    </button>
                </div>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-[#31372B1F]">
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loggingOut ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <LogOut size={20} />
                    )}
                    <span className="text-[14px] font-medium">{loggingOut ? "Logging out..." : "Logout"}</span>
                </button>
            </div>
        </div>
    );
}
