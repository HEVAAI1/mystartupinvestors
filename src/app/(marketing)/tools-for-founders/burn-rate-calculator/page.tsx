"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import SmartNavbar from "@/components/SmartNavbar";
import CreditExhaustedModal from "@/components/CreditExhaustedModal";
import { useState } from "react";
import { useCalculationCredits } from "@/hooks/useCalculationCredits";
import DownloadPDFButton from "@/components/tools/DownloadPDFButton";

export default function BurnRateCalculatorPage() {
    // Credit system
    const { creditStatus, useCredit: consumeCredit, isLoading } = useCalculationCredits();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showResults, setShowResults] = useState(false);
    // Input states
    const [monthlyExpenses, setMonthlyExpenses] = useState<string>("150000");
    const [monthlyRevenue, setMonthlyRevenue] = useState<string>("50000");
    const [cashBalance, setCashBalance] = useState<string>("1200000");

    // Calculated results
    const [results, setResults] = useState({
        grossBurn: 0,
        netBurn: 0,
        runway: 0,
        isPositiveCashFlow: false,
    });

    // Handle calculate button click
    const handleCalculate = async () => {
        if (!creditStatus.canCalculate) {
            setShowCreditModal(true);
            return;
        }
        const result = await consumeCredit();
        if (result.success) {
            // Calculate burn rate AFTER credit is consumed
            const monthlyExpensesNum = parseFloat(monthlyExpenses) || 0;
            const monthlyRevenueNum = parseFloat(monthlyRevenue) || 0;
            const cashBalanceNum = parseFloat(cashBalance) || 0;

            const grossBurn = monthlyExpensesNum;
            const netBurn = monthlyExpensesNum - monthlyRevenueNum;
            const isPositiveCashFlow = netBurn <= 0;
            const runway = isPositiveCashFlow
                ? Infinity
                : (netBurn > 0 ? cashBalanceNum / netBurn : 0);

            setResults({
                grossBurn,
                netBurn,
                runway,
                isPositiveCashFlow,
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

    const formatNumber = (value: number) => {
        if (value === Infinity) return "∞";
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
        }).format(value);
    };

    const getRunwayStatus = (months: number) => {
        if (months === Infinity) return { color: "text-green-600", message: "Cash flow positive!" };
        if (months >= 18) return { color: "text-green-600", message: "Healthy runway" };
        if (months >= 12) return { color: "text-yellow-600", message: "Adequate runway" };
        if (months >= 6) return { color: "text-orange-600", message: "Start fundraising soon" };
        return { color: "text-red-600", message: "Critical - fundraise now!" };
    };

    const runwayStatus = getRunwayStatus(results.runway);

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
                        <span className="text-[#31372B]">Burn Rate Calculator</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[48px] font-bold text-[#31372B] mb-4 leading-tight">
                            Burn Rate & Runway Calculator
                        </h1>
                        <p className="text-[20px] text-[#717182] leading-relaxed max-w-[800px]">
                            Calculate your startup&apos;s burn rate and cash runway. Understand how long your company can operate before needing to raise new funding.
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
                                        Monthly Operating Expenses
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={monthlyExpenses}
                                            onChange={(e) => setMonthlyExpenses(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="150000"
                                        />
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Salaries, rent, software, marketing, etc.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Monthly Revenue
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={monthlyRevenue}
                                            onChange={(e) => setMonthlyRevenue(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="50000"
                                        />
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Average monthly recurring revenue
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Current Cash Balance
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={cashBalance}
                                            onChange={(e) => setCashBalance(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="1200000"
                                        />
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Total cash available in bank
                                    </p>
                                </div>

                                {/* Calculate Button */}
                                <button
                                    onClick={handleCalculate}
                                    disabled={isLoading}
                                    className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition disabled:opacity-50 mt-6"
                                >
                                    {isLoading ? "Loading..." : "Calculate Burn Rate"}
                                </button>
                            </div>

                            {/* Results - Only shown after credit consumed */}
                            <div>
                                {showResults ? (
                                    <div id="burn-rate-results" className="bg-[#EDF4E5] rounded-lg p-6 h-fit">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-[18px] font-bold text-[#31372B]">Burn Analysis</h3>
                                            <DownloadPDFButton
                                                fileName="burn-rate-analysis"
                                                title="Burn Rate Analysis"
                                                data={[
                                                    { label: "Gross Burn Rate", value: `${formatCurrency(results.grossBurn)} per month` },
                                                    { label: "Net Burn Rate", value: `${formatCurrency(results.netBurn)} per month` },
                                                    { label: "Cash Runway", value: results.runway === Infinity ? "Infinite" : `${formatNumber(results.runway)} months`, subtext: runwayStatus.message },
                                                    { label: "Cash Flow Status", value: results.isPositiveCashFlow ? "Positive" : "Negative" }
                                                ]}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Gross Burn Rate</div>
                                                <div className="text-[24px] font-bold text-[#31372B]">
                                                    {formatCurrency(results.grossBurn)}
                                                </div>
                                                <div className="text-xs text-[#717182] mt-1">
                                                    per month
                                                </div>
                                            </div>

                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Net Burn Rate</div>
                                                <div className="text-[24px] font-bold text-[#31372B]">
                                                    {formatCurrency(results.netBurn)}
                                                </div>
                                                <div className="text-xs text-[#717182] mt-1">
                                                    per month (expenses - revenue)
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <div className="text-sm text-[#717182] mb-1">Cash Runway</div>
                                                <div className="text-[40px] font-bold text-[#31372B]">
                                                    {formatNumber(results.runway)}
                                                </div>
                                                <div className="text-xs text-[#717182] mt-1">
                                                    {results.runway === Infinity ? "months (profitable!)" : "months remaining"}
                                                </div>
                                                <div className={`text-sm font-medium mt-2 ${runwayStatus.color}`}>
                                                    {runwayStatus.message}
                                                </div>
                                            </div>
                                        </div>

                                        {results.isPositiveCashFlow && (
                                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-sm text-green-800">
                                                    🎉 Congratulations! You&apos;re cash flow positive.
                                                </p>
                                            </div>
                                        )}

                                        {!results.isPositiveCashFlow && results.runway < 6 && results.runway > 0 && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-800">
                                                    ⚠️ Critical runway. Start fundraising immediately.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-[#F5F5F5] rounded-lg p-6 h-full flex items-center justify-center min-h-[300px]">
                                        <p className="text-[#717182] text-center">
                                            Click &quot;Calculate Burn Rate&quot; to see your results
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
                            <h3 className="text-[20px] font-bold mb-3">Understanding Burn Rate</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                Burn rate measures how quickly a company spends its cash reserves. It&apos;s one of the most critical metrics for startups, as it directly determines how long you can operate before running out of money.
                            </p>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Calculation Method</h3>
                            <ol className="list-decimal list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Gross Burn Rate:</strong> Total monthly operating expenses</li>
                                <li><strong>Net Burn Rate:</strong> Monthly Expenses - Monthly Revenue</li>
                                <li><strong>Cash Runway:</strong> Cash Balance ÷ Net Burn Rate</li>
                            </ol>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Key Concepts</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Gross Burn:</strong> Total cash spent per month, regardless of revenue</li>
                                <li><strong>Net Burn:</strong> Actual cash depletion after accounting for revenue</li>
                                <li><strong>Runway:</strong> Number of months until cash runs out at current burn rate</li>
                                <li><strong>Cash Flow Positive:</strong> When revenue exceeds expenses (infinite runway)</li>
                            </ul>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Runway Benchmarks</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>18+ months:</strong> Healthy - focus on growth</li>
                                <li><strong>12-18 months:</strong> Adequate - monitor closely</li>
                                <li><strong>6-12 months:</strong> Start preparing for fundraising</li>
                                <li><strong>Under 6 months:</strong> Critical - fundraise immediately</li>
                            </ul>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Important Considerations</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li>Fundraising typically takes 3-6 months</li>
                                <li>Revenue growth can extend runway significantly</li>
                                <li>One-time expenses can temporarily increase burn</li>
                                <li>Seasonal variations may affect monthly calculations</li>
                            </ul>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is burn rate?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Burn rate is the rate at which a company spends its cash reserves before generating positive cash flow. Net burn rate (expenses minus revenue) is the most important metric, as it shows actual cash depletion and determines your runway.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is a healthy runway for startups?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Most VCs recommend maintaining at least 12-18 months of runway. This gives you time to hit milestones, raise your next round, and handle unexpected challenges. If your runway drops below 6 months, you should be actively fundraising.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How does revenue growth affect burn?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    As revenue grows, your net burn rate decreases, extending your runway. Eventually, when revenue exceeds expenses, you become cash flow positive with infinite runway. This is why investors focus heavily on revenue growth rates and unit economics.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    When should founders start fundraising?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Start fundraising when you have 9-12 months of runway remaining. Fundraising typically takes 3-6 months, and you want buffer for negotiations and unexpected delays. Never wait until you&apos;re desperate—investors can sense urgency and it weakens your position.
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
                                href="/tools-for-founders/break-even-calculator"
                                className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition"
                            >
                                <div className="text-[24px] mb-2">📊</div>
                                <h3 className="font-bold text-[#31372B] mb-1">Break-Even Calculator</h3>
                                <p className="text-sm text-[#717182]">Calculate your path to profitability</p>
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
