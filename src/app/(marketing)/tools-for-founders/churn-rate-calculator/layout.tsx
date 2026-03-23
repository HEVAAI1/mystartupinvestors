import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Churn Rate Calculator",
  description: "Calculate your startup's monthly and annual customer churn rate and understand its impact on your recurring revenue.",
};

export default function ChurnRateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
