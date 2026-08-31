import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startup Details",
  description: "View and manage your submitted startup details on MyFundingList.",
  robots: { index: false, follow: false },
};

export default function StartupDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
