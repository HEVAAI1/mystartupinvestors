import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Your Startup",
  description: "Submit your startup to MyFundingList. If your startup is exceptional, our team will also manually help you connect with relevant investors.",
};

export default function AddStartupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
