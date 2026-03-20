import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Failed",
  description: "There was an issue processing your payment. Please try again or contact support.",
  robots: { index: false, follow: false },
};

export default function PaymentFailureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
