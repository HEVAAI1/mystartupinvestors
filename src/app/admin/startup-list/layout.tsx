import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startup List",
  description: "Admin view of all submitted startups on MyFundingList.",
  robots: { index: false, follow: false },
};

export default function StartupListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
