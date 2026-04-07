// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import Script from "next/script";

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

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

/* Client-only ad host (renders all ad components) */
import AdsHost from "@/components/client/AdsHost";

/* ───────────────── Metadata ───────────────── */

export const metadata: Metadata = {
  title: {
    default: "AdwaStream | Premium Habesha Cinema",
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "The ultimate luxury streaming destination for global blockbusters and exclusive Ethiopian cinema.",
  metadataBase: new URL("https://adwastream.xyz"),
  applicationName: "AdwaStream",
  manifest: "/manifest.json",

  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    type: "website",
    siteName: "AdwaStream",
    title: "AdwaStream | Premium Habesha Cinema",
    description:
      "Stream high-end movies and exclusive Habesha content.",
    url: "https://adwastream.xyz",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AdwaStream Preview",
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

/* ───────────────── Viewport ───────────────── */

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/* ───────────────── Root Layout ───────────────── */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      data-scroll-behavior="smooth"
    >
      <body
        className={cn(
          "bg-[#080808] min-h-dvh antialiased select-none overflow-x-hidden",
          Outfit.className,
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

              {/* ✅ Client-only Disclaimer */}
              {IS_PRODUCTION && <Providers /> /* keep your existing logic; if you had ClientOnlyDisclaimer, keep it inside Providers or AdsHost as needed */}

              <TopNavbar />

              {/* Main content + layout */}
              <div className="relative">
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
              </div>

              <BottomNavbar />

              {/* AdsHost is a client component that mounts banner, sidebar, sticky bottom, and pre-roll controller */}
              <Suspense fallback={null}>
                <AdsHost />
              </Suspense>

            </Providers>
          </NuqsAdapter>
        </Suspense>

        {/* Performance */}
        <SpeedInsights />
        <Analytics />

        {/* 🔥 Adsterra Global Script Integration 🔥 */}
        <Script
          id="adsterra-global"
          src="https://pl29085033.profitablecpmratenetwork.com/c5/14/99/c514994a5300c2501ab0e78ea0d66080.js"
          strategy="lazyOnload"
        />

      </body>
    </html>
  );
}
