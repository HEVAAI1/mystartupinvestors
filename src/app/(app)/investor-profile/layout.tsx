import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Profile",
  description: "View a verified investor's profile including sectors of interest, location, and direct contact information on MyFundingList.",
};

export default function InvestorProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
