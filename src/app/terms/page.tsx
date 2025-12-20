import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export const metadata = {
    title: "Terms of Service – MyFundingList",
    description: "Terms of Service for MyFundingList - Read our terms and conditions for using our investor database platform.",
};

export default function TermsOfService() {
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
                            Terms of Service
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
                            {`These Terms of Service ("Terms") govern your access to and use of the MyFundingList website and services (the "Service"), operated by MyFundingList ("Company", "we", "us", or "our").`}
                        </p>
                        <p>
                            By accessing or using the Service at <a href="https://myfundinglist.com">https://myfundinglist.com</a>, you agree to be bound by these Terms. If you do not agree, you must not use the Service.
                        </p>

                        <h2>2. Eligibility</h2>
                        <p>To use the Service, you must:</p>
                        <ul>
                            <li>Be at least 18 years of age</li>
                            <li>Have the legal capacity to enter into a binding agreement</li>
                            <li>Use the Service for lawful business or professional purposes</li>
                        </ul>
                        <p>By using the Service, you represent that you meet these requirements.</p>

                        <h2>3. Description of Service</h2>
                        <p>
                            MyFundingList is a Software-as-a-Service (SaaS) platform that provides access to a curated database of startup investors and related information.
                        </p>
                        <p>Important clarifications:</p>
                        <ul>
                            <li>The Service is informational in nature</li>
                            <li>We do not act as brokers, agents, advisors, or intermediaries</li>
                            <li>We do not provide financial, investment, legal, or fundraising advice</li>
                            <li>We do not guarantee fundraising outcomes, responses, or investments</li>
                        </ul>

                        <h2>4. Account Registration and Authentication</h2>
                        <h3>4.1 Account Creation</h3>
                        <p>Access to the Service requires account creation using Google OAuth authentication.</p>
                        <p>You are responsible for:</p>
                        <ul>
                            <li>Maintaining the confidentiality of your account</li>
                            <li>All activities that occur under your account</li>
                            <li>Ensuring that your information is accurate and up to date</li>
                        </ul>

                        <h3>4.2 Account Suspension or Termination</h3>
                        <p>We reserve the right to suspend or terminate accounts that:</p>
                        <ul>
                            <li>Violate these Terms</li>
                            <li>Engage in misuse, abuse, or unlawful activity</li>
                            <li>Compromise platform integrity or security</li>
                        </ul>

                        <h2>5. Subscription Plans and Payments</h2>
                        <h3>5.1 Plans</h3>
                        <p>
                            The Service may offer free and paid subscription plans with different features and usage limits.
                        </p>
                        <p>
                            Plan details, pricing, and limitations are described on the website and may change from time to time.
                        </p>

                        <h3>5.2 Payments</h3>
                        <ul>
                            <li>Payments are processed through Dodo Payments</li>
                            <li>All fees are non-refundable unless required by applicable law</li>
                            <li>You are responsible for applicable taxes, duties, or levies</li>
                        </ul>

                        <h3>5.3 Billing Issues</h3>
                        <p>We are not responsible for payment failures caused by third-party payment providers.</p>

                        <h2>6. Acceptable Use</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use the Service for unlawful or fraudulent purposes</li>
                            <li>Scrape, copy, resell, or redistribute data without authorization</li>
                            <li>Attempt to reverse engineer, bypass, or interfere with the Service</li>
                            <li>Upload false, misleading, or infringing content</li>
                            <li>Harass, spam, or misuse investor information</li>
                        </ul>
                        <p>We may take action against accounts that violate acceptable use standards.</p>

                        <h2>7. Data and Content</h2>
                        <h3>7.1 User Data</h3>
                        <p>We may collect and process:</p>
                        <ul>
                            <li>Name and email address</li>
                            <li>Profile and account information</li>
                            <li>Startup and business details</li>
                            <li>Usage and analytics data</li>
                        </ul>
                        <p>Data handling is governed by our Privacy Policy.</p>

                        <h3>7.2 Investor Data</h3>
                        <p>
                            Investor information is compiled from publicly available, submitted, or verified sources. We do not guarantee:
                        </p>
                        <ul>
                            <li>Accuracy or completeness of data</li>
                            <li>Availability or responsiveness of investors</li>
                            <li>Current investment status or preferences</li>
                        </ul>

                        <h2>8. Intellectual Property</h2>
                        <p>All rights, title, and interest in the Service, including:</p>
                        <ul>
                            <li>Software</li>
                            <li>Databases</li>
                            <li>Branding</li>
                            <li>Content and design</li>
                        </ul>
                        <p>are owned by MyFundingList or its licensors.</p>
                        <p>
                            You are granted a limited, non-exclusive, non-transferable right to access and use the Service for its intended purpose.
                        </p>

                        <h2>9. No Professional Advice</h2>
                        <p>The Service does not provide:</p>
                        <ul>
                            <li>Financial advice</li>
                            <li>Investment recommendations</li>
                            <li>Legal or regulatory guidance</li>
                        </ul>
                        <p>
                            Any decisions made based on information from the Service are your sole responsibility. You should consult qualified professionals where appropriate.
                        </p>

                        <h2>10. No Guarantee of Results</h2>
                        <p>We do not guarantee:</p>
                        <ul>
                            <li>Fundraising success</li>
                            <li>Investor interest or responses</li>
                            <li>Accuracy, availability, or timeliness of data</li>
                            <li>Business outcomes of any kind</li>
                        </ul>
                        <p>Use of the Service is at your own risk.</p>

                        <h2>11. Third-Party Services and Links</h2>
                        <p>The Service may rely on or link to third-party services, including:</p>
                        <ul>
                            <li>Google OAuth</li>
                            <li>Payment providers</li>
                            <li>External websites or tools</li>
                        </ul>
                        <p>We are not responsible for third-party services, content, or policies.</p>

                        <h2>12. Limitation of Liability</h2>
                        <p>To the maximum extent permitted by law:</p>
                        <ul>
                            <li>MyFundingList shall not be liable for indirect, incidental, or consequential damages</li>
                            <li>Our total liability shall not exceed the amount paid by you in the previous 12 months</li>
                        </ul>
                        <p>This applies regardless of the legal theory under which liability is claimed.</p>

                        <h2>13. Indemnification</h2>
                        <p>You agree to indemnify and hold harmless MyFundingList from any claims, losses, or damages arising from:</p>
                        <ul>
                            <li>Your use of the Service</li>
                            <li>Violation of these Terms</li>
                            <li>Infringement of third-party rights</li>
                        </ul>

                        <h2>14. Termination</h2>
                        <p>You may stop using the Service at any time.</p>
                        <p>We may terminate or suspend access:</p>
                        <ul>
                            <li>With or without notice</li>
                            <li>For violations of these Terms</li>
                            <li>For operational, legal, or security reasons</li>
                        </ul>
                        <p>Upon termination, your access rights will cease immediately.</p>

                        <h2>15. Modifications to the Terms</h2>
                        <p>
                            We may update these Terms from time to time. Continued use of the Service after changes indicates acceptance of the updated Terms.
                        </p>
                        <p>The latest version will always be available on the website.</p>

                        <h2>16. Governing Law and Jurisdiction</h2>
                        <p>These Terms are governed by the laws of India.</p>
                        <p>Any disputes shall be subject to the exclusive jurisdiction of the courts located in India.</p>

                        <h2>17. Contact Information</h2>
                        <p>For questions or concerns regarding these Terms, please contact:</p>
                        <p>
                            <strong>MyFundingList</strong><br />
                            Website: <a href="https://myfundinglist.com">https://myfundinglist.com</a><br />
                            Email: <a href="mailto:fazal@heva.ai">fazal@heva.ai</a>
                        </p>

                        <div className="mt-8 p-6 bg-[#EDF4E5] border border-[#31372B1F] rounded-xl">
                            <p className="text-sm text-[#31372B] font-medium">
                                By using the Service, you acknowledge that you have read, understood, and agreed to these Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
