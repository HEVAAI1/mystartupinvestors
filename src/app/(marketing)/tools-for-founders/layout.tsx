import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools for Founders",
  description: "Free tools for founders to understand valuation, burn rate, runway, dilution, customer economics, and growth before raising capital.",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
