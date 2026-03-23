"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import SmartNavbar from "@/components/SmartNavbar";
import CreditExhaustedModal from "@/components/CreditExhaustedModal";
import { useState } from "react";
import { useCalculationCredits } from "@/hooks/useCalculationCredits";
import DownloadPDFButton from "@/components/tools/DownloadPDFButton";

// SEO Metadata is exported from a separate metadata file for client components
// This component handles the interactive calculator

export default function AdvancedValuationEnginePage() {
    // Credit system
    const { creditStatus, useCredit: consumeCredit, isLoading } = useCalculationCredits();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Input states
    const [arr, setArr] = useState<string>("1000000");
    const [growthRate, setGrowthRate] = useState<string>("100");
    const [timeToExit, setTimeToExit] = useState<string>("5");
    const [exitMultiple, setExitMultiple] = useState<string>("10");
    const [targetReturn, setTargetReturn] = useState<string>("10");
    const [futureDilution, setFutureDilution] = useState<string>("30");
    const [investmentAmount, setInvestmentAmount] = useState<string>("2000000");

    // Calculated results
    const [results, setResults] = useState({
        exitRevenue: 0,
        exitValuation: 0,
        postMoney: 0,
        adjustedPostMoney: 0,
        preMoney: 0,
    });

    // Handle calculate button click
    const handleCalculate = async () => {
        // Check if credits available
        if (!creditStatus.canCalculate) {
            setShowCreditModal(true);
            return;
        }

        // Consume credit
        const result = await consumeCredit();

        if (result.success) {
            // Calculate valuation AFTER credit is consumed
            const arrNum = parseFloat(arr) || 0;
            const growthRateNum = parseFloat(growthRate) / 100 || 0;
            const timeToExitNum = parseFloat(timeToExit) || 0;
            const exitMultipleNum = parseFloat(exitMultiple) || 0;
            const targetReturnNum = parseFloat(targetReturn) || 0;
            const futureDilutionNum = parseFloat(futureDilution) / 100 || 0;
            const investmentAmountNum = parseFloat(investmentAmount) || 0;

            // VC Method Calculation
            const exitRevenue = arrNum * Math.pow(1 + growthRateNum, timeToExitNum);
            const exitValuation = exitRevenue * exitMultipleNum;
            const postMoney = exitValuation / targetReturnNum;
            const adjustedPostMoney = postMoney * (1 - futureDilutionNum);
            const preMoney = adjustedPostMoney - investmentAmountNum;

            setResults({
                exitRevenue,
                exitValuation,
                postMoney,
                adjustedPostMoney,
                preMoney: Math.max(0, preMoney),
            });

            setShowResults(true);
        } else {
            setShowCreditModal(true);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

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
                        <span className="text-[#31372B]">Advanced Valuation Engine</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[48px] font-bold text-[#31372B] mb-4 leading-tight">
                            Advanced Startup Valuation Engine
                        </h1>
                        <p className="text-[20px] text-[#717182] leading-relaxed max-w-[800px]">
                            Estimate your startup&apos;s valuation using the VC method. Calculate pre-money and post-money valuation based on growth projections, exit assumptions, dilution, and investor return expectations.
                        </p>
                    </div>

                    {/* Credit Status Banner */}
                    {!isLoading && (
                        <div className="mb-6 p-4 bg-[#EDF4E5] border border-[#31372B]/10 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-[#31372B]">
                                        {creditStatus.message}
                                    </p>
                                    {creditStatus.resetDate && (
                                        <p className="text-xs text-[#717182] mt-1">
                                            Resets on {new Date(creditStatus.resetDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                {!creditStatus.unlimited && (
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-[#31372B]">
                                            {creditStatus.remaining}
                                        </p>
                                        <p className="text-xs text-[#717182]">
                                            {creditStatus.limit ? `of ${creditStatus.limit}` : "remaining"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Calculator Section */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Calculator</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Inputs */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Annual Recurring Revenue (ARR)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={arr}
                                            onChange={(e) => setArr(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="1000000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Expected Annual Growth Rate
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={growthRate}
                                            onChange={(e) => setGrowthRate(e.target.value)}
                                            className="w-full pr-12 pl-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="100"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]">%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Time to Exit
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={timeToExit}
                                            onChange={(e) => setTimeToExit(e.target.value)}
                                            className="w-full pr-20 pl-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="5"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]">years</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Exit Multiple (× revenue)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={exitMultiple}
                                            onChange={(e) => setExitMultiple(e.target.value)}
                                            className="w-full pr-8 pl-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]">×</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Target Investor Return (×)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={targetReturn}
                                            onChange={(e) => setTargetReturn(e.target.value)}
                                            className="w-full pr-8 pl-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]">×</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Expected Future Dilution
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={futureDilution}
                                            onChange={(e) => setFutureDilution(e.target.value)}
                                            className="w-full pr-12 pl-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="30"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]">%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Investment Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={investmentAmount}
                                            onChange={(e) => setInvestmentAmount(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="2000000"
                                        />
                                    </div>
                                </div>

                                {/* Calculate Button */}
                                <button
                                    onClick={handleCalculate}
                                    disabled={isLoading}
                                    className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition disabled:opacity-50 mt-6"
                                >
                                    {isLoading ? "Loading..." : "Calculate Valuation"}
                                </button>
                            </div>

                            {/* Results - Only shown after credit consumed */}
                            <div>
                                {showResults ? (
                                    <div id="valuation-results" className="bg-[#EDF4E5] rounded-lg p-6 h-fit">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-[18px] font-bold text-[#31372B]">Valuation Results</h3>
                                            <DownloadPDFButton
                                                fileName="valuation-report"
                                                title="Valuation Report"
                                                data={[
                                                    { label: "Pre-Money Valuation", value: formatCurrency(results.preMoney) },
                                                    { label: "Post-Money Valuation", value: formatCurrency(results.postMoney) },
                                                    { label: "Adjusted Post-Money", value: formatCurrency(results.adjustedPostMoney), subtext: "After dilution" },
                                                    { label: "Projected Exit Revenue", value: formatCurrency(results.exitRevenue) },
                                                    { label: "Projected Exit Valuation", value: formatCurrency(results.exitValuation) }
                                                ]}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Projected Exit Revenue</div>
                                                <div className="text-[24px] font-bold text-[#31372B]">
                                                    {formatCurrency(results.exitRevenue)}
                                                </div>
                                            </div>

                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Projected Exit Valuation</div>
                                                <div className="text-[24px] font-bold text-[#31372B]">
                                                    {formatCurrency(results.exitValuation)}
                                                </div>
                                            </div>

                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Post-Money Valuation</div>
                                                <div className="text-[24px] font-bold text-[#31372B]">
                                                    {formatCurrency(results.postMoney)}
                                                </div>
                                            </div>

                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Adjusted Post-Money (after dilution)</div>
                                                <div className="text-[24px] font-bold text-[#31372B]">
                                                    {formatCurrency(results.adjustedPostMoney)}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <div className="text-sm text-[#717182] mb-1">Pre-Money Valuation</div>
                                                <div className="text-[32px] font-bold text-[#31372B]">
                                                    {formatCurrency(results.preMoney)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[#F5F5F5] rounded-lg p-6 h-full flex items-center justify-center min-h-[300px]">
                                        <p className="text-[#717182] text-center">
                                            Click &quot;Calculate Valuation&quot; to see your results
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-[#31372B] rounded-xl p-10 text-center mb-12">
                        <h2 className="text-[32px] font-bold text-[#FAF7EE] mb-4">
                            Founders who know their numbers raise faster.
                        </h2>
                        <p className="text-[#FAF7EE]/80 text-[18px] mb-6 max-w-[600px] mx-auto">
                            Connect with investors who understand your stage and sector.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-block bg-[#C6FF55] text-[#31372B] px-8 py-4 rounded-lg font-bold text-[18px] hover:brightness-110 transition"
                        >
                            Find Investors for Your Stage
                        </Link>
                    </div>

                    {/* Methodology & Assumptions */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Methodology & Assumptions</h2>

                        <div className="prose prose-lg max-w-none text-[#31372B]">
                            <h3 className="text-[20px] font-bold mb-3">The VC Method</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                The VC (Venture Capital) method is a widely-used approach for valuing early-stage startups. It works backward from an expected exit to determine today&apos;s valuation.
                            </p>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Calculation Steps</h3>
                            <ol className="list-decimal list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Project Exit Revenue:</strong> ARR × (1 + Growth Rate)^Years</li>
                                <li><strong>Calculate Exit Valuation:</strong> Exit Revenue × Exit Multiple</li>
                                <li><strong>Determine Required Post-Money:</strong> Exit Valuation ÷ Target Return</li>
                                <li><strong>Adjust for Future Dilution:</strong> Post-Money × (1 - Dilution %)</li>
                                <li><strong>Calculate Pre-Money:</strong> Adjusted Post-Money - Investment Amount</li>
                            </ol>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Key Assumptions</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li>Growth rate remains constant (compound annual growth)</li>
                                <li>Exit occurs at the specified timeframe</li>
                                <li>Exit multiples reflect market conditions at exit</li>
                                <li>Future dilution accounts for additional funding rounds</li>
                                <li>Investor return expectations are based on risk profile</li>
                            </ul>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Typical Ranges</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>SaaS Exit Multiples:</strong> 5-15× ARR (depending on growth and margins)</li>
                                <li><strong>VC Return Expectations:</strong> 5-10× for seed, 3-5× for Series A+</li>
                                <li><strong>Future Dilution:</strong> 20-40% (varies by funding strategy)</li>
                            </ul>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How do VCs calculate startup valuation?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    VCs typically use the VC method, which projects future exit value and works backward to determine current valuation. They consider growth potential, market size, competitive position, and required returns to calculate what they can pay today for a stake in your company.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is the VC valuation method?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    The VC method estimates a company&apos;s current value by projecting its future exit valuation and discounting it back to present value based on the investor&apos;s required rate of return. It accounts for growth, exit multiples, and future dilution from additional funding rounds.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How does dilution affect valuation?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Future dilution reduces the investor&apos;s ownership percentage over time as you raise additional rounds. VCs account for this by adjusting the post-money valuation downward, which impacts the pre-money valuation they&apos;re willing to accept today.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    Is this suitable for pre-revenue startups?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    The VC method works best for startups with revenue or clear revenue projections. For pre-revenue companies, investors may use comparable company analysis, scorecard methods, or risk factor summation instead. However, you can still use this tool by inputting projected first-year revenue.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Related Tools */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm">
                        <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Related Tools</h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <Link
                                href="/tools-for-founders/break-even-calculator"
                                className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition"
                            >
                                <div className="text-[24px] mb-2">📊</div>
                                <h3 className="font-bold text-[#31372B] mb-1">Break-Even Calculator</h3>
                                <p className="text-sm text-[#717182]">Calculate your path to profitability</p>
                            </Link>

                            <Link
                                href="/tools-for-founders/burn-rate-calculator"
                                className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition"
                            >
                                <div className="text-[24px] mb-2">🔥</div>
                                <h3 className="font-bold text-[#31372B] mb-1">Burn Rate Calculator</h3>
                                <p className="text-sm text-[#717182]">Track cash burn and runway</p>
                            </Link>

                            <Link
                                href="/tools-for-founders/cac"
                                className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition"
                            >
                                <div className="text-[24px] mb-2">📈</div>
                                <h3 className="font-bold text-[#31372B] mb-1">CAC Calculator</h3>
                                <p className="text-sm text-[#717182]">Analyze customer acquisition costs</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <CreditExhaustedModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                userState={creditStatus.userState === "loading" ? "anonymous" : creditStatus.userState}
                remaining={creditStatus.remaining}
                resetDate={creditStatus.resetDate}
            />

            <Footer />
        </>
    );
}
