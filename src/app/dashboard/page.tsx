"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";

// Define the Investor type
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
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch investors
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
      }
    } catch (err) {
      console.error(err);
      setError("Investor data table does not exist yet. Please create the table in Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  // Filter investors based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredInvestors(investors);
    } else {
      const filtered = investors.filter((inv) =>
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.firm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.preference_sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInvestors(filtered);
    }
  }, [searchTerm, investors]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Mask helpers
  const maskString = (value: string, visibleChars: number) => {
    if (!value) return "";
    return (
      value
        .split(" ")
        .map((word) =>
          word.length <= visibleChars
            ? word
            : word.slice(0, visibleChars) + "*".repeat(word.length - visibleChars)
        )
        .join(" ")
    );
  };

  const maskEmail = (email: string, visibleChars: number) => {
  if (!email) return "";

  const [localPart, domain] = email.split("@");
  if (!domain) {
    return localPart.slice(0, visibleChars) + "*".repeat(localPart.length - visibleChars);
  }

  // Mask local part
  const maskedLocal =
    localPart.length <= visibleChars
      ? localPart
      : localPart.slice(0, visibleChars) + "*".repeat(localPart.length - visibleChars);

  // Mask domain fully, including subdomains & TLD
  const maskedDomain = domain
    .split(".")
    .map((part) => "*".repeat(part.length))
    .join(".");

  return `${maskedLocal}@${maskedDomain}`;
};


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Navbar */}
      <Navbar credits={5} />

      {/* Search Bar */}
      <div className="p-8">
        <input
          type="text"
          placeholder="Search investors..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-1/2"
        />
      </div>

      {/* Investor Table */}
      <div className="p-8 overflow-x-auto">
        {loading ? (
          <p className="text-gray-400">Loading investor data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
            <thead className="bg-gray-700 text-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Investor Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">About</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Preference Sector</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Firm Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">LinkedIn</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestors.map((inv) => {
                const expanded = expandedRows.includes(inv.id);
                return (
                  <tr key={inv.id} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="px-6 py-4">
                      {expanded ? inv.name : maskString(inv.name, 2)}
                    </td>
                    <td className="px-6 py-4">
                      {expanded ? inv.about : maskString(inv.about, 0)}
                    </td>
                    <td className="px-6 py-4">
                      {expanded ? `${inv.city}, ${inv.country}` : `${maskString(inv.city, 1)}, ${inv.country}`}
                    </td>
                    <td className="px-6 py-4">{inv.preference_sector}</td>
                    <td className="px-6 py-4">
                      {expanded ? inv.firm_name : maskString(inv.firm_name, 2)}
                    </td>
                    <td className="px-6 py-4">
                      {expanded ? inv.email : maskEmail(inv.email, 3)}
                    </td>
                    <td className="px-6 py-4">
                      {expanded ? (
                        <a
                          href={inv.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Profile
                        </a>
                      ) : (
                        maskString("Profile", 1)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRow(inv.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm"
                      >
                        {expanded ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
