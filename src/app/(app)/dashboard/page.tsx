"use client";

import { useState, useEffect, ChangeEvent, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
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



interface ViewedIdsResponse {
  data: { investor_id: number }[] | null;
  error: { message?: string } | null;
}

interface InvestorListResponse {
  data: Investor[] | null;
  count: number | null;
  error: { message?: string } | null;
}

const Dashboard = () => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const latestFetchIdRef = useRef(0);

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

  const withTimeout = useCallback(
  async function withTimeout<T>(
    promise: PromiseLike<T>, // ✅ KEY FIX
    message: string,
    timeoutMs = 15000
  ): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  },
  []
);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Fetch filter options once on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { data, error } = await withTimeout(
  supabase
    .from("investors")
    .select("country, preference_sector"),
  "Loading filter options took too long."
);

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
                    .map((sector: string) => sector.trim())
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
  }, [supabase, withTimeout]);

  const fetchInvestors = useCallback(async () => {
    const fetchId = ++latestFetchIdRef.current;
    setLoading(true);
    setError("");
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
        const { data: viewedIds, error: viewedIdsError } = await withTimeout<ViewedIdsResponse>(
          supabase
            .from("user_investor_views")
            .select("investor_id")
            .eq("user_id", userId),
          "Loading viewed investors took too long."
        );

        if (viewedIdsError) throw viewedIdsError;

        if (viewedIds && viewedIds.length > 0) {
          query = query.in("id", viewedIds.map(v => v.investor_id));
        } else {
          // No viewed investors
          if (fetchId !== latestFetchIdRef.current) return;
          setCurrentPageData([]);
          setTotalCount(0);
          return;
        }
      }

      const { data, count, error } = await withTimeout<InvestorListResponse>(
        query
          .range(from, to)
          .order("id", { ascending: true }),
        "Loading investor data timed out. Please try again."
      );

      if (error) throw error;
      if (fetchId !== latestFetchIdRef.current) return;

      setCurrentPageData(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching investors:", err);
      if (fetchId !== latestFetchIdRef.current) return;
      setError("Failed to fetch investors");
      setCurrentPageData([]);
      setTotalCount(0);
    } finally {
      if (fetchId === latestFetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    PAGE_SIZE,
    currentPage,
    debouncedSearch,
    selectedIndustry,
    selectedLocation,
    showViewed,
    supabase,
    userId,
    withTimeout,
  ]);

  // Fetch investors with server-side pagination and filters
  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

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
  }, [supabase, userId]);



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
  }, [credits, decrementCredit, supabase, used, userId, viewedInvestorIds]);

  return (
    <div className="min-h-screen bg-[#FAF7EE] font-inter text-[#31372B]">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto mt-16 md:mt-[92px] px-4 md:px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <h1 className="text-2xl md:text-[32px] font-space font-bold text-[#1E1E1E] tracking-[-0.02em]">Investor database</h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-black/[0.05] border border-black/[0.06] rounded-full px-3 py-1.5">
            <div className="w-2 h-2 bg-[#C6FF55] rounded-full"></div>
            <span className="text-sm font-inter font-medium text-[#31372B]">
              {credits} credits
            </span>
          </div>
          <Link href="/pricing">
            <button className="flex items-center gap-2 bg-[#1E1E1E] text-white rounded-full px-5 py-2 text-sm font-inter font-semibold hover:bg-[#333] transition shadow-lg shadow-black/10 cursor-pointer">
              Get Credits
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
              className="w-full bg-white border border-black/[0.08] rounded-2xl pl-4 pr-4 py-2.5 font-inter placeholder-[#9ca3af] text-[#31372B] focus:ring-2 focus:ring-[#C6FF55]/40 focus:border-[#C6FF55]/60 outline-none transition"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#1E1E1E] text-white p-2.5 rounded-2xl hover:bg-[#333] transition flex items-center justify-center shrink-0"
            aria-label="Search"
          >
            <Search size={18} />
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
            className="w-full bg-white border border-black/[0.08] rounded-2xl px-3 py-2.5 text-sm font-inter text-[#31372B] focus:ring-2 focus:ring-[#C6FF55]/40 outline-none transition"
          />
          {locationSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-black/[0.08] rounded-2xl shadow-xl max-h-60 overflow-y-auto">
              <div
                className="px-3 py-2 text-sm font-inter hover:bg-black/[0.04] cursor-pointer rounded-t-2xl"
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
                    className="px-3 py-2 text-sm font-inter hover:bg-black/[0.04] cursor-pointer"
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
          className="bg-white border border-black/[0.08] rounded-2xl px-3 py-2.5 text-sm font-inter text-[#31372B] w-full md:w-44 focus:ring-2 focus:ring-[#C6FF55]/40 outline-none"
          size={1}
        >
          <option value="All">All Industries</option>
          {industries.map((industry) => (
            <option key={industry}>{industry}</option>
          ))}
        </select>

        <div
          className="flex items-center bg-white border border-black/[0.08] rounded-2xl px-4 py-2.5 text-sm font-inter gap-3 cursor-pointer select-none hover:bg-black/[0.02] transition"
          onClick={handleToggleViewed}
        >
          <span className="text-[#31372B]">Show Viewed Only</span>
          <div
            className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-all duration-300 ${showViewed ? "bg-[#1E1E1E]" : "bg-[#CBCED4]"}`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full transform transition-transform duration-300 ${showViewed ? "translate-x-4" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Investor List */}
      <div className="max-w-[1400px] mx-auto mt-6 md:mt-8 space-y-3 md:space-y-4 px-4 md:px-6 pb-8">
        {loading ? (
          <div className="flex items-center gap-3 py-8">
            <div className="animate-spin h-5 w-5 rounded-full border-2 border-[#1E1E1E] border-t-transparent" />
            <p className="text-[#6B6B6B] font-inter text-sm">Loading investor data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3">
            <p className="text-red-500 font-inter text-sm">{error}</p>
            <button
              onClick={fetchInvestors}
              className="bg-[#1E1E1E] text-white rounded-full px-4 py-1.5 text-sm font-inter font-medium hover:bg-[#333] transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {currentPageData.map((inv: Investor) => {
              return (
                <div
                  key={inv.id}
                  className="flex flex-col md:flex-row justify-between items-start bg-white/70 border border-black/[0.06] rounded-3xl p-4 md:p-5 shadow-sm gap-4 md:gap-0 hover:border-[#C6FF55]/30 hover:shadow-md transition-all duration-300 backdrop-blur-sm"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-start gap-3 md:gap-4 w-full md:w-[260px]">
                    <div className="flex justify-center items-center w-10 h-10 md:w-12 md:h-12 bg-[#1E1E1E] text-white rounded-full font-space font-bold text-sm md:text-base shrink-0">
                      {inv.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-inter font-bold text-[15px] leading-5 text-[#1E1E1E]">
                        {maskName(inv.name, inv.id)}
                      </p>
                      <p className="font-inter text-[13px] text-[#6B6B6B] mt-0.5">{inv.firm_name}</p>
                      {inv.type && (
                        <span className="inline-block mt-1 bg-black/[0.05] border border-black/[0.06] text-[#31372B] text-[11px] font-inter px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          {inv.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* About + Tags */}
                  <div className="flex flex-col flex-1 w-full md:w-auto">
                    {viewedInvestorIds.includes(inv.id) ? (
                      <p className="text-[13px] font-inter text-[#31372B] mb-2 leading-relaxed">{inv.about}</p>
                    ) : (
                      <div className="relative mb-2">
                        <p className="text-[13px] font-inter text-[#6B6B6B]">
                          {maskDescription(inv.about, inv.name, inv.id).substring(0, 100)}...
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-white pointer-events-none" />
                        <p className="text-xs font-inter text-[#6B6B6B] mt-1">🔒 Unlock to view full description</p>
                      </div>
                    )}
                    <div className="flex gap-1.5 flex-wrap">
                      {inv.preference_sector.split(",").map((tag) => (
                        <span
                          key={tag}
                          className="bg-black/[0.05] border border-black/[0.06] text-[#31372B] text-[11px] font-inter px-2.5 py-0.5 rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 w-full md:w-[150px]">
                    <p className="text-[13px] font-inter text-[#6B6B6B] text-right">
                      {inv.country}
                    </p>
                    <button
                      onClick={() => handleViewProfile(inv)}
                      disabled={loadingInvestorId === inv.id}
                      className="bg-[#1E1E1E] text-white rounded-full px-5 py-2 text-sm font-inter font-semibold hover:bg-[#333] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center w-full md:w-auto"
                    >
                      {loadingInvestorId === inv.id ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
                  className="px-4 py-2 rounded-full border border-black/[0.08] text-sm font-inter disabled:opacity-40 hover:bg-black/[0.04] disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>
                <span className="text-sm font-inter text-[#6B6B6B] px-3">
                  Page {currentPage} of {Math.ceil(totalCount / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalCount / PAGE_SIZE), p + 1))}
                  disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE) || loading}
                  className="px-4 py-2 rounded-full border border-black/[0.08] text-sm font-inter disabled:opacity-40 hover:bg-black/[0.04] disabled:cursor-not-allowed transition"
                >
                  Next →
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
