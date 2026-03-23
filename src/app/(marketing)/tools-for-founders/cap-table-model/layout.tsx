import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cap Table Model",
  description: "Build and model your startup's cap table with scenario planning for funding rounds and founder dilution.",
};

export default function CapTableLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
