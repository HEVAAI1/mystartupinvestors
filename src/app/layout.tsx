import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans,
  Funnel_Display,
} from "next/font/google";
import "./globals.css";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// IMPORTANT: Your Navbar.tsx
import AuthenticatedNavbar from "@/components/Navbar";

// =======================
// Fonts
// =======================
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

// =======================
// Metadata
// =======================
export const metadata: Metadata = {
  title: "MyFundingList",
  description: "Startup Funding Platform",
};

// =======================
// RootLayout
// =======================
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side Supabase client
  const supabase = await createSupabaseServerClient();

  // Fetch logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let credits = 0;

  // Fetch credits if logged in
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("credits_allocated, credits_used")
      .eq("id", user.id)
      .single();

    credits = (data?.credits_allocated ?? 0) - (data?.credits_used ?? 0);
  }

  // Detect current route - Next.js 15 uses x-pathname header
  const headerList = await headers();
const pathname = headerList.get("x-pathname") || "/";
  const showNavbar = pathname !== "/"; // ❗ Hide Navbar on landing page

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
        {/* Show Navbar only when NOT the landing page */}
        {showNavbar && <AuthenticatedNavbar credits={credits} />}

        {children}
      </body>
    </html>
  );
}
