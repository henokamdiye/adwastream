import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";

// 🔥 Luxury Font System
import {
  DMSans,
  Syne,
  BebasNeue,
  Cinzel,
  Playfair,
  Outfit
} from "@/utils/fonts";

import "../styles/globals.css";
import "../styles/lightbox.css";

import Providers from "./providers";
import TopNavbar from "@/components/ui/layout/TopNavbar";
import BottomNavbar from "@/components/ui/layout/BottomNavbar";
import Sidebar from "@/components/ui/layout/Sidebar";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { cn } from "@/utils/helpers";
import { IS_PRODUCTION, SpacingClasses } from "@/utils/constants";

import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

// Safe dynamic import for legal compliance
const Disclaimer = dynamic(
  () => import("@/components/ui/overlay/Disclaimer"),
  { ssr: false }
);

// Client wrapper for monetization
import AdStickyBottomClient from "@/components/client/AdStickyBottomClient";

/* ───────────────── Metadata (SEO & Branding) ───────────────── */

export const metadata: Metadata = {
  title: {
    default: "AdwaStream | Premium Habesha Cinema",
    template: `%s | ${siteConfig.name}`,
  },
  description: "The ultimate luxury streaming destination for global blockbusters and exclusive Ethiopian cinema. Experience the spirit of Adwa.",
  metadataBase: new URL("https://adwastream.xyz"),
  applicationName: "AdwaStream",
  manifest: "/manifest.json",

  icons: {
    icon: "/icon.png", // Your new Gold Adwa 'A' icon
    apple: "/icon.png",
  },

  openGraph: {
    type: "website",
    siteName: "AdwaStream",
    title: "AdwaStream | Premium Habesha Cinema",
    description: "Stream high-end movies and exclusive Habesha content in ultra-luxury UI.",
    url: "https://adwastream.xyz",
    images: [
      {
        url: "/og-image.jpg", // Make sure to place a banner in your /public folder!
        width: 1200,
        height: 630,
        alt: "AdwaStream Luxury Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AdwaStream",
    description: "The gold standard of Ethiopian streaming.",
  },

  formatDetection: {
    telephone: false,
  },
};

/* ───────────────── Viewport (OLED Black Theme) ───────────────── */

export const viewport: Viewport = {
  themeColor: "#080808", // Matches your Adwa OLED Black
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/* ───────────────── Root Layout ───────────────── */

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html 
      suppressHydrationWarning 
      lang="en" 
      data-scroll-behavior="smooth" // ✅ Fixes the Next.js Smooth Scroll Warning
    >
      <body
        className={cn(
          "bg-[#080808] min-h-dvh antialiased select-none overflow-x-hidden",

          /* 🎬 Primary UI Font (Outfit) */
          Outfit.className,

          /* 🎬 Luxury Font Variables for CSS reference */
          Syne.variable,
          BebasNeue.variable,
          DMSans.variable,
          Cinzel.variable,
          Playfair.variable
        )}
      >
        <Suspense fallback={<div className="h-screen bg-black" />}>
          <NuqsAdapter>
            <Providers>

              {/* Only show legal disclaimer in production */}
              {IS_PRODUCTION && <Disclaimer />}

              <TopNavbar />

              {/* Main Sidebar Wrapper */}
              <Sidebar>
                <main
                  className={cn(
                    "container mx-auto max-w-full min-h-screen",
                    SpacingClasses.main
                  )}
                >
                  {children}
                </main>
              </Sidebar>

              <BottomNavbar />

              {/* Ad Integration Placeholder */}
              <AdStickyBottomClient />

            </Providers>
          </NuqsAdapter>
        </Suspense>

        {/* Performance Tracking (Cloudflare compatible) */}
        <SpeedInsights />
        <Analytics />

      </body>
    </html>
  );
}