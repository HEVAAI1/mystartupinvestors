import { Metadata } from "next";
import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import InvestabilityScoreCalculatorClient from "./investability-score-calculator-client";

export const metadata: Metadata = {
    title: "Investability Score Calculator",
    description: "Score your startup across team, market, product-market fit, and moat to assess investor readiness.",
    openGraph: {
        title: "Investability Score Calculator",
        description: "Score your startup across team, market, product-market fit, and moat to assess investor readiness.",
        url: "/tools-for-founders/investability-score-calculator",
    },
};

export default function InvestabilityScoreCalculatorPage() {
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
                        <span className="text-[#31372B]">Investability Score</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[clamp(36px,5vw,56px)] font-space font-bold text-[#31372B] mb-4 leading-[1.05] tracking-[-0.03em]">
                            Startup Investability Score
                        </h1>
                        <p className="text-lg md:text-xl font-inter text-[#6B6B6B] leading-relaxed max-w-[800px]">
                            Evaluate your startup from a VC&apos;s perspective. Identify strengths and weaknesses in your team, market, traction, and defensibility.
                        </p>
                    </div>

                    {/* Calculator Client Component */}
                    <InvestabilityScoreCalculatorClient />

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
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Methodology & Scoring</h2>

                        <div className="prose prose-lg max-w-none text-[#31372B]">
                            <h3 className="text-[20px] font-bold mb-3">How VCs Score Startups</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                This calculator uses a weighted average of the four most critical factors venture capitalists evaluate. The weights reflect the relative importance of each factor for early-stage companies (Seed to Series A).
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">1. Team (30%)</h4>
                            <p className="text-[16px] leading-relaxed mb-2">
                                For early-stage startups, the team is the biggest risk and biggest asset. Investors look for founder-market fit, technical capability, sales ability, and resilience.
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">2. Market (25%)</h4>
                            <p className="text-[16px] leading-relaxed mb-2">
                                VCs need massive outcomes to return their funds. They look for large ($1B+) and growing markets. A great team in a small market is capped; an average team in a booming market can sometimes succeed.
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">3. Product-Market Fit (25%)</h4>
                            <p className="text-[16px] leading-relaxed mb-2">
                                Evidence that customers love your product. Measured by growth, retention, engagement, and revenue. This validates that you are solving a real problem.
                            </p>

                            <h4 className="text-[18px] font-bold mb-2 mt-4">4. Moat / Defensibility (20%)</h4>
                            <p className="text-[16px] leading-relaxed mb-2">
                                What stops Google or a funded competitor from cloning you? Network effects, proprietary data, complex tech, or brand affinity create long-term value.
                            </p>

                            <div className="bg-gray-100 p-4 rounded-lg mt-6">
                                <p className="font-mono text-sm">
                                    Overall Score = (Team × 0.30) + (Market × 0.25) + (PMF × 0.25) + (Moat × 0.20)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white/60 backdrop-blur-sm border border-black/[0.06] rounded-3xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What makes a startup investable?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Investable startups minimize risk while maximizing potential return. They have a credible team (execution risk addressed), a huge market (market risk addressed), and early signs of traction (product risk addressed). The &quot;story&quot; connects these dots convincingly.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How do VCs evaluate early-stage companies?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    At Pre-Seed and Seed, evaluation is almost entirely qualitative: &quot;Do we believe these founders can build this future?&quot; As you move to Series A and B, evaluation becomes quantitative: &quot;Do the metrics prove the business model works at scale?&quot;
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    Can a low score still raise funding?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Yes, especially if one area is an outlier &quot;10/10&quot;. For example, a repeat founder with a billion-dollar exit (Team: 10) can often raise money with just an idea (PMF: 1). However, weakness in all areas usually prevents funding.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How should founders use investability scores?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Use the score to identify your weakest link. If your Market score is low, consider pivoting to a bigger problem. If PMF is low, focus on customer discovery before pitching investors. Fix the holes in your boat before trying to sail across the ocean.
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
                            <Link href="/tools-for-founders/irr-calculator" className="p-5 border border-black/[0.06] rounded-2xl bg-white/70 hover:shadow-md hover:border-[#C6FF55]/40 transition-all duration-300">
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

