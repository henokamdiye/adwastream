"use client";

import React from "react";
import dynamic from "next/dynamic";

/**
 * AdsHost: central client-only host for ad slots.
 * - Loads client ad components dynamically (ssr: false)
 * - Keeps ad script injection inside each component
 */

const AdBanner = dynamic(() => import("@/components/ui/ads/AdBanner"), { ssr: false });
const AdSidebar = dynamic(() => import("@/components/ui/ads/AdSidebar"), { ssr: false });
const AdStickyBottom = dynamic(() => import("@/components/ui/ads/AdStickyBottom"), { ssr: false });
const AdController = dynamic(() => import("@/components/client/AdController"), { ssr: false });

export default function AdsHost(): React.ReactElement {
  return (
    <>
      {/* Top banner (place where you want it in the flow) */}
      <div className="w-full pointer-events-auto">
        <div className="container mx-auto px-4 py-3">
          <AdBanner />
        </div>
      </div>

      {/* Sidebar (desktop only) */}
      <aside aria-hidden="true" className="hidden xl:block fixed right-6 top-28 z-40 pointer-events-none">
        <div className="sticky top-28 pointer-events-auto">
          <AdSidebar />
        </div>
      </aside>

      {/* Sticky bottom (mobile / small screens) */}
      <AdStickyBottom />

      {/* Controller for pre-rolls and global ad events */}
      <AdController />
    </>
  );
}
