"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface CreditInfo {
  credits: number;
  allocated: number;
  used: number;
  userId: string | null;
  decrementCredit: () => void;
  setCredits: (info: { credits: number; allocated: number; used: number }) => void;
}

const CreditsContext = createContext<CreditInfo>({
  credits: 0,
  allocated: 0,
  used: 0,
  userId: null,
  decrementCredit: () => { },
  setCredits: () => { },
});

export default function CreditsProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: { credits: number; allocated: number; used: number; userId: string | null };
}) {
  const [creditState, setCreditState] = useState(value);

  useEffect(() => {
    setCreditState(value);
  }, [value]);

  const decrementCredit = () => {
    setCreditState((prev) => ({
      ...prev,
      credits: prev.credits - 1,
      used: prev.used + 1,
    }));
  };

  const setCredits = (info: { credits: number; allocated: number; used: number }) => {
    setCreditState((prev) => ({ ...prev, ...info }));
  };

  return (
    <CreditsContext.Provider value={{ ...creditState, decrementCredit, setCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}

export const useCredits = () => useContext(CreditsContext);
