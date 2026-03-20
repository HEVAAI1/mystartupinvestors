import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor List",
  description: "Admin view of all investors in the MyFundingList database.",
  robots: { index: false, follow: false },
};

export default function InvestorListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
