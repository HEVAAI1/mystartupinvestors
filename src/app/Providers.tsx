"use client";

import { CalculationCreditsProvider } from "@/context/CalculationCreditsContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <CalculationCreditsProvider>{children}</CalculationCreditsProvider>;
}
