"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import SmartNavbar from "@/components/SmartNavbar";
import CreditExhaustedModal from "@/components/CreditExhaustedModal";
import { useState } from "react";
import { useCalculationCredits } from "@/hooks/useCalculationCredits";
import DownloadPDFButton from "@/components/tools/DownloadPDFButton";

export default function BreakEvenCalculatorPage() {
    // Credit system
    const { creditStatus, useCredit: consumeCredit, isLoading } = useCalculationCredits();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showResults, setShowResults] = useState(false);
    // Input states
    const [fixedCosts, setFixedCosts] = useState<string>("50000");
    const [revenuePerUnit, setRevenuePerUnit] = useState<string>("100");
    const [variableCostPerUnit, setVariableCostPerUnit] = useState<string>("40");

    // Calculated results
    const [results, setResults] = useState({
        contributionMargin: 0,
        breakEvenUnits: 0,
        breakEvenRevenue: 0,
        contributionMarginPercent: 0,
    });

    // Handle calculate button click
    const handleCalculate = async () => {
        if (!creditStatus.canCalculate) {
            setShowCreditModal(true);
            return;
        }
        const result = await consumeCredit();
        if (result.success) {
            // Calculate break-even AFTER credit is consumed
            const fixedCostsNum = parseFloat(fixedCosts) || 0;
            const revenuePerUnitNum = parseFloat(revenuePerUnit) || 0;
            const variableCostPerUnitNum = parseFloat(variableCostPerUnit) || 0;

            const contributionMargin = revenuePerUnitNum - variableCostPerUnitNum;
            const contributionMarginPercent = revenuePerUnitNum > 0
                ? (contributionMargin / revenuePerUnitNum) * 100
                : 0;
            const breakEvenUnits = contributionMargin > 0
                ? fixedCostsNum / contributionMargin
                : 0;
            const breakEvenRevenue = breakEvenUnits * revenuePerUnitNum;

            setResults({
                contributionMargin,
                breakEvenUnits,
                breakEvenRevenue,
                contributionMarginPercent,
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
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
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
                        <span className="text-[#31372B]">Break-Even Calculator</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[48px] font-bold text-[#31372B] mb-4 leading-tight">
                            Break-Even Calculator for Startups
                        </h1>
                        <p className="text-[20px] text-[#717182] leading-relaxed max-w-[800px]">
                            Calculate your startup&apos;s break-even point in units and revenue. Understand how pricing, costs, and volume impact your path to profitability.
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
                                        Fixed Monthly Costs
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={fixedCosts}
                                            onChange={(e) => setFixedCosts(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="50000"
                                        />
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Rent, salaries, software, insurance, etc.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Revenue per Unit
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={revenuePerUnit}
                                            onChange={(e) => setRevenuePerUnit(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="100"
                                        />
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Price you charge per product/service
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Variable Cost per Unit
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={variableCostPerUnit}
                                            onChange={(e) => setVariableCostPerUnit(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="40"
                                        />
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Direct costs per unit (materials, delivery, etc.)
                                    </p>
                                </div>

                                {/* Calculate Button */}
                                <button
                                    onClick={handleCalculate}
                                    disabled={isLoading}
                                    className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition disabled:opacity-50 mt-6"
                                >
                                    {isLoading ? "Loading..." : "Calculate Break-Even"}
                                </button>
                            </div>

                            {/* Results - Only shown after credit consumed */}
                            <div>
                                {showResults ? (
                                    <div id="break-even-results" className="bg-[#EDF4E5] rounded-lg p-6 h-fit">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-[18px] font-bold text-[#31372B]">Break-Even Analysis</h3>
                                            <DownloadPDFButton
                                                fileName="break-even-analysis"
                                                title="Break-Even Analysis"
                                                data={[
                                                    { label: "Break-Even Revenue", value: formatCurrency(results.breakEvenRevenue), subtext: "Monthly revenue needed" },
                                                    { label: "Break-Even Units", value: formatNumber(results.breakEvenUnits), subtext: "Units per month" },
                                                    { label: "Contribution Margin", value: formatCurrency(results.contributionMargin) },
                                                    { label: "Contribution Margin %", value: `${formatNumber(results.contributionMarginPercent)}%` }
                                                ]}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Contribution Margin per Unit</div>
                                                <div className="text-[24px] font-bold text-[#31372B]">
                                                    {formatCurrency(results.contributionMargin)}
                                                </div>
                                                <div className="text-xs text-[#717182] mt-1">
                                                    {formatNumber(results.contributionMarginPercent)}% margin
                                                </div>
                                            </div>

                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Break-Even Units</div>
                                                <div className="text-[32px] font-bold text-[#31372B]">
                                                    {formatNumber(results.breakEvenUnits)}
                                                </div>
                                                <div className="text-xs text-[#717182] mt-1">
                                                    units per month
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <div className="text-sm text-[#717182] mb-1">Break-Even Revenue</div>
                                                <div className="text-[32px] font-bold text-[#31372B]">
                                                    {formatCurrency(results.breakEvenRevenue)}
                                                </div>
                                                <div className="text-xs text-[#717182] mt-1">
                                                    monthly revenue needed
                                                </div>
                                            </div>
                                        </div>

                                        {results.contributionMargin <= 0 && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-800">
                                                    ⚠️ Your variable cost exceeds revenue per unit. Adjust pricing or reduce costs.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-[#F5F5F5] rounded-lg p-6 h-full flex items-center justify-center min-h-[300px]">
                                        <p className="text-[#717182] text-center">
                                            Click &quot;Calculate Break-Even&quot; to see your results
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
                            <h3 className="text-[20px] font-bold mb-3">Break-Even Analysis Fundamentals</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                Break-even analysis identifies the point where total revenue equals total costs, meaning your business is neither making a profit nor a loss. This is critical for understanding pricing strategy, cost structure, and sales targets.
                            </p>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Calculation Method</h3>
                            <ol className="list-decimal list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Contribution Margin:</strong> Revenue per Unit - Variable Cost per Unit</li>
                                <li><strong>Contribution Margin %:</strong> (Contribution Margin ÷ Revenue per Unit) × 100</li>
                                <li><strong>Break-Even Units:</strong> Fixed Costs ÷ Contribution Margin</li>
                                <li><strong>Break-Even Revenue:</strong> Break-Even Units × Revenue per Unit</li>
                            </ol>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Key Concepts</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Fixed Costs:</strong> Expenses that don&apos;t change with volume (rent, salaries, software)</li>
                                <li><strong>Variable Costs:</strong> Expenses that scale with each unit (materials, shipping, commissions)</li>
                                <li><strong>Contribution Margin:</strong> Amount each unit contributes to covering fixed costs</li>
                                <li><strong>Break-Even Point:</strong> Minimum sales needed to avoid losses</li>
                            </ul>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Practical Applications</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li>Set realistic sales targets for profitability</li>
                                <li>Evaluate pricing strategies and their impact</li>
                                <li>Assess the viability of new products or services</li>
                                <li>Understand how cost changes affect profitability</li>
                                <li>Plan for different growth scenarios</li>
                            </ul>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is break-even analysis?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Break-even analysis is a financial calculation that determines the point at which your total revenue equals your total costs. At this point, you&apos;re not making a profit, but you&apos;re also not losing money. It helps founders understand minimum sales requirements and pricing strategies.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How do fixed and variable costs differ?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Fixed costs remain constant regardless of sales volume (rent, salaries, insurance). Variable costs change with each unit sold (raw materials, shipping, transaction fees). Understanding this distinction is crucial for accurate break-even calculations and pricing decisions.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    Why is break-even important for startups?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Break-even analysis helps startups set realistic sales targets, evaluate pricing strategies, and understand how long until profitability. It&apos;s essential for fundraising conversations, as investors want to know your path to profitability and capital efficiency.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    Can break-even change over time?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Yes, your break-even point changes as your cost structure evolves. Hiring new team members increases fixed costs, while economies of scale may reduce variable costs. Regularly recalculating break-even helps you stay on track and make informed decisions about growth investments.
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
                                href="/tools-for-founders/cap-table"
                                className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition"
                            >
                                <div className="text-[24px] mb-2">📋</div>
                                <h3 className="font-bold text-[#31372B] mb-1">Cap Table Model</h3>
                                <p className="text-sm text-[#717182]">Model equity dilution scenarios</p>
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
