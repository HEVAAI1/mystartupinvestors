import { Metadata } from "next";
import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import DCFCalculatorClient from "./dcf-calculator-client";

export const metadata: Metadata = {
    title: "DCF Calculator",
    description: "Calculate enterprise value using discounted cash flow methodology. Model cash flows, terminal value, and intrinsic valuation.",
    openGraph: {
        title: "DCF Calculator",
        description: "Calculate enterprise value using discounted cash flow methodology. Model cash flows, terminal value, and intrinsic valuation.",
        url: "/tools-for-founders/dcf-calculator",
    },
};

export default function DCFCalculatorPage() {
    return (
        <>
            <SmartNavbar />

            <main className="min-h-screen bg-[#FAF7EE] font-[Arial] text-[#31372B]">
                <div className="max-w-[1200px] mx-auto pt-32 pb-16 px-6">
                    {/* Breadcrumb Navigation */}
                    <nav className="mb-8 text-sm text-[#717182]">
                        <Link href="/" className="hover:text-[#31372B]">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/tools-for-founders" className="hover:text-[#31372B]">Tools for Founders</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#31372B]">DCF Calculator</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[48px] font-bold text-[#31372B] mb-4 leading-tight">
                            Discounted Cash Flow (DCF) Calculator
                        </h1>
                        <p className="text-[20px] text-[#717182] leading-relaxed max-w-[800px]">
                            Determine the intrinsic value of your startup by discounting projected future cash flows to their present value.
                        </p>
                    </div>

                    {/* Calculator Client Component */}
                    <DCFCalculatorClient />

                    {/* CTA Section */}
                    <div className="bg-[#31372B] rounded-xl p-10 text-center mb-12">
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
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Methodology & Formulas</h2>

                        <div className="prose prose-lg max-w-none text-[#31372B]">
                            <h3 className="text-[20px] font-bold mb-3">DCF Formula</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                The Discounted Cash Flow (DCF) method estimates the value of an investment based on its expected future cash flows.
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">1. Projected Cash Flows</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                Cash Flow Year N = Year 1 Cash Flow × (1 + Growth Rate)^N
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">2. Discount Factor</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                Discount Factor = 1 / (1 + WACC)^N
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">3. Present Value (PV)</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                PV = Cash Flow × Discount Factor
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">4. Terminal Value</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                Terminal Value = Final Year Cash Flow × Terminal Multiple
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">5. Enterprise Value</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                Enterprise Value = Sum of Discounted Cash Flows + Discounted Terminal Value
                            </p>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is a DCF valuation?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    A Discounted Cash Flow (DCF) valuation is a method of valuing a company using the concepts of the time value of money. It estimates the value of an investment based on its expected future cash flows, adjusted for risk and time.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What discount rate should startups use?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Startups typically use a higher discount rate (WACC) than established companies to account for higher risk. Rates between 15% and 50% are common depending on the stage, with early-stage companies often at the higher end of that range.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How does terminal value affect DCF?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Terminal value represents the value of the company beyond the projection period and often accounts for a large majority (50-80%) of the total DCF valuation. It assumes the company grows at a stable rate or is sold for a multiple of its cash flow.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    When is DCF not appropriate?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    DCF is less reliable for early-stage startups with negative cash flows or unpredictable growth. In these cases, method-based valuations (like Berkus or Scorecard) or comparable market multiples may be more appropriate.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Related Tools */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm">
                        <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Related Tools</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Link href="/tools-for-founders/advanced-valuation-engine" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">Valuation Engine</h3>
                            </Link>
                            <Link href="/tools-for-founders/break-even-calculator" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">Break-Even Calculator</h3>
                            </Link>
                            <Link href="/tools-for-founders/burn-rate-calculator" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">Burn Rate Calculator</h3>
                            </Link>
                            <Link href="/tools-for-founders/cac-optimizer" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">CAC Optimizer</h3>
                            </Link>
                            <Link href="/tools-for-founders/cap-table-model" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">Cap Table Model</h3>
                            </Link>
                            <Link href="/tools-for-founders/churn-rate-calculator" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">Churn Rate Calculator</h3>
                            </Link>
                            <Link href="/tools-for-founders/fundraising-calculator" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">Fundraising Calculator</h3>
                            </Link>
                            <Link href="/tools-for-founders/investability-score-calculator" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">Investability Score</h3>
                            </Link>
                            <Link href="/tools-for-founders/irr-calculator" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">IRR Calculator</h3>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
