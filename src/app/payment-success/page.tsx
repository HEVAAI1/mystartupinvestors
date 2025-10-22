"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthenticatedNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PaymentSuccessPage() {
  const router = useRouter();

  const creditsAdded = 60;
  const remainingCredits = 202;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7EE]">
      {/* Navbar */}
      <AuthenticatedNavbar credits={remainingCredits} />

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 py-16 mt-20">
  <div className="bg-white border border-[rgba(49,55,43,0.12)] rounded-xl shadow-sm w-full max-w-[520px] p-8 md:p-10 text-center flex flex-col items-center gap-6">
    {/* Checkmark Icon */}
    <div className="w-20 h-20 flex items-center justify-center bg-[rgba(49,55,43,0.1)] rounded-full">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-[3px] border-[#31372B] rounded-full"></div>
        <div className="absolute left-[37%] top-[42%] w-[22%] h-[3px] bg-[#31372B] rotate-45"></div>
        <div className="absolute left-[50%] top-[45%] w-[45%] h-[3px] bg-[#31372B] -rotate-45"></div>
      </div>
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
    <div className="bg-[rgba(245,245,245,0.3)] rounded-lg p-5 w-full max-w-[460px] text-left flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="text-[#717182] text-[15px] font-[Arial]">Credits Added:</p>
        <p className="text-[#31372B] font-[Arial] font-bold text-[15px]">{creditsAdded} Credits</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-[#717182] text-[15px] font-[Arial]">Remaining Balance:</p>
        <p className="text-[#31372B] font-[Arial] font-bold text-[15px]">{remainingCredits} Credits</p>
      </div>
    </div>

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


      {/* Footer */}
      <Footer />
    </div>
  );
}
