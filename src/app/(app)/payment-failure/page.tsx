"use client";

import { useRouter } from "next/navigation";
import AuthenticatedNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { XCircle } from "lucide-react";

export default function PaymentFailurePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7EE]">
            {/* Navbar */}
            <AuthenticatedNavbar />

            {/* Main Section */}
            <main className="flex flex-col items-center justify-center flex-grow px-6 py-16 mt-20">
                <div className="bg-white/70 border border-black/[0.06] rounded-3xl shadow-sm w-full max-w-[520px] p-8 md:p-10 text-center flex flex-col items-center gap-6 backdrop-blur-sm">
                    {/* X Icon */}
                    <div className="w-16 h-16 flex items-center justify-center bg-red-50 rounded-full">
                        <XCircle className="w-9 h-9 text-red-500" strokeWidth={2} />
                    </div>

                    {/* Headings */}
                    <div>
                        <h1 className="font-space font-bold text-[#1E1E1E] text-[28px] leading-[40px] tracking-[-0.02em]">
                            Payment Failed
                        </h1>
                        <p className="text-[#6B6B6B] text-[15px] leading-[24px] mt-2 font-inter">
                            We couldn&apos;t process your payment. Please try again.
                        </p>
                    </div>

                    {/* Error Info Box */}
                    <div className="bg-red-50 rounded-2xl p-4 w-full text-left border border-red-100">
                        <p className="text-[13px] font-inter text-red-700">
                            Your payment was not successful. No charges have been made to your account.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col md:flex-row gap-3 w-full">
                        <button
                            onClick={() => router.push("/pricing")}
                            className="bg-[#1E1E1E] text-white rounded-full py-2.5 text-[14px] font-inter font-semibold flex justify-center items-center gap-2 hover:bg-[#333] transition flex-1 cursor-pointer"
                        >
                            Try Again →
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="bg-white border border-black/[0.10] text-[#31372B] rounded-full py-2.5 text-[14px] font-inter font-medium flex justify-center items-center gap-2 hover:bg-black/[0.04] transition flex-1 cursor-pointer"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Support Message */}
                    <p className="text-[#6B6B6B] text-[12px] font-inter">
                        Need help? Contact our support team for assistance.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
