import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliates",
  description: "Affiliate program overview for MyFundingList.",
  robots: { index: false, follow: false },
};

export default function AdminAffiliatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
