"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FiUpload, FiUser } from "react-icons/fi";

// Define the Investor type based on your data points
interface Investor {
  id: number; // or string if your Supabase ID is uuid
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvestors = async () => {
    try {
      let { data, error } = await supabase.from("investors").select("*") as { data: Investor[] | null; error: any };
      if (error) throw error;
      if (data) setInvestors(data);
    } catch (err) {
      console.error(err);
      setError(
        "Investor data table does not exist yet. Please create the table in Supabase."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-gray-800 px-8 py-4 shadow-md">
  <div className="text-2xl font-bold text-white">MyStartupInvestors</div>

  <input
    type="text"
    placeholder="Search investors..."
    className="flex-1 mx-8 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  {/* Credits Left Badge */}
  <div className="flex items-center gap-2 mr-4">
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
      5
    </div>
    <span className="text-white text-xs">credits left</span>
  </div>

  <div className="flex items-center gap-4">
    <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
      <FiUpload size={20} className="text-gray-200" />
    </button>
    <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
      <FiUser size={20} className="text-gray-200" />
    </button>
  </div>
</nav>


      {/* Dashboard content */}
      <div className="p-8">
        {loading ? (
          <p className="text-gray-400">Loading investor data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
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
                {investors.map((inv) => (
                  <tr key={inv.id} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="px-6 py-4">{inv.name}</td>
                    <td className="px-6 py-4">{inv.about}</td>
                    <td className="px-6 py-4">{inv.city}, {inv.country}</td>
                    <td className="px-6 py-4">{inv.preference_sector}</td>
                    <td className="px-6 py-4">{inv.firm_name}</td>
                    <td className="px-6 py-4">{inv.email}</td>
                    <td className="px-6 py-4">
                      <a
                        href={inv.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Profile
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
