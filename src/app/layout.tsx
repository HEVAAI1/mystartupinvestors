import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans,
  Funnel_Display,
} from "next/font/google";
import "./globals.css"; 
import Script from "next/script";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://myfundinglist.com"),

  title: {
    default: "Find 5000+ Verified Investors | MyFundingList",
    template: "%s | MyFundingList",
  },

  description:
    "Connect with 5,000+ verified investors. MyFundingList helps founders find, filter, and reach the right investors across sectors and geographies.",

  openGraph: {
    title: "Find & Connect with 5000+ Verified Investors",
    description:
      "Access 5,000+ active investors across sectors and geographies for your startup.",
    url: "https://myfundinglist.com",
    siteName: "MyFundingList",
    images: [
      {
        url: "https://myfundinglist.com/og-preview.png", // 🔥 IMPORTANT
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Find & Connect with 5000+ Verified Investors",
    description:
      "Access 5,000+ active investors across sectors and geographies.",
    images: ["https://myfundinglist.com/og-preview.png"], // 🔥 IMPORTANT
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${notoSans.variable}
          ${funnelDisplay.variable}
          antialiased
        `}
      >
        {children}

        {/* Google Analytics */}
        <Script
  src="https://www.googletagmanager.com/gtag/js?id=G-RSRMCPZL28"
  strategy="afterInteractive"
/>

<Script id="google-analytics" strategy="afterInteractive">
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