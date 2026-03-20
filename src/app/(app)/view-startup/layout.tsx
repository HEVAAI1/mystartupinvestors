import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "View Startup",
  description: "Explore startup submissions on MyFundingList.",
};

export default function ViewStartupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
