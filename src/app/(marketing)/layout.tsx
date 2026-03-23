import { CalculationCreditsProvider } from "@/context/CalculationCreditsContext";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CalculationCreditsProvider>
            {children}
        </CalculationCreditsProvider>
    );
}
