"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { X } from "lucide-react";

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

interface StartupDetails {
  full_name: string;
  email: string;
  phone: string;
  linkedin: string;
  city: string;
  company_name: string;
  designation: string;
  company_website: string;
  profile: string;
  industry: string;
  current_arr: string;
  looking_to_raise: string;
  pre_money_valuation: string;
  funding_status: string;
  previous_funding_amount: string;
  referral_source: string;
  additional_notes: string;
  deck_url: string | null;
}

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [startupDetails, setStartupDetails] = useState<StartupDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalUserName, setModalUserName] = useState("");

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

  const handleOpenStartupModal = async (userId: string, userName: string) => {
    setModalUserName(userName);
    setModalOpen(true);
    setModalLoading(true);
    setStartupDetails(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("startup_leads")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching startup details:", error);
      } else {
        setStartupDetails(data);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setModalLoading(false);
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
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
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
                    {user.startup_form_submitted ? (
                      <button
                        onClick={() => handleOpenStartupModal(user.id, user.name || "Unknown")}
                        className="px-2 py-1 rounded-md text-[12px] font-medium bg-green-100 text-green-800 hover:bg-green-200 transition cursor-pointer underline-offset-2 hover:underline"
                      >
                        Submitted
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-md text-[12px] font-medium bg-gray-100 text-gray-800">
                        Not Submitted
                      </span>
                    )}
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

        {/* Mobile View - Cards */}
        <div className="md:hidden flex flex-col divide-y divide-[#31372B1F]">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 hover:bg-[#F5F5F5] transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[#31372B] font-semibold text-[16px]">{user.name || "N/A"}</h3>
                  <p className="text-[#717182] text-[14px] truncate max-w-[200px]">{user.email || "N/A"}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap ${user.plan === "premium"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
                  }`}>
                  {user.plan || "free"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[12px] text-[#717182]">Credits</p>
                  <p className="text-[14px] text-[#31372B] font-medium">
                    {user.credits_used || 0} / {user.credits_allocated || 0}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-[#717182]">Startup Form</p>
                  {user.startup_form_submitted ? (
                    <button
                      onClick={() => handleOpenStartupModal(user.id, user.name || "Unknown")}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium inline-block mt-1 bg-green-100 text-green-800 hover:bg-green-200 transition cursor-pointer hover:underline underline-offset-2"
                    >
                      Submitted
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium inline-block mt-1 bg-gray-100 text-gray-800">
                      Not Submitted
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[12px] text-[#717182]">Joined</p>
                  <p className="text-[14px] text-[#31372B]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-[#717182]">Last Login</p>
                  <p className="text-[14px] text-[#31372B]">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#717182]">No users found</p>
          </div>
        )}
      </div>

      {/* Startup Details Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col z-10 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#31372B1F] shrink-0">
              <div>
                <h2 className="text-[20px] font-bold text-[#31372B]">Startup Details</h2>
                <p className="text-[13px] text-[#717182]">{modalUserName}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-[#F5F5F5] transition text-[#31372B]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {modalLoading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-[#717182]">Loading startup details...</p>
                </div>
              ) : !startupDetails ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-[#717182]">No startup details found.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Personal */}
                  <section>
                    <h3 className="text-[14px] font-bold text-[#31372B] uppercase tracking-wider mb-3">Personal Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: "Name", value: startupDetails.full_name },
                        { label: "Email", value: startupDetails.email },
                        { label: "Phone", value: startupDetails.phone },
                        { label: "LinkedIn", value: startupDetails.linkedin },
                        { label: "City", value: startupDetails.city },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-[#F5F5F5] rounded-lg px-4 py-3">
                          <p className="text-[11px] text-[#717182] font-semibold uppercase tracking-wide mb-1">{label}</p>
                          <p className="text-[13px] text-[#31372B] break-all">{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <hr className="border-[#31372B1F]" />

                  {/* Startup */}
                  <section>
                    <h3 className="text-[14px] font-bold text-[#31372B] uppercase tracking-wider mb-3">Startup Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: "Company Name", value: startupDetails.company_name },
                        { label: "Designation", value: startupDetails.designation },
                        { label: "Company Website", value: startupDetails.company_website },
                        { label: "Profile", value: startupDetails.profile },
                        { label: "Industry", value: startupDetails.industry },
                        { label: "Current ARR", value: startupDetails.current_arr },
                        { label: "Looking to Raise", value: startupDetails.looking_to_raise },
                        { label: "Pre-Money Valuation", value: startupDetails.pre_money_valuation },
                        { label: "Funding Status", value: startupDetails.funding_status },
                        { label: "Previous Funding Amount", value: startupDetails.previous_funding_amount },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-[#F5F5F5] rounded-lg px-4 py-3">
                          <p className="text-[11px] text-[#717182] font-semibold uppercase tracking-wide mb-1">{label}</p>
                          <p className="text-[13px] text-[#31372B]">{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <hr className="border-[#31372B1F]" />

                  {/* Additional */}
                  <section>
                    <h3 className="text-[14px] font-bold text-[#31372B] uppercase tracking-wider mb-3">Additional Information</h3>
                    <div className="space-y-3">
                      <div className="bg-[#F5F5F5] rounded-lg px-4 py-3">
                        <p className="text-[11px] text-[#717182] font-semibold uppercase tracking-wide mb-1">Referral Source</p>
                        <p className="text-[13px] text-[#31372B]">{startupDetails.referral_source || "—"}</p>
                      </div>
                      <div className="bg-[#F5F5F5] rounded-lg px-4 py-3">
                        <p className="text-[11px] text-[#717182] font-semibold uppercase tracking-wide mb-1">Additional Notes</p>
                        <p className="text-[13px] text-[#31372B] whitespace-pre-wrap">{startupDetails.additional_notes || "—"}</p>
                      </div>
                      {startupDetails.deck_url && (
                        <div className="bg-[#F5F5F5] rounded-lg px-4 py-3">
                          <p className="text-[11px] text-[#717182] font-semibold uppercase tracking-wide mb-1">Pitch Deck</p>
                          <a
                            href={startupDetails.deck_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-[#31372B] hover:underline font-semibold"
                          >
                            View Pitch Deck →
                          </a>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
