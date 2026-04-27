import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "Churn Analysis Tool",
    description: "Calculate and analyze customer churn rates. Free tool for startup founders tracking retention metrics.",
    openGraph: {
        title: "Churn Analysis Tool",
        description: "Calculate and analyze customer churn rates. Free tool for startup founders tracking retention metrics.",
        url: "/tools-for-founders/churn",
    },
};

export default function ChurnToolPage() {
    return (
        <>
            {/* Public Navbar */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-[rgba(255,255,255,0.95)] border-b border-[rgba(49,55,43,0.12)] backdrop-blur-md px-8 py-4">
                <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/Logo.svg"
                            alt="Logo"
                            width={100}
                            height={40}
                            className="h-[38px] w-auto"
                        />
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/tools-for-founders"
                            className="text-[#31372B] text-[14px] font-inter font-bold hover:text-[#717182] transition cursor-pointer"
                        >
                            Tools for Founders
                        </Link>
                        <Link
                            href="/auth"
                            className="bg-[#31372B] text-[#FAF7EE] px-6 py-2 rounded-lg font-bold shadow hover:opacity-90 transition cursor-pointer"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="min-h-screen bg-[#FAF7EE] font-inter text-[#31372B]">
                <div className="max-w-[900px] mx-auto pt-32 pb-16 px-6">
                    {/* Back Link */}
                    <Link
                        href="/tools-for-founders"
                        className="inline-flex items-center text-[#717182] hover:text-[#31372B] mb-8 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Tools
                    </Link>

                    {/* Page Header */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-10 shadow-sm text-center">
                        <div className="text-[60px] mb-4">📉</div>
                        <h1 className="text-[40px] font-bold text-[#31372B] mb-4">
                            Churn Analysis Tool
                        </h1>
                        <p className="text-[18px] text-[#717182] mb-8">
                            Calculate and analyze customer churn rates
                        </p>

                        <div className="bg-[#EDF4E5] border border-[#31372B]/10 rounded-lg p-6">
                            <p className="text-[16px] text-[#31372B] font-medium">
                                🚧 Coming Soon
                            </p>
                            <p className="text-[14px] text-[#717182] mt-2">
                                This tool is currently under development. Check back soon!
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

