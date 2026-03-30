import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export const metadata = {
    title: "Policies | MyFundingList",
    description: "Review the policies that govern your use of MyFundingList — including our Privacy Policy, Terms of Service, and Refund Policy.",
};

const policies = [
    {
        title: "Privacy Policy",
        description: "Learn how we collect, use, store, and protect your personal data when you use our platform.",
        href: "/privacy",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        updated: "December 20, 2025",
    },
    {
        title: "Terms of Service",
        description: "Understand the rules and conditions that govern your access to and use of MyFundingList.",
        href: "/terms",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
        updated: "December 20, 2025",
    },
    {
        title: "Refund Policy",
        description: "Find out how refunds are handled for subscriptions and payments made on our platform.",
        href: "/refund",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.56" />
            </svg>
        ),
        updated: "December 20, 2025",
    },
];

export default function PoliciesPage() {
    return (
        <main className="min-h-screen bg-[#FAF7EE] font-[Arial] text-[#31372B]">
            {/* Navbar */}
            <nav className="w-full flex justify-between items-center px-8 py-4 bg-[#FFFFFE] border-b border-black/10 fixed top-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/Logo.png"
                        alt="Logo"
                        width={100}
                        height={40}
                        className="h-[38px] w-auto"
                    />
                </Link>

                <Link href="/">
                    <button className="bg-[#31372B] text-[#FAF7EE] px-6 py-2 rounded-lg font-bold shadow hover:opacity-90 transition cursor-pointer">
                        Back to Home
                    </button>
                </Link>
            </nav>

            {/* Content */}
            <div className="max-w-[900px] mx-auto pt-28 pb-20 px-6">
                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-[40px] md:text-[48px] font-bold text-[#31372B] mb-3">
                        Policies
                    </h1>
                    <p className="text-[#717182] text-lg leading-relaxed">
                        At MyFundingList, transparency and trust are core to how we operate. Review the policies below to understand how we handle your data, what governs your use of the platform, and our approach to payments and refunds.
                    </p>
                </div>

                {/* Policy Cards */}
                <div className="flex flex-col gap-4">
                    {policies.map((policy) => (
                        <Link
                            key={policy.href}
                            href={policy.href}
                            className="group bg-white border border-[#31372B1F] rounded-2xl p-6 md:p-8 flex items-start gap-5 shadow-sm hover:shadow-md hover:border-[#31372B40] transition-all duration-200"
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#EDF4E5] flex items-center justify-center text-[#31372B] group-hover:bg-[#31372B] group-hover:text-[#FAF7EE] transition-colors duration-200">
                                {policy.icon}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                    <h2 className="text-[18px] font-bold text-[#31372B] group-hover:underline">
                                        {policy.title}
                                    </h2>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="flex-shrink-0 text-[#717182] group-hover:text-[#31372B] transition-colors"
                                    >
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </div>
                                <p className="text-[#717182] text-sm mt-1 leading-relaxed">
                                    {policy.description}
                                </p>
                                <p className="text-[#31372B80] text-xs mt-3">
                                    Last updated: {policy.updated}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer note */}
                <div className="mt-10 p-6 bg-white border border-[#31372B1F] rounded-2xl shadow-sm">
                    <p className="text-sm text-[#717182] leading-relaxed">
                        Have questions about any of our policies? Reach out to us at{" "}
                        <a href="mailto:hi@eaglegrowthpartners.com" className="text-[#31372B] font-semibold hover:underline">
                            hi@eaglegrowthpartners.com
                        </a>{" "}
                        and we&apos;ll be happy to help.
                    </p>
                </div>
            </div>

            <Footer />
        </main>
    );
}
