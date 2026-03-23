"use client";

import { useState } from "react";
import CreditExhaustedModal from "@/components/CreditExhaustedModal";
import { useCalculationCredits } from "@/hooks/useCalculationCredits";
import DownloadPDFButton from "@/components/tools/DownloadPDFButton";

export default function InvestabilityScoreCalculatorClient() {
    // Credit system
    const { creditStatus, useCredit: consumeCredit, isLoading } = useCalculationCredits();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Inputs
    const [teamScore, setTeamScore] = useState<string>("7");
    const [marketScore, setMarketScore] = useState<string>("7");
    const [pmfScore, setPmfScore] = useState<string>("5");
    const [moatScore, setMoatScore] = useState<string>("4");

    // Results
    const [results, setResults] = useState({
        weightedScore: 0,
        teamContrib: 0,
        marketContrib: 0,
        pmfContrib: 0,
        moatContrib: 0,
        verdict: "",
    });

    const formatScore = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).format(value);
    };

    const handleCalculate = async () => {
        if (!creditStatus.canCalculate) {
            setShowCreditModal(true);
            return;
        }

        const creditResult = await consumeCredit();

        if (creditResult.success) {
            const team = Math.min(10, Math.max(1, parseFloat(teamScore) || 1));
            const market = Math.min(10, Math.max(1, parseFloat(marketScore) || 1));
            const pmf = Math.min(10, Math.max(1, parseFloat(pmfScore) || 1));
            const moat = Math.min(10, Math.max(1, parseFloat(moatScore) || 1));

            // Weighted Score = (Team × 0.30) + (Market × 0.25) + (PMF × 0.25) + (Moat × 0.20)
            const teamContrib = team * 0.30;
            const marketContrib = market * 0.25;
            const pmfContrib = pmf * 0.25;
            const moatContrib = moat * 0.20;

            const weightedScore = teamContrib + marketContrib + pmfContrib + moatContrib;

            // Simple verdict based on score
            let verdict = "";
            if (weightedScore >= 8) verdict = "Highly Investable - Top Tier";
            else if (weightedScore >= 6.5) verdict = "Investable - Promising";
            else if (weightedScore >= 5) verdict = "Potentially Investable - Needs Work";
            else verdict = "Not Yet Investable - Focus on Fundamentals";

            setResults({
                weightedScore,
                teamContrib,
                marketContrib,
                pmfContrib,
                moatContrib,
                verdict,
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
                <h2 className="text-[24px] font-bold text-[#31372B] mb-6">Investability Score</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <p className="text-sm text-[#717182] mb-4">
                            Rate your startup from 1 (Weak) to 10 (World Class) on the following dimensions:
                        </p>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-[#31372B]">
                                    Team Strength
                                </label>
                                <span className="text-sm font-bold text-[#31372B]">{teamScore}/10</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="0.5"
                                value={teamScore}
                                onChange={(e) => setTeamScore(e.target.value)}
                                className="w-full accent-[#31372B] cursor-pointer"
                            />
                            <p className="text-xs text-[#717182] mt-1">
                                Experience, track record, technical ability, completeness
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-[#31372B]">
                                    Market Size & Timing
                                </label>
                                <span className="text-sm font-bold text-[#31372B]">{marketScore}/10</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="0.5"
                                value={marketScore}
                                onChange={(e) => setMarketScore(e.target.value)}
                                className="w-full accent-[#31372B] cursor-pointer"
                            />
                            <p className="text-xs text-[#717182] mt-1">
                                TAM &gt; $1B, growth rate, urgency of problem
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-[#31372B]">
                                    Product-Market Fit (Traction)
                                </label>
                                <span className="text-sm font-bold text-[#31372B]">{pmfScore}/10</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="0.5"
                                value={pmfScore}
                                onChange={(e) => setPmfScore(e.target.value)}
                                className="w-full accent-[#31372B] cursor-pointer"
                            />
                            <p className="text-xs text-[#717182] mt-1">
                                Revenue growth, retention, user engagement, love
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-[#31372B]">
                                    Competitive Moat (Defensibility)
                                </label>
                                <span className="text-sm font-bold text-[#31372B]">{moatScore}/10</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="0.5"
                                value={moatScore}
                                onChange={(e) => setMoatScore(e.target.value)}
                                className="w-full accent-[#31372B] cursor-pointer"
                            />
                            <p className="text-xs text-[#717182] mt-1">
                                IP, network effects, high switching costs, brand
                            </p>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={isLoading}
                            className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition disabled:opacity-50 mt-6"
                        >
                            {isLoading ? "Loading..." : "Calculate Score"}
                        </button>
                    </div>

                    {/* Results */}
                    <div>
                        {showResults ? (
                            <div className="space-y-4">
                                <div id="investability-results" className="bg-[#EDF4E5] rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[18px] font-bold text-[#31372B]">Investment Readiness</h3>
                                        <DownloadPDFButton
                                            fileName="investability-score"
                                            title="Investability Score"
                                            data={[
                                                { label: "Overall Score", value: `${formatScore(results.weightedScore)} / 10.0`, subtext: results.verdict },
                                                { label: "Team (30%)", value: formatScore(results.teamContrib) },
                                                { label: "Market (25%)", value: formatScore(results.marketContrib) },
                                                { label: "Product/Traction (25%)", value: formatScore(results.pmfContrib) },
                                                { label: "Moat (20%)", value: formatScore(results.moatContrib) }
                                            ]}
                                        />
                                    </div>

                                    <div className="flex flex-col items-center justify-center py-6 border-b border-[#31372B]/10">
                                        <div className="text-[48px] font-bold text-[#31372B] leading-none">
                                            {formatScore(results.weightedScore)}
                                        </div>
                                        <div className="text-sm text-[#717182] mt-1">out of 10.0</div>
                                        <div className="mt-2 text-center text-sm font-bold text-[#31372B] bg-white/50 px-3 py-1 rounded-full border border-[#31372B]/10">
                                            {results.verdict}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#717182]">Team Contribution (30%)</span>
                                            <span className="font-medium">{formatScore(results.teamContrib)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#717182]">Market Contribution (25%)</span>
                                            <span className="font-medium">{formatScore(results.marketContrib)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#717182]">PMF Contribution (25%)</span>
                                            <span className="font-medium">{formatScore(results.pmfContrib)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#717182]">Moat Contribution (20%)</span>
                                            <span className="font-medium">{formatScore(results.moatContrib)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#F5F5F5] rounded-lg p-6 h-full flex items-center justify-center min-h-[300px]">
                                <p className="text-[#717182] text-center">
                                    Click &quot;Calculate Score&quot; to see your result
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
