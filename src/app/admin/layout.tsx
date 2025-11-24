"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check if user is authenticated (except on login page)
        if (pathname !== "/admin") {
            const isAuthenticated = localStorage.getItem("adminAuth");
            if (!isAuthenticated) {
                router.push("/admin");
            }
        }
    }, [pathname, router]);

    // Don't show sidebar on login page
    if (pathname === "/admin") {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#FAF7EE]">
            <AdminSidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
