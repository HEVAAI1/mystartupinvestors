import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User List",
  description: "Admin view of all registered users on MyFundingList.",
  robots: { index: false, follow: false },
};

export default function UserListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
