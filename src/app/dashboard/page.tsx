"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import UpgradeModal from "@/components/UpgradeModal";
import { set } from "zod";

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

const Dashboard = () => {

  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [locations, setLocations] = useState<string[]>
  ([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showViewed, setShowViewed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
  };

  const handleIndustryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndustry(e.target.value);
  };

  const fetchInvestors = async () => {
    try {
      let { data, error } = await supabase.from("investors").select("*") as {
        data: Investor[] | null;
        error: any;
      };
      if (error) throw error;
      if (data) {
        setInvestors(data);
        setFilteredInvestors(data);

        const uniqueLocation = Array.from(
          new Set(data.map((item) => item.country).filter(Boolean))
        );
        const uniqueIndustry = Array.from(
           new Set(data.map((item) => item.preference_sector).filter(Boolean))
        );
        setIndustries(uniqueIndustry.sort());
        setLocations(uniqueLocation.sort());
      }
    } catch (err) {
      console.error(err);
      setError("Investor data table does not exist yet. Please create it in Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  useEffect(() => {
    let filtered = investors;
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.firm_name.toLowerCase().includes(lowerSearch) ||
          inv.preference_sector.toLowerCase().includes(lowerSearch) ||
          inv.country.toLowerCase().includes(lowerSearch)
      );
    }
    if (selectedLocation !== "All") {
      filtered = filtered.filter((inv) => inv.country === selectedLocation);
    }
    if (selectedIndustry !== "All") {
      filtered = filtered.filter((inv) => inv.preference_sector === selectedIndustry);
    }
    setFilteredInvestors(filtered);
  }, [searchTerm, investors, selectedLocation, selectedIndustry]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleToggleViewed = () => {
    setShowViewed((prev) => !prev);
    console.log("Show Viewed:", !showViewed);
  };

  // 🧠 NEW MASKING ALGORITHM
  const maskName = (name: string): string => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      // Single name (e.g., "Arjun")
      const first = parts[0][0];
      return first + "X".repeat(parts[0].length - 1);
    } else {
      // First + Last (e.g., "Arjun Mehta")
      const first = parts[0][0] + "X".repeat(parts[0].length - 1);
      const last = parts[1][0] + "X".repeat(parts[1].length - 1);
      return `${first} ${last}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] font-[Arial] text-[#31372B]">
      <Navbar credits={5} />

      <div className="max-w-[1400px] mx-auto mt-[92px] px-6 flex justify-between items-center">
        <h1 className="text-[32px] font-bold">Investor database</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#31372B1F] rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-[#F0B100] rounded-full"></div>
            <span className="text-sm font-bold text-[#31372B]">Credits: 0/0</span>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-2 bg-[#31372B] text-[#FAF7EE] rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 cursor-pointer"
          >
            <Image
              src="/GetCreditsLogoLight.svg"
              alt="Get Credits Icon"
              width={16}
              height={16}
              className="opacity-90"
            />
            Get credits
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="max-w-[1400px] mx-auto mt-8 flex flex-wrap items-center gap-4 px-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-white border border-[#31372B1F] rounded-md px-10 py-2 placeholder-[#717182] text-[#31372B] focus:ring-1 focus:ring-[#717182] outline-none"
          />
          <Image
            src="/SearchIcon.png"
            alt="Search Icon"
            width={20}
            height={20}
            className="absolute left-3 top-2.5 opacity-70"
          />
        </div>
        <select value={selectedLocation}
          onChange={handleCountryChange}
          className="bg-white border border-[#31372B1F] rounded-md px-3 py-2 text-sm text-[#31372B] w-44">
          <option value="All">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <select value={selectedIndustry}
          onChange={handleIndustryChange} className="bg-white border border-[#31372B1F] rounded-md px-3 py-2 text-sm text-[#31372B] w-44">
          <option value="All">All Industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
        <div
          className="flex items-center bg-white border border-[#31372B1F] rounded-md px-3 py-2 text-sm gap-3 cursor-pointer select-none"
          onClick={handleToggleViewed}
        >
          <span>Show Viewed</span>
          <div
            className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-all duration-300 ${showViewed ? "bg-[#31372B]" : "bg-[#CBCED4]"
              }`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full transform transition-transform duration-300 ${showViewed ? "translate-x-4" : "translate-x-0"
                }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Investor Cards */}
      <div className="max-w-[1400px] mx-auto mt-8 space-y-6 px-6 pb-20">
        {loading ? (
          <p className="text-[#717182]">Loading investor data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          filteredInvestors.map((inv) => {
            const expanded = expandedRows.includes(inv.id);
            return (
              <div
                key={inv.id}
                className="flex justify-between items-start bg-white border border-[#31372B1F] rounded-xl p-5 shadow-sm"
              >
                {/* Avatar and Name */}
                <div className="flex items-start gap-4 w-[250px]">
                  <div className="flex justify-center items-center w-12 h-12 bg-[#F5F5F5] rounded-full font-bold">
                    {inv.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[15px] leading-5">
                      {expanded ? inv.name : maskName(inv.name)}
                    </p>
                    <p className="text-[14px] text-[#717182]">{inv.firm_name}</p>
                  </div>
                </div>

                {/* About & Tags */}
                <div className="flex flex-col flex-1">
                  <p className="text-[14px] mb-2">{inv.about}</p>
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

                {/* Location + Action */}
                <div className="flex flex-col items-end gap-3 w-[150px]">
                  <p className="text-[14px] text-[#717182] text-right pr-2">
                    {expanded ? `${inv.city}, ${inv.country}` : inv.country}
                  </p>
                  <button
                    onClick={() => toggleRow(inv.id)}
                    className="bg-[#31372B] text-[#FAF7EE] rounded-md px-4 py-1.5 text-sm font-bold hover:opacity-90 cursor-pointer"
                  >
                    {expanded ? "Hide" : "View Profile"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onViewPlans={() => {
          setShowUpgradeModal(false);
          console.log("Navigating to /pricing"); // or router.push("/pricing")
        }}
      />
    </div>

  );
};

export default Dashboard;
