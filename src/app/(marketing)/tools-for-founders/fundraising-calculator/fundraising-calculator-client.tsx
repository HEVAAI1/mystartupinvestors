"use client";

import { useState } from "react";
import CreditExhaustedModal from "@/components/CreditExhaustedModal";
import { useCalculationCredits } from "@/hooks/useCalculationCredits";
import DownloadPDFButton from "@/components/tools/DownloadPDFButton";

export default function FundraisingCalculatorClient() {
    // Credit system
    const { creditStatus, useCredit: consumeCredit, isLoading } = useCalculationCredits();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Inputs
    const [currentRunway, setCurrentRunway] = useState<string>("6");
    const [targetRunway, setTargetRunway] = useState<string>("18");
    const [monthlyBurnRate, setMonthlyBurnRate] = useState<string>("50000");
    const [preMoneyValuation, setPreMoneyValuation] = useState<string>("5000000");
    const [founderOwnership, setFounderOwnership] = useState<string>("100");

    // Results
    const [results, setResults] = useState({
        requiredCapital: 0,
        postMoneyValuation: 0,
        dilutionRef: 0, // Dilution percentage
        founderOwnershipAfter: 0,
    });

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

    const handleCalculate = async () => {
        if (!creditStatus.canCalculate) {
            setShowCreditModal(true);
            return;
        }

        const creditResult = await consumeCredit();

        if (creditResult.success) {
            const currentR = parseFloat(currentRunway) || 0;
            const targetR = parseFloat(targetRunway) || 0;
            const burn = parseFloat(monthlyBurnRate) || 0;
            const preMoney = parseFloat(preMoneyValuation) || 0;
            const founderOwn = parseFloat(founderOwnership) || 0;

            // Required Capital = Burn Rate × (Target Runway − Current Runway)
            const requiredCapital = Math.max(0, burn * (targetR - currentR));

            // Post-Money Valuation = Pre-Money + Required Capital
            const postMoneyValuation = preMoney + requiredCapital;

            // Dilution = Required Capital / Post-Money
            const dilutionDecimal = postMoneyValuation > 0 ? requiredCapital / postMoneyValuation : 0;
            const dilutionPercent = dilutionDecimal * 100;

            // Founder Ownership After = Founder Ownership × (1 − Dilution)
            // If Dilution is decimal, 1 - dilutionDecimal.
            const founderOwnershipAfter = founderOwn * (1 - dilutionDecimal);

            setResults({
                requiredCapital,
                postMoneyValuation,
                dilutionRef: dilutionPercent,
                founderOwnershipAfter,
            });

            setShowResults(true);
        } else {
            setShowCreditModal(true);
        }
    };

    return (
        <div className="space-y-12">
            {/* Credit Status Banner */}
            {!isLoading && (
                <div className="p-4 bg-[#EDF4E5] border border-[#31372B]/10 rounded-lg">
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

            <div className="bg-white border border-[#31372B1F] rounded-xl p-8 shadow-sm">
                <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Fundraising Planning</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#31372B] mb-2">
                                    Current Runway (Mo)
                                </label>
                                <input
                                    type="number"
                                    value={currentRunway}
                                    onChange={(e) => setCurrentRunway(e.target.value)}
                                    className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#31372B] mb-2">
                                    Target Runway (Mo)
                                </label>
                                <input
                                    type="number"
                                    value={targetRunway}
                                    onChange={(e) => setTargetRunway(e.target.value)}
                                    className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#31372B] mb-2">
                                Monthly Burn Rate
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                <input
                                    type="number"
                                    value={monthlyBurnRate}
                                    onChange={(e) => setMonthlyBurnRate(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                />
                            </div>
                        </div>

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
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#31372B] mb-2">
                                Current Founder Ownership (%)
                            </label>
                            <input
                                type="number"
                                value={founderOwnership}
                                onChange={(e) => setFounderOwnership(e.target.value)}
                                className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                            />
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={isLoading}
                            className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition disabled:opacity-50 mt-6"
                        >
                            {isLoading ? "Loading..." : "Calculate Plan"}
                        </button>
                    </div>

                    {/* Results */}
                    <div>
                        {showResults ? (
                            <div className="space-y-4">
                                <div id="fundraising-results" className="bg-[#EDF4E5] rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[18px] font-bold text-[#31372B]">Funding Requirements</h3>
                                        <DownloadPDFButton
                                            fileName="fundraising-plan"
                                            title="Fundraising Plan"
                                            data={[
                                                { label: "Capital to Raise", value: formatCurrency(results.requiredCapital), subtext: `To reach ${targetRunway} months of runway` },
                                                { label: "Post-Money Valuation", value: formatCurrency(results.postMoneyValuation) },
                                                { label: "Dilution", value: `${formatPercent(results.dilutionRef)}%` },
                                                { label: "Founder Ownership After", value: `${formatPercent(results.founderOwnershipAfter)}%` }
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="pb-3 border-b border-[#31372B]/10">
                                            <div className="text-sm text-[#717182] mb-1">Capital to Raise</div>
                                            <div className="text-[32px] font-bold text-[#31372B]">
                                                {formatCurrency(results.requiredCapital)}
                                            </div>
                                            <div className="text-xs text-[#717182] mt-1">
                                                To reach {targetRunway} months of runway
                                            </div>
                                        </div>

                                        <div className="pb-3 border-b border-[#31372B]/10">
                                            <div className="text-sm text-[#717182] mb-1">Post-Money Valuation</div>
                                            <div className="text-[24px] font-bold text-[#31372B]">
                                                {formatCurrency(results.postMoneyValuation)}
                                            </div>
                                        </div>

                                        <div className="pt-2 grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-[#717182] mb-1">Dilution</div>
                                                <div className="text-[20px] font-bold text-[#31372B]">
                                                    {formatPercent(results.dilutionRef)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-[#717182] mb-1">Founder %% After</div>
                                                <div className="text-[20px] font-bold text-[#31372B]">
                                                    {formatPercent(results.founderOwnershipAfter)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#F5F5F5] rounded-lg p-6 h-full flex items-center justify-center min-h-[300px]">
                                <p className="text-[#717182] text-center">
                                    Click &quot;Calculate Plan&quot; to see your results
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreditExhaustedModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                userState={creditStatus.userState === "loading" ? "anonymous" : creditStatus.userState}
                remaining={creditStatus.remaining}
                resetDate={creditStatus.resetDate}
            />
        </div>
    );
}
