import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Break-Even Calculator",
  description: "Find out exactly how many units you need to sell to cover your startup's costs and achieve profitability.",
};

export default function BreakEvenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
