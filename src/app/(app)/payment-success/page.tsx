"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthenticatedNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";
import { useCredits } from "@/context/CreditsContext";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

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
          // Map plan type to credits
          const creditMap: { [key: string]: number } = {
            'professional': 60,
            'growth': 300,
            'enterprise': 999999
          };
          setCreditsAdded(creditMap[transaction.plan_type] || 0);
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
          <div className="bg-white border border-[rgba(49,55,43,0.12)] rounded-xl shadow-sm w-full max-w-[520px] p-8 md:p-10 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31372B]"></div>
            </div>
            <div>
              <h1 className="font-[Arial] font-bold text-[#31372B] text-[24px] leading-[36px]">
                Processing Payment...
              </h1>
              <p className="text-[#717182] text-[14px] leading-[20px] mt-2 font-[Arial]">
                Please wait while we verify your transaction
              </p>
            </div>
          </div>
        </main>
      ) : (
        /* Main Section */
        <main className="flex flex-col items-center justify-center flex-grow px-6 py-16 mt-20">
          <div className="bg-white border border-[rgba(49,55,43,0.12)] rounded-xl shadow-sm w-full max-w-[520px] p-8 md:p-10 text-center flex flex-col items-center gap-6">
            {/* Checkmark Icon */}
            <div className="w-20 h-20 flex items-center justify-center bg-[rgba(49,55,43,0.1)] rounded-full">
              <CheckCircle className="w-10 h-10 text-[#31372B]" strokeWidth={2.5} />
            </div>

            {/* Headings */}
            <div>
              <h1 className="font-[Arial] font-bold text-[#31372B] text-[32px] leading-[48px] -tracking-[0.8px]">
                Payment Successful 🎉
              </h1>
              <p className="text-[#717182] text-[16px] leading-[24px] mt-2 font-[Arial]">
                Your credits are now available in your account.
              </p>
            </div>

            {/* Credits Info Box */}
            {creditsAdded !== null && (
              <div className="bg-[rgba(245,245,245,0.3)] rounded-lg p-5 w-full max-w-[460px] text-left flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-[#717182] text-[15px] font-[Arial]">Credits Added:</p>
                  <p className="text-[#31372B] font-[Arial] font-bold text-[15px]">
                    {creditsAdded.toLocaleString()} Credits
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[#717182] text-[15px] font-[Arial]">Remaining Balance:</p>
                  <p className="text-[#31372B] font-[Arial] font-bold text-[15px]">
                    {remainingCredits.toLocaleString()} Credits
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-3 w-full max-w-[460px]">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-[#31372B] text-[#FAF7EE] rounded-md py-2.5 text-[14px] font-[Arial] flex justify-center items-center gap-2 hover:opacity-90 transition flex-1"
              >
                Go to Dashboard →
              </button>
              <button
                onClick={() => router.push("/investors")}
                className="bg-[#FAF7EE] border border-[rgba(49,55,43,0.12)] text-[#31372B] rounded-md py-2.5 text-[14px] font-[Arial] flex justify-center items-center gap-2 hover:bg-[#F5F5F5] transition flex-1"
              >
                Start Browsing Investors →
              </button>
            </div>

            {/* Email Confirmation */}
            <p className="text-[#717182] text-[13px] font-[Arial] mt-1">
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
