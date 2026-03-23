"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface CalculationCreditStatus {
    userState: "anonymous" | "free" | "paid" | "loading";
    remaining: number;
    limit?: number;
    canCalculate: boolean;
    message: string;
    unlimited?: boolean;
    resetDate?: string;
    plan?: string;
}

interface CalculationCreditsContextType {
    creditStatus: CalculationCreditStatus;
    isLoading: boolean;
    useCredit: () => Promise<{ success: boolean; error?: string; message?: string }>;
    refreshCredits: () => Promise<void>;
}

const CalculationCreditsContext = createContext<CalculationCreditsContextType | null>(null);

export function CalculationCreditsProvider({ children }: { children: ReactNode }) {
    const [creditStatus, setCreditStatus] = useState<CalculationCreditStatus>({
        userState: "loading",
        remaining: 0,
        canCalculate: true,
        message: "Loading...",
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch credits on mount
    useEffect(() => {
        checkCredits();
    }, []);

    const checkCredits = async () => {
        try {
            setIsLoading(true);
            const supabase = createSupabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            const headers: HeadersInit = {};
            if (session?.access_token) {
                headers["Authorization"] = `Bearer ${session.access_token}`;
            }

            const response = await fetch("/api/calculations/check-credits", {
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                setCreditStatus(data);
            }
        } catch (error) {
            console.error("Error checking credits:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const useCredit = async (): Promise<{ success: boolean; error?: string; message?: string }> => {
        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
            if (session?.access_token) {
                headers["Authorization"] = `Bearer ${session.access_token}`;
            }

            const response = await fetch("/api/calculations/use-credit", {
                method: "POST",
                headers,
            });

            const data = await response.json();

            if (data.success) {
                // Update local credit status
                setCreditStatus(prev => ({
                    ...prev,
                    remaining: data.remaining !== undefined ? data.remaining : prev.remaining,
                    message: data.message || prev.message,
                }));
                return { success: true, message: data.message };
            } else {
                return { success: false, error: data.error, message: data.message };
            }
        } catch (error) {
            console.error("Error using credit:", error);
            return { success: false, error: "NETWORK_ERROR" };
        }
    };

    return (
        <CalculationCreditsContext.Provider
            value={{
                creditStatus,
                isLoading,
                useCredit,
                refreshCredits: checkCredits,
            }}
        >
            {children}
        </CalculationCreditsContext.Provider>
    );
}

export function useCalculationCredits() {
    const context = useContext(CalculationCreditsContext);
    if (!context) {
        throw new Error("useCalculationCredits must be used within CalculationCreditsProvider");
    }
    return context;
}
