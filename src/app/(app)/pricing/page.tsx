"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<"professional" | "growth" | "enterprise">("growth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = [
    {
      id: "professional",
      title: "Professional",
      price: "$19",
      credits: "Receive 60 Tool and Investor Contact Credits",
      description: "Unlock verified contacts",
      popular: true,
      product_id: "pdt_0NbbbqCdfuGTpxX9KDNwm",
    },
    {
      id: "growth",
      title: "Growth",
      price: "$99",
      credits: "Receive 300 Tool and Investor Contact Credits",
      description: "Scale your outreach",
      product_id: "pdt_0NbbbrHJcVDJqitCUkpjt",
    },
    {
      id: "enterprise",
      title: "Enterprise",
      price: "$999",
      credits: "Receive 4,000 Tool and Investor Contact Credits",
      description: "For serious fundraisers",
      product_id: "pdt_0NbbbqfeSmy9PD46q3jf3",
    },
  ];

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in to continue");
        return;
      }

      // Get selected plan details
      const selectedPlanDetails = plans.find(p => p.id === selectedPlan);
      if (!selectedPlanDetails) {
        setError("Please select a plan");
        return;
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: selectedPlanDetails.product_id,
          user_id: user.id,
        }),
      });

      const data = await response.json();
      console.log("FULL BACKEND RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          `${data.error}\nRequestId: ${data.requestId}\nLogs:\n${JSON.stringify(data.logs, null, 2)}`
        );
      }

      // Redirect to Dodo Payments checkout
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col font-inter">
      {/* Navbar rendered by layout */}

      {/* Main Content */}
      <main className="flex flex-col items-center w-full mt-24 px-6 md:px-0 mb-20">
        <div className="max-w-[1100px] flex flex-col items-center gap-12 w-full">
          {/* Heading */}
          <div className="text-center">
            <h1 className="font-space font-bold text-[36px] md:text-[42px] leading-tight text-[#1E1E1E] tracking-[-0.03em]">
              Choose Your Credit Pack
            </h1>
            <p className="text-[#6B6B6B] text-[17px] font-inter mt-3">
              Pay once, use credits anytime. No subscriptions, no hidden fees.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as "professional" | "growth" | "enterprise")}
                className={`relative flex flex-col justify-between rounded-3xl border p-7 w-full cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? "border-[#C6FF55] bg-white shadow-xl shadow-[#C6FF55]/10"
                    : "border-black/[0.06] bg-white/60 backdrop-blur-sm hover:border-[#C6FF55]/30 hover:shadow-lg"
                }`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C6FF55] text-[#1E1E1E] text-[11px] rounded-full px-4 py-1 font-inter font-bold whitespace-nowrap flex items-center gap-1">
                    ⚡ MOST POPULAR
                  </div>
                )}

                {/* Radio circle */}
                <div
                  className={`absolute top-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPlan === plan.id ? "bg-[#1E1E1E] border-[#1E1E1E]" : "border-black/[0.15]"
                  }`}
                >
                  {selectedPlan === plan.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                {/* Title & Price */}
                <div>
                  <p className="font-inter font-semibold text-sm text-[#6B6B6B]">{plan.title}</p>
                  <p className="font-space font-bold text-[36px] text-[#1E1E1E] mt-2 tracking-[-0.02em]">
                    {plan.price}
                  </p>
                  <p className="text-[#6B6B6B] font-inter text-[13px] mt-1">{plan.description}</p>
                  <span className="inline-block bg-black/[0.05] border border-black/[0.06] text-[#31372B] text-[11px] font-inter px-3 py-1 rounded-full mt-4">
                    {plan.credits}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Card */}
          <div className="bg-white/70 border border-black/[0.06] rounded-3xl w-full p-8 shadow-sm backdrop-blur-sm">
            <form className="flex flex-col gap-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-[14px] font-inter">
                  {error}
                </div>
              )}

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="bg-[#1E1E1E] text-white py-3.5 rounded-2xl text-[15px] font-inter font-semibold flex items-center justify-center gap-2 hover:bg-[#333] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-black/10"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Proceed to Checkout →</>
                )}
              </button>

              <p className="text-center text-[#6B6B6B] text-[13px] font-inter">
                Your payment is secure and encrypted
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
