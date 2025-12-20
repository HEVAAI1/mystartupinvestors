import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export const metadata = {
    title: "Privacy Policy – MyFundingList",
    description: "Privacy Policy for MyFundingList - Learn how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicy() {
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
                            Privacy Policy
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
                            {`MyFundingList ("Company", "we", "us", or "our") operates the website `}<a href="https://myfundinglist.com">https://myfundinglist.com</a>{` (the "Service").`}
                        </p>
                        <p>
                            This Privacy Policy explains how we collect, use, store, disclose, and protect personal data when you use our Service. By accessing or using the Service, you agree to the practices described in this Privacy Policy.
                        </p>

                        <h2>2. Scope of This Policy</h2>
                        <p>This Privacy Policy applies to:</p>
                        <ul>
                            <li>Website visitors</li>
                            <li>Registered users</li>
                            <li>Free and paid subscribers</li>
                            <li>Startup founders and business users accessing the platform</li>
                        </ul>
                        <p>It does not apply to third-party websites or services linked from our platform.</p>

                        <h2>3. Information We Collect</h2>
                        <p>We collect only the information necessary to operate and improve the Service.</p>

                        <h3>3.1 Information You Provide</h3>
                        <ul>
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Profile information</li>
                            <li>Startup or business details</li>
                            <li>Any information voluntarily submitted through forms or communication</li>
                        </ul>

                        <h3>3.2 Authentication Information</h3>
                        <ul>
                            <li>Google OAuth is used for authentication</li>
                            <li>We do not receive or store your Google password</li>
                            <li>We may receive basic profile information permitted by Google OAuth settings</li>
                        </ul>

                        <h3>3.3 Usage and Technical Data</h3>
                        <ul>
                            <li>Log data (IP address, browser type, device information)</li>
                            <li>Pages visited and features used</li>
                            <li>Timestamps and usage patterns</li>
                            <li>Session and analytics data</li>
                        </ul>

                        <h2>4. How We Use Your Information</h2>
                        <p>We use collected information to:</p>
                        <ul>
                            <li>Provide and maintain the Service</li>
                            <li>Authenticate users and manage accounts</li>
                            <li>Process subscriptions and payments</li>
                            <li>Improve platform performance and usability</li>
                            <li>Monitor usage, security, and abuse</li>
                            <li>Communicate service-related updates and notices</li>
                            <li>Comply with legal and regulatory obligations</li>
                        </ul>
                        <p>We do not sell personal data.</p>

                        <h2>5. Payments and Financial Information</h2>
                        <ul>
                            <li>Payments are processed through Dodo Payments</li>
                            <li>We do not store full payment card or banking details</li>
                            <li>Payment data is handled directly by third-party payment providers under their own privacy policies</li>
                        </ul>

                        <h2>6. Investor and Business Data Disclaimer</h2>
                        <p>Investor information available on the platform:</p>
                        <ul>
                            <li>Is collected from public, submitted, or verified sources</li>
                            <li>Is provided for informational purposes only</li>
                            <li>May not always be complete, current, or accurate</li>
                        </ul>
                        <p>We do not guarantee investor availability, interest, or responses.</p>

                        <h2>7. Cookies and Tracking Technologies</h2>
                        <p>We may use cookies or similar technologies to:</p>
                        <ul>
                            <li>Maintain user sessions</li>
                            <li>Improve site functionality</li>
                            <li>Analyze usage trends</li>
                        </ul>
                        <p>
                            You can control cookies through your browser settings. Disabling cookies may affect certain features of the Service.
                        </p>

                        <h2>8. Data Sharing and Disclosure</h2>
                        <p>We may share information only in the following cases:</p>
                        <ul>
                            <li>With service providers assisting in operations (hosting, analytics, payments)</li>
                            <li>To comply with legal obligations or lawful requests</li>
                            <li>To protect our rights, security, or users</li>
                            <li>As part of a business transfer, merger, or acquisition</li>
                        </ul>
                        <p>We do not share personal data for advertising or resale.</p>

                        <h2>9. Data Retention</h2>
                        <p>We retain personal data only for as long as necessary to:</p>
                        <ul>
                            <li>Provide the Service</li>
                            <li>Fulfill contractual and legal obligations</li>
                            <li>Resolve disputes and enforce agreements</li>
                        </ul>
                        <p>Data may be deleted or anonymized when no longer required.</p>

                        <h2>10. Data Security</h2>
                        <p>We implement reasonable technical and organizational measures to protect personal data, including:</p>
                        <ul>
                            <li>Access controls</li>
                            <li>Secure hosting environments</li>
                            <li>Limited internal access to data</li>
                        </ul>
                        <p>However, no system is completely secure, and we cannot guarantee absolute security.</p>

                        <h2>11. International Users</h2>
                        <p>
                            MyFundingList is based in India, but users may access the Service globally.
                        </p>
                        <p>
                            By using the Service, you acknowledge that your data may be processed and stored in jurisdictions that may have different data protection laws.
                        </p>

                        <h2>12. Your Rights</h2>
                        <p>Depending on applicable laws, you may have the right to:</p>
                        <ul>
                            <li>Access your personal data</li>
                            <li>Correct inaccurate or incomplete information</li>
                            <li>Request deletion of your data</li>
                            <li>Withdraw consent where applicable</li>
                        </ul>
                        <p>Requests can be made by contacting us at the email address below.</p>

                        <h2>{`13. Children's Privacy`}</h2>
                        <p>
                            The Service is not intended for individuals under the age of 18.
                        </p>
                        <p>
                            We do not knowingly collect personal data from minors.
                        </p>

                        <h2>14. Third-Party Links and Services</h2>
                        <p>
                            The Service may contain links to third-party websites or services.
                        </p>
                        <p>
                            We are not responsible for the privacy practices or content of third parties. You should review their privacy policies separately.
                        </p>

                        <h2>15. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time.
                        </p>
                        <p>
                            Changes will be effective upon posting on the website. Continued use of the Service after changes constitutes acceptance of the updated policy.
                        </p>

                        <h2>16. Governing Law</h2>
                        <p>
                            This Privacy Policy is governed by the laws of India.
                        </p>
                        <p>
                            Any disputes relating to privacy or data protection shall be subject to the exclusive jurisdiction of courts located in India.
                        </p>

                        <h2>17. Contact Information</h2>
                        <p>For questions, concerns, or data requests, please contact:</p>
                        <p>
                            <strong>MyFundingList</strong><br />
                            Website: <a href="https://myfundinglist.com">https://myfundinglist.com</a><br />
                            Email: <a href="mailto:fazal@heva.ai">fazal@heva.ai</a>
                        </p>

                        <div className="mt-8 p-6 bg-[#EDF4E5] border border-[#31372B1F] rounded-xl">
                            <p className="text-sm text-[#31372B] font-medium">
                                By using the Service, you acknowledge that you have read and understood this Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
