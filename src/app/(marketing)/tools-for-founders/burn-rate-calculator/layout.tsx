import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Burn Rate Calculator",
  description: "Calculate your startup's monthly burn rate and cash runway. Understand how long your company can operate before needing to raise funding.",
};

export default function BurnRateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
