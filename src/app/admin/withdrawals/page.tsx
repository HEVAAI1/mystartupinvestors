"use client";

import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useCallback, useEffect, useState } from "react";
import { Check, DollarSign, X } from "lucide-react";

type WithdrawalRequest = {
  id: string;
  affiliate_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  created_at: string;
  processed_at: string | null;
  affiliates: {
    referral_code: string;
    total_earned: number;
    total_paid: number;
    user_id: string;
  };
};

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoadError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: rows, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const list = rows ?? [];
      const affiliateIds = [...new Set(list.map((r) => r.affiliate_id).filter(Boolean))] as string[];

      let affById: Record<
        string,
        { referral_code: string; total_earned: number; total_paid: number; user_id: string }
      > = {};

      if (affiliateIds.length > 0) {
        const { data: affiliates, error: affErr } = await supabase
          .from("affiliates")
          .select("id, referral_code, total_earned, total_paid, user_id")
          .in("id", affiliateIds);

        if (affErr) throw affErr;
        affById = Object.fromEntries(
          (affiliates ?? []).map((a) => [a.id as string, a])
        );
      }

      setRequests(
        list.map((r) => ({
          ...r,
          affiliates:
            affById[r.affiliate_id as string] ?? {
              referral_code: "—",
              total_earned: 0,
              total_paid: 0,
              user_id: "",
            },
        })) as WithdrawalRequest[]
      );
    } catch (e) {
      console.error(e);
      setLoadError(
        e instanceof Error ? e.message : "Could not load withdrawals (check Supabase access)."
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, action: "approve" | "reject" | "mark-paid") => {
    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      "mark-paid": "paid",
    };
    const newStatus = statusMap[action] as WithdrawalRequest["status"];

    setProcessingId(id);
    try {
      const supabase = createSupabaseBrowserClient();

      const { data: withdrawal, error: fetchErr } = await supabase
        .from("withdrawal_requests")
        .select("id, affiliate_id, amount, status")
        .eq("id", id)
        .maybeSingle();

      if (fetchErr || !withdrawal) {
        alert(fetchErr?.message || "Withdrawal not found");
        return;
      }

      const { error: updateErr } = await supabase
        .from("withdrawal_requests")
        .update({ status: newStatus, processed_at: new Date().toISOString() })
        .eq("id", id);

      if (updateErr) {
        alert(updateErr.message);
        return;
      }

      if (action === "mark-paid") {
        const { data: affiliate, error: affFetchErr } = await supabase
          .from("affiliates")
          .select("total_paid")
          .eq("id", withdrawal.affiliate_id)
          .single();

        if (!affFetchErr && affiliate) {
          const newTotalPaid =
            Number(affiliate.total_paid) + Number(withdrawal.amount);
          await supabase
            .from("affiliates")
            .update({ total_paid: newTotalPaid })
            .eq("id", withdrawal.affiliate_id);

          await supabase
            .from("commissions")
            .update({ status: "paid" })
            .eq("affiliate_id", withdrawal.affiliate_id)
            .eq("status", "pending");
        }
      }

      await fetchRequests();
    } catch (error) {
      console.error("Action error:", error);
      alert("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "approved":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "paid":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#31372B]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#31372B]">Withdrawal Requests</h1>
        <p className="text-[#717182] mt-1">Manage affiliate payout requests</p>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#31372B1F] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7EE] border-b border-[#31372B1F]">
                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider">
                  Affiliate Code
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#31372B1F]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#717182]">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-[14px] text-[#31372B]">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[12px] text-[#717182]">
                        {new Date(request.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[14px] bg-[#EDF4E5] px-2 py-1 rounded text-[#31372B]">
                        {request.affiliates.referral_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[16px] font-bold text-[#31372B]">
                        ${Number(request.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[12px] font-bold border ${getStatusColor(request.status)}`}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {request.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAction(request.id, "approve")}
                              disabled={processingId !== null}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(request.id, "reject")}
                              disabled={processingId !== null}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        {request.status === "approved" && (
                          <button
                            type="button"
                            onClick={() => handleAction(request.id, "mark-paid")}
                            disabled={processingId !== null}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[14px] font-bold"
                          >
                            <DollarSign size={16} />
                            Mark as Paid
                          </button>
                        )}
                        {(request.status === "paid" || request.status === "rejected") && (
                          <span className="text-[12px] text-[#717182] italic">
                            Processed on{" "}
                            {request.processed_at
                              ? new Date(request.processed_at).toLocaleDateString()
                              : "N/A"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
