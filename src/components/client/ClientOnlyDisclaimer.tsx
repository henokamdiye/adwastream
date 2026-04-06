"use client";

import dynamic from 'next/dynamic';

const Disclaimer = dynamic(
  () => import("@/components/ui/overlay/Disclaimer"),
  { ssr: false }
);

// 🚨 Check that this line says 'export default function'
export default function ClientOnlyDisclaimer() {
  return <Disclaimer />;
}