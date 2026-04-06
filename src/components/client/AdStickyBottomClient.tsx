"use client";

import dynamic from "next/dynamic";

const AdStickyBottom = dynamic(
  () => import("@/components/ui/ads/AdStickyBottom"),
  { ssr: false }
);

export default function AdStickyBottomClient() {
  return <AdStickyBottom />;
}