"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Users, Building2, Database, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalStartups: number;
  totalInvestors: number;
  creditsUsed: number;
  freeUsers: number;
  starterUsers: number;
  growthUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
}

interface RevenueData {
  period: string;
  revenue: number;
  transactions: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStartups: 0,
    totalInvestors: 0,
    creditsUsed: 0,
    freeUsers: 0,
    starterUsers: 0,
    growthUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyActiveUsers: 0,
    monthlyActiveUsers: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [chartView, setChartView] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRevenueData();
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [chartView]);

  const fetchStats = async () => {
    try {
      const supabase = createSupabaseBrowserClient();

      // Fetch all users data
      const { data: usersData } = await supabase
        .from("users")
        .select("plan, credits_used, last_login");

      // Calculate user counts by plan
      const freeCount = usersData?.filter(u => !u.plan || u.plan === "free").length || 0;
      const starterCount = usersData?.filter(u => u.plan === "starter").length || 0;
      const growthCount = usersData?.filter(u => u.plan === "growth").length || 0;

      // Calculate active users
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const dailyActive = usersData?.filter(u => {
        if (!u.last_login) return false;
        const lastLogin = new Date(u.last_login);
        return lastLogin >= oneDayAgo;
      }).length || 0;

      const monthlyActive = usersData?.filter(u => {
        if (!u.last_login) return false;
        const lastLogin = new Date(u.last_login);
        return lastLogin >= oneMonthAgo;
      }).length || 0;

      // Fetch total startups
      const { count: startupsCount } = await supabase
        .from("startup_leads")
        .select("*", { count: "exact", head: true });

      // Fetch total investors
      const { count: investorsCount } = await supabase
        .from("investors")
        .select("*", { count: "exact", head: true });

      // Calculate total credits used
      const totalCreditsUsed = usersData?.reduce(
        (sum, user) => sum + (user.credits_used || 0),
        0
      ) || 0;

      // Fetch revenue data
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("amount, completed_at, status");

      const completedTransactions = transactionsData?.filter(t => t.status === "completed") || [];

      const totalRev = completedTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      // Calculate current month revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRev = completedTransactions
        .filter(t => {
          if (!t.completed_at) return false;
          const date = new Date(t.completed_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      setStats({
        totalUsers: usersData?.length || 0,
        totalStartups: startupsCount || 0,
        totalInvestors: investorsCount || 0,
        creditsUsed: totalCreditsUsed,
        freeUsers: freeCount,
        starterUsers: starterCount,
        growthUsers: growthCount,
        totalRevenue: totalRev,
        monthlyRevenue: monthlyRev,
        dailyActiveUsers: dailyActive,
        monthlyActiveUsers: monthlyActive,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("amount, completed_at, status")
        .eq("status", "completed")
        .order("completed_at", { ascending: true });

      if (!transactionsData) return;

      const groupedData: { [key: string]: { revenue: number; count: number } } = {};

      transactionsData.forEach(transaction => {
        if (!transaction.completed_at) return;

        const date = new Date(transaction.completed_at);
        let key: string;

        if (chartView === "monthly") {
          // Group by month for current year
          if (date.getFullYear() === new Date().getFullYear()) {
            key = date.toLocaleDateString('en-US', { month: 'short' });
          } else {
            return;
          }
        } else {
          // Group by year
          key = date.getFullYear().toString();
        }

        if (!groupedData[key]) {
          groupedData[key] = { revenue: 0, count: 0 };
        }

        groupedData[key].revenue += parseFloat(transaction.amount) || 0;
        groupedData[key].count += 1;
      });

      const chartData: RevenueData[] = Object.entries(groupedData).map(([period, data]) => ({
        period,
        revenue: Math.round(data.revenue * 100) / 100,
        transactions: data.count,
      }));

      setRevenueData(chartData);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
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

      {/* Revenue Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
          <h3 className="text-[14px] text-[#717182] mb-1">Total Revenue</h3>
          <p className="text-[32px] font-bold text-[#31372B]">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#717182] mt-2">All-time earnings</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
          <h3 className="text-[14px] text-[#717182] mb-1">Monthly Revenue</h3>
          <p className="text-[32px] font-bold text-[#31372B]">
            ${stats.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#717182] mt-2">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Activity Status Section */}
      <div className="mt-8 bg-white rounded-xl border border-[#31372B1F] p-6 shadow-sm">
        <h2 className="text-[20px] font-bold text-[#31372B] mb-6">
          Activity Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Active Users */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Users size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-[14px] text-[#717182] mb-1">Daily Active Users</h3>
            <p className="text-[32px] font-bold text-[#31372B]">
              {stats.dailyActiveUsers.toLocaleString()}
            </p>
            <p className="text-[12px] text-[#717182] mt-2">
              Active in last 24 hours
            </p>
          </div>

          {/* Monthly Active Users */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Users size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-[14px] text-[#717182] mb-1">Monthly Active Users</h3>
            <p className="text-[32px] font-bold text-[#31372B]">
              {stats.monthlyActiveUsers.toLocaleString()}
            </p>
            <p className="text-[12px] text-[#717182] mt-2">
              Active in last 30 days
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mt-8 bg-white rounded-xl border border-[#31372B1F] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold text-[#31372B]">
            Revenue Analytics
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setChartView("monthly")}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition ${chartView === "monthly"
                ? "bg-[#31372B] text-white"
                : "border border-[#31372B1F] hover:bg-[#F5F5F5]"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setChartView("yearly")}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition ${chartView === "yearly"
                ? "bg-[#31372B] text-white"
                : "border border-[#31372B1F] hover:bg-[#F5F5F5]"
                }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis
                dataKey="period"
                stroke="#717182"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#717182"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#31372B"
                strokeWidth={2}
                dot={{ fill: '#31372B', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#717182]">No transaction data available</p>
          </div>
        )}
      </div>

      {/* User Details Section */}
      <div className="mt-8 bg-white rounded-xl border border-[#31372B1F] p-6 shadow-sm">
        <h2 className="text-[20px] font-bold text-[#31372B] mb-6">
          User Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Users */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-500 p-3 rounded-lg">
                <Users size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-[14px] text-[#717182] mb-1">Free Users</h3>
            <p className="text-[32px] font-bold text-[#31372B]">
              {stats.freeUsers.toLocaleString()}
            </p>
            <p className="text-[12px] text-[#717182] mt-2">
              {stats.totalUsers > 0 ? Math.round((stats.freeUsers / stats.totalUsers) * 100) : 0}% of total users
            </p>
          </div>

          {/* Starter Users */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Users size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-[14px] text-[#717182] mb-1">Starter Users</h3>
            <p className="text-[32px] font-bold text-[#31372B]">
              {stats.starterUsers.toLocaleString()}
            </p>
            <p className="text-[12px] text-[#717182] mt-2">
              {stats.totalUsers > 0 ? Math.round((stats.starterUsers / stats.totalUsers) * 100) : 0}% of total users
            </p>
          </div>

          {/* Growth Users */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <Users size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-[14px] text-[#717182] mb-1">Growth Users</h3>
            <p className="text-[32px] font-bold text-[#31372B]">
              {stats.growthUsers.toLocaleString()}
            </p>
            <p className="text-[12px] text-[#717182] mt-2">
              {stats.totalUsers > 0 ? Math.round((stats.growthUsers / stats.totalUsers) * 100) : 0}% of total users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
