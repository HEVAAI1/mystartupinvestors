"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";
import { tools } from "@/lib/tools";

// --- SVG Illustrations ---
const IllustrationFundraising = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#C6FF55" fillOpacity="0.12"/>
    <rect x="22" y="48" width="10" height="16" rx="2" fill="#C6FF55" fillOpacity="0.6"/>
    <rect x="35" y="38" width="10" height="26" rx="2" fill="#C6FF55" fillOpacity="0.8"/>
    <rect x="48" y="28" width="10" height="36" rx="2" fill="#C6FF55"/>
    <path d="M27 30 L40 20 L53 24" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="27" cy="30" r="2.5" fill="#1E1E1E"/>
    <circle cx="40" cy="20" r="2.5" fill="#1E1E1E"/>
    <circle cx="53" cy="24" r="2.5" fill="#1E1E1E"/>
  </svg>
);

const IllustrationFinancial = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#6B6BFF" fillOpacity="0.10"/>
    <circle cx="40" cy="40" r="22" stroke="#1E1E1E" strokeWidth="2" strokeDasharray="4 3"/>
    <path d="M40 18 A22 22 0 0 1 62 40" stroke="#C6FF55" strokeWidth="4" strokeLinecap="round"/>
    <path d="M40 40 L40 22" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round"/>
    <path d="M40 40 L54 48" stroke="#C6FF55" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="40" cy="40" r="3" fill="#1E1E1E"/>
  </svg>
);

const IllustrationBurn = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#FF6B6B" fillOpacity="0.10"/>
    <path d="M40 62 C28 62 20 54 20 44 C20 36 26 30 32 26 C30 32 34 36 40 34 C38 28 44 20 52 18 C50 28 56 34 58 42 C60 50 52 62 40 62Z" fill="#FF6B6B" fillOpacity="0.4" stroke="#1E1E1E" strokeWidth="1.5"/>
    <path d="M40 58 C34 58 29 53 29 47 C29 42 32 38 36 36 C35 39 37 41 40 40 C39 37 42 33 46 32 C45 37 48 40 49 44 C50 49 45 58 40 58Z" fill="#C6FF55" fillOpacity="0.8"/>
  </svg>
);

const IllustrationGrowth = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#C6FF55" fillOpacity="0.10"/>
    <path d="M18 56 C24 46 30 50 36 42 C42 34 46 22 58 18" stroke="#C6FF55" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M50 18 L58 18 L58 26" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="36" cy="42" r="3" fill="#1E1E1E"/>
    <circle cx="24" cy="50" r="3" fill="#C6FF55"/>
    <circle cx="48" cy="28" r="3" fill="#1E1E1E"/>
  </svg>
);

const IllustrationCapTable = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#C6FF55" fillOpacity="0.08"/>
    <circle cx="40" cy="40" r="20" fill="none" stroke="#E5E5E5" strokeWidth="10"/>
    <circle cx="40" cy="40" r="20" fill="none" stroke="#C6FF55" strokeWidth="10" strokeDasharray="31.4 94.2" strokeLinecap="round" strokeDashoffset="-15"/>
    <circle cx="40" cy="40" r="20" fill="none" stroke="#1E1E1E" strokeWidth="10" strokeDasharray="18.8 94.2" strokeLinecap="round" strokeDashoffset="-47"/>
    <circle cx="40" cy="40" r="8" fill="white"/>
    <text x="40" y="44" textAnchor="middle" fontSize="8" fill="#1E1E1E" fontWeight="bold">CAP</text>
  </svg>
);

const IllustrationChurn = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#FF6B6B" fillOpacity="0.08"/>
    <path d="M18 28 L62 28" stroke="#E5E5E5" strokeWidth="1.5"/>
    <path d="M18 40 L62 40" stroke="#E5E5E5" strokeWidth="1.5"/>
    <path d="M18 52 L62 52" stroke="#E5E5E5" strokeWidth="1.5"/>
    <path d="M20 56 L30 44 L38 50 L50 30 L60 24" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="30" cy="44" r="3" fill="#1E1E1E"/>
    <circle cx="50" cy="30" r="3" fill="#C6FF55"/>
  </svg>
);

const IllustrationDCF = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#6B6BFF" fillOpacity="0.08"/>
    <rect x="20" y="22" width="40" height="36" rx="4" fill="white" stroke="#E5E5E5" strokeWidth="1.5"/>
    <rect x="26" y="30" width="28" height="4" rx="1.5" fill="#C6FF55" fillOpacity="0.6"/>
    <rect x="26" y="38" width="20" height="3" rx="1.5" fill="#E5E5E5"/>
    <rect x="26" y="44" width="24" height="3" rx="1.5" fill="#E5E5E5"/>
    <circle cx="54" cy="26" r="8" fill="#C6FF55"/>
    <path d="M51 26 L53.5 28.5 L58 24" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IllustrationHandshake = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#C6FF55" fillOpacity="0.10"/>
    <path d="M20 46 L30 36 L36 40 L44 32 L52 36 L60 26" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 46 C22 48 26 48 28 46" stroke="#C6FF55" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M28 46 L36 40" stroke="#C6FF55" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="36" cy="40" r="3" fill="#C6FF55"/>
    <circle cx="44" cy="32" r="3" fill="#1E1E1E"/>
  </svg>
);

const IllustrationScore = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#C6FF55" fillOpacity="0.10"/>
    <path d="M20 50 A22 22 0 0 1 60 50" stroke="#E5E5E5" strokeWidth="6" strokeLinecap="round"/>
    <path d="M20 50 A22 22 0 0 1 48 31" stroke="#C6FF55" strokeWidth="6" strokeLinecap="round"/>
    <path d="M40 50 L50 34" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="40" cy="50" r="3.5" fill="#1E1E1E"/>
    <text x="40" y="62" textAnchor="middle" fontSize="9" fill="#1E1E1E" fontWeight="bold">87</text>
  </svg>
);

const IllustrationIRR = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="40" r="36" fill="#6B6BFF" fillOpacity="0.08"/>
    <rect x="22" y="24" width="14" height="32" rx="3" fill="#E5E5E5"/>
    <rect x="33" y="30" width="14" height="26" rx="3" fill="#C6FF55" fillOpacity="0.6"/>
    <rect x="44" y="20" width="14" height="36" rx="3" fill="#C6FF55"/>
    <path d="M22 18 L62 18" stroke="#1E1E1E" strokeWidth="1.5" strokeDasharray="3 2"/>
    <path d="M24 46 A18 18 0 0 0 56 46" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2"/>
  </svg>
);

// Map route -> { Illustration, categoryColor }
type IllustrationComponent = ({ className }: { className?: string }) => React.ReactElement;

const toolMeta: Record<string, { Icon: IllustrationComponent; categoryColor: string }> = {
  "/tools-for-founders/advanced-valuation-engine": { Icon: IllustrationFundraising, categoryColor: "#EDF4E5" },
  "/tools-for-founders/break-even-calculator":      { Icon: IllustrationFinancial,  categoryColor: "#F0F0FF" },
  "/tools-for-founders/burn-rate-calculator":        { Icon: IllustrationBurn,       categoryColor: "#FFF0F0" },
  "/tools-for-founders/cac-optimizer":               { Icon: IllustrationGrowth,     categoryColor: "#FFFBF0" },
  "/tools-for-founders/cap-table-model":             { Icon: IllustrationCapTable,   categoryColor: "#EDF4E5" },
  "/tools-for-founders/churn-rate-calculator":       { Icon: IllustrationChurn,      categoryColor: "#FFF0F0" },
  "/tools-for-founders/dcf-calculator":              { Icon: IllustrationDCF,        categoryColor: "#EDF4E5" },
  "/tools-for-founders/fundraising-calculator":      { Icon: IllustrationHandshake,  categoryColor: "#EDF4E5" },
  "/tools-for-founders/investability-score-calculator": { Icon: IllustrationScore,  categoryColor: "#EDF4E5" },
  "/tools-for-founders/irr-calculator":              { Icon: IllustrationIRR,        categoryColor: "#F0F0FF" },
};

// --- FAQ Data ---
const faqs = [
  {
    q: "Why do I need a valuation calculator for my startup?",
    a: "A valuation calculator helps you estimate what your company is worth before talking to investors. It uses industry-standard methods like the Venture Capital Method to give you a realistic range.",
  },
  {
    q: "How do I calculate my startup's burn rate and runway?",
    a: "Use our free Burn Rate Calculator to input your monthly expenses and current cash balance. It will automatically calculate your gross and net burn rate and how many months of runway you have left.",
  },
  {
    q: "What is a good CAC for a SaaS startup?",
    a: "A \"good\" CAC depends on your Customer Lifetime Value (LTV). Generally, an LTV:CAC ratio of 3:1 or higher is considered healthy for a SaaS business.",
  },
  {
    q: "How accurate are these startup financial tools?",
    a: "These tools use standard financial formulas used by venture capitalists and founders worldwide. They are for estimation and planning purposes — actual results will vary.",
  },
  {
    q: "Are these tools free?",
    a: "Yes, these tools are designed to be accessible resources for early-stage founders, generating professional-grade insights for your pitch deck.",
  },
];

export default function ToolsForFoundersClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredTools = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }),
    []
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SmartNavbar />

      <main className="min-h-screen bg-background font-inter text-foreground">

        {/* Hero */}
        <section className="relative pt-36 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#C6FF55]/20 rounded-full blur-[140px]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-[#1E1E1E] text-[#C6FF55] text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-widest"
            >
              Free Tools
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[clamp(36px,6vw,64px)] font-space font-bold text-[#000] leading-[1.05] tracking-[-0.03em]"
            >
              Tools for<br />
              <span className="relative inline-block">
                Startup Founders
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 10" fill="none">
                  <path d="M2 6C75 1 225 1 298 6" stroke="#C6FF55" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-[#6B6B6B] max-w-2xl mx-auto mt-8 leading-relaxed"
            >
              Free tools for founders to understand valuation, burn rate, runway, dilution,
              customer economics, and growth before raising capital.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-xl mx-auto mt-10"
            >
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search calculators (e.g., 'burn rate', 'valuation')..."
                className="w-full pl-14 pr-5 py-4 rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C6FF55]/50 focus:border-[#C6FF55]/40 text-[#31372B] text-base transition-all"
              />
            </motion.div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            {filteredTools.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#6B6B6B]">No tools found for &quot;{searchTerm}&quot;</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-[#31372B] font-bold underline hover:text-[#717182]"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool, i) => {
                  const meta = toolMeta[tool.route];
                  const Icon = meta?.Icon ?? IllustrationFundraising;
                  const catColor = meta?.categoryColor ?? "#EDF4E5";
                  return (
                    <motion.div
                      key={tool.route}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -6, boxShadow: "0 24px 60px rgba(198,255,85,0.15), 0 8px 24px rgba(0,0,0,0.08)" }}
                      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                    >
                      <Link
                        href={tool.route}
                        className="group flex flex-col bg-white/70 backdrop-blur-sm border border-black/[0.06] rounded-3xl p-7 shadow-sm cursor-pointer transition-colors duration-300 hover:border-[#C6FF55]/40 h-full"
                      >
                        {/* Illustration */}
                        <div className="mb-5">
                          <Icon className="w-20 h-20" />
                        </div>

                        {/* Category badge */}
                        <div className="mb-3">
                          <span
                            className="text-xs font-bold px-3 py-1 rounded-full border border-black/[0.06]"
                            style={{ backgroundColor: catColor, color: "#31372B" }}
                          >
                            {tool.category}
                          </span>
                        </div>

                        <h2 className="text-lg font-space font-bold text-[#1E1E1E] mb-2 leading-snug">
                          {tool.name}
                        </h2>
                        <p className="text-sm text-[#6B6B6B] leading-relaxed flex-1">
                          {tool.description}
                        </p>

                        <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#1E1E1E] group-hover:text-[#6B6B6B] transition-colors">
                          Open tool
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Dark Info + FAQ Section */}
        <section className="py-20 bg-[#1E1E1E] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C6FF55]/5 blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-[clamp(24px,3.5vw,38px)] font-space font-bold text-white leading-tight tracking-[-0.02em]">
                Founder Tools for Fundraising,<br /> Finance, and Growth
              </h2>
              <p className="text-white/50 mt-4 max-w-2xl mx-auto leading-relaxed">
                Early-stage founders need clarity before they raise capital. These tools simplify complex startup finance into clear, actionable insights.
              </p>
            </motion.div>

            {/* FAQ Accordion */}
            <div className="space-y-3 mt-10">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-white text-sm pr-4">{faq.q}</span>
                    <span
                      className={`text-[#C6FF55] text-xl flex-shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
