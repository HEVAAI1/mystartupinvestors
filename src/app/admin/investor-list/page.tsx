"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface Investor {
  id: number;
  name: string;
  firm_name: string;
  email: string;
  linkedin: string;
  city: string;
  country: string;
  preference_sector: string;
  about: string;
}

export default function InvestorListPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("investors")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setInvestors(data || []);
    } catch (error) {
      console.error("Error fetching investors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestors = investors.filter(
    (investor) =>
      investor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.firm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.preference_sector?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[#717182]">Loading investors...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-[#31372B] mb-2">
            Investor Table
          </h1>
          <p className="text-[16px] text-[#717182]">
            {filteredInvestors.length} investor{filteredInvestors.length !== 1 ? 's' : ''} in database
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-[#31372B1F] rounded-lg hover:bg-[#F5F5F5] transition text-[14px] font-medium">
            Add Investor
          </button>
          <button className="px-4 py-2 bg-[#31372B] text-white rounded-lg hover:opacity-90 transition text-[14px] font-medium">
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, firm, email, country, or sector..."
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
                  ID
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Firm
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Sectors
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  LinkedIn
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#31372B1F]">
              {filteredInvestors.map((investor) => (
                <tr key={investor.id} className="hover:bg-[#F5F5F5] transition">
                  <td className="px-6 py-4 text-[14px] text-[#717182]">
                    {investor.id}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#31372B] font-medium">
                    {investor.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#717182]">
                    {investor.firm_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#717182]">
                    {investor.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#717182]">
                    {investor.city && investor.country
                      ? `${investor.city}, ${investor.country}`
                      : investor.country || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {investor.preference_sector?.split(",").slice(0, 2).map((sector, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-[12px] font-medium"
                        >
                          {sector.trim()}
                        </span>
                      ))}
                      {investor.preference_sector?.split(",").length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-[12px] font-medium">
                          +{investor.preference_sector.split(",").length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px]">
                    {investor.linkedin ? (
                      <a
                        href={investor.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-[#717182]">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvestors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#717182]">No investors found</p>
          </div>
        )}
      </div>
    </div>
  );
}
