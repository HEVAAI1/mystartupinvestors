import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans,
  Funnel_Display,
} from "next/font/google";
import "./globals.css";

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
    default: "Home | MyFundingList",
    template: "%s | MyFundingList",
  },

  description:
    "Connect with 5,000+ verified investors. MyFundingList is the fastest way for founders to find, filter, and reach the right investors across sectors and geographies.",

  openGraph: {
    siteName: "MyFundingList",
    type: "website",
    description: "Connect with 5,000+ verified investors. Find, filter, and reach the right investors for your startup.",
  },

  twitter: {
    card: "summary_large_image",
    description: "Connect with 5,000+ verified investors on MyFundingList.",
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
      </body>
    </html>
  );
}
