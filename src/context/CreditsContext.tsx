"use client";

import { createContext, useContext } from "react";

interface CreditInfo {
  credits: number;
  allocated: number;
  used: number;
}

const CreditsContext = createContext<CreditInfo>({
  credits: 0,
  allocated: 0,
  used: 0,
});

export default function CreditsProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: CreditInfo;
}) {
  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
}

export const useCredits = () => useContext(CreditsContext);
