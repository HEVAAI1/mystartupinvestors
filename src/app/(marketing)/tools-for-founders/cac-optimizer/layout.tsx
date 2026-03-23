import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAC Optimizer",
  description: "Optimize your Customer Acquisition Cost (CAC) and improve your startup's unit economics and growth efficiency.",
};

export default function CACOptimizerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
