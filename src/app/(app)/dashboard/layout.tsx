import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Database",
  description: "Search and filter 34,850+ verified investors by sector, location, and stage. Unlock direct email contacts to accelerate your fundraising.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
