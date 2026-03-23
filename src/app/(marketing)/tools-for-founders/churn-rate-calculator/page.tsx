"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import SmartNavbar from "@/components/SmartNavbar";
import CreditExhaustedModal from "@/components/CreditExhaustedModal";
import { useState } from "react";
import { useCalculationCredits } from "@/hooks/useCalculationCredits";
import DownloadPDFButton from "@/components/tools/DownloadPDFButton";

export default function ChurnRateCalculatorPage() {
    // Credit system
    const { creditStatus, useCredit: consumeCredit, isLoading } = useCalculationCredits();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Input states
    const [startingCustomers, setStartingCustomers] = useState<string>("1000");
    const [customersLost, setCustomersLost] = useState<string>("50");
    const [startingMRR, setStartingMRR] = useState<string>("100000");
    const [churnedMRR, setChurnedMRR] = useState<string>("6000");

    // Calculated results
    const [results, setResults] = useState({
        customerChurnRate: 0,
        revenueChurnRate: 0,
        customerLifetime: 0,
        annualChurnRate: 0,
        retentionRate: 0,
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
            // Calculate churn metrics AFTER credit is consumed
            const startingCustomersNum = parseFloat(startingCustomers) || 0;
            const customersLostNum = parseFloat(customersLost) || 0;
            const startingMRRNum = parseFloat(startingMRR) || 0;
            const churnedMRRNum = parseFloat(churnedMRR) || 0;

            // Churn Rate Calculations
            // Customer Churn (%) = Customers Lost / Starting Customers × 100
            const customerChurnRate = startingCustomersNum > 0
                ? (customersLostNum / startingCustomersNum) * 100
                : 0;

            // Revenue Churn (%) = Churned MRR / Starting MRR × 100
            const revenueChurnRate = startingMRRNum > 0
                ? (churnedMRRNum / startingMRRNum) * 100
                : 0;

            // Average Customer Lifetime (months) = 1 / Monthly Churn Rate
            const monthlyChurnDecimal = customerChurnRate / 100;
            const customerLifetime = monthlyChurnDecimal > 0
                ? 1 / monthlyChurnDecimal
                : 0;

            // Annual Churn Rate (approximate)
            const annualChurnRate = customerChurnRate * 12;

            // Retention Rate = 100 - Churn Rate
            const retentionRate = 100 - customerChurnRate;

            setResults({
                customerChurnRate,
                revenueChurnRate,
                customerLifetime,
                annualChurnRate: Math.min(annualChurnRate, 100), // Cap at 100%
                retentionRate: Math.max(0, retentionRate),
            });

            setShowResults(true);
        } else {
            setShowCreditModal(true);
        }
    };

    const formatPercent = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatNumber = (value: number) => {
        if (!isFinite(value)) return "∞";
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
        }).format(value);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getChurnStatus = (rate: number) => {
        if (rate <= 2) return { color: "text-green-600", message: "Excellent" };
        if (rate <= 5) return { color: "text-yellow-600", message: "Good" };
        if (rate <= 7) return { color: "text-orange-600", message: "Needs improvement" };
        return { color: "text-red-600", message: "Critical - focus on retention" };
    };

    const churnStatus = getChurnStatus(results.customerChurnRate);

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
                        <span className="text-[#31372B]">Churn Rate Calculator</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[48px] font-bold text-[#31372B] mb-4 leading-tight">
                            Churn Rate Calculator
                        </h1>
                        <p className="text-[20px] text-[#717182] leading-relaxed max-w-[800px]">
                            Calculate customer churn and revenue churn for your SaaS or subscription business. Understand retention, customer lifetime, and impact on unit economics.
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
                                    <h3 className="text-[16px] font-bold text-[#31372B] mb-4">Customer Metrics</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#31372B] mb-2">
                                                Starting Customers
                                            </label>
                                            <input
                                                type="number"
                                                value={startingCustomers}
                                                onChange={(e) => setStartingCustomers(e.target.value)}
                                                className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                                placeholder="1000"
                                            />
                                            <p className="text-xs text-[#717182] mt-1">
                                                Customers at start of period
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[#31372B] mb-2">
                                                Customers Lost
                                            </label>
                                            <input
                                                type="number"
                                                value={customersLost}
                                                onChange={(e) => setCustomersLost(e.target.value)}
                                                className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                                placeholder="50"
                                            />
                                            <p className="text-xs text-[#717182] mt-1">
                                                Customers who churned this month
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[16px] font-bold text-[#31372B] mb-4">Revenue Metrics</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#31372B] mb-2">
                                                Starting MRR
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                                <input
                                                    type="number"
                                                    value={startingMRR}
                                                    onChange={(e) => setStartingMRR(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                                    placeholder="100000"
                                                />
                                            </div>
                                            <p className="text-xs text-[#717182] mt-1">
                                                Monthly recurring revenue at start
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[#31372B] mb-2">
                                                Churned MRR
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                                <input
                                                    type="number"
                                                    value={churnedMRR}
                                                    onChange={(e) => setChurnedMRR(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                                    placeholder="6000"
                                                />
                                            </div>
                                            <p className="text-xs text-[#717182] mt-1">
                                                MRR lost from churned customers
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Calculate Button */}
                                <button
                                    onClick={handleCalculate}
                                    disabled={isLoading}
                                    className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition disabled:opacity-50 mt-6"
                                >
                                    {isLoading ? "Loading..." : "Calculate Churn"}
                                </button>
                            </div>

                            {/* Results - Only shown after credit consumed */}
                            <div>
                                {showResults ? (
                                    <div id="churn-rate-results" className="bg-[#EDF4E5] rounded-lg p-6 h-fit">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-[18px] font-bold text-[#31372B]">Churn Analysis</h3>
                                            <DownloadPDFButton
                                                fileName="churn-rate-analysis"
                                                title="Churn Rate Analysis"
                                                data={[
                                                    { label: "Monthly Customer Churn", value: `${formatPercent(results.customerChurnRate)}%` },
                                                    { label: "Monthly Revenue Churn", value: `${formatPercent(results.revenueChurnRate)}%`, subtext: `${formatCurrency(parseFloat(churnedMRR))} lost` },
                                                    { label: "Retention Rate", value: `${formatPercent(results.retentionRate)}%` },
                                                    { label: "Avg Customer Lifetime", value: `${formatNumber(results.customerLifetime)} months` }
                                                ]}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Monthly Customer Churn</div>
                                                <div className="text-[32px] font-bold text-[#31372B]">
                                                    {formatPercent(results.customerChurnRate)}%
                                                </div>
                                                <div className={`text-sm font-medium mt-1 ${churnStatus.color}`}>
                                                    {churnStatus.message}
                                                </div>
                                            </div>

                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Monthly Revenue Churn</div>
                                                <div className="text-[28px] font-bold text-[#31372B]">
                                                    {formatPercent(results.revenueChurnRate)}%
                                                </div>
                                                <div className="text-xs text-[#717182] mt-1">
                                                    {formatCurrency(parseFloat(churnedMRR))} lost
                                                </div>
                                            </div>

                                            <div className="pb-3 border-b border-[#31372B]/10">
                                                <div className="text-sm text-[#717182] mb-1">Customer Retention Rate</div>
                                                <div className="text-[24px] font-bold text-[#31372B]">
                                                    {formatPercent(results.retentionRate)}%
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <div className="text-sm text-[#717182] mb-1">Average Customer Lifetime</div>
                                                <div className="text-[28px] font-bold text-[#31372B]">
                                                    {formatNumber(results.customerLifetime)}
                                                </div>
                                                <div className="text-xs text-[#717182] mt-1">
                                                    months
                                                </div>
                                            </div>
                                        </div>

                                        {results.customerChurnRate > 7 && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-800">
                                                    ⚠️ High churn rate. Focus on customer success and retention.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-[#F5F5F5] rounded-lg p-6 h-full flex items-center justify-center min-h-[300px]">
                                        <p className="text-[#717182] text-center">
                                            Click &quot;Calculate Churn&quot; to see your results
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
                            Low churn demonstrates product-market fit and sustainable growth potential.
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
                            <h3 className="text-[20px] font-bold mb-3">Understanding Churn</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                Churn rate measures the percentage of customers or revenue lost over a period. It&apos;s one of the most critical metrics for subscription businesses, directly impacting growth, LTV, and valuation.
                            </p>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Calculation Method</h3>
                            <ol className="list-decimal list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Customer Churn Rate:</strong> (Customers Lost ÷ Starting Customers) × 100</li>
                                <li><strong>Revenue Churn Rate:</strong> (Churned MRR ÷ Starting MRR) × 100</li>
                                <li><strong>Customer Lifetime:</strong> 1 ÷ Monthly Churn Rate</li>
                                <li><strong>Retention Rate:</strong> 100% - Churn Rate</li>
                            </ol>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Churn Benchmarks (SaaS)</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Excellent:</strong> Under 2% monthly (SMB), under 1% (Enterprise)</li>
                                <li><strong>Good:</strong> 2-5% monthly</li>
                                <li><strong>Acceptable:</strong> 5-7% monthly</li>
                                <li><strong>Concerning:</strong> Over 7% monthly</li>
                            </ul>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Customer vs Revenue Churn</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                Customer churn tracks the number of customers lost, while revenue churn tracks the dollar amount lost. Revenue churn can be negative if expansion revenue from existing customers exceeds churned revenue—a sign of strong product-market fit.
                            </p>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Impact on Business</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li>High churn limits growth potential and increases CAC burden</li>
                                <li>Low churn enables compounding growth and higher LTV</li>
                                <li>Churn directly affects valuation multiples</li>
                                <li>Reducing churn is often more impactful than increasing acquisition</li>
                            </ul>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is a good churn rate for SaaS startups?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    For SMB SaaS, monthly churn under 5% is good, under 2% is excellent. Enterprise SaaS should target under 1% monthly churn. Early-stage startups often have higher churn (5-10%) as they refine product-market fit. The key is showing improvement over time and understanding why customers leave.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What&apos;s the difference between customer churn and revenue churn?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Customer churn measures the percentage of customers lost, while revenue churn measures the percentage of revenue lost. They can differ significantly—losing 10 small customers might be 5% customer churn but only 1% revenue churn. Revenue churn is typically more important for business health.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How does churn affect LTV?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Churn directly determines customer lifetime, which is a key component of LTV. If monthly churn is 5%, average customer lifetime is 20 months (1 ÷ 0.05). Lower churn means longer customer lifetime and higher LTV, which improves unit economics and allows for higher CAC spending.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How can founders reduce churn?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Focus on customer success and onboarding, ensure strong product-market fit, provide excellent support, regularly engage with customers, identify at-risk customers early, gather and act on feedback, and continuously improve product value. Sometimes raising prices to attract better-fit customers can reduce churn.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Related Tools */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm">
                        <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Related Tools</h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <Link
                                href="/tools-for-founders/cac-optimizer"
                                className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition"
                            >
                                <div className="text-[24px] mb-2">📈</div>
                                <h3 className="font-bold text-[#31372B] mb-1">CAC Optimizer</h3>
                                <p className="text-sm text-[#717182]">Optimize customer acquisition costs</p>
                            </Link>

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
