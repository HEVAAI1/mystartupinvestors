"use client";

import Image from "next/image";
import AuthenticatedNavbar from "@/components/Navbar";
import { useState } from "react";
import Footer from "@/components/Footer"; // ✅ import here

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "growth">("growth");

  const plans = [
    {
      id: "starter",
      title: "Starter Pack",
      price: "$15",
      credits: "60 Credits",
    },
    {
      id: "growth",
      title: "Growth Pack",
      price: "$49",
      credits: "300 Credits",
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col">
      {/* Navbar */}
      <AuthenticatedNavbar credits={5} />

      {/* Main Content */}
      <main className="flex flex-col items-center w-full mt-24 px-6 md:px-0">
        <div className="max-w-[1024px] flex flex-col items-center gap-12 w-full">
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
          <div className="flex flex-col md:flex-row justify-center gap-6 w-full">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as "starter" | "growth")}
                className={`relative flex flex-col justify-between bg-white rounded-xl border ${
                  selectedPlan === plan.id
                    ? "border-[#31372B] shadow-lg"
                    : "border-[rgba(49,55,43,0.12)]"
                } p-6 w-full md:w-[500px] cursor-pointer transition-all duration-150`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#31372B] text-[#FAF7EE] text-[16px] rounded-full px-4 py-1 font-[Arial]">
                    <Image
                      src="/GetCreditsLogoLight.svg"
                      alt="Popular"
                      width={16}
                      height={16}
                    />
                    <span>Most Popular</span>
                  </div>
                )}

                {/* Title & Price */}
                <div>
                  <h3 className="font-bold text-[24px] leading-[36px] text-[#31372B] tracking-[-0.6px] font-[Arial]">
                    {plan.title}
                  </h3>
                  <p className="font-bold text-[32px] leading-[48px] text-[#31372B] tracking-[-0.8px] mt-2 font-[Arial]">
                    {plan.price}
                  </p>
                  <span className="inline-block bg-[rgba(49,55,43,0.1)] border border-[rgba(49,55,43,0.2)] text-[#31372B] text-[12px] px-2 py-[2px] rounded-md mt-3 font-[Arial]">
                    {plan.credits}
                  </span>
                </div>

                {/* Radio Circle */}
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                    selectedPlan === plan.id
                      ? "bg-[#31372B] border-[#31372B]"
                      : "border-[rgba(49,55,43,0.12)]"
                  } absolute top-6 right-6`}
                >
                  {selectedPlan === plan.id && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
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

              {/* Checkout Button */}
              <button
                type="button"
                className="bg-[#31372B] text-[#FAF7EE] py-3 rounded-md mt-6 text-[14px] font-[Arial] flex items-center justify-center gap-2 hover:opacity-90 transition"
              >
                <Image
                  src="/CheckoutIconLight.svg"
                  alt="Proceed Icon"
                  width={16}
                  height={16}
                />
                Proceed to Checkout
              </button>

              <p className="text-center text-[#717182] text-[14px] font-[Arial] mt-3">
                Your payment is secure and encrypted
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer/>
    </div>
  );
}
