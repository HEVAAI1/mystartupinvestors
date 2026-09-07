"use client";

import { useState } from "react";
import CreditExhaustedModal from "@/components/CreditExhaustedModal";
import { useCalculationCredits } from "@/hooks/useCalculationCredits";
import DownloadPDFButton from "@/components/tools/DownloadPDFButton";

export default function DCFCalculatorClient() {
    // Credit system
    const { creditStatus, useCredit: consumeCredit, isLoading } = useCalculationCredits();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Inputs
    const [year1FCF, setYear1FCF] = useState<string>("1000000");
    const [growthRate, setGrowthRate] = useState<string>("20");
    const [wacc, setWacc] = useState<string>("12");
    const [projectionPeriod, setProjectionPeriod] = useState<string>("5");
    const [terminalMultiple, setTerminalMultiple] = useState<string>("10");

    // Results
    const [results, setResults] = useState({
        discountedCashFlowsSum: 0,
        terminalValue: 0,
        discountedTerminalValue: 0,
        enterpriseValue: 0,
        yearlyProjections: [] as { year: number; cashFlow: number; discounted: number }[]
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const handleCalculate = async () => {
        if (!creditStatus.canCalculate) {
            setShowCreditModal(true);
            return;
        }

        const fcf = parseFloat(year1FCF);
        const growth = parseFloat(growthRate) / 100;
        const dr = parseFloat(wacc) / 100;
        const years = parseInt(projectionPeriod, 10);
        const mult = parseFloat(terminalMultiple);

        if (
            !Number.isFinite(fcf) ||
            !Number.isFinite(growth) ||
            !Number.isFinite(dr) ||
            !Number.isInteger(years) || years < 1 ||
            !Number.isFinite(mult) || mult < 0
        ) {
            setValidationError("Enter a projection period of at least 1 year and valid numbers for every field.");
            return;
        }
        setValidationError(null);

        const creditResult = await consumeCredit();

        if (creditResult.success) {

            let dcfSum = 0;
            const yearlyProjections: { year: number; cashFlow: number; discounted: number }[] = [];

            // Year 1 cash flow is the user-entered input as-is (not grown), each
            // subsequent year compounds the prior year by the growth rate — the
            // standard convention, and consistent with the "Year 1 FCF" label.
            yearlyProjections.push({
                year: 1,
                cashFlow: fcf,
                discounted: fcf / Math.pow(1 + dr, 1)
            });
            dcfSum += fcf / Math.pow(1 + dr, 1);

            let prevCF = fcf;
            for (let i = 2; i <= years; i++) {
                const cf = prevCF * (1 + growth);
                const discounted = cf / Math.pow(1 + dr, i); // Discount Factor = 1 / (1 + WACC)^N
                yearlyProjections.push({
                    year: i,
                    cashFlow: cf,
                    discounted: discounted
                });
                dcfSum += discounted;
                prevCF = cf;
            }

            // Terminal Value = Final Year Cash Flow * Terminal Multiple
            const finalYearCF = yearlyProjections[years - 1].cashFlow;
            const tv = finalYearCF * mult;

            // Discounted TV
            const discountedTV = tv / Math.pow(1 + dr, years);

            // Enterprise Value
            const ev = dcfSum + discountedTV;

            setResults({
                discountedCashFlowsSum: dcfSum,
                terminalValue: tv,
                discountedTerminalValue: discountedTV,
                enterpriseValue: ev,
                yearlyProjections
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
                <h2 className="text-[24px] font-bold text-[#31372B] mb-6">DCF Valuation Model</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#31372B] mb-2">
                                Year 1 Free Cash Flow
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]">$</span>
                                <input
                                    type="number"
                                    value={year1FCF}
                                    onChange={(e) => setYear1FCF(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#31372B] mb-2">
                                Annual Growth Rate (%)
                            </label>
                            <input
                                type="number"
                                value={growthRate}
                                onChange={(e) => setGrowthRate(e.target.value)}
                                className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#31372B] mb-2">
                                Discount Rate (WACC %)
                            </label>
                            <input
                                type="number"
                                value={wacc}
                                onChange={(e) => setWacc(e.target.value)}
                                className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#31372B] mb-2">
                                    Projection (Years)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={projectionPeriod}
                                    onChange={(e) => setProjectionPeriod(e.target.value)}
                                    className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#31372B] mb-2">
                                    Terminal Multiple
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={terminalMultiple}
                                    onChange={(e) => setTerminalMultiple(e.target.value)}
                                    className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                />
                            </div>
                        </div>

                        {validationError && (
                            <p className="text-sm text-red-600 mt-2">{validationError}</p>
                        )}

                        <button
                            onClick={handleCalculate}
                            disabled={isLoading}
                            className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition disabled:opacity-50 mt-6"
                        >
                            {isLoading ? "Loading..." : "Calculate Valuation"}
                        </button>
                    </div>

                    {/* Results */}
                    <div>
                        {showResults ? (
                            <div className="space-y-4">
                                <div id="dcf-results" className="bg-[#EDF4E5] rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[18px] font-bold text-[#31372B]">Valuation Results</h3>
                                        <DownloadPDFButton
                                            fileName="dcf-valuation"
                                            title="DCF Valuation"
                                            data={[
                                                { label: "Enterprise Value", value: formatCurrency(results.enterpriseValue) },
                                                { label: "PV of Cash Flows", value: formatCurrency(results.discountedCashFlowsSum) },
                                                { label: "PV of Terminal Value", value: formatCurrency(results.discountedTerminalValue), subtext: `Terminal Value: ${formatCurrency(results.terminalValue)}` }
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="pb-3 border-b border-[#31372B]/10">
                                            <div className="text-sm text-[#717182] mb-1">Enterprise Value</div>
                                            <div className="text-[32px] font-bold text-[#31372B]">
                                                {formatCurrency(results.enterpriseValue)}
                                            </div>
                                        </div>

                                        <div className="pb-3 border-b border-[#31372B]/10">
                                            <div className="text-sm text-[#717182] mb-1">PV of Cash Flows</div>
                                            <div className="text-[24px] font-bold text-[#31372B]">
                                                {formatCurrency(results.discountedCashFlowsSum)}
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="text-sm text-[#717182] mb-1">PV of Terminal Value</div>
                                            <div className="text-[24px] font-bold text-[#31372B]">
                                                {formatCurrency(results.discountedTerminalValue)}
                                            </div>
                                            <div className="text-xs text-[#717182] mt-1">
                                                (Terminal Value: {formatCurrency(results.terminalValue)})
                                            </div>
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
