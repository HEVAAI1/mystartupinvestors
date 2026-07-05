"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/api";
import AuthenticatedNavbar from "./Navbar";
import PublicNavbar from "./PublicNavbar";

export default function SmartNavbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { user } = await getUser();
            setIsAuthenticated(!!user);
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/Logo.svg" alt="MyFundingList" width={130} height={40} className="h-[36px] w-auto" />
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    if (isAuthenticated) {
        return <AuthenticatedNavbar />;
    }

    return <PublicNavbar />;
}
