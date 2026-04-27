import { Metadata } from "next";
import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import IRRCalculatorClient from "./irr-calculator-client";

export const metadata: Metadata = {
    title: "IRR Calculator",
    description: "Calculate Internal Rate of Return for venture capital and startup investments using multiple cash flows.",
    openGraph: {
        title: "IRR Calculator",
        description: "Calculate Internal Rate of Return for venture capital and startup investments using multiple cash flows.",
        url: "/tools-for-founders/irr-calculator",
    },
};

export default function IRRCalculatorPage() {
    return (
        <>
            <SmartNavbar />

            <main className="min-h-screen bg-[#FAF7EE] font-inter text-[#31372B]">
                <div className="max-w-[1200px] mx-auto pt-32 pb-16 px-6">
                    {/* Breadcrumb Navigation */}
                    <nav className="mb-8 text-sm text-[#717182]">
                        <Link href="/" className="hover:text-[#31372B]">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/tools-for-founders" className="hover:text-[#31372B]">Tools for Founders</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#31372B]">IRR Calculator</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[clamp(36px,5vw,56px)] font-space font-bold text-[#31372B] mb-4 leading-[1.05] tracking-[-0.03em]">
                            Internal Rate of Return (IRR) Calculator
                        </h1>
                        <p className="text-lg md:text-xl font-inter text-[#6B6B6B] leading-relaxed max-w-[800px]">
                            Measure the profitability of potential startup investments. Compare returns across different exit scenarios and time horizons.
                        </p>
                    </div>

                    {/* Calculator Client Component */}
                    <IRRCalculatorClient />

                    {/* CTA Section */}
                    <div className="bg-[#1E1E1E] rounded-3xl p-10 text-center mb-12 shadow-2xl shadow-black/15">
                        <h2 className="text-[32px] font-bold text-[#FAF7EE] mb-4">
                            Investors back founders who understand their numbers.
                        </h2>
                        <Link
                            href="/dashboard"
                            className="inline-block bg-[#C6FF55] text-[#31372B] px-8 py-4 rounded-lg font-bold text-[18px] hover:brightness-110 transition"
                        >
                            Find Investors for Your Stage
                        </Link>
                    </div>

                    {/* Methodology & Assumptions */}
                    <div className="bg-white/60 backdrop-blur-sm border border-black/[0.06] rounded-3xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Methodology & Formulas</h2>

                        <div className="prose prose-lg max-w-none text-[#31372B]">
                            <h3 className="text-[20px] font-bold mb-3">Understanding IRR</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                The Internal Rate of Return (IRR) is the annual growth rate that makes the Net Present Value (NPV) of all cash flows (both positive and negative) from a particular investment equal to zero.
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">1. Key Formula</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                0 = Sum( Cash Flow / (1 + IRR)^t )
                            </p>
                            <p className="text-sm text-[#717182] mt-1">
                                Where &apos;t&apos; is the time period in years. This equation is solved iteratively.
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">2. Multiple on Invested Capital (MOIC)</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                MOIC = Total Cash Returned / Total Cash Invested
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">3. Net Profit</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                Net Profit = Total Cash Returned - Total Cash Invested
                            </p>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white/60 backdrop-blur-sm border border-black/[0.06] rounded-3xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    Why is IRR important for VCs?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    VCs have a limited time horizon (usually 10 years) to return capital to their Limited Partners (LPs). IRR accounts for the time value of money—receiving 3x your money in 3 years (high IRR) is much better than receiving 3x in 10 years (lower IRR).
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How does IRR differ from MOIC?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    MOIC (Multiple on Invested Capital) tells you how many times your money you made back (e.g., 3x), ignoring time. IRR tells you the annualized speed of that return. A quick 2x exit might have a higher IRR than a slow 10x exit, though VCs generally aim for high multiples first.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is a good IRR for VC investments?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Top-quartile VC funds typically target a net IRR of 20-30%+. However, individual successful startup investments often need to generate IRRs of 50-100%+ to make up for the inevitable failures in the portfolio.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How do follow-on rounds affect IRR?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Investing more capital in later years (follow-on) generally lowers the IRR because that capital has less time to compound, but it can increase the total Net Profit (cash) if the company continues to grow. This is the trade-off between &quot;velocity&quot; of money and &quot;mass&quot; of money.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Related Tools */}
                    <div className="bg-white/60 backdrop-blur-sm border border-black/[0.06] rounded-3xl p-8 shadow-sm">
                        <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Related Tools</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Link href="/tools-for-founders/advanced-valuation-engine" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
                                <h3 className="font-bold text-[#31372B] mb-1">Valuation Engine</h3>
                            </Link>
                            <Link href="/tools-for-founders/break-even-calculator" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
                                <h3 className="font-bold text-[#31372B] mb-1">Break-Even Calculator</h3>
                            </Link>
                            <Link href="/tools-for-founders/burn-rate-calculator" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
                                <h3 className="font-bold text-[#31372B] mb-1">Burn Rate Calculator</h3>
                            </Link>
                            <Link href="/tools-for-founders/cac-optimizer" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
                                <h3 className="font-bold text-[#31372B] mb-1">CAC Optimizer</h3>
                            </Link>
                            <Link href="/tools-for-founders/cap-table-model" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
                                <h3 className="font-bold text-[#31372B] mb-1">Cap Table Model</h3>
                            </Link>
                            <Link href="/tools-for-founders/churn-rate-calculator" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
                                <h3 className="font-bold text-[#31372B] mb-1">Churn Rate Calculator</h3>
                            </Link>
                            <Link href="/tools-for-founders/dcf-calculator" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
                                <h3 className="font-bold text-[#31372B] mb-1">DCF Calculator</h3>
                            </Link>
                            <Link href="/tools-for-founders/fundraising-calculator" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
                                <h3 className="font-bold text-[#31372B] mb-1">Fundraising Calculator</h3>
                            </Link>
                            <Link href="/tools-for-founders/investability-score-calculator" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
                                <h3 className="font-bold text-[#31372B] mb-1">Investability Score</h3>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

