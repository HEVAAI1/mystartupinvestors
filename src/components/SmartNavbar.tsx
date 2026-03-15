"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import AuthenticatedNavbar from "./Navbar";

export default function SmartNavbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
            <nav className="fixed top-0 left-0 w-full z-50 bg-[rgba(255,255,255,0.95)] border-b border-[rgba(49,55,43,0.12)] backdrop-blur-md px-8 py-4">
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

    // Otherwise show public navbar
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-[rgba(255,255,255,0.95)] border-b border-[rgba(49,55,43,0.12)] backdrop-blur-md px-8 py-4">
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

                <div className="flex items-center gap-4">
                    <Link
                        href="/tools-for-founders"
                        className="text-[#31372B] text-[14px] font-[Arial] font-bold hover:text-[#717182] transition cursor-pointer"
                    >
                        Tools for Founders
                    </Link>
                    <Link
                        href="/"
                        className="text-[#31372B] text-[14px] font-[Arial] font-bold hover:text-[#717182] transition cursor-pointer"
                    >
                        Add My Startup
                    </Link>
                    <Link
                        href="/"
                        className="bg-[#31372B] text-[#FAF7EE] px-6 py-2 rounded-lg font-bold shadow hover:opacity-90 transition cursor-pointer"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </nav>
    );
}
