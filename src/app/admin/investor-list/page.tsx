"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

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

const AdminInvestorList = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch investors
  const fetchInvestors = async () => {
    try {
      let { data, error } = await supabase
        .from("investors")
        .select("*") as { data: Investor[] | null; error: any };
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

  // Search filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredInvestors(investors);
    } else {
      const filtered = investors.filter(
        (inv) =>
          inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.firm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.preference_sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInvestors(filtered);
    }
  }, [searchTerm, investors]);

  // Handle Excel upload
  const handleExcelUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      const newInvestors = rows.map((row) => ({
        name: row["Name"] || "",
        about: row["About"] || "",
        city: row["City"] || "",
        country: row["Country"] || "",
        preference_sector: row["Preference Sector"] || "",
        firm_name: row["Firm Name"] || "",
        email: row["Email"] || "",
        linkedin: row["LinkedIn"] || "",
      }));

      const { error } = await supabase.from("investors").insert(newInvestors);
      if (error) {
        console.error("Excel upload error:", error);
        alert("Upload failed: " + error.message);
      } else {
        alert("Upload successful!");
        fetchInvestors(); // refresh table
      }
    } catch (err) {
      console.error("Excel parsing error:", err);
      alert("Failed to read Excel file. Make sure it is valid.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 text-gray-200 flex items-center justify-between px-8 py-4 shadow-md">
        <div className="text-2xl font-bold">Admin Panel</div>
        <div className="flex gap-6">
          <a href="/admin/investors" className="hover:underline">Investor Details</a>
          <a href="/admin/startup-leads" className="hover:underline">Startup Leads</a>
          <a href="/admin/users" className="hover:underline">User Lists</a>
        </div>
      </nav>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-4">
        <input
          type="text"
          placeholder="Search investors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        />
        <label className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600">
          Upload Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleExcelUpload}
          />
        </label>
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
              </tr>
            </thead>
            <tbody>
              {filteredInvestors.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="px-6 py-4">{inv.name}</td>
                  <td className="px-6 py-4">{inv.about}</td>
                  <td className="px-6 py-4">{inv.city}, {inv.country}</td>
                  <td className="px-6 py-4">{inv.preference_sector}</td>
                  <td className="px-6 py-4">{inv.firm_name}</td>
                  <td className="px-6 py-4">{inv.email}</td>
                  <td className="px-6 py-4">
                    <a href={inv.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      Profile
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminInvestorList;
