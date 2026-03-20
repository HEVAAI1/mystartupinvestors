import { Metadata } from "next";
import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import FundraisingCalculatorClient from "./fundraising-calculator-client";

export const metadata: Metadata = {
    title: "Fundraising Calculator",
    description: "Calculate optimal fundraising amount, dilution impact, and runway extension for your next startup funding round.",
    openGraph: {
        title: "Fundraising Calculator",
        description: "Calculate optimal fundraising amount, dilution impact, and runway extension for your next startup funding round.",
        url: "/tools-for-founders/fundraising-calculator",
    },
};

export default function FundraisingCalculatorPage() {
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
                        <span className="text-[#31372B]">Fundraising Calculator</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[48px] font-bold text-[#31372B] mb-4 leading-tight">
                            Startup Fundraising Calculator
                        </h1>
                        <p className="text-[20px] text-[#717182] leading-relaxed max-w-[800px]">
                            Determine how much capital you need to raise to reach your next milestone while managing equity dilution.
                        </p>
                    </div>

                    {/* Calculator Client Component */}
                    <FundraisingCalculatorClient />

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
                            <h3 className="text-[20px] font-bold mb-3">Fundraising Logic</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                This calculator works backwards from your target runway (typically 18-24 months) to determine the capital required based on your burn rate.
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">1. Required Capital</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                Required Capital = Burn Rate × (Target Runway − Current Runway)
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">2. Post-Money Valuation</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                Post-Money Valuation = Pre-Money Valuation + Investment Amount
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">3. Dilution</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                Dilution % = Investment Amount / Post-Money Valuation
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">4. Founder Ownership Impact</h4>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                                New Ownership = Old Ownership × (1 − Dilution %)
                            </p>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How much should I raise in my next round?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    A common rule of thumb is to raise enough capital for 18-24 months of runway. This gives you roughly 12-15 months to execute on milestones and 3-6 months to raise your next round without running out of cash.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How does raise amount affect dilution?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    The more you raise, the more dilution you suffer, assuming a fixed valuation. Typical dilution for a seed or Series A round is 15-25%. Founders must balance the need for capital (to grow faster and increase valuation) with the cost of giving up equity.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    When should founders raise more or less?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Raise more if market conditions are favorable, capital is cheap, or you have a clear way to deploy capital for aggressive growth. Raise less (or delay) if your valuation is low, market conditions are tough, or you haven&apos;t yet proven key milestones that would unlock a better valuation.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How much runway do investors expect?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Investors typically want to see that their capital will last at least 18 months. This suggests you have a plan to reach the next set of value-inflection points (e.g., product launch, $1M ARR) before needing to ask for money again.
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
                            <Link href="/tools-for-founders/dcf-calculator" className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition">
                                <h3 className="font-bold text-[#31372B] mb-1">DCF Calculator</h3>
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
