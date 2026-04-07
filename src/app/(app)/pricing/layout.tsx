import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing plans for MyFundingList. Choose a plan to unlock verified investor contacts. Credits never expire.",
  alternates: {
    canonical: "https://myfundinglist.com/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
