"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthenticatedNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";
import { useCredits } from "@/context/CreditsContext";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { creditsForPlanType } from "@/lib/dodo-config";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { credits: remainingCredits } = useCredits();
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      const paymentId = searchParams.get('payment_id');
      const status = searchParams.get('status');

      // Check if payment failed and redirect
      if (status && status !== 'succeeded') {
        router.push(`/payment-failure?payment_id=${paymentId}&status=${status}`);
        return;
      }

      if (!paymentId) {
        // No payment ID, just show current credits
        setCreditsAdded(0);
        setLoading(false);
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch the most recent transaction for this user
        const { data: transaction } = await supabase
          .from('transactions')
          .select('plan_type')
          .eq('user_id', user.id)
          .eq('transaction_id', paymentId)
          .eq('status', 'succeeded')
          .single();

        if (transaction) {
          setCreditsAdded(creditsForPlanType(transaction.plan_type));
        } else {
          setCreditsAdded(0);
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        setCreditsAdded(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7EE]">
      {/* Navbar */}
      <AuthenticatedNavbar />

      {/* Show loader while checking status or fetching data */}
      {loading ? (
        <main className="flex flex-col items-center justify-center flex-grow px-6 py-16 mt-20">
          <div className="bg-white/70 border border-black/[0.06] rounded-3xl shadow-sm w-full max-w-[520px] p-8 md:p-10 text-center flex flex-col items-center gap-6 backdrop-blur-sm">
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1E1E1E] border-t-transparent" />
            </div>
            <div>
              <h1 className="font-space font-bold text-[#1E1E1E] text-[24px] leading-[36px] tracking-[-0.02em]">
                Processing Payment...
              </h1>
              <p className="text-[#6B6B6B] text-[14px] leading-[20px] mt-2 font-inter">
                Please wait while we verify your transaction
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex flex-col items-center justify-center flex-grow px-6 py-16 mt-20">
          <div className="bg-white/70 border border-black/[0.06] rounded-3xl shadow-sm w-full max-w-[520px] p-8 md:p-10 text-center flex flex-col items-center gap-6 backdrop-blur-sm">
            {/* Checkmark Icon */}
            <div className="w-16 h-16 flex items-center justify-center bg-[#C6FF55]/20 rounded-full">
              <CheckCircle className="w-9 h-9 text-[#31372B]" strokeWidth={2} />
            </div>

            {/* Headings */}
            <div>
              <h1 className="font-space font-bold text-[#1E1E1E] text-[28px] leading-[40px] tracking-[-0.02em]">
                Payment Successful 🎉
              </h1>
              <p className="text-[#6B6B6B] text-[15px] leading-[24px] mt-2 font-inter">
                Your credits are now available in your account.
              </p>
            </div>

            {/* Credits Info Box */}
            {creditsAdded !== null && (
              <div className="bg-black/[0.03] rounded-2xl p-5 w-full text-left flex flex-col gap-3 border border-black/[0.05]">
                <div className="flex justify-between items-center">
                  <p className="text-[#6B6B6B] text-[14px] font-inter">Credits Added:</p>
                  <p className="text-[#1E1E1E] font-inter font-bold text-[14px]">
                    {creditsAdded.toLocaleString()} Credits
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[#6B6B6B] text-[14px] font-inter">Remaining Balance:</p>
                  <p className="text-[#1E1E1E] font-inter font-bold text-[14px]">
                    {remainingCredits.toLocaleString()} Credits
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-[#1E1E1E] text-white rounded-full py-2.5 text-[14px] font-inter font-semibold flex justify-center items-center gap-2 hover:bg-[#333] transition flex-1 cursor-pointer"
              >
                Go to Dashboard →
              </button>
              <button
                onClick={() => router.push("/investors")}
                className="bg-white border border-black/[0.10] text-[#31372B] rounded-full py-2.5 text-[14px] font-inter font-medium flex justify-center items-center gap-2 hover:bg-black/[0.04] transition flex-1 cursor-pointer"
              >
                Browse Investors →
              </button>
            </div>

            {/* Email Confirmation */}
            <p className="text-[#6B6B6B] text-[12px] font-inter">
              An email receipt has been sent to your registered email address.
            </p>
          </div>
        </main>
      )}


      {/* Footer */}
      <Footer />
    </div>
  );
}
