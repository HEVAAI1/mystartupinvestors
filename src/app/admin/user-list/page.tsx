"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  credits_allocated: number;
  credits_used: number;
  startup_form_submitted: boolean;
  created_at: string;
  last_login: string;
}

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.plan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-[#717182]">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[32px] font-bold text-[#31372B] mb-2">
          User List
        </h1>
        <p className="text-[16px] text-[#717182]">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or plan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-[#31372B1F] rounded-lg outline-none focus:ring-2 focus:ring-[#31372B] text-[14px]"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#31372B1F] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F5F5] border-b border-[#31372B1F]">
              <tr>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Used
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Startup Form
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#31372B] uppercase tracking-wider">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#31372B1F]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#F5F5F5] transition">
                  <td className="px-6 py-4 text-[14px] text-[#31372B] font-medium">
                    {user.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#717182]">
                    {user.email || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[12px] font-medium ${user.plan === "premium"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                      }`}>
                      {user.plan || "free"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#717182]">
                    {user.credits_allocated || 0}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#717182]">
                    {user.credits_used || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[12px] font-medium ${user.startup_form_submitted
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                      }`}>
                      {user.startup_form_submitted ? "Submitted" : "Not Submitted"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#717182]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#717182]">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#717182]">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
