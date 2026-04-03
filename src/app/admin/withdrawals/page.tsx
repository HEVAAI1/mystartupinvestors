"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock, DollarSign } from "lucide-react";

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
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/withdrawals");
            const data = await res.json();
            setRequests(data.withdrawals || []);
        } catch (error) {
            console.error("Failed to fetch withdrawals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, action: "approve" | "reject" | "mark-paid") => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/withdrawals/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (res.ok) {
                await fetchRequests();
            } else {
                const error = await res.json();
                alert(error.error || "Action failed");
            }
        } catch (error) {
            console.error("Action error:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "approved": return "text-blue-600 bg-blue-50 border-blue-200";
            case "paid": return "text-green-600 bg-green-50 border-green-200";
            case "rejected": return "text-red-600 bg-red-50 border-red-200";
            default: return "text-gray-600 bg-gray-50 border-gray-200";
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

            <div className="bg-white rounded-xl border border-[#31372B1F] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FAF7EE] border-b border-[#31372B1F]">
                                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider">Affiliate Code</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[12px] font-bold text-[#717182] uppercase tracking-wider text-right">Actions</th>
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
                                                {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                            <span className={`px-3 py-1 rounded-full text-[12px] font-bold border ${getStatusColor(request.status)}`}>
                                                {request.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {request.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(request.id, "approve")}
                                                            disabled={processingId !== null}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
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
                                                        Processed on {request.processed_at ? new Date(request.processed_at).toLocaleDateString() : 'N/A'}
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
