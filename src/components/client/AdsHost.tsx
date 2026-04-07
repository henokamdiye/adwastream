// src/components/client/AdsHost.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";

/**
 * AdsHost: client-only wrapper that mounts ad components.
 * Keep this file as a client component so dynamic(..., { ssr: false }) is allowed.
 */

const AdBanner = dynamic(() => import("@/components/ui/ads/AdBanner"), {
  ssr: false,
  loading: () => <div className="h-20" />
});
const AdSidebar = dynamic(() => import("@/components/ui/ads/AdSidebar"), {
  ssr: false,
  loading: () => <div className="h-64 w-72 bg-transparent" />
});
const AdStickyBottomClient = dynamic(
  () => import("@/components/client/AdStickyBottomClient"),
  { ssr: false, loading: () => null }
);
const AdController = dynamic(() => import("@/components/client/AdController"), {
  ssr: false,
  loading: () => null
});

/* Use React.ReactElement instead of JSX.Element to avoid missing JSX namespace errors */
export default function AdsHost(): React.ReactElement {
  return (
    <>
      {/* Top Banner: md+ */}
      <div className="w-full hidden md:block pointer-events-auto">
        <div className="container mx-auto px-4 py-3">
          <AdBanner />
        </div>
      </div>

      {/* Right Sidebar ad (desktop only) */}
      <aside
        aria-hidden="true"
        className="hidden lg:block fixed right-6 top-28 w-72 max-w-xs z-40 pointer-events-none"
      >
        <div className="sticky top-28 pointer-events-auto">
          <AdSidebar />
        </div>
      </aside>

      {/* Sticky bottom ad (mobile) */}
      <AdStickyBottomClient />

      {/* Pre-roll controller (listens for triggerPreRoll events) */}
      <AdController />
    </>
  );
}
