"use client";

import { useState, useEffect, ChangeEvent, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import UpgradeModal from "@/components/UpgradeModal";
import { useCredits } from "@/context/CreditsContext"; // ✅ USE CONTEXT
import Link from "next/link";
import { Search } from "lucide-react";

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
  type?: string;
}

const Dashboard = () => {
  // Server-side pagination state
  const [currentPageData, setCurrentPageData] = useState<Investor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [showViewed, setShowViewed] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 7;

  // UI state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadingInvestorId, setLoadingInvestorId] = useState<number | null>(null);
  const [locationSearch, setLocationSearch] = useState("");

  // Filter options (fetched once)
  const [locations, setLocations] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);

  const [viewedInvestorIds, setViewedInvestorIds] = useState<number[]>([]);
  // ⭐⭐⭐ USE CREDITS FROM CONTEXT ⭐⭐⭐
  const { credits, used, decrementCredit, userId } = useCredits(); // <— THIS is the correct way

  const handleIndustryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndustry(e.target.value);
    setCurrentPage(1); // Reset to page 1
  };


  // Debounce search input (300ms)
  // Manual search trigger
  const handleSearch = () => {
    setDebouncedSearch(searchTerm);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Fetch filter options once on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { data, error } = await supabase
          .from("investors")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .select("country, preference_sector") as { data: Investor[] | null; error: any };

        if (error) throw error;

        if (data) {
          const uniqueLocations = Array.from(
            new Set(data.map((item) => item.country).filter(Boolean))
          );
          const uniqueIndustries = Array.from(
            new Set(
              data
                .flatMap((item) =>
                  item.preference_sector
                    ?.split(",")
                    .map((sector) => sector.trim())
                )
                .filter(Boolean)
            )
          ).sort();

          setLocations(uniqueLocations.sort());
          setIndustries(uniqueIndustries.sort());
        }
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch investors with server-side pagination and filters
  useEffect(() => {
    fetchInvestors();
  }, [currentPage, debouncedSearch, selectedLocation, selectedIndustry, showViewed, userId]);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("investors")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select("*", { count: "exact" }) as any;

      // Server-side search
      if (debouncedSearch) {
        query = query.or(
          `name.ilike.%${debouncedSearch}%,` +
          `firm_name.ilike.%${debouncedSearch}%,` +
          `preference_sector.ilike.%${debouncedSearch}%,` +
          `country.ilike.%${debouncedSearch}%,` +
          `type.ilike.%${debouncedSearch}%`
        );
      }

      // Location filter
      if (selectedLocation !== "All") {
        query = query.eq("country", selectedLocation);
      }

      // Industry filter
      if (selectedIndustry !== "All") {
        query = query.ilike("preference_sector", `%${selectedIndustry}%`);
      }
      // Viewed filter
      if (showViewed && userId) {
        const { data: viewedIds } = await supabase
          .from("user_investor_views")
          .select("investor_id")
          .eq("user_id", userId);

        if (viewedIds && viewedIds.length > 0) {
          query = query.in("id", viewedIds.map(v => v.investor_id));
        } else {
          // No viewed investors
          setCurrentPageData([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }
      }

      const { data, count, error } = await query
        .range(from, to)
        .order("id", { ascending: true });

      if (error) throw error;

      setCurrentPageData(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching investors:", err);
      setError("Failed to fetch investors");
      setCurrentPageData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch viewed investors
  useEffect(() => {
    const fetchViewed = async () => {
      if (userId) {
        console.log("Fetching viewed investors for user:", userId);
        const { data } = await supabase
          .from("user_investor_views")
          .select("investor_id")
          .eq("user_id", userId);

        if (data) {
          setViewedInvestorIds(data.map((item) => item.investor_id));
        }
      }
    };
    fetchViewed();
  }, [userId]);



  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };



  const handleToggleViewed = () => {
    setShowViewed((prev) => !prev);
    setCurrentPage(1); // Reset to page 1
  };

  // Masking Names
  const maskName = (name: string, id: number): string => {
    if (viewedInvestorIds.includes(id)) return name; // Show full name if viewed

    if (!name) return "";
    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0][0] + "X".repeat(parts[0].length - 1);
    }

    const first = parts[0][0] + "X".repeat(parts[0].length - 1);
    const last = parts[1][0] + "X".repeat(parts[1].length - 1);

    return `${first} ${last}`;
  };

  // Mask investor name in description for locked profiles
  const maskDescription = (description: string, name: string, id: number): string => {
    if (viewedInvestorIds.includes(id)) return description; // Show full description if viewed

    if (!description || !name) return description;

    // Replace the full name with asterisks
    const maskedName = "*".repeat(name.length);
    let maskedDesc = description.replace(new RegExp(name, 'gi'), maskedName);

    // Also replace first name only (in case it appears separately)
    const firstName = name.split(" ")[0];
    if (firstName) {
      const maskedFirstName = "*".repeat(firstName.length);
      maskedDesc = maskedDesc.replace(new RegExp(`\\b${firstName}\\b`, 'gi'), maskedFirstName);
    }

    return maskedDesc;
  };

  const handleViewProfile = useCallback(async (investor: Investor) => {
    console.log("handleViewProfile called for:", investor.id);
    console.log("Current credits:", credits);
    console.log("Current used:", used);
    console.log("Current userId:", userId);
    console.log("Viewed IDs:", viewedInvestorIds);

    // 1. If already viewed, navigate to profile page
    if (viewedInvestorIds.includes(investor.id)) {
      console.log("Investor already viewed. Navigating to profile page.");
      window.location.href = `/investor-profile?id=${investor.id}`;
      return;
    }

    // 2. If not viewed, check credits
    if (credits > 0) {
      console.log("Credits available. Proceeding with deduction.");

      // Set loading state
      setLoadingInvestorId(investor.id);

      // Optimistic update
      decrementCredit();
      setViewedInvestorIds((prev) => [...prev, investor.id]);

      // DB Updates
      if (userId) {
        try {
          console.log("Updating DB for user:", userId);

          // Use Promise.all to run both operations in parallel for better performance
          const [viewResult, creditResult] = await Promise.all([
            // Record view
            supabase.from("user_investor_views").insert({
              user_id: userId,
              investor_id: investor.id,
            }),
            // Atomically increment credits_used to avoid race conditions
            supabase.rpc('increment_credits_used', { user_id: userId })
          ]);

          if (viewResult.error) {
            console.error("Error inserting into user_investor_views:", viewResult.error);
            throw viewResult.error;
          } else {
            console.log("Successfully inserted into user_investor_views");
          }

          if (creditResult.error) {
            console.error("Error updating credits:", creditResult.error);
            // Fallback to manual update if RPC doesn't exist
            const { error: updateError } = await supabase
              .from("users")
              .update({ credits_used: used + 1 })
              .eq("id", userId);

            if (updateError) {
              console.error("Error updating users table:", updateError);
              throw updateError;
            }
          } else {
            console.log("Successfully updated credits_used atomically");
          }

          // Navigate to profile page after successful DB update
          window.location.href = `/investor-profile?id=${investor.id}`;

        } catch (err) {
          console.error("Error updating credits/views:", err);
          setLoadingInvestorId(null);
          alert("An error occurred. Please try again.");
        }
      } else {
        console.error("No userId found, skipping DB updates");
      }
    } else {
      // 3. No credits
      console.log("No credits left. Showing upgrade modal.");
      setShowUpgradeModal(true);
    }
  }, [credits, used, userId, viewedInvestorIds, decrementCredit]);

  return (
    <div className="min-h-screen bg-[#FAF7EE] font-[Arial] text-[#31372B]">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto mt-16 md:mt-[92px] px-4 md:px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <h1 className="text-2xl md:text-[32px] font-bold">Investor database</h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white border border-[#31372B1F] rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-[#F0B100] rounded-full"></div>

            {/* ⭐⭐⭐ THE ONLY CHANGE ⭐⭐⭐ */}
            <span className="text-sm font-bold text-[#31372B]">
              Credits Left: {credits}
            </span>
          </div>
          <Link href="/pricing">
            <button

              className="flex items-center gap-2 bg-[#31372B] text-[#FAF7EE] rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 cursor-pointer"
            >
              <Image
                src="/GetCreditsLogoLight.svg"
                alt="Get Credits Icon"
                width={16}
                height={16}
              />
              Get credits
            </button>
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="max-w-[1400px] mx-auto mt-6 md:mt-8 flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-3 md:gap-4 px-4 md:px-6">
        <div className="relative w-full md:flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, firm, or sector..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-white border border-[#31372B1F] rounded-md pl-4 pr-4 py-2 placeholder-[#717182] text-[#31372B] focus:ring-1 focus:ring-[#717182] outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#31372B] text-white p-2 rounded-md hover:opacity-90 transition flex items-center justify-center shrink-0"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Searchable Location Filter */}
        <div className="relative w-full md:w-44">
          <input
            type="text"
            placeholder="Search location..."
            value={locationSearch}
            onChange={(e) => {
              setLocationSearch(e.target.value);
              const match = locations.find(loc => loc.toLowerCase() === e.target.value.toLowerCase());
              if (match) {
                setSelectedLocation(match);
              } else if (e.target.value === "") {
                setSelectedLocation("All");
              }
            }}
            className="w-full bg-white border border-[#31372B1F] rounded-md px-3 py-2 text-sm text-[#31372B] focus:ring-1 focus:ring-[#717182] outline-none"
          />
          {locationSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[#31372B1F] rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div
                className="px-3 py-2 text-sm hover:bg-[#F5F5F5] cursor-pointer"
                onClick={() => {
                  setSelectedLocation("All");
                  setLocationSearch("");
                }}
              >
                All Locations
              </div>
              {locations
                .filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                .map((location) => (
                  <div
                    key={location}
                    className="px-3 py-2 text-sm hover:bg-[#F5F5F5] cursor-pointer"
                    onClick={() => {
                      setSelectedLocation(location);
                      setLocationSearch("");
                    }}
                  >
                    {location}
                  </div>
                ))}
            </div>
          )}
        </div>

        <select
          value={selectedIndustry}
          onChange={handleIndustryChange}
          className="bg-white border border-[#31372B1F] rounded-md px-3 py-2 text-sm text-[#31372B] w-full md:w-44"
          size={1}
        >
          <option value="All">All Industries</option>
          {industries.map((industry) => (
            <option key={industry}>{industry}</option>
          ))}
        </select>

        <div
          className="flex items-center bg-white border border-[#31372B1F] rounded-md px-3 py-2 text-sm gap-3 cursor-pointer select-none"
          onClick={handleToggleViewed}
        >
          <span>Show Viewed Only</span>
          <div
            className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-all duration-300 ${showViewed ? "bg-[#31372B]" : "bg-[#CBCED4]"
              }`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full transform transition-transform duration-300 ${showViewed ? "translate-x-4" : ""
                }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Investor List */}
      <div className="max-w-[1400px] mx-auto mt-6 md:mt-8 space-y-4 md:space-y-6 px-4 md:px-6 pb-8">
        {loading ? (
          <p className="text-[#717182]">Loading investor data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {currentPageData.map((inv: Investor) => {
              return (
                <div
                  key={inv.id}
                  className="flex flex-col md:flex-row justify-between items-start bg-white border border-[#31372B1F] rounded-xl p-4 md:p-5 shadow-sm gap-4 md:gap-0"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-start gap-3 md:gap-4 w-full md:w-[250px]">
                    <div className="flex justify-center items-center w-10 h-10 md:w-12 md:h-12 bg-[#F5F5F5] rounded-full font-bold text-sm md:text-base shrink-0">
                      {inv.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[15px] leading-5">
                        {maskName(inv.name, inv.id)}
                      </p>
                      <p className="text-[14px] text-[#717182]">{inv.firm_name}</p>
                      {inv.type && (
                        <span className="inline-block mt-1 bg-[#F5F5F5] border border-[#31372B1F] text-[#31372B] text-xs px-2 py-0.5 rounded-md whitespace-nowrap">
                          {inv.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* About + Tags */}
                  <div className="flex flex-col flex-1 w-full md:w-auto">
                    {viewedInvestorIds.includes(inv.id) ? (
                      // Full about text for unlocked investors
                      <p className="text-[14px] mb-2">{inv.about}</p>
                    ) : (
                      // Censored preview for locked investors with masked names
                      <div className="relative mb-2">
                        <p className="text-[14px] text-[#717182]">
                          {maskDescription(inv.about, inv.name, inv.id).substring(0, 100)}...
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-white pointer-events-none"></div>
                        <p className="text-xs text-[#717182] italic mt-1">
                          🔒 Unlock to view full description
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {inv.preference_sector.split(",").map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#F5F5F5] border border-[#31372B1F] text-[#31372B] text-xs px-2 py-0.5 rounded-md"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 w-full md:w-[150px]">
                    <p className="text-[14px] text-[#717182] text-right pr-2">
                      {inv.country}
                    </p>

                    <button
                      onClick={() => handleViewProfile(inv)}
                      disabled={loadingInvestorId === inv.id}
                      className="bg-[#31372B] text-[#FAF7EE] rounded-md px-4 py-2 md:py-1.5 text-sm font-bold hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center w-full md:w-auto md:min-w-[120px]"
                    >
                      {loadingInvestorId === inv.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        viewedInvestorIds.includes(inv.id) ? "View Again" : "View Profile"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalCount > PAGE_SIZE && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 rounded border border-[#31372B1F] text-sm disabled:opacity-50 hover:bg-[#F5F5F5] disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm text-[#717182]">
                  Page {currentPage} of {Math.ceil(totalCount / PAGE_SIZE)}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalCount / PAGE_SIZE), p + 1))}
                  disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE) || loading}
                  className="px-3 py-1 rounded border border-[#31372B1F] text-sm disabled:opacity-50 hover:bg-[#F5F5F5] disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

export default Dashboard;
