"use client";

// This hook is now a simple re-export of the context hook
// All the logic has been moved to CalculationCreditsContext for better caching
export { useCalculationCredits } from "@/context/CalculationCreditsContext";
