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
                <div className="bg-white border border-[rgba(49,55,43,0.12)] rounded-xl shadow-sm w-full max-w-[520px] p-8 md:p-10 text-center flex flex-col items-center gap-6">
                    {/* X Icon */}
                    <div className="w-20 h-20 flex items-center justify-center bg-red-50 rounded-full">
                        <XCircle className="w-10 h-10 text-red-600" strokeWidth={2.5} />
                    </div>

                    {/* Headings */}
                    <div>
                        <h1 className="font-[Arial] font-bold text-[#31372B] text-[32px] leading-[48px] -tracking-[0.8px]">
                            Payment Failed
                        </h1>
                        <p className="text-[#717182] text-[16px] leading-[24px] mt-2 font-[Arial]">
                            We couldn&apos;t process your payment. Please try again.
                        </p>
                    </div>

                    {/* Error Info Box */}
                    <div className="bg-red-50 rounded-lg p-5 w-full max-w-[460px] text-left">
                        <p className="text-[14px] text-red-800 font-[Arial]">
                            Your payment was not successful. No charges have been made to your account.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col md:flex-row gap-3 w-full max-w-[460px]">
                        <button
                            onClick={() => router.push("/pricing")}
                            className="bg-[#31372B] text-[#FAF7EE] rounded-md py-2.5 text-[14px] font-[Arial] flex justify-center items-center gap-2 hover:opacity-90 transition flex-1"
                        >
                            Try Again →
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="bg-[#FAF7EE] border border-[rgba(49,55,43,0.12)] text-[#31372B] rounded-md py-2.5 text-[14px] font-[Arial] flex justify-center items-center gap-2 hover:bg-[#F5F5F5] transition flex-1"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Support Message */}
                    <p className="text-[#717182] text-[13px] font-[Arial] mt-1">
                        Need help? Contact our support team for assistance.
                    </p>
                </div>
            </main>


            {/* Footer */}
            <Footer />
        </div>
    );
}
