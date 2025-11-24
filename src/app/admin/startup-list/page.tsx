"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface Startup {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    company_name: string;
    designation: string;
    industry: string;
    funding_status: string;
    looking_to_raise: string;
    created_at: string;
}

export default function StartupListPage() {
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchStartups();
    }, []);

    const fetchStartups = async () => {
        try {
            const supabase = createSupabaseBrowserClient();
            const { data, error } = await supabase
                .from("startup_leads")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setStartups(data || []);
        } catch (error) {
            console.error("Error fetching startups:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStartups = startups.filter(
        (startup) =>
            startup.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            startup.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            startup.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            startup.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-[#717182]">Loading startups...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-[32px] font-bold text-[#31372B] mb-2">
                        Startup List
                    </h1>
                    <p className="text-[16px] text-[#717182]">
                        {filteredStartups.length} startup{filteredStartups.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
                <button className="px-4 py-2 bg-[#31372B] text-white rounded-lg hover:opacity-90 transition text-[14px] font-medium">
                    Export CSV
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by company, founder, email, or industry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
                />
            </div>

            <div className="bg-white rounded-xl border border-[#31372B1F] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#F5F5F5] border-b border-[#31372B1F]">
                            <tr>
                                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                                    Founder
                                </th>
                                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                                    Industry
                                </th>
                                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                                    Funding Status
                                </th>
                                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                                    Raising
                                </th>
                                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                                    Submitted
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#31372B1F]">
                            {filteredStartups.map((startup) => (
                                <tr key={startup.id} className="hover:bg-[#F5F5F5] transition">
                                    <td className="px-6 py-4 text-[14px] text-[#31372B] font-medium">
                                        {startup.company_name || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-[14px] text-[#717182]">
                                        {startup.full_name || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-[14px] text-[#717182]">
                                        {startup.email || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-[14px] text-[#717182]">
                                        {startup.phone || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-[14px] text-[#717182]">
                                        {startup.industry || "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-[12px] font-medium">
                                            {startup.funding_status || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[12px] font-medium ${startup.looking_to_raise?.includes("Yes")
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}>
                                            {startup.looking_to_raise?.includes("Yes") ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[14px] text-[#717182]">
                                        {new Date(startup.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStartups.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-[#717182]">No startups found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
