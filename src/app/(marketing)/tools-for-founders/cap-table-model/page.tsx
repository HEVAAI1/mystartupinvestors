"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import SmartNavbar from "@/components/SmartNavbar";
import CreditExhaustedModal from "@/components/CreditExhaustedModal";
import { useState } from "react";
import { useCalculationCredits } from "@/hooks/useCalculationCredits";
import DownloadPDFButton from "@/components/tools/DownloadPDFButton";

export default function CapTableModelPage() {
    // Credit system
    const { creditStatus, useCredit: consumeCredit, isLoading } = useCalculationCredits();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Input states
    const [preMoneyValuation, setPreMoneyValuation] = useState<string>("8000000");
    const [investmentAmount, setInvestmentAmount] = useState<string>("2000000");
    const [founderOwnershipBefore, setFounderOwnershipBefore] = useState<string>("100");
    const [optionPoolSize, setOptionPoolSize] = useState<string>("10");

    // Calculated results
    const [results, setResults] = useState({
        postMoneyValuation: 0,
        investorOwnership: 0,
        founderOwnershipAfter: 0,
        dilution: 0,
        optionPoolShares: 0,
        founderShares: 0,
        investorShares: 0,
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
            // Calculate cap table AFTER credit is consumed
            const preMoneyNum = parseFloat(preMoneyValuation) || 0;
            const investmentNum = parseFloat(investmentAmount) || 0;
            const founderOwnershipBeforeNum = parseFloat(founderOwnershipBefore) || 0;
            const optionPoolNum = parseFloat(optionPoolSize) || 0;

            // Cap Table Calculation
            // Post-Money Valuation = Pre-Money + Investment
            const postMoneyValuation = preMoneyNum + investmentNum;

            // Investor Ownership % = Investment / Post-Money
            const investorOwnership = postMoneyValuation > 0
                ? (investmentNum / postMoneyValuation) * 100
                : 0;

            // Founder Ownership After = 100 − Investor % − Option Pool %
            const founderOwnershipAfter = 100 - investorOwnership - optionPoolNum;

            // Dilution % = Founder Ownership Before − Founder Ownership After
            const dilution = founderOwnershipBeforeNum - founderOwnershipAfter;

            // Calculate share distribution (for visualization)
            const optionPoolShares = optionPoolNum;
            const founderShares = founderOwnershipAfter;
            const investorShares = investorOwnership;

            setResults({
                postMoneyValuation,
                investorOwnership,
                founderOwnershipAfter: Math.max(0, founderOwnershipAfter),
                dilution,
                optionPoolShares,
                founderShares: Math.max(0, founderShares),
                investorShares,
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

    const formatPercent = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
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
                        <span className="text-[#31372B]">Cap Table Model</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[48px] font-bold text-[#31372B] mb-4 leading-tight">
                            Cap Table Model
                        </h1>
                        <p className="text-[20px] text-[#717182] leading-relaxed max-w-[800px]">
                            Model startup cap tables and equity dilution across funding rounds. Understand ownership changes for founders, investors, and option pools.
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
                                        Pre-Money Valuation
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={preMoneyValuation}
                                            onChange={(e) => setPreMoneyValuation(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="8000000"
                                        />
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Company valuation before investment
                                    </p>
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
                                    <p className="text-xs text-[#717182] mt-1">
                                        Amount being invested in this round
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Existing Founder Ownership
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={founderOwnershipBefore}
                                            onChange={(e) => setFounderOwnershipBefore(e.target.value)}
                                            className="w-full pr-12 pl-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="100"
                                            max="100"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]">%</span>
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Founder ownership before this round
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Option Pool Size
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={optionPoolSize}
                                            onChange={(e) => setOptionPoolSize(e.target.value)}
                                            className="w-full pr-12 pl-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="10"
                                            max="30"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]">%</span>
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Equity reserved for employee options
                                    </p>
                                </div>

                                {/* Calculate Button */}
                                <button
                                    onClick={handleCalculate}
                                    disabled={isLoading}
                                    className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition disabled:opacity-50 mt-6"
                                >
                                    {isLoading ? "Loading..." : "Calculate Cap Table"}
                                </button>
                            </div>

                            {/* Results - Only shown after credit consumed */}
                            <div>
                                {showResults ? (
                                    <div className="space-y-4">
                                        <div id="cap-table-results" className="bg-[#EDF4E5] rounded-lg p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[18px] font-bold text-[#31372B]">Cap Table Results</h3>
                                                <DownloadPDFButton
                                                    fileName="cap-table-model"
                                                    title="Cap Table Model"
                                                    data={[
                                                        { label: "Post-Money Valuation", value: formatCurrency(results.postMoneyValuation) },
                                                        { label: "Investor Ownership", value: `${formatPercent(results.investorOwnership)}%` },
                                                        { label: "Founder Ownership (After)", value: `${formatPercent(results.founderOwnershipAfter)}%` },
                                                        { label: "Option Pool", value: `${formatPercent(results.optionPoolShares)}%` },
                                                        { label: "Total Dilution", value: `${formatPercent(results.dilution)}%` }
                                                    ]}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="pb-3 border-b border-[#31372B]/10">
                                                    <div className="text-sm text-[#717182] mb-1">Post-Money Valuation</div>
                                                    <div className="text-[28px] font-bold text-[#31372B]">
                                                        {formatCurrency(results.postMoneyValuation)}
                                                    </div>
                                                </div>

                                                <div className="pb-3 border-b border-[#31372B]/10">
                                                    <div className="text-sm text-[#717182] mb-1">Investor Ownership</div>
                                                    <div className="text-[24px] font-bold text-[#31372B]">
                                                        {formatPercent(results.investorOwnership)}%
                                                    </div>
                                                </div>

                                                <div className="pb-3 border-b border-[#31372B]/10">
                                                    <div className="text-sm text-[#717182] mb-1">Founder Ownership (After)</div>
                                                    <div className="text-[24px] font-bold text-[#31372B]">
                                                        {formatPercent(results.founderOwnershipAfter)}%
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <div className="text-sm text-[#717182] mb-1">Total Dilution</div>
                                                    <div className="text-[28px] font-bold text-[#31372B]">
                                                        {formatPercent(results.dilution)}%
                                                    </div>
                                                    <div className="text-xs text-[#717182] mt-1">
                                                        Founder ownership decrease
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ownership Visualization */}
                                        <div className="bg-white border border-[#31372B1F] rounded-lg p-4">
                                            <h4 className="text-sm font-bold text-[#31372B] mb-3">Ownership Breakdown</h4>

                                            {/* Visual bar */}
                                            <div className="h-8 flex rounded-lg overflow-hidden mb-3">
                                                <div
                                                    className="bg-[#31372B]"
                                                    style={{ width: `${results.founderShares}%` }}
                                                    title={`Founders: ${formatPercent(results.founderShares)}%`}
                                                />
                                                <div
                                                    className="bg-[#C6FF55]"
                                                    style={{ width: `${results.investorShares}%` }}
                                                    title={`Investors: ${formatPercent(results.investorShares)}%`}
                                                />
                                                <div
                                                    className="bg-[#717182]"
                                                    style={{ width: `${results.optionPoolShares}%` }}
                                                    title={`Option Pool: ${formatPercent(results.optionPoolShares)}%`}
                                                />
                                            </div>

                                            {/* Legend */}
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-[#31372B] rounded"></div>
                                                        <span className="text-[#717182]">Founders</span>
                                                    </div>
                                                    <span className="font-medium text-[#31372B]">{formatPercent(results.founderShares)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-[#C6FF55] rounded"></div>
                                                        <span className="text-[#717182]">Investors</span>
                                                    </div>
                                                    <span className="font-medium text-[#31372B]">{formatPercent(results.investorShares)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-[#717182] rounded"></div>
                                                        <span className="text-[#717182]">Option Pool</span>
                                                    </div>
                                                    <span className="font-medium text-[#31372B]">{formatPercent(results.optionPoolShares)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[#F5F5F5] rounded-lg p-6 h-full flex items-center justify-center min-h-[300px]">
                                        <p className="text-[#717182] text-center">
                                            Click &quot;Calculate Cap Table&quot; to see your results
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-[#31372B] rounded-xl p-10 text-center mb-12">
                        <h2 className="text-[32px] font-bold text-[#FAF7EE] mb-4">
                            Strong metrics attract better investors.
                        </h2>
                        <p className="text-[#FAF7EE]/80 text-[18px] mb-6 max-w-[600px] mx-auto">
                            Understanding dilution helps you negotiate better terms and maintain control.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-block bg-[#C6FF55] text-[#31372B] px-8 py-4 rounded-lg font-bold text-[18px] hover:brightness-110 transition"
                        >
                            Discover Investors for Your Stage
                        </Link>
                    </div>

                    {/* Methodology & Assumptions */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Methodology & Assumptions</h2>

                        <div className="prose prose-lg max-w-none text-[#31372B]">
                            <h3 className="text-[20px] font-bold mb-3">Understanding Cap Tables</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                A capitalization table (cap table) tracks ownership stakes in a company. It shows who owns what percentage of the company and how that changes with each funding round, option grants, and exits.
                            </p>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Calculation Method</h3>
                            <ol className="list-decimal list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Post-Money Valuation:</strong> Pre-Money Valuation + Investment Amount</li>
                                <li><strong>Investor Ownership:</strong> (Investment Amount ÷ Post-Money Valuation) × 100</li>
                                <li><strong>Founder Ownership After:</strong> 100% - Investor % - Option Pool %</li>
                                <li><strong>Dilution:</strong> Founder Ownership Before - Founder Ownership After</li>
                            </ol>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Key Concepts</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Pre-Money Valuation:</strong> Company value before new investment</li>
                                <li><strong>Post-Money Valuation:</strong> Company value after new investment</li>
                                <li><strong>Dilution:</strong> Reduction in ownership percentage from new shares</li>
                                <li><strong>Option Pool:</strong> Shares reserved for employee equity compensation</li>
                                <li><strong>Fully Diluted:</strong> Ownership assuming all options are exercised</li>
                            </ul>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Typical Dilution by Round</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Seed Round:</strong> 10-25% dilution</li>
                                <li><strong>Series A:</strong> 20-30% dilution</li>
                                <li><strong>Series B:</strong> 15-25% dilution</li>
                                <li><strong>Later Rounds:</strong> 10-20% dilution each</li>
                            </ul>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Important Considerations</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li>Option pools are typically created before the round (diluting founders)</li>
                                <li>Preferred stock terms can affect economics beyond ownership %</li>
                                <li>Anti-dilution provisions protect early investors</li>
                                <li>Founder vesting protects the company and investors</li>
                            </ul>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How does dilution work in startup funding?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    When you raise money, new shares are created for investors, which reduces (dilutes) everyone else&apos;s ownership percentage. If you own 100% and raise money for 20% of the company, you now own 80%. The company is worth more, but you own a smaller piece of a bigger pie.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is a typical option pool size?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Most startups create option pools of 10-20% of fully diluted shares. Early-stage companies often start with 10-15%, while later-stage companies might have 15-20% to attract senior talent. VCs typically require the option pool to be created before their investment, diluting founders rather than investors.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How much equity do founders give up per round?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Founders typically give up 10-25% in seed rounds, 15-30% in Series A, and 15-25% in Series B. By the time a company reaches Series C or later, founders often own 15-30% collectively. The key is balancing dilution with the value each round brings in capital and strategic support.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is fully diluted ownership?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Fully diluted ownership assumes all options, warrants, and convertible securities have been exercised. This is the most conservative way to calculate ownership and is typically used in term sheets and cap tables. It shows what your ownership would be if everyone exercised their rights to buy shares.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Related Tools */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm">
                        <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Related Tools</h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <Link
                                href="/tools-for-founders/advanced-valuation-engine"
                                className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition"
                            >
                                <div className="text-[24px] mb-2">💰</div>
                                <h3 className="font-bold text-[#31372B] mb-1">Valuation Engine</h3>
                                <p className="text-sm text-[#717182]">Calculate startup valuation using VC method</p>
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
                                href="/tools-for-founders/break-even-calculator"
                                className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition"
                            >
                                <div className="text-[24px] mb-2">📊</div>
                                <h3 className="font-bold text-[#31372B] mb-1">Break-Even Calculator</h3>
                                <p className="text-sm text-[#717182]">Calculate your path to profitability</p>
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
