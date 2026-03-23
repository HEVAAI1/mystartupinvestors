"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import SmartNavbar from "@/components/SmartNavbar";

const tools = [
    {
        name: "Advanced Valuation Engine",
        description: "Calculate pre-money and post-money valuation using the VC method",
        route: "/tools-for-founders/advanced-valuation-engine",
        category: "Fundraising",
        icon: "💰",
    },
    {
        name: "Break-Even Calculator",
        description: "Determine when your startup will become profitable",
        route: "/tools-for-founders/break-even-calculator",
        category: "Financial Planning",
        icon: "📊",
    },
    {
        name: "Burn Rate & Runway Calculator",
        description: "Track your cash burn and calculate remaining runway",
        route: "/tools-for-founders/burn-rate-calculator",
        category: "Financial Planning",
        icon: "🔥",
    },
    {
        name: "CAC Optimizer",
        description: "Optimize customer acquisition costs across channels",
        route: "/tools-for-founders/cac-optimizer",
        category: "Growth Metrics",
        icon: "📈",
    },
    {
        name: "Cap Table Model",
        description: "Model equity dilution and ownership across funding rounds",
        route: "/tools-for-founders/cap-table-model",
        category: "Fundraising",
        icon: "📋",
    },
    {
        name: "Churn Rate Calculator",
        description: "Calculate customer and revenue churn for subscription businesses",
        route: "/tools-for-founders/churn-rate-calculator",
        category: "Growth Metrics",
        icon: "📉",
    },
    {
        name: "DCF Calculator",
        description: "Calculate enterprise value using discounted cash flows",
        route: "/tools-for-founders/dcf-calculator",
        category: "Fundraising",
        icon: "🔮",
    },
    {
        name: "Fundraising Calculator",
        description: "Calculate how much to raise and dilution impact",
        route: "/tools-for-founders/fundraising-calculator",
        category: "Fundraising",
        icon: "🤝",
    },
    {
        name: "Investability Score",
        description: "Score your startup across team, market, and traction",
        route: "/tools-for-founders/investability-score-calculator",
        category: "Fundraising",
        icon: "⭐",
    },
    {
        name: "IRR Calculator",
        description: "Calculate Internal Rate of Return for investments",
        route: "/tools-for-founders/irr-calculator",
        category: "Fundraising",
        icon: "🎯",
    },
];

const categoryColors: Record<string, string> = {
    "Fundraising": "bg-[#EDF4E5] text-[#31372B] border-[#31372B]/10",
    "Financial Planning": "bg-[#F5F5F5] text-[#31372B] border-[#31372B]/10",
    "Growth Metrics": "bg-[#FAF7EE] text-[#31372B] border-[#31372B]/10",
};

const faqs = [
    {
        question: "Why do I need a valuation calculator for my startup?",
        answer: "A valuation calculator helps you estimate what your company is worth before talking to investors. It uses industry-standard methods like the Venture Capital Method to give you a realistic range, helping you negotiate better terms and avoid giving away too much equity."
    },
    {
        question: "How do I calculate my startup's burn rate and runway?",
        answer: "You can use our free Burn Rate Calculator to input your monthly expenses and current cash balance. It will automatically calculate your gross and net burn rate, and tell you exactly how many months of runway you have left before you need to raise more capital."
    },
    {
        question: "What is a good CAC (Customer Acquisition Cost) for a SaaS startup?",
        answer: "A 'good' CAC depends on your Customer Lifetime Value (LTV). Generally, an LTV:CAC ratio of 3:1 or higher is considered healthy for a SaaS business. Our CAC Optimizer tool helps you calculate this ratio and identify which marketing channels are providing the best return on investment."
    },
    {
        question: "How accurate are these startup financial tools?",
        answer: "These tools use standard financial formulas and models used by venture capitalists and founders worldwide. However, they are for estimation and planning purposes. Actual results will vary based on your specific market conditions, execution, and external factors."
    },
    {
        question: "Are these tools free for effective fundraising planning?",
        answer: "Yes, these tools are designed to be accessible resources for early-stage founders. They generate professional-grade insights that you can include in your pitch deck to demonstrate financial discipline and understanding of your unit economics to potential investors."
    }
];

export default function ToolsForFoundersPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Schema.org FAQ Page JSON-LD
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <SmartNavbar />

            <main className="min-h-screen bg-[#FAF7EE] font-[Arial] text-[#31372B]">
                {/* Hero Section */}
                <section className="max-w-[1200px] mx-auto pt-32 pb-16 px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-[48px] font-bold text-[#31372B] mb-4 leading-tight">
                            Tools for Startup Founders
                        </h1>
                        <p className="text-[20px] text-[#717182] max-w-[800px] mx-auto leading-relaxed">
                            Free tools for founders to understand valuation, burn rate, runway, dilution, customer economics, and growth before raising capital.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-[600px] mx-auto mb-16 relative">
                        <input
                            type="text"
                            placeholder="Search calculators (e.g., 'burn rate', 'valuation')..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#31372B1F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#31372B]/20 text-lg"
                        />
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#717182]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Tools Grid */}
                    {filteredTools.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                            {filteredTools.map((tool) => (
                                <Link
                                    key={tool.route}
                                    href={tool.route}
                                    className="group bg-white border border-[#31372B1F] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                                >
                                    {/* Icon */}
                                    <div className="text-[40px] mb-4">{tool.icon}</div>

                                    {/* Category Badge */}
                                    <div className="mb-3">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${categoryColors[tool.category]}`}>
                                            {tool.category}
                                        </span>
                                    </div>

                                    {/* Tool Name */}
                                    <h2 className="text-[20px] font-bold text-[#31372B] mb-2 group-hover:text-[#717182] transition-colors">
                                        {tool.name}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-[#717182] text-[14px] leading-relaxed flex-1">
                                        {tool.description}
                                    </p>

                                    {/* Arrow Icon */}
                                    <div className="mt-4 flex items-center text-[#31372B] group-hover:text-[#717182] transition-colors">
                                        <span className="text-sm font-medium">Learn more</span>
                                        <svg
                                            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-[#717182]">
                            <p className="text-xl">No calculators found matching &quot;{searchTerm}&quot;</p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 text-[#31372B] font-bold underline hover:text-[#717182]"
                            >
                                Clear search
                            </button>
                        </div>
                    )}

                    {/* SEO Content Section */}
                    <div className="max-w-[900px] mx-auto bg-white border border-[#31372B1F] rounded-xl p-10 shadow-sm mb-12">
                        <h2 className="text-[32px] font-bold text-[#31372B] mb-6">
                            Founder Tools for Fundraising, Finance, and Growth
                        </h2>

                        <div className="space-y-4 text-[#31372B] text-[16px] leading-relaxed">
                            <p>
                                Early-stage founders need clarity before they raise capital. Understanding valuation, burn rate, dilution, and unit economics helps founders make better decisions and avoid common fundraising mistakes.
                            </p>

                            <p>
                                These tools for founders are designed to simplify complex startup finance concepts into clear, actionable insights. Whether you&apos;re preparing for your first investor pitch or planning your next round, these tools help you approach fundraising with confidence and data-backed reasoning.
                            </p>

                            <p>
                                As you grow, these tools work alongside investor discovery and outreach, helping founders connect numbers with the right investors at the right stage.
                            </p>
                        </div>
                    </div>

                    {/* FAQ Section with Semantic HTML for SEO */}
                    <div className="max-w-[900px] mx-auto">
                        <h2 className="text-[32px] font-bold text-[#31372B] mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <details key={index} className="group bg-white border border-[#31372B1F] rounded-xl overflow-hidden shadow-sm">
                                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                                        <h3 className="text-[18px] font-bold text-[#31372B] pr-4">{faq.question}</h3>
                                        <span className="transition-transform group-open:rotate-180">
                                            <svg className="w-6 h-6 text-[#717182]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </summary>
                                    <div className="px-6 pb-6 text-[#717182] leading-relaxed">
                                        <p>{faq.answer}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
