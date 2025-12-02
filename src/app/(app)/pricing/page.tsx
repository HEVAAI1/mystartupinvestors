"use client";

import Image from "next/image";
import AuthenticatedNavbar from "@/components/Navbar";
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
      price: "$15",
      credits: "60 Credits",
      description: "Unlock verified contacts",
      popular: true,
      product_id: "pdt_UQVM7C1CCtMCSP1MFCx9m",
    },
    {
      id: "growth",
      title: "Growth",
      price: "$49",
      credits: "300 Credits",
      description: "Scale your outreach",
      product_id: "pdt_cPLJVSbDTlp397NpGKoS4",
    },
    {
      id: "enterprise",
      title: "Enterprise",
      price: "$999",
      credits: "Unlimited",
      description: "For serious fundraisers",
      product_id: "pdt_vNXSWmxxgNRt1TzHQZDni",
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
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
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col">
      {/* Navbar */}
      <AuthenticatedNavbar />

      {/* Main Content */}
      <main className="flex flex-col items-center w-full mt-24 px-6 md:px-0 mb-20">
        <div className="max-w-[1200px] flex flex-col items-center gap-12 w-full">
          {/* Heading */}
          <div className="text-center">
            <h1 className="font-bold text-[40px] leading-[60px] text-[#31372B] -tracking-[1px] font-[Arial]">
              Choose Your Credit Pack
            </h1>
            <p className="text-[#717182] text-[18px] leading-[27px] font-[Arial] mt-2">
              Pay once, use credits anytime. No subscriptions, no hidden fees.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-items-center">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as "professional" | "growth" | "enterprise")}
                className={`relative flex flex-col justify-between bg-white rounded-xl border ${selectedPlan === plan.id
                  ? "border-[#31372B] shadow-lg"
                  : "border-[rgba(49,55,43,0.12)]"
                  } p-6 w-full cursor-pointer transition-all duration-150 min-h-[280px]`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#31372B] text-[#FAF7EE] text-[12px] rounded-full px-3 py-1 font-[Arial] whitespace-nowrap">
                    <Image
                      src="/GetCreditsLogoLight.svg"
                      alt="Popular"
                      width={12}
                      height={12}
                    />
                    <span>Most Popular</span>
                  </div>
                )}

                {/* Title & Price */}
                <div>
                  <h3 className="font-bold text-[20px] leading-[30px] text-[#31372B] tracking-[-0.6px] font-[Arial]">
                    {plan.title}
                  </h3>
                  <p className="font-bold text-[32px] leading-[48px] text-[#31372B] tracking-[-0.8px] mt-1 font-[Arial]">
                    {plan.price}
                  </p>
                  <p className="text-[#717182] text-[14px] mt-1 font-[Arial]">
                    {plan.description}
                  </p>
                  <span className="inline-block bg-[rgba(49,55,43,0.1)] border border-[rgba(49,55,43,0.2)] text-[#31372B] text-[12px] px-2 py-[2px] rounded-md mt-4 font-[Arial]">
                    {plan.credits}
                  </span>
                </div>

                {/* Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === plan.id
                    ? "bg-[#31372B] border-[#31372B]"
                    : "border-[rgba(49,55,43,0.12)]"
                    } absolute top-6 right-6`}
                >
                  {selectedPlan === plan.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Billing Details */}
          <div className="bg-white rounded-xl border border-[rgba(49,55,43,0.12)] w-full p-8 shadow-sm">
            <h2 className="font-bold text-[28px] leading-[42px] text-[#31372B] mb-8 font-[Arial]">
              Enter Your Billing Details
            </h2>

            <form className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#31372B] text-[14px] font-[Arial]">
                  Street Address *
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  className="bg-[#F3F3F5] rounded-md px-3 py-2 text-[#717182] text-[14px] font-[Arial] outline-none"
                />
              </div>

              {/* Row 1 */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[#31372B] text-[14px] font-[Arial]">City *</label>
                  <input
                    type="text"
                    placeholder="Bangalore"
                    className="bg-[#F3F3F5] rounded-md px-3 py-2 text-[#717182] text-[14px] font-[Arial] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[#31372B] text-[14px] font-[Arial]">State *</label>
                  <input
                    type="text"
                    placeholder="Karnataka"
                    className="bg-[#F3F3F5] rounded-md px-3 py-2 text-[#717182] text-[14px] font-[Arial] outline-none"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[#31372B] text-[14px] font-[Arial]">Pincode *</label>
                  <input
                    type="text"
                    placeholder="560001"
                    className="bg-[#F3F3F5] rounded-md px-3 py-2 text-[#717182] text-[14px] font-[Arial] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[#31372B] text-[14px] font-[Arial]">Country *</label>
                  <input
                    type="text"
                    placeholder="India"
                    className="bg-[#F3F3F5] rounded-md px-3 py-2 text-[#717182] text-[14px] font-[Arial] outline-none"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-[14px] font-[Arial]">
                  {error}
                </div>
              )}

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="bg-[#31372B] text-[#FAF7EE] py-3 rounded-md mt-6 text-[14px] font-[Arial] flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Image
                      src="/CheckoutIconLight.svg"
                      alt="Proceed Icon"
                      width={16}
                      height={16}
                    />
                    Proceed to Checkout
                  </>
                )}
              </button>

              <p className="text-center text-[#717182] text-[14px] font-[Arial] mt-3">
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
