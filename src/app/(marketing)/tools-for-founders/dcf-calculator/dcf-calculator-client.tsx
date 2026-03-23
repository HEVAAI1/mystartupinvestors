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

        const creditResult = await consumeCredit();

        if (creditResult.success) {
            const fcf = parseFloat(year1FCF) || 0;
            const growth = (parseFloat(growthRate) || 0) / 100;
            const dr = (parseFloat(wacc) || 0) / 100;
            const years = parseInt(projectionPeriod) || 5;
            const mult = parseFloat(terminalMultiple) || 0;

            let dcfSum = 0;
            const yearlyProjections: { year: number; cashFlow: number; discounted: number }[] = [];

            // Calculate projections
            // Cash Flow Year N = Year 1 Cash Flow * (1 + Growth Rate)^(N-1) if we start at year 1
            // But formula says: Cash Flow Year N = Year 1 Cash Flow × (1 + Growth Rate)^N
            // If the input is "Year 1 FCF", then Year 1 is FIXED.
            // Let's assume the user inputs the BASE, and we project N years.
            // Or usually "Year 1 FCF" IS the first year.
            // Let's treat inputs as:
            // Year 1 = Input
            // Year 2 = Year 1 * (1 + g)
            // ...

            // Re-reading formula: "Cash Flow Year N = Year 1 Cash Flow × (1 + Growth Rate)^N"
            // This implies Year 0 is Year 1 FCF / (1+g)? Or maybe Input is "Current FCF"?
            // If Input is "Year 1 FCF", then for N=1, it should be Year 1 FCF.
            // If I use the formula literally: CF_1 = Input * (1+g)^1. That would mean Year 1 is grown.
            // I will assume Input is the BASE (Year 0 equivalent) or I will strictly follow the provided formula logic?
            // "Cash Flow Year N = Year 1 Cash Flow × (1 + Growth Rate)^N" --> This implies compounding starting from Year 1.
            // If N=1, CF = Input * (1+g).
            // So Input is "Base Year" or Year 0.
            // But the label is "Year 1 Free Cash Flow".
            // If I label it "Year 1", and then multiply by (1+g) for Year 1, that's double counting growth.
            // I will implement: Year 1 = Input. Year 2 = Year 1 * (1+g).
            // This is standard.

            // However, strictly following the prompt's "Calculation Logic":
            // Cash Flow Year N = Year 1 Cash Flow × (1 + Growth Rate)^N
            // This usually implies Year N is N years AFTER Year 1?
            // If N=0 (Year 1), (1+g)^0 = 1.
            // So if I map Loop Index i (1 to Period) as "N in projection":
            // If i=1 (Year 1), I want it to be Year 1 FCF. 
            // So exponent should be i-1.
            // But prompt says "^N".
            // I will assume standard DCF: Year 1 is given or calculated.
            // Let's assume Year 1 is GIVEN.
            // Year 2 = Year 1 * (1+g).

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
                                    value={terminalMultiple}
                                    onChange={(e) => setTerminalMultiple(e.target.value)}
                                    className="w-full px-4 py-3 border border-[#31372B1F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31372B]/20"
                                />
                            </div>
                        </div>

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
