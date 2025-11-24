"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Users, Building2, Database, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalStartups: number;
  totalInvestors: number;
  creditsUsed: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStartups: 0,
    totalInvestors: 0,
    creditsUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const supabase = createSupabaseBrowserClient();

      // Fetch total users
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Fetch total startups
      const { count: startupsCount } = await supabase
        .from("startup_leads")
        .select("*", { count: "exact", head: true });

      // Fetch total investors
      const { count: investorsCount } = await supabase
        .from("investors")
        .select("*", { count: "exact", head: true });

      // Fetch total credits used
      const { data: creditsData } = await supabase
        .from("users")
        .select("credits_used");

      const totalCreditsUsed = creditsData?.reduce(
        (sum, user) => sum + (user.credits_used || 0),
        0
      ) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalStartups: startupsCount || 0,
        totalInvestors: investorsCount || 0,
        creditsUsed: totalCreditsUsed,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Startups",
      value: stats.totalStartups,
      icon: Building2,
      color: "bg-green-500",
    },
    {
      title: "Total Investors",
      value: stats.totalInvestors,
      icon: Database,
      color: "bg-purple-500",
    },
    {
      title: "Credits Used",
      value: stats.creditsUsed,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[#717182]">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[32px] font-bold text-[#31372B] mb-2">
        Data Dashboard
      </h1>
      <p className="text-[16px] text-[#717182] mb-8">
        Overview of platform statistics
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-[#31372B1F] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-[14px] text-[#717182] mb-1">{card.title}</h3>
              <p className="text-[32px] font-bold text-[#31372B]">
                {card.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-[#31372B1F] p-6 shadow-sm">
        <h2 className="text-[20px] font-bold text-[#31372B] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-[#31372B] text-white rounded-lg hover:opacity-90 transition text-[14px] font-medium">
            Export All Data
          </button>
          <button className="px-4 py-3 border border-[#31372B1F] rounded-lg hover:bg-[#F5F5F5] transition text-[14px] font-medium">
            Generate Report
          </button>
          <button className="px-4 py-3 border border-[#31372B1F] rounded-lg hover:bg-[#F5F5F5] transition text-[14px] font-medium">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
