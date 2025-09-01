"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [investorCount, setInvestorCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      // Get user count
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });
      
      // Get investor count
      const { count: investorsCount } = await supabase
        .from("investors")
        .select("*", { count: "exact", head: true });

      setUserCount(usersCount ?? 0);
      setInvestorCount(investorsCount ?? 0);
    } catch (err) {
      console.error("Error fetching counts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-900 text-gray-200 flex items-center justify-between px-8 py-4 shadow-md">
        <div className="text-2xl font-bold">Admin Panel</div>
        <div className="flex gap-6">
          <a href="/admin/investor-list" className="hover:underline">Investor Details</a>
          <a href="/admin/startup-leads" className="hover:underline">Startup Leads</a>
          <a href="/admin/users" className="hover:underline">User Lists</a>
        </div>
      </nav>

      {/* Dashboard Cards */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
          <h2 className="text-gray-500 text-sm mb-2">User Count</h2>
          <p className="text-3xl font-bold">{loading ? "..." : userCount}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
          <h2 className="text-gray-500 text-sm mb-2">Investor Count</h2>
          <p className="text-3xl font-bold">{loading ? "..." : investorCount}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
