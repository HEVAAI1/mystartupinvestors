"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // Skip auth check on login page
            if (pathname === "/admin") {
                setIsChecking(false);
                return;
            }

            // Check localStorage admin auth
            const isAdminAuthenticated = localStorage.getItem("adminAuth");

            if (!isAdminAuthenticated) {
                console.log("[Admin Layout] No admin auth found, redirecting to /admin");
                router.push("/admin");
                return;
            }

            // Also check if user is a regular authenticated user trying to access admin
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // User is authenticated with Supabase - check if they're an admin
                const { data: userData } = await supabase
                    .from("users")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (userData?.role !== "admin") {
                    // Regular user trying to access admin - redirect to user dashboard
                    console.log("[Admin Layout] Regular user trying to access admin, redirecting to /dashboard");
                    router.push("/dashboard");
                    return;
                }
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [pathname, router]);

    // Don't show sidebar on login page
    if (pathname === "/admin") {
        return <>{children}</>;
    }

    // Show loading state while checking auth
    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAF7EE]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31372B] mx-auto mb-4"></div>
                    <p className="text-[#717182]">Verifying access...</p>
                </div>
            </div>
        );
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
