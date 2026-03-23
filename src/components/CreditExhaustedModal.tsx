"use client";

import { useRouter } from "next/navigation";

interface CreditExhaustedModalProps {
    isOpen: boolean;
    onClose: () => void;
    userState: "anonymous" | "free" | "paid";
    remaining?: number;
    resetDate?: string;
}

export default function CreditExhaustedModal({
    isOpen,
    onClose,
    userState,
    resetDate,
}: CreditExhaustedModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const getContent = () => {
        switch (userState) {
            case "anonymous":
                return {
                    title: "Create a Free Account",
                    message: "You've used all 3 free calculations this week. Create a free account to get 3 calculations every week!",
                    ctaText: "Sign Up Free",
                    ctaAction: () => router.push("/"),
                    secondaryText: "Already have an account?",
                    secondaryAction: () => router.push("/"),
                    secondaryActionText: "Sign In",
                };

            case "free":
                return {
                    title: "Upgrade for More Calculations",
                    message: `You've used all your free calculations this week. ${resetDate
                            ? `Your credits will reset on ${new Date(resetDate).toLocaleDateString()}.`
                            : ""
                        } Upgrade now for unlimited calculations!`,
                    ctaText: "View Pricing",
                    ctaAction: () => router.push("/pricing"),
                    secondaryText: null,
                    secondaryAction: null,
                    secondaryActionText: null,
                };

            case "paid":
                return {
                    title: "Out of Calculation Credits",
                    message: "You've used all your calculation credits. Contact support to purchase additional credits or upgrade your plan.",
                    ctaText: "Contact Support",
                    ctaAction: () => window.open("mailto:support@myfundinglist.com", "_blank"),
                    secondaryText: "Or",
                    secondaryAction: () => router.push("/pricing"),
                    secondaryActionText: "View Plans",
                };

            default:
                return {
                    title: "Limit Reached",
                    message: "You've reached your calculation limit.",
                    ctaText: "Close",
                    ctaAction: onClose,
                    secondaryText: null,
                    secondaryAction: null,
                    secondaryActionText: null,
                };
        }
    };

    const content = getContent();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-[#EDF4E5] rounded-full flex items-center justify-center">
                        <span className="text-3xl">🔒</span>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-[24px] font-bold text-[#31372B] text-center mb-3">
                    {content.title}
                </h2>

                {/* Message */}
                <p className="text-[16px] text-[#717182] text-center mb-6 leading-relaxed">
                    {content.message}
                </p>

                {/* CTA Button */}
                <button
                    onClick={content.ctaAction}
                    className="w-full bg-[#31372B] text-[#FAF7EE] px-6 py-3 rounded-lg font-bold text-[16px] hover:opacity-90 transition mb-3"
                >
                    {content.ctaText}
                </button>

                {/* Secondary Action */}
                {content.secondaryText && content.secondaryAction && (
                    <div className="text-center">
                        <span className="text-sm text-[#717182]">{content.secondaryText} </span>
                        <button
                            onClick={content.secondaryAction}
                            className="text-sm text-[#31372B] font-medium hover:underline"
                        >
                            {content.secondaryActionText}
                        </button>
                    </div>
                )}

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#717182] hover:text-[#31372B] transition"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
