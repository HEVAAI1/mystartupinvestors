"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useCredits } from "@/context/CreditsContext";

interface Investor {
    id: number;
    name: string;
    about: string;
    city: string;
    country: string;
    preference_sector: string;
    firm_name: string;
    email: string;
    linkedin: string;
}

const InvestorProfilePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const investorId = searchParams.get("id");
    const { userId } = useCredits();

    const [investor, setInvestor] = useState<Investor | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const fetchInvestorAndCheckAccess = async () => {
            if (!investorId || !userId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch investor data
                const { data: investorData, error: investorError } = await supabase
                    .from("investors")
                    .select("*")
                    .eq("id", investorId)
                    .single();

                if (investorError) throw investorError;

                // Check if user has viewed this investor
                const { data: viewData, error: viewError } = await supabase
                    .from("user_investor_views")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("investor_id", investorId)
                    .single();

                if (viewError && viewError.code !== "PGRST116") {
                    // PGRST116 means no rows found, which is fine
                    console.error("Error checking access:", viewError);
                }

                setInvestor(investorData);
                setHasAccess(!!viewData);
            } catch (err) {
                console.error("Error fetching investor:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestorAndCheckAccess();
    }, [investorId, userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
                <p className="text-[#717182]">Loading investor profile...</p>
            </div>
        );
    }

    if (!investor || !hasAccess) {
        return (
            <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#31372B] text-lg mb-4">
                        {!investor ? "Investor not found" : "You don't have access to this profile"}
                    </p>
                    <Link href="/dashboard">
                        <button className="bg-[#31372B] text-[#FAF7EE] rounded-md px-6 py-2 text-sm font-medium hover:opacity-90">
                            Back to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF7EE] font-[Arial] text-[#31372B]">
            {/* Breadcrumb */}
            <div className="max-w-[1200px] mx-auto pt-[92px] px-4 sm:px-6">
                <div className="flex items-center gap-2 text-sm text-[#717182] mb-6">
                    <Link href="/dashboard" className="hover:text-[#31372B]">
                        Investor database
                    </Link>
                    <span>/</span>
                    <span className="text-[#31372B]">Investor Profile</span>
                </div>

                {/* Main Content */}
                <div className="bg-white border border-[#31372B1F] rounded-2xl p-4 sm:p-8 shadow-sm">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                        {/* Avatar */}
                        <div className="flex justify-center items-center w-16 h-16 bg-[#F5F5F5] rounded-full font-bold text-2xl flex-shrink-0">
                            {investor.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Name and Info */}
                        <div className="flex-1">
                            <h1 className="text-[32px] font-bold text-[#31372B] mb-2">
                                {investor.name}
                            </h1>

                            {/* Email Verified Badge */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1 text-blue-600 text-sm">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span>Email verified</span>
                                </div>
                            </div>

                            {/* About */}


                            {/* Location */}
                            <div className="flex items-center gap-2 text-[#717182]">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <span className="text-[15px]">{investor.country}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        <a
                            href={`mailto:${investor.email}`}
                            className="flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2 bg-white border border-[#31372B] text-[#31372B] rounded-md px-4 py-2 text-sm font-medium hover:bg-[#31372B] hover:text-[#FAF7EE] transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="truncate">{investor.email}</span>
                        </a>

                        <a
                            href={investor.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2 bg-[#31372B] text-[#FAF7EE] rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            View Profile
                        </a>
                    </div>

                    {/* About Section */}
                    <div className="border-t border-[#31372B1F] pt-6">
                        <h2 className="text-[20px] font-bold text-[#31372B] mb-4">About</h2>
                        <p className="text-[15px] text-[#31372B] leading-relaxed mb-6">
                            {investor.about}
                        </p>

                        {/* Industry Tags */}
                        <div className="mb-6">
                            <h3 className="text-[16px] font-semibold text-[#31372B] mb-3">
                                Preferred Sectors
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {investor.preference_sector.split(",").map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-[#F5F5F5] border border-[#31372B1F] text-[#31372B] text-sm px-3 py-1.5 rounded-md"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-3 text-[15px]">
                            <div className="flex justify-between py-2 border-b border-[#31372B0D]">
                                <span className="font-semibold text-[#31372B]">Firm Name:</span>
                                <span className="text-[#717182]">{investor.firm_name}</span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-[#31372B0D]">
                                <span className="font-semibold text-[#31372B]">Location:</span>
                                <span className="text-[#717182]">
                                    {investor.city}, {investor.country}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="mt-8 flex justify-start">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="bg-white border border-[#31372B] text-[#31372B] rounded-md px-6 py-2 text-sm font-medium hover:bg-[#31372B] hover:text-[#FAF7EE] transition-colors"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestorProfilePage;
