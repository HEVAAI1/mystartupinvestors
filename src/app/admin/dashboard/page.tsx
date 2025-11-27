"use client";

import { useState, useEffect, useCallback } from "react";
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

interface VisualizationData {
  period: string;
  value: number;
}

type MetricType = "creditsUsed" | "creditsAllocated" | "revenue" | "activeUsers";
type DurationType = "1D" | "7D" | "28D" | "90D" | "1Y";

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
  const [visualizationData, setVisualizationData] = useState<VisualizationData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("revenue");
  const [selectedDuration, setSelectedDuration] = useState<DurationType>("28D");
  const [loading, setLoading] = useState(true);

  const fetchVisualizationData = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const now = new Date();

      // Calculate the start date based on selected duration
      let startDate: Date;
      let groupBy: "hour" | "day" | "week" | "month";

      switch (selectedDuration) {
        case "1D":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          groupBy = "hour";
          break;
        case "7D":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          groupBy = "day";
          break;
        case "28D":
          startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
          groupBy = "day";
          break;
        case "90D":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          groupBy = "week";
          break;
        case "1Y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          groupBy = "month";
          break;
      }

      const groupedData: { [key: string]: number[] } = {};

      if (selectedMetric === "revenue") {
        // Fetch transaction data
        const { data: transactionsData } = await supabase
          .from("transactions")
          .select("amount, completed_at, status")
          .eq("status", "completed")
          .gte("completed_at", startDate.toISOString())
          .order("completed_at", { ascending: true });

        transactionsData?.forEach(transaction => {
          if (!transaction.completed_at) return;
          const date = new Date(transaction.completed_at);
          const key = formatDateByGroup(date, groupBy);
          if (!groupedData[key]) groupedData[key] = [];
          groupedData[key].push(parseFloat(transaction.amount) || 0);
        });

      } else if (selectedMetric === "creditsUsed" || selectedMetric === "creditsAllocated") {
        // For credits, we need to aggregate user data over time
        // Note: This is a snapshot approach - we're showing current values grouped by user creation
        const { data: usersData } = await supabase
          .from("users")
          .select("created_at, credits_used, credits_allocated")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: true });

        usersData?.forEach(user => {
          if (!user.created_at) return;
          const date = new Date(user.created_at);
          const key = formatDateByGroup(date, groupBy);
          if (!groupedData[key]) groupedData[key] = [];

          const value = selectedMetric === "creditsUsed"
            ? (user.credits_used || 0)
            : (user.credits_allocated || 0);
          groupedData[key].push(value);
        });

      } else if (selectedMetric === "activeUsers") {
        // Fetch user login data
        const { data: usersData } = await supabase
          .from("users")
          .select("last_login")
          .gte("last_login", startDate.toISOString())
          .order("last_login", { ascending: true });

        usersData?.forEach(user => {
          if (!user.last_login) return;
          const date = new Date(user.last_login);
          const key = formatDateByGroup(date, groupBy);
          if (!groupedData[key]) groupedData[key] = [];
          groupedData[key].push(1); // Count each user as 1
        });
      }

      // Convert grouped data to chart format
      const chartData: VisualizationData[] = Object.entries(groupedData).map(([period, values]) => ({
        period,
        value: selectedMetric === "activeUsers"
          ? values.length // For active users, count unique entries
          : Math.round(values.reduce((sum, val) => sum + val, 0) * 100) / 100, // Sum and round
      }));

      setVisualizationData(chartData);
    } catch (error) {
      console.error("Error fetching visualization data:", error);
    }
  }, [selectedMetric, selectedDuration]);

  // Helper function to format dates based on grouping
  const formatDateByGroup = (date: Date, groupBy: "hour" | "day" | "week" | "month"): string => {
    switch (groupBy) {
      case "hour":
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
      case "day":
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case "week":
        // Get the start of the week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case "month":
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

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

  useEffect(() => {
    fetchStats();
    fetchVisualizationData();
  }, [fetchVisualizationData]);

  useEffect(() => {
    fetchVisualizationData();
  }, [fetchVisualizationData]);

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

      {/* Visualization Chart */}
      <div className="mt-8 bg-white rounded-xl border border-[#31372B1F] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-[20px] font-bold text-[#31372B]">
            Visualization
          </h2>
          <div className="flex gap-3 flex-wrap">
            {/* Metric Selector */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
              className="px-4 py-2 rounded-lg text-[14px] font-medium border border-[#31372B1F] bg-white hover:bg-[#F5F5F5] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#31372B]"
            >
              <option value="revenue">Revenue</option>
              <option value="creditsUsed">Credits Used</option>
              <option value="creditsAllocated">Credits Allocated</option>
              <option value="activeUsers">Active Users</option>
            </select>

            {/* Duration Selector */}
            <div className="flex gap-2">
              {(["1D", "7D", "28D", "90D", "1Y"] as DurationType[]).map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`px-4 py-2 rounded-lg text-[14px] font-medium transition ${selectedDuration === duration
                      ? "bg-[#31372B] text-white"
                      : "border border-[#31372B1F] hover:bg-[#F5F5F5]"
                    }`}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visualizationData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visualizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis
                dataKey="period"
                stroke="#717182"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#717182"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => {
                  if (selectedMetric === "revenue") {
                    return `$${value}`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                formatter={(value: number) => {
                  if (selectedMetric === "revenue") {
                    return [`$${value.toFixed(2)}`, 'Revenue'];
                  } else if (selectedMetric === "creditsUsed") {
                    return [value, 'Credits Used'];
                  } else if (selectedMetric === "creditsAllocated") {
                    return [value, 'Credits Allocated'];
                  } else {
                    return [value, 'Active Users'];
                  }
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#31372B"
                strokeWidth={2}
                dot={{ fill: '#31372B', r: 4 }}
                activeDot={{ r: 6 }}
                name={
                  selectedMetric === "revenue" ? "Revenue" :
                    selectedMetric === "creditsUsed" ? "Credits Used" :
                      selectedMetric === "creditsAllocated" ? "Credits Allocated" :
                        "Active Users"
                }
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#717182]">No data available for the selected period</p>
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
