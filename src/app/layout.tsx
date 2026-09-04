import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans,
  Funnel_Display,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { headers } from "next/headers";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  alternates: {
    canonical: "/",
  },

  title: {
    default: "Find 34,850+ Verified Investors | MyFundingList",
    template: "%s | MyFundingList",
  },

  description:
    "Connect with 34,850+ verified investors. MyFundingList helps founders find, filter, and unlock direct investor email addresses across sectors and geographies.",

  keywords: [
    "investor database",
    "find investors for startup",
    "startup funding database",
    "angel investors directory",
    "VC database",
    "venture capital contacts",
    "startup fundraising platform",
    "investor list for founders",
    "investor email",
    "investor email list",
    "investor email addresses",
    "find investor emails",
    "VC email",
    "VC email list",
    "venture capital email addresses",
    "angel investor email list",
    "email list of investors",
    "startup investor contact list",
    "verified investor contacts",
    "investor contact database",
  ],

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/Logo.png",
  },

  openGraph: {
    title: "Find & Connect with 34,850+ Verified Investors",
    description:
      "Access 34,850+ verified investor emails across sectors and geographies for your startup.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Find & Connect with 34,850+ Verified Investors",
    description:
      "Access 34,850+ verified investor emails across sectors and geographies.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/Logo.png`,
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${notoSans.variable}
          ${funnelDisplay.variable}
          ${inter.variable}
          ${spaceGrotesk.variable}
          min-h-screen
          flex
          flex-col
          antialiased
        `}
      >
        <Script
          id="org-jsonld"
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        {children}

        {/* Google Analytics */}
        <Script
  src="https://www.googletagmanager.com/gtag/js?id=G-RSRMCPZL28"
  strategy="afterInteractive"
  nonce={nonce}
/>

<Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-RSRMCPZL28');
  `}
</Script>

      </body>
    </html>
  );
}