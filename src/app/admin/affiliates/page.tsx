"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminAffiliates, getAdminUsers } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type AffiliateRow = {
  id: string;
  user_id: string;
  referral_code: string;
  total_earned: number;
  total_paid: number;
  pending_earnings: number;
  referral_count: number;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
};

export default function AdminAffiliatesPage() {
  const [rows, setRows] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAffiliates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const affResult = await getAdminAffiliates();
      const affiliates = affResult.data ?? [];

      const userIds = [...new Set(affiliates.map((a: any) => a.user_id).filter(Boolean))] as string[];

      let usersById: Record<string, { email: string | null; name: string | null }> = {};
      if (userIds.length > 0) {
        const usersResult = await getAdminUsers();
        const users = usersResult.data ?? [];
        usersById = Object.fromEntries(
          users.filter((u: any) => userIds.includes(u.id)).map((u: any) => [u.id, { email: u.email, name: u.name }])
        );
      }

      setRows(
        affiliates.map((a: any) => {
          const uid = a.user_id;
          const u = usersById[uid];
          const earned = Number(a.total_earned);
          const paid = Number(a.total_paid);
          return {
            id: a.id,
            user_id: uid,
            referral_code: a.referral_code,
            total_earned: earned,
            total_paid: paid,
            pending_earnings: earned - paid,
            referral_count: 0,
            created_at: a.created_at,
            user_email: u?.email ?? null,
            user_name: u?.name ?? null,
          };
        })
      );
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Failed to load affiliates (check Supabase access)."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

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
        <h1 className="text-2xl font-bold text-[#31372B]">Affiliates</h1>
        <p className="text-[#717182] mt-1">
          Referral codes, earnings, and linked user accounts
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#31372B1F] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#FAF7EE] border-b border-[#31372B1F]">
                <th className="px-4 py-3 text-[12px] font-bold text-[#717182] uppercase tracking-wider">
                  Referral code
                </th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#717182] uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#717182] uppercase tracking-wider text-right">
                  Referrals
                </th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#717182] uppercase tracking-wider text-right">
                  Total earned
                </th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#717182] uppercase tracking-wider text-right">
                  Pending
                </th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#717182] uppercase tracking-wider text-right">
                  Paid out
                </th>
                <th className="px-4 py-3 text-[12px] font-bold text-[#717182] uppercase tracking-wider">
                  Since
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#31372B1F]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#717182]">
                    No affiliates yet.
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[13px] bg-[#EDF4E5] px-2 py-1 rounded text-[#31372B]">
                        {a.referral_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[14px] text-[#31372B] font-medium">
                        {a.user_name || "—"}
                      </div>
                      <div className="text-[12px] text-[#717182] break-all">
                        {a.user_email || a.user_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[14px] text-[#31372B] font-medium">
                      {a.referral_count}
                    </td>
                    <td className="px-4 py-3 text-right text-[14px] font-bold text-[#31372B]">
                      ${a.total_earned.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-[14px] text-amber-700 font-medium">
                      ${a.pending_earnings.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-[14px] text-green-700 font-medium">
                      ${a.total_paid.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#717182] whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
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
