"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { usePathname } from "next/navigation";
import AuthenticatedNavbar from "./Navbar";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SmartNavbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    const getNavLinkClasses = (path: string) => {
        const isActive = pathname === path || (path === "/tools-for-founders" && pathname?.startsWith("/tools-for-founders"));
        return isActive
            ? "px-4 py-2 rounded-full text-sm font-inter font-semibold bg-[#1E1E1E] text-white transition cursor-pointer"
            : "px-4 py-2 rounded-full text-sm font-inter font-medium text-[#31372B]/70 hover:text-[#1E1E1E] hover:bg-black/5 transition cursor-pointer";
    };

    const getMobileNavClasses = (path: string) => {
        const isActive = pathname === path || (path === "/tools-for-founders" && pathname?.startsWith("/tools-for-founders"));
        return isActive
            ? "w-full text-left px-4 py-3 rounded-2xl bg-[#1E1E1E] text-white font-inter font-semibold text-sm transition mb-1 cursor-pointer"
            : "w-full text-left px-4 py-3 rounded-2xl bg-black/[0.04] text-[#31372B] font-inter font-medium text-sm hover:bg-black/[0.07] transition mb-1 cursor-pointer";
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // Loading skeleton
    if (isLoading) {
        return (
            <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 md:px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center h-16 lg:h-[72px]">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/Logo.svg" alt="Logo" width={110} height={40} className="h-[34px] w-auto" />
                    </Link>
                </div>
            </nav>
        );
    }

    // Authenticated users get the full authenticated navbar
    if (isAuthenticated) {
        return <AuthenticatedNavbar />;
    }

    const handleGoogleLogin = async () => {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) console.error("Google Login Error:", error);
    };

    // Public (unauthenticated) navbar
    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
                    scrolled
                        ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]"
                        : "bg-white/95 backdrop-blur-md border-b border-black/[0.06]"
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-[72px]">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/Logo.svg" alt="Logo" width={110} height={40} className="h-[34px] w-auto" />
                        </Link>

                        {/* Desktop links */}
                        <div className="hidden md:flex items-center gap-1">
                            <Link href="/tools-for-founders" className={getNavLinkClasses("/tools-for-founders")}>
                                Tools for Founders
                            </Link>
                            <button onClick={handleGoogleLogin} className={getNavLinkClasses("/auth")}>
                                Add My Startup
                            </button>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={handleGoogleLogin}
                                className="px-5 py-2.5 text-sm font-inter font-semibold bg-[#1E1E1E] text-white rounded-full hover:bg-[#333] transition-all shadow-lg shadow-black/10 cursor-pointer"
                            >
                                Sign In
                            </button>
                        </div>

                        {/* Mobile */}
                        <div className="flex md:hidden items-center gap-2">
                            <button
                                onClick={handleGoogleLogin}
                                className="bg-[#1E1E1E] text-white px-4 py-2 rounded-full text-sm font-inter font-semibold shadow hover:opacity-90 transition cursor-pointer"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="flex justify-center items-center w-9 h-9 rounded-full bg-black/[0.05] hover:bg-black/[0.09] transition border border-black/[0.06]"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X size={18} color="#31372B" /> : <Menu size={18} color="#31372B" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ duration: 0.25 }}
                            className="fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-50 md:hidden flex flex-col border-l border-black/[0.06]"
                        >
                            <div className="flex justify-between items-center px-5 py-4 border-b border-black/[0.06]">
                                <span className="font-space font-bold text-[#1E1E1E] text-sm">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 hover:bg-black/[0.05] rounded-full transition">
                                    <X size={18} color="#31372B" />
                                </button>
                            </div>
                            <div className="flex flex-col gap-1 p-4">
                                <Link href="/tools-for-founders" className={getMobileNavClasses("/tools-for-founders")} onClick={() => setMobileMenuOpen(false)}>
                                    Tools for Founders
                                </Link>
                                <button className={getMobileNavClasses("/auth")} onClick={() => { setMobileMenuOpen(false); handleGoogleLogin(); }}>
                                    Add My Startup
                                </button>
                                <button
                                    className="w-full text-center px-4 py-3 rounded-2xl bg-[#1E1E1E] text-white font-inter font-semibold text-sm mt-2 hover:bg-[#333] transition cursor-pointer"
                                    onClick={() => { setMobileMenuOpen(false); handleGoogleLogin(); }}
                                >
                                    Sign In
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
