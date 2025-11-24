"use client";

import { createContext, useContext, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};
