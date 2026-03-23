"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import SmartNavbar from "@/components/SmartNavbar";
import CreditExhaustedModal from "@/components/CreditExhaustedModal";
import { useState } from "react";
import { useCalculationCredits } from "@/hooks/useCalculationCredits";
import DownloadPDFButton from "@/components/tools/DownloadPDFButton";

export default function CACOptimizerPage() {
    // Credit system
    const { creditStatus, useCredit: consumeCredit, isLoading } = useCalculationCredits();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Input states for multiple channels
    const [channels, setChannels] = useState([
        { name: "Google Ads", spend: "10000", customers: "50" },
        { name: "Facebook Ads", spend: "8000", customers: "40" },
        { name: "Content Marketing", spend: "5000", customers: "30" },
    ]);

    const [ltv, setLtv] = useState<string>("5000");
    const [monthlyGrossProfit, setMonthlyGrossProfit] = useState<string>("100");

    // Calculated results
    const [results, setResults] = useState({
        channelCACs: [] as { name: string; cac: number; customers: number }[],
        blendedCAC: 0,
        totalSpend: 0,
        totalCustomers: 0,
        ltvCacRatio: 0,
        cacPayback: 0,
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
            // Calculate CAC metrics AFTER credit is consumed
            const ltvNum = parseFloat(ltv) || 0;
            const monthlyGrossProfitNum = parseFloat(monthlyGrossProfit) || 0;

            // Calculate per-channel CAC
            const channelCACs = channels.map(channel => {
                const spend = parseFloat(channel.spend) || 0;
                const customers = parseFloat(channel.customers) || 0;
                // Channel CAC = Channel Spend / Customers Acquired
                const cac = customers > 0 ? spend / customers : 0;
                return {
                    name: channel.name,
                    cac,
                    customers,
                };
            });

            // Calculate totals
            const totalSpend = channels.reduce((sum, ch) => sum + (parseFloat(ch.spend) || 0), 0);
            const totalCustomers = channels.reduce((sum, ch) => sum + (parseFloat(ch.customers) || 0), 0);

            // Blended CAC = Total Spend / Total Customers
            const blendedCAC = totalCustomers > 0 ? totalSpend / totalCustomers : 0;

            // LTV/CAC Ratio = LTV / Blended CAC
            const ltvCacRatio = blendedCAC > 0 ? ltvNum / blendedCAC : 0;

            // CAC Payback (months) = Blended CAC / Monthly Gross Profit per Customer
            const cacPayback = monthlyGrossProfitNum > 0 ? blendedCAC / monthlyGrossProfitNum : 0;

            setResults({
                channelCACs,
                blendedCAC,
                totalSpend,
                totalCustomers,
                ltvCacRatio,
                cacPayback,
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

    const updateChannel = (index: number, field: 'name' | 'spend' | 'customers', value: string) => {
        const newChannels = [...channels];
        newChannels[index][field] = value;
        setChannels(newChannels);
    };

    const addChannel = () => {
        setChannels([...channels, { name: `Channel ${channels.length + 1}`, spend: "0", customers: "0" }]);
    };

    const removeChannel = (index: number) => {
        if (channels.length > 1) {
            setChannels(channels.filter((_, i) => i !== index));
        }
    };

    const getRatioStatus = (ratio: number) => {
        if (ratio >= 3) return { color: "text-green-600", message: "Excellent" };
        if (ratio >= 2) return { color: "text-yellow-600", message: "Good" };
        if (ratio >= 1) return { color: "text-orange-600", message: "Needs improvement" };
        return { color: "text-red-600", message: "Unsustainable" };
    };

    const ratioStatus = getRatioStatus(results.ltvCacRatio);

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
                        <span className="text-[#31372B]">CAC Optimizer</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-[48px] font-bold text-[#31372B] mb-4 leading-tight">
                            CAC Optimizer
                        </h1>
                        <p className="text-[20px] text-[#717182] leading-relaxed max-w-[800px]">
                            Optimize your Customer Acquisition Cost across marketing channels. Calculate blended CAC, LTV/CAC ratio, and understand acquisition efficiency for sustainable growth.
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
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-[16px] font-bold text-[#31372B]">Marketing Channels</h3>
                                        <button
                                            onClick={addChannel}
                                            className="text-sm text-[#31372B] hover:text-[#717182] font-medium"
                                        >
                                            + Add Channel
                                        </button>
                                    </div>

                                    {channels.map((channel, index) => (
                                        <div key={index} className="mb-4 p-4 border border-[#31372B1F] rounded-lg">
                                            <div className="flex justify-between items-center mb-3">
                                                <input
                                                    type="text"
                                                    value={channel.name}
                                                    onChange={(e) => updateChannel(index, 'name', e.target.value)}
                                                    className="font-medium text-[#31372B] bg-transparent border-none focus:outline-none"
                                                    placeholder="Channel name"
                                                />
                                                {channels.length > 1 && (
                                                    <button
                                                        onClick={() => removeChannel(index)}
                                                        className="text-red-600 text-sm hover:text-red-800"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-[#717182] mb-1">Spend</label>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#717182] text-sm">$</span>
                                                        <input
                                                            type="number"
                                                            value={channel.spend}
                                                            onChange={(e) => updateChannel(index, 'spend', e.target.value)}
                                                            className="w-full pl-6 pr-2 py-2 text-sm border border-[#31372B1F] rounded focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-[#717182] mb-1">Customers</label>
                                                    <input
                                                        type="number"
                                                        value={channel.customers}
                                                        onChange={(e) => updateChannel(index, 'customers', e.target.value)}
                                                        className="w-full px-2 py-2 text-sm border border-[#31372B1F] rounded focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Customer Lifetime Value (LTV)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={ltv}
                                            onChange={(e) => setLtv(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="5000"
                                        />
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        Total revenue expected from a customer
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#31372B] mb-2">
                                        Monthly Gross Profit per Customer
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                        <input
                                            type="number"
                                            value={monthlyGrossProfit}
                                            onChange={(e) => setMonthlyGrossProfit(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                            placeholder="100"
                                        />
                                    </div>
                                    <p className="text-xs text-[#717182] mt-1">
                                        For payback period calculation
                                    </p>
                                </div>

                                {/* Calculate Button */}
                                <button
                                    onClick={handleCalculate}
                                    disabled={isLoading}
                                    className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition disabled:opacity-50 mt-6"
                                >
                                    {isLoading ? "Loading..." : "Calculate CAC"}
                                </button>
                            </div>

                            {/* Results - Only shown after credit consumed */}
                            <div>
                                {showResults ? (
                                    <div className="space-y-4">
                                        <div id="cac-results" className="bg-[#EDF4E5] rounded-lg p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[18px] font-bold text-[#31372B]">CAC Analysis</h3>
                                                <DownloadPDFButton
                                                    fileName="cac-analysis"
                                                    title="CAC Analysis"
                                                    data={[
                                                        { label: "Blended CAC", value: formatCurrency(results.blendedCAC), subtext: `${formatCurrency(results.totalSpend)} spent / ${formatNumber(results.totalCustomers)} customers` },
                                                        { label: "LTV / CAC Ratio", value: `${formatNumber(results.ltvCacRatio)}x`, subtext: ratioStatus.message },
                                                        { label: "CAC Payback Period", value: `${formatNumber(results.cacPayback)} months` },
                                                        ...results.channelCACs.map(c => ({ label: `Channel: ${c.name}`, value: formatCurrency(c.cac) }))
                                                    ]}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="pb-3 border-b border-[#31372B]/10">
                                                    <div className="text-sm text-[#717182] mb-1">Blended CAC</div>
                                                    <div className="text-[32px] font-bold text-[#31372B]">
                                                        {formatCurrency(results.blendedCAC)}
                                                    </div>
                                                    <div className="text-xs text-[#717182] mt-1">
                                                        {formatCurrency(results.totalSpend)} spent / {formatNumber(results.totalCustomers)} customers
                                                    </div>
                                                </div>

                                                <div className="pb-3 border-b border-[#31372B]/10">
                                                    <div className="text-sm text-[#717182] mb-1">LTV / CAC Ratio</div>
                                                    <div className="text-[28px] font-bold text-[#31372B]">
                                                        {formatNumber(results.ltvCacRatio)}x
                                                    </div>
                                                    <div className={`text-sm font-medium mt-1 ${ratioStatus.color}`}>
                                                        {ratioStatus.message}
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <div className="text-sm text-[#717182] mb-1">CAC Payback Period</div>
                                                    <div className="text-[24px] font-bold text-[#31372B]">
                                                        {formatNumber(results.cacPayback)} months
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Channel Breakdown */}
                                        <div className="bg-white border border-[#31372B1F] rounded-lg p-4">
                                            <h4 className="text-sm font-bold text-[#31372B] mb-3">Channel Performance</h4>
                                            <div className="space-y-2">
                                                {results.channelCACs.map((channel, index) => (
                                                    <div key={index} className="flex justify-between items-center text-sm">
                                                        <span className="text-[#717182]">{channel.name}</span>
                                                        <span className="font-medium text-[#31372B]">{formatCurrency(channel.cac)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[#F5F5F5] rounded-lg p-6 h-full flex items-center justify-center min-h-[300px]">
                                        <p className="text-[#717182] text-center">
                                            Click &quot;Calculate CAC&quot; to see your results
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
                            Show investors you understand unit economics and customer acquisition efficiency.
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
                            <h3 className="text-[20px] font-bold mb-3">Understanding CAC</h3>
                            <p className="text-[16px] leading-relaxed mb-4">
                                Customer Acquisition Cost (CAC) measures how much you spend to acquire a new customer. It&apos;s one of the most critical metrics for evaluating marketing efficiency and business sustainability.
                            </p>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Calculation Method</h3>
                            <ol className="list-decimal list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>Channel CAC:</strong> Channel Spend ÷ Customers Acquired</li>
                                <li><strong>Blended CAC:</strong> Total Marketing Spend ÷ Total Customers Acquired</li>
                                <li><strong>LTV/CAC Ratio:</strong> Customer Lifetime Value ÷ Blended CAC</li>
                                <li><strong>CAC Payback:</strong> Blended CAC ÷ Monthly Gross Profit per Customer</li>
                            </ol>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Key Benchmarks</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li><strong>LTV/CAC Ratio:</strong> 3:1 or higher is ideal for SaaS</li>
                                <li><strong>CAC Payback:</strong> Under 12 months is healthy</li>
                                <li><strong>Channel CAC:</strong> Varies by industry and channel maturity</li>
                            </ul>

                            <h3 className="text-[20px] font-bold mb-3 mt-6">Optimization Strategies</h3>
                            <ul className="list-disc list-inside space-y-2 text-[16px] leading-relaxed">
                                <li>Focus budget on channels with lowest CAC</li>
                                <li>Improve conversion rates to reduce CAC</li>
                                <li>Increase LTV through retention and upsells</li>
                                <li>Test new channels at small scale first</li>
                                <li>Track CAC trends over time, not just snapshots</li>
                            </ul>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm mb-12">
                        <h2 className="text-[28px] font-bold text-[#31372B] mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is a good CAC for startups?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    A &quot;good&quot; CAC depends on your LTV. The LTV/CAC ratio should be at least 3:1 for sustainable growth. For SaaS startups, CAC typically ranges from $100-$500 for SMB customers and $1,000-$10,000+ for enterprise. The key is ensuring CAC payback is under 12 months.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How do I calculate blended CAC?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Blended CAC is your total marketing and sales spend divided by total new customers acquired in the same period. Include all costs: advertising, salaries, software, agencies, and overhead. This gives you the true average cost to acquire a customer across all channels.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    What is a healthy LTV to CAC ratio?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    A ratio of 3:1 or higher is considered healthy for most SaaS businesses. This means you earn $3 in lifetime value for every $1 spent on acquisition. Ratios below 1:1 are unsustainable, 1-2:1 needs improvement, and above 5:1 might indicate underinvestment in growth.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-bold text-[#31372B] mb-2">
                                    How can founders reduce CAC?
                                </h3>
                                <p className="text-[16px] text-[#717182] leading-relaxed">
                                    Improve conversion rates at each funnel stage, optimize ad targeting and creative, build organic channels (SEO, content, referrals), improve product-market fit to increase word-of-mouth, and focus on channels with proven ROI. Sometimes increasing LTV through better retention is more effective than reducing CAC.
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
                                href="/tools-for-founders/churn-rate-calculator"
                                className="p-4 border border-[#31372B1F] rounded-lg hover:shadow-md transition"
                            >
                                <div className="text-[24px] mb-2">📉</div>
                                <h3 className="font-bold text-[#31372B] mb-1">Churn Rate Calculator</h3>
                                <p className="text-sm text-[#717182]">Calculate customer and revenue churn</p>
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
