import { CalculationCreditsProvider } from "@/context/CalculationCreditsContext";

export default function BlogLayout({
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
