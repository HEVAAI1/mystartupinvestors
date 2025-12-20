import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export const metadata = {
    title: "Refund Policy – MyFundingList",
    description: "Refund Policy for MyFundingList - Learn about our refund terms and conditions for subscription payments.",
};

export default function RefundPolicy() {
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
                <div className="bg-white border border-[#31372B1F] rounded-2xl shadow-sm p-8 md:p-12">
                    {/* Header */}
                    <div className="mb-8 pb-6 border-b border-[#31372B1F]">
                        <h1 className="text-[40px] md:text-[48px] font-bold text-[#31372B] mb-2">
                            Refund Policy
                        </h1>
                        <p className="text-[#717182] text-lg">MyFundingList</p>
                        <p className="text-[#717182] text-sm mt-2">Last updated: December 20, 2025</p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none
            prose-headings:text-[#31372B] prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-[#31372B] prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-[#31372B] prose-a:underline hover:prose-a:text-[#717182]
            prose-strong:text-[#31372B] prose-strong:font-bold
            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
            prose-li:text-[#31372B] prose-li:mb-2">

                        <h2>1. Introduction</h2>
                        <p>
                            {`This Refund Policy explains how refunds are handled for subscriptions and payments made on MyFundingList ("Company", "we", "us", or "our").`}
                        </p>
                        <p>
                            By purchasing or using any paid plan on <a href="https://myfundinglist.com">https://myfundinglist.com</a>, you agree to this Refund Policy in addition to our Terms of Service.
                        </p>

                        <h2>2. Nature of the Service</h2>
                        <p>
                            MyFundingList is a digital, subscription-based SaaS platform that provides access to an online database of startup investors and related information.
                        </p>
                        <p>Key characteristics of the Service:</p>
                        <ul>
                            <li>Instant or near-instant access upon payment</li>
                            <li>Digital-only delivery</li>
                            <li>Ongoing access rather than a one-time deliverable</li>
                            <li>Usage-based and time-based value</li>
                        </ul>
                        <p>Because of this nature, refunds are limited and subject to the conditions below.</p>

                        <h2>3. General Refund Policy</h2>
                        <p>Unless explicitly stated otherwise:</p>
                        <ul>
                            <li>All payments are non-refundable</li>
                            <li>Subscription fees are charged in advance</li>
                            <li>Partial refunds for unused time or usage are not provided</li>
                        </ul>
                        <p>Once access to a paid plan is granted, the subscription is considered active and consumed.</p>

                        <h2>4. Eligible Refund Scenarios</h2>
                        <p>Refunds may be considered only in the following limited cases:</p>
                        <ul>
                            <li>Duplicate payment for the same subscription</li>
                            <li>Payment charged due to a technical error attributable to our systems</li>
                            <li>Payment processed after documented account cancellation caused by a platform fault</li>
                        </ul>
                        <p>Any approved refund will be processed at our sole discretion.</p>

                        <h2>5. Non-Eligible Refund Scenarios</h2>
                        <p>Refunds will not be provided for:</p>
                        <ul>
                            <li>Change of mind after purchase</li>
                            <li>Lack of fundraising success or investor responses</li>
                            <li>Dissatisfaction with investor data relevance or outcomes</li>
                            <li>Failure to use the Service during the subscription period</li>
                            <li>Account suspension or termination due to violation of Terms of Service</li>
                            <li>Incorrect plan selection by the user</li>
                            <li>Issues caused by third-party services, including payment providers or authentication services</li>
                        </ul>

                        <h2>6. Free Plans and Trials</h2>
                        <ul>
                            <li>{`Free plans do not involve payment and therefore are not eligible for refunds`}</li>
                            <li>{`Any trial access, if offered, is provided "as is" and without refund eligibility`}</li>
                        </ul>

                        <h2>7. Subscription Cancellation</h2>
                        <p>
                            You may cancel your subscription at any time through your account settings or by contacting support.
                        </p>
                        <p>Important notes:</p>
                        <ul>
                            <li>Cancellation stops future billing</li>
                            <li>Cancellation does not entitle you to a refund for the current billing period</li>
                            <li>Access continues until the end of the active subscription term unless stated otherwise</li>
                        </ul>

                        <h2>8. Payment Processing</h2>
                        <ul>
                            <li>Payments are processed through Dodo Payments</li>
                            <li>Refunds, if approved, will be issued to the original payment method</li>
                            <li>Processing times depend on the payment provider and banking channels</li>
                            <li>We are not responsible for delays caused by third-party payment systems</li>
                        </ul>

                        <h2>9. Taxes and Fees</h2>
                        <ul>
                            <li>Taxes, transaction fees, and currency conversion charges are non-refundable</li>
                            <li>Any refunded amount will exclude such charges unless required by applicable law</li>
                        </ul>

                        <h2>10. Changes to This Refund Policy</h2>
                        <p>
                            We reserve the right to modify this Refund Policy at any time.
                        </p>
                        <p>
                            Changes will be effective once posted on the website. Continued use of the Service after changes constitutes acceptance of the updated policy.
                        </p>

                        <h2>11. Governing Law</h2>
                        <p>This Refund Policy is governed by the laws of India.</p>
                        <p>
                            Any disputes related to refunds shall fall under the exclusive jurisdiction of the courts located in India.
                        </p>

                        <h2>12. Contact Information</h2>
                        <p>For refund-related questions or requests, please contact:</p>
                        <p>
                            <strong>MyFundingList</strong><br />
                            Website: <a href="https://myfundinglist.com">https://myfundinglist.com</a><br />
                            Email: <a href="mailto:fazal@heva.ai">fazal@heva.ai</a>
                        </p>

                        <div className="mt-8 p-6 bg-[#EDF4E5] border border-[#31372B1F] rounded-xl">
                            <p className="text-sm text-[#31372B] font-medium">
                                By making a payment on MyFundingList, you acknowledge that you have read, understood, and agreed to this Refund Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
