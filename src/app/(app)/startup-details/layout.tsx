import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startup Details",
  description: "View and manage your submitted startup details on MyFundingList.",
};

export default function StartupDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
