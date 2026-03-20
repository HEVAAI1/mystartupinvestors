import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Valuation Engine",
  description: "Calculate your startup's valuation using multiple methodologies including the VC method. Estimate pre-money and post-money valuation.",
};

export default function AdvancedValuationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
