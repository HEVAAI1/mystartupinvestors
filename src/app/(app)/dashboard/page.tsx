"use client";

import { useState, useEffect, ChangeEvent, useCallback, useMemo, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import UpgradeModal from "@/components/UpgradeModal";
import { useCredits } from "@/context/CreditsContext"; // ✅ USE CONTEXT
import Link from "next/link";
import { Search, MapPin, Zap, ExternalLink, Briefcase, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import InvestorProfileDrawer from "@/components/dashboard/InvestorProfileDrawer";
import UpgradeBanner from "@/components/dashboard/UpgradeBanner";

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

interface FilterPillDropdownProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

function FilterPillDropdown({
  icon: Icon,
  label,
  value,
  options,
  onSelect,
}: FilterPillDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#C6FF55]/40 sm:min-w-[148px]"
      >
        <Icon className="h-4 w-4 flex-shrink-0 text-[#9B9B9B]" />
        <span className="flex-1 truncate text-sm font-inter font-medium text-[#4B4B4B]">
          {value}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-[#ABABAB] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 top-[calc(100%+8px)] z-20 w-full min-w-[220px] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-xl"
          >
            <div className="border-b border-black/[0.05] px-4 py-2.5">
              <p className="text-[11px] font-inter font-semibold uppercase tracking-[0.14em] text-[#9B9B9B]">
                {label}
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto py-1.5">
              {[label, ...options].map((option) => {
                const optionValue = option === label ? "All" : option;
                const isActive = value === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onSelect(optionValue);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center px-4 py-2.5 text-sm font-inter transition ${
                      isActive
                        ? "bg-[#C6FF55]/12 text-[#1E1E1E] font-semibold"
                        : "text-[#4B4B4B] hover:bg-black/[0.03]"
                    }`}
                  >
                    <span className="truncate">{option}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);

  // Filter options (fetched once)
  const [locations, setLocations] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);

  const [viewedInvestorIds, setViewedInvestorIds] = useState<number[]>([]);
  // ⭐⭐⭐ USE CREDITS FROM CONTEXT ⭐⭐⭐
  const { credits, used, decrementCredit, userId, hasPaid } = useCredits();

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

  const locationLabel = selectedLocation === "All" ? "All Locations" : selectedLocation;
  const industryLabel = selectedIndustry === "All" ? "All Industries" : selectedIndustry;

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

    // 1. If already viewed, open the in-page drawer
    if (viewedInvestorIds.includes(investor.id)) {
      console.log("Investor already viewed. Opening drawer.");
      setSelectedInvestor(investor);
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

          // Open the profile in-place after successful DB update
          setSelectedInvestor(investor);

        } catch (err) {
          console.error("Error updating credits/views:", err);
          setLoadingInvestorId(null);
          alert("An error occurred. Please try again.");
          return;
        }
      } else {
        console.error("No userId found, skipping DB updates");
      }

      setLoadingInvestorId(null);
    } else {
      // 3. No credits
      console.log("No credits left. Showing upgrade modal.");
      setShowUpgradeModal(true);
    }
  }, [credits, decrementCredit, supabase, used, userId, viewedInvestorIds]);

  return (
    <div className="min-h-screen bg-[#F8F6F0] font-inter text-[#31372B]">
      <InvestorProfileDrawer investor={selectedInvestor} onClose={() => setSelectedInvestor(null)} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 lg:pt-[72px]">
        <div className="sticky top-16 lg:top-[72px] z-30 -mx-6 px-6 lg:-mx-8 lg:px-8 pb-4 bg-[#F8F6F0]/95 backdrop-blur-md border-b border-black/[0.05]">
          <div className="pt-5 pb-4">
            <div className="relative max-w-3xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]" />
              <input
                type="text"
                placeholder="Search investors, companies, industries..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl border border-black/[0.07] bg-white pl-10 pr-4 py-2 text-sm font-inter text-[#31372B] shadow-sm outline-none transition focus:ring-2 focus:ring-[#C6FF55]/40 placeholder:text-[#ABABAB]"
              />
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-space font-bold text-[#1E1E1E] md:text-[2.15rem]">Investor Database</h1>
            <p className="mt-1.5 text-sm font-inter text-[#6B6B6B] md:text-[1.05rem]">
              Discover and connect with <span className="font-semibold text-[#1E1E1E]">5,000+</span> verified investors worldwide
            </p>
          </div>

          <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <FilterPillDropdown
                icon={MapPin}
                label="All Locations"
                value={locationLabel}
                options={locations}
                onSelect={(value) => {
                  setSelectedLocation(value);
                  setCurrentPage(1);
                }}
              />

              <FilterPillDropdown
                icon={Briefcase}
                label="All Industries"
                value={industryLabel}
                options={industries}
                onSelect={(value) => {
                  setSelectedIndustry(value);
                  setCurrentPage(1);
                }}
              />

              <div
                className="inline-flex w-full items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm font-inter shadow-sm transition select-none hover:border-[#C6FF55]/40 cursor-pointer sm:w-auto"
                onClick={handleToggleViewed}
              >
                <span className="text-[#31372B]">Viewed Only</span>
                <div className={`flex h-4 w-8 items-center rounded-full p-0.5 transition-all duration-300 ${showViewed ? "bg-[#1E1E1E]" : "bg-[#CBCED4]"}`}>
                  <div className={`h-3.5 w-3.5 rounded-full bg-white transition-transform duration-300 ${showViewed ? "translate-x-4" : ""}`} />
                </div>
              </div>
            </div>

            <span className="text-sm font-inter text-[#9B9B9B] sm:text-right">
              Showing <span className="font-semibold text-[#4B4B4B]">{currentPageData.length}</span> of{" "}
              <span className="font-semibold text-[#4B4B4B]">5,000+</span> investors
            </span>
          </div>
        </div>

        <UpgradeBanner visible={!hasPaid} />

        {/* Investor List */}
        <div className="mt-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center gap-3 py-12">
              <div className="animate-spin h-5 w-5 rounded-full border-2 border-[#1E1E1E] border-t-transparent" />
              <p className="text-[#6B6B6B] font-inter text-sm">Loading investor data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 py-8">
              <p className="text-red-500 font-inter text-sm">{error}</p>
              <button onClick={fetchInvestors} className="bg-[#1E1E1E] text-white rounded-full px-4 py-1.5 text-sm font-inter font-medium hover:bg-[#333] transition">
                Retry
              </button>
            </div>
          ) : (
            <>
              {currentPageData.map((inv: Investor) => {
                const isViewed = viewedInvestorIds.includes(inv.id);
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative bg-white/70 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 ${
                      isViewed
                        ? "border-black/[0.06] hover:border-[#C6FF55]/40 hover:shadow-lg hover:shadow-[#C6FF55]/5"
                        : "border-black/[0.04] hover:border-black/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-space font-bold text-sm ${
                        isViewed ? "bg-[#1E1E1E] text-white" : "bg-black/[0.06] text-[#6B6B6B]"
                      }`}>
                        {inv.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-space font-bold text-base ${isViewed ? "text-[#1E1E1E]" : "text-[#6B6B6B]"}`}>
                            {maskName(inv.name, inv.id)}
                          </h3>
                          {inv.type && (
                            <span className="text-[10px] font-inter font-semibold bg-black/[0.05] border border-black/[0.06] text-[#31372B] px-2 py-0.5 rounded-full">
                              {inv.type}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-inter mt-0.5 ${isViewed ? "text-[#6B6B6B]" : "text-[#6B6B6B]/60"}`}>
                          {inv.firm_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-inter text-[#6B6B6B] flex-shrink-0">
                        <MapPin className="w-3 h-3" />
                        {inv.city ? `${inv.city}, ` : ""}{inv.country}
                      </div>
                    </div>

                    {/* Bio */}
                    {isViewed ? (
                      <p className="text-sm font-inter text-[#6B6B6B] leading-relaxed mt-3">{inv.about}</p>
                    ) : (
                      <div className="relative mt-3">
                        <p className={`text-sm font-inter text-[#6B6B6B]/50 leading-relaxed`} style={{ filter: "blur(3px)", userSelect: "none" }}>
                          {maskDescription(inv.about, inv.name, inv.id).substring(0, 100)}...
                        </p>
                        <p className="text-xs font-inter text-[#6B6B6B] mt-1">🔒 Unlock to view full description</p>
                      </div>
                    )}

                    {/* Tags + action */}
                    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {inv.preference_sector.split(",").map((tag) => (
                          <span key={tag} className={`text-[10px] font-inter font-semibold px-2.5 py-1 rounded-full ${
                            isViewed ? "bg-[#C6FF55]/15 text-[#1E1E1E]" : "bg-black/[0.04] text-[#6B6B6B]/60"
                          }`}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleViewProfile(inv)}
                        disabled={loadingInvestorId === inv.id}
                        className={`flex items-center gap-1.5 text-xs font-inter font-semibold px-4 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isViewed
                            ? "bg-[#C6FF55]/20 text-[#1E1E1E] hover:bg-[#C6FF55]/40"
                            : "bg-[#1E1E1E] text-white hover:bg-[#333]"
                        }`}
                      >
                        {loadingInvestorId === inv.id ? (
                          <>
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading...
                          </>
                        ) : isViewed ? (
                          <><ExternalLink className="w-3 h-3" /> View Profile</>
                        ) : (
                          <><Zap className="w-3 h-3 text-[#C6FF55]" /> Unlock Profile</>
                        )}
                      </button>
                    </div>

                    {!isViewed && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent via-transparent to-white/60 pointer-events-none" />
                    )}
                  </motion.div>
                );
              })}

              {/* Pagination */}
              {totalCount > PAGE_SIZE && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 rounded-full border border-black/[0.08] bg-white/70 text-sm font-inter disabled:opacity-40 hover:border-[#C6FF55]/40 disabled:cursor-not-allowed transition"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm font-inter text-[#6B6B6B] px-3">
                    Page {currentPage} of {Math.ceil(totalCount / PAGE_SIZE)}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalCount / PAGE_SIZE), p + 1))}
                    disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE) || loading}
                    className="px-4 py-2 rounded-full border border-black/[0.08] bg-white/70 text-sm font-inter disabled:opacity-40 hover:border-[#C6FF55]/40 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 relative bg-[#1E1E1E] rounded-3xl p-8 md:p-12 overflow-hidden text-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#C6FF55]/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#C6FF55]/10 border border-[#C6FF55]/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-[#C6FF55]" />
              <span className="text-xs font-inter font-semibold text-[#C6FF55] uppercase tracking-wider">Unlock More</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-space font-bold text-white mb-3">
              Get instant access to all 5,000+ investors
            </h2>
            <p className="text-white/50 font-inter max-w-lg mx-auto mb-8">
              Upgrade your plan to unlock verified emails, direct contact info, and full investor profiles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pricing">
                <button className="inline-flex items-center gap-2 bg-[#C6FF55] text-[#1E1E1E] font-inter font-semibold px-8 py-4 rounded-2xl hover:bg-[#d4ff77] transition-colors shadow-lg">
                  <Zap className="w-4 h-4" /> Upgrade Plan
                </button>
              </Link>
              <Link href="/pricing">
                <button className="inline-flex items-center gap-2 bg-white/10 text-white font-inter font-medium px-8 py-4 rounded-2xl hover:bg-white/15 transition-colors">
                  View all plans
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>

      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};

export default Dashboard;
