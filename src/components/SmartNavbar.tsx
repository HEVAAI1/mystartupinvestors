"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { usePathname } from "next/navigation";
import AuthenticatedNavbar from "./Navbar";
import { FiMenu, FiX } from "react-icons/fi";

export default function SmartNavbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const getButtonClasses = (path: string) => {
        const isActive = pathname === path || (path === "/tools-for-founders" && pathname?.startsWith("/tools-for-founders"));
        return isActive
            ? "hidden md:flex bg-[#31372B] text-[#FAF7EE] border border-[#31372B] px-4 py-2 rounded-lg text-[14px] font-bold shadow hover:opacity-90 transition cursor-pointer"
            : "hidden md:flex bg-[#F5F5F5] text-[#31372B] border border-[#E5E5E5] px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-[#EBEBEB] transition cursor-pointer";
    };

    const getMobileButtonClasses = (path: string) => {
        const isActive = pathname === path || (path === "/tools-for-founders" && pathname?.startsWith("/tools-for-founders"));
        return isActive
            ? "w-full text-left px-4 py-3 bg-[#31372B] text-[#FAF7EE] rounded-md text-[14px] font-bold shadow hover:opacity-90 transition mb-2"
            : "w-full text-left px-4 py-3 bg-[#F5F5F5] text-[#31372B] border border-[#E5E5E5] rounded-md text-[14px] font-medium hover:bg-[#EBEBEB] transition mb-2";
    };

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // Show loading state or nothing while checking auth
    if (isLoading) {
        return (
            <nav className="fixed top-0 left-0 w-full z-50 bg-[rgba(255,255,255,0.95)] border-b border-[rgba(49,55,43,0.12)] backdrop-blur-md px-6 md:px-8 py-4">
                <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/Logo.png"
                            alt="Logo"
                            width={100}
                            height={40}
                            className="h-[38px] w-auto"
                        />
                    </Link>
                </div>
            </nav>
        );
    }

    // If authenticated, show the authenticated navbar
    if (isAuthenticated) {
        return <AuthenticatedNavbar />;
    }

    const handleGoogleLogin = async () => {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) console.error("Google Login Error:", error);
    };

    // Otherwise show public navbar
    return (
        <>
        <nav className="fixed top-0 left-0 w-full z-50 bg-[rgba(255,255,255,0.95)] border-b border-[rgba(49,55,43,0.12)] backdrop-blur-md px-6 md:px-8 py-4">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/Logo.png"
                        alt="Logo"
                        width={100}
                        height={40}
                        className="h-[38px] w-auto"
                    />
                </Link>

                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/tools-for-founders"
                        className={getButtonClasses("/tools-for-founders")}
                    >
                        Tools for Founders
                    </Link>
                    <button
                        onClick={handleGoogleLogin}
                        className={getButtonClasses("/auth")}
                    >
                        Add My Startup
                    </button>
                    <button
                        onClick={handleGoogleLogin}
                        className="bg-[#31372B] text-[#FAF7EE] px-6 py-2 rounded-lg font-bold shadow hover:opacity-90 transition cursor-pointer"
                    >
                        Sign In
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <div className="flex md:hidden items-center gap-2">
                    <button
                        onClick={handleGoogleLogin}
                        className="bg-[#31372B] text-[#FAF7EE] px-4 py-2 rounded-lg text-[14px] font-bold shadow hover:opacity-90 transition cursor-pointer"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex justify-center items-center w-9 h-9 rounded-md hover:bg-[#EDF4E5] transition cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <FiX size={22} color="#31372B" /> : <FiMenu size={22} color="#31372B" />}
                    </button>
                </div>
            </div>
        </nav>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
            <>
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
                <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-black/10">
                        <span className="font-bold text-[#31372B]">Menu</span>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 hover:bg-[#EDF4E5] rounded-md transition cursor-pointer"
                        >
                            <FiX size={20} color="#31372B" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                        <Link
                            href="/tools-for-founders"
                            className={getMobileButtonClasses("/tools-for-founders")}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Tools for Founders
                        </Link>
                        <button
                            className={getMobileButtonClasses("/auth")}
                            onClick={() => { setMobileMenuOpen(false); handleGoogleLogin(); }}
                        >
                            Add My Startup
                        </button>
                        <button
                            className="w-full text-center px-4 py-3 bg-[#31372B] text-[#FAF7EE] rounded-md text-[14px] font-bold mt-2 hover:opacity-90 transition"
                            onClick={() => { setMobileMenuOpen(false); handleGoogleLogin(); }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </>
        )}
        </>
    );
}
