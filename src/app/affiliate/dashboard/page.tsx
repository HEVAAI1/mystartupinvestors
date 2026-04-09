"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MIN_AFFILIATE_WITHDRAWAL_USD } from "@/lib/affiliate-constants";
import Footer from "@/components/Footer";

type Affiliate = {
  id: string;
  referral_code: string;
  total_earned: string;
  total_paid: string;
  pending_earnings: string;
  awaiting_withdrawal: string;
  referral_count: number;
};

type Commission = {
  id: string;
  amount: number;
  commission_amount: number;
  status: "pending" | "paid";
  created_at: string;
  payment_id: string;
};

type Withdrawal = {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  created_at: string;
};

type WithdrawalForm = {
  name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  contact_number: string;
  email_id: string;
  country: string;
  additional_details: string;
};

type Toast = { message: string; type: "success" | "error" };

function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white transition-all animate-fade-in ${toast.type === "success" ? "bg-[#31372B]" : "bg-red-600"}`}>
      {toast.type === "success" ? "✅ " : "❌ "}{toast.message}
    </div>
  );
}

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [copied, setCopied] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState<WithdrawalForm>({
    name: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    contact_number: "",
    email_id: "",
    country: "",
    additional_details: "",
  });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  const referralLink = affiliate
    ? `https://myfundinglist.com?ref=${affiliate.referral_code}`
    : "";

  const pendingBalance = affiliate ? parseFloat(affiliate.pending_earnings || "0") : 0;
  const awaitingWithdrawal = affiliate
    ? parseFloat(affiliate.awaiting_withdrawal || "0")
    : 0;
  const availableToWithdraw = Math.max(0, pendingBalance - awaitingWithdrawal);
  const canRequestWithdrawal = availableToWithdraw >= MIN_AFFILIATE_WITHDRAWAL_USD;

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const [dashRes, commRes, wdRes] = await Promise.all([
      fetch("/api/affiliate/dashboard"),
      fetch("/api/affiliate/commissions"),
      fetch("/api/affiliate/withdraw"),
    ]);

    const dashJson = await dashRes.json();
    const commJson = commRes.ok ? await commRes.json() : { commissions: [] };
    const wdJson = wdRes.ok ? await wdRes.json() : { withdrawals: [] };

    setAffiliate(dashJson.affiliate || null);
    setCommissions(commJson.commissions || []);
    setWithdrawals(wdJson.withdrawals || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleRegister = async () => {
    setRegistering(true);
    const res = await fetch("/api/affiliate/register", { method: "POST" });
    const json = await res.json();
    if (json.affiliate) {
      await fetchDashboard();
      showToast("Welcome to the affiliate program!");
    } else {
      showToast("Failed to register. Please try again.", "error");
    }
    setRegistering(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      showToast("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      showToast("Please enter a valid amount.", "error");
      return;
    }
    if (availableToWithdraw < MIN_AFFILIATE_WITHDRAWAL_USD) {
      showToast(
        `You need at least $${MIN_AFFILIATE_WITHDRAWAL_USD} available to withdraw (after open requests).`,
        "error"
      );
      return;
    }
    if (amount < MIN_AFFILIATE_WITHDRAWAL_USD) {
      showToast(`Minimum withdrawal is $${MIN_AFFILIATE_WITHDRAWAL_USD}.`, "error");
      return;
    }
    if (amount > availableToWithdraw) {
      showToast(`Max you can withdraw is $${availableToWithdraw.toFixed(2)}`, "error");
      return;
    }

    if (
      !withdrawForm.name.trim() ||
      !withdrawForm.account_number.trim() ||
      !withdrawForm.ifsc_code.trim() ||
      !withdrawForm.account_holder_name.trim() ||
      !withdrawForm.contact_number.trim() ||
      !withdrawForm.email_id.trim() ||
      !withdrawForm.country.trim()
    ) {
      showToast("Please fill all required withdrawal details.", "error");
      return;
    }

    setWithdrawing(true);
    const res = await fetch("/api/affiliate/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, ...withdrawForm }),
    });
    const json = await res.json();
    if (res.ok) {
      showToast("Withdrawal request submitted!");
      setWithdrawAmount("");
      setWithdrawForm({
        name: "",
        account_number: "",
        ifsc_code: "",
        account_holder_name: "",
        contact_number: "",
        email_id: "",
        country: "",
        additional_details: "",
      });
      await fetchDashboard();
    } else {
      showToast(json.error || "Failed to submit request.", "error");
    }
    setWithdrawing(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return `inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${map[status] || "bg-gray-100 text-gray-700"}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#31372B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7EE]">
      {toast && <ToastNotification toast={toast} onDismiss={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto px-4 pt-32 pb-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#31372B] font-funnel-display mb-1">
            Affiliate Dashboard
          </h1>
          <p className="text-[#717182] text-sm">
            Earn 25% on every payment from people you refer — for life.
          </p>
        </div>

        {/* Not an affiliate yet */}
        {!affiliate ? (
          <div className="bg-white border border-[#31372B]/10 rounded-2xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">💸</div>
            <h2 className="text-2xl font-bold text-[#31372B] font-funnel-display mb-2">
              Become an Affiliate
            </h2>
            <p className="text-[#717182] text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Join our affiliate program to get your unique referral link and start earning
              25% lifetime commissions on every successful payment.
            </p>
            <button
              onClick={handleRegister}
              disabled={registering}
              className="bg-[#31372B] text-[#FAF7EE] font-bold px-8 py-3 rounded-xl hover:bg-black transition disabled:opacity-50 cursor-pointer"
            >
              {registering ? "Setting up..." : "Get My Referral Link →"}
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {(
                [
                  { label: "Total Earned", value: `$${Number(affiliate.total_earned).toFixed(2)}`, color: "text-[#31372B]" },
                  { label: "Pending", value: `$${Number(affiliate.pending_earnings).toFixed(2)}`, color: "text-amber-600", hint: "Not yet paid out" },
                  { label: "Awaiting Withdrawal", value: `$${awaitingWithdrawal.toFixed(2)}`, color: "text-violet-700", hint: "Pending / approved requests" },
                  { label: "Paid Out", value: `$${Number(affiliate.total_paid).toFixed(2)}`, color: "text-green-600" },
                  { label: "Referrals", value: String(affiliate.referral_count), color: "text-blue-600" },
                ] as const
              ).map((stat) => (
                <div key={stat.label} className="bg-white border border-[#31372B]/10 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-[#717182] font-medium mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold font-funnel-display ${stat.color}`}>{stat.value}</p>
                  {"hint" in stat ? (
                    <p className="text-[10px] text-[#717182] mt-1 leading-tight">{stat.hint}</p>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Referral Link */}
            <div className="bg-white border border-[#31372B]/10 rounded-2xl p-6 mb-6 shadow-sm">
              <h2 className="text-base font-bold text-[#31372B] mb-3">Your Referral Link</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-[#FAF7EE] border border-[#31372B]/10 rounded-lg px-4 py-3 text-sm text-[#31372B] font-mono break-all select-all">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-5 py-3 rounded-lg font-bold text-sm transition cursor-pointer shrink-0 ${copied ? "bg-[#C6FF55] text-[#31372B]" : "bg-[#31372B] text-[#FAF7EE] hover:bg-black"}`}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <p className="text-xs text-[#717182] mt-3">
                Share this link. Anyone who signs up and pays within 24 hours of clicking it will be attributed to you — forever.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Withdrawal request */}
              <div className="bg-white border border-[#31372B]/10 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#31372B] mb-1">Request Withdrawal</h2>
                <p className="text-xs text-[#717182] mb-2">
                  Available to request:{" "}
                  <span className="font-bold text-[#31372B]">${availableToWithdraw.toFixed(2)}</span>
                  {awaitingWithdrawal > 0 && (
                    <span className="block mt-1 text-[#717182]">
                      (Pending balance ${pendingBalance.toFixed(2)} − ${awaitingWithdrawal.toFixed(2)} in open withdrawal
                      {awaitingWithdrawal === 1 ? " request" : " requests"})
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#717182] mb-4">
                  Minimum withdrawal: <span className="font-bold text-[#31372B]">${MIN_AFFILIATE_WITHDRAWAL_USD}</span>
                  {" "}— you need at least that much available, and each request must be for at least that amount.
                </p>
                {!canRequestWithdrawal && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                    Reach <span className="font-bold">${MIN_AFFILIATE_WITHDRAWAL_USD}</span> in available balance to submit a withdrawal request.
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min={MIN_AFFILIATE_WITHDRAWAL_USD}
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Amount (min $${MIN_AFFILIATE_WITHDRAWAL_USD})`}
                      disabled={!canRequestWithdrawal}
                      className="flex-1 border border-[#31372B]/20 rounded-lg px-4 py-2.5 text-sm text-[#31372B] bg-[#FAF7EE] focus:outline-none focus:ring-2 focus:ring-[#31372B]/30 disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={withdrawForm.name}
                      onChange={(e) => setWithdrawForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Name *"
                      disabled={!canRequestWithdrawal}
                      className="border border-[#31372B]/20 rounded-lg px-4 py-2.5 text-sm bg-[#FAF7EE] focus:outline-none focus:ring-2 focus:ring-[#31372B]/30 disabled:opacity-50"
                    />
                    <input
                      value={withdrawForm.account_holder_name}
                      onChange={(e) =>
                        setWithdrawForm((p) => ({ ...p, account_holder_name: e.target.value }))
                      }
                      placeholder="Account Holder Name *"
                      disabled={!canRequestWithdrawal}
                      className="border border-[#31372B]/20 rounded-lg px-4 py-2.5 text-sm bg-[#FAF7EE] focus:outline-none focus:ring-2 focus:ring-[#31372B]/30 disabled:opacity-50"
                    />
                    <input
                      value={withdrawForm.account_number}
                      onChange={(e) =>
                        setWithdrawForm((p) => ({ ...p, account_number: e.target.value }))
                      }
                      placeholder="Account Number *"
                      disabled={!canRequestWithdrawal}
                      className="border border-[#31372B]/20 rounded-lg px-4 py-2.5 text-sm bg-[#FAF7EE] focus:outline-none focus:ring-2 focus:ring-[#31372B]/30 disabled:opacity-50"
                    />
                    <input
                      value={withdrawForm.ifsc_code}
                      onChange={(e) => setWithdrawForm((p) => ({ ...p, ifsc_code: e.target.value }))}
                      placeholder="IFSC Code *"
                      disabled={!canRequestWithdrawal}
                      className="border border-[#31372B]/20 rounded-lg px-4 py-2.5 text-sm bg-[#FAF7EE] focus:outline-none focus:ring-2 focus:ring-[#31372B]/30 disabled:opacity-50"
                    />
                    <input
                      value={withdrawForm.contact_number}
                      onChange={(e) =>
                        setWithdrawForm((p) => ({ ...p, contact_number: e.target.value }))
                      }
                      placeholder="Contact Number (WhatsApp preferred) *"
                      disabled={!canRequestWithdrawal}
                      className="border border-[#31372B]/20 rounded-lg px-4 py-2.5 text-sm bg-[#FAF7EE] focus:outline-none focus:ring-2 focus:ring-[#31372B]/30 disabled:opacity-50 sm:col-span-2"
                    />
                    <input
                      value={withdrawForm.email_id}
                      onChange={(e) => setWithdrawForm((p) => ({ ...p, email_id: e.target.value }))}
                      placeholder="Email ID *"
                      disabled={!canRequestWithdrawal}
                      className="border border-[#31372B]/20 rounded-lg px-4 py-2.5 text-sm bg-[#FAF7EE] focus:outline-none focus:ring-2 focus:ring-[#31372B]/30 disabled:opacity-50"
                    />
                    <input
                      value={withdrawForm.country}
                      onChange={(e) => setWithdrawForm((p) => ({ ...p, country: e.target.value }))}
                      placeholder="Country *"
                      disabled={!canRequestWithdrawal}
                      className="border border-[#31372B]/20 rounded-lg px-4 py-2.5 text-sm bg-[#FAF7EE] focus:outline-none focus:ring-2 focus:ring-[#31372B]/30 disabled:opacity-50"
                    />
                    <textarea
                      value={withdrawForm.additional_details}
                      onChange={(e) =>
                        setWithdrawForm((p) => ({ ...p, additional_details: e.target.value }))
                      }
                      placeholder="Additional Details (optional)"
                      disabled={!canRequestWithdrawal}
                      rows={3}
                      className="border border-[#31372B]/20 rounded-lg px-4 py-2.5 text-sm bg-[#FAF7EE] focus:outline-none focus:ring-2 focus:ring-[#31372B]/30 disabled:opacity-50 sm:col-span-2"
                    />
                  </div>

                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing || !withdrawAmount || !canRequestWithdrawal}
                    className="bg-[#31372B] text-[#FAF7EE] font-bold px-4 py-2.5 rounded-lg text-sm hover:bg-black transition disabled:opacity-40 cursor-pointer"
                  >
                    {withdrawing ? "..." : "Submit Withdrawal Request"}
                  </button>
                </div>
              </div>

              {/* Withdrawal history */}
              <div className="bg-white border border-[#31372B]/10 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#31372B] mb-4">Withdrawal History</h2>
                {withdrawals.length === 0 ? (
                  <p className="text-sm text-[#717182]">No withdrawals yet.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="flex justify-between items-center text-sm py-2 border-b border-[#31372B]/5 last:border-0">
                        <div>
                          <span className="font-bold text-[#31372B]">${Number(w.amount).toFixed(2)}</span>
                          <span className="text-[#717182] text-xs ml-2">
                            {new Date(w.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={statusBadge(w.status)}>{w.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Commissions table */}
            <div className="bg-white border border-[#31372B]/10 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#31372B] mb-4">Commission History</h2>
              {commissions.length === 0 ? (
                <div className="text-center py-10 text-[#717182] text-sm">
                  <div className="text-3xl mb-3">🔗</div>
                  Start sharing your link to earn commissions.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#31372B]/10">
                        <th className="text-left text-xs font-bold text-[#717182] py-2 pr-4">Date</th>
                        <th className="text-left text-xs font-bold text-[#717182] py-2 pr-4">Payment</th>
                        <th className="text-right text-xs font-bold text-[#717182] py-2 pr-4">Amount</th>
                        <th className="text-right text-xs font-bold text-[#717182] py-2 pr-4">Commission</th>
                        <th className="text-right text-xs font-bold text-[#717182] py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((c) => (
                        <tr key={c.id} className="border-b border-[#31372B]/5 last:border-0 hover:bg-[#FAF7EE]/50 transition">
                          <td className="py-3 pr-4 text-[#717182]">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 pr-4 text-[#31372B] font-mono text-xs">
                            {c.payment_id ? `...${c.payment_id.slice(-8)}` : "—"}
                          </td>
                          <td className="py-3 pr-4 text-right text-[#31372B] font-medium">
                            ${Number(c.amount).toFixed(2)}
                          </td>
                          <td className="py-3 pr-4 text-right font-bold text-[#31372B]">
                            +${Number(c.commission_amount).toFixed(2)}
                          </td>
                          <td className="py-3 text-right">
                            <span className={statusBadge(c.status)}>{c.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-[#717182] hover:text-[#31372B] transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
      `}</style>

      <Footer/>
    </div>
  );
}
