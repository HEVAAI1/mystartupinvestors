import type { Metadata } from "next";
import { headers } from "next/headers";
import ToolsForFoundersClient from "@/components/ToolsForFoundersClient";

export const metadata: Metadata = {
  title: "Startup Tools for Founders | Valuation, Burn Rate, CAC, Runway",
  description:
    "Free startup tools for founders including valuation calculators, burn rate, runway, CAC, churn, and fundraising models. Prepare your startup for investors.",
  alternates: {
    canonical: "https://myfundinglist.com/tools-for-founders",
  },
};

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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

// Server component so the JSON-LD <script> can carry the per-request CSP nonce
// (ToolsForFoundersClient is "use client" and can't read next/headers).
export default async function ToolsForFoundersPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ToolsForFoundersClient />
    </>
  );
}

