import type { Metadata } from "next";
import ToolsForFoundersClient from "@/components/ToolsForFoundersClient";

export const metadata: Metadata = {
  title: "Startup Tools for Founders | Valuation, Burn Rate, CAC, Runway",
  description:
    "Free startup tools for founders including valuation calculators, burn rate, runway, CAC, churn, and fundraising models. Prepare your startup for investors.",
  alternates: {
    canonical: "https://myfundinglist.com/tools-for-founders",
  },
};

export default function ToolsForFoundersPage() {
  return <ToolsForFoundersClient />;
}
