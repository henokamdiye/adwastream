// src/components/client/AdController.tsx
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/**
 * Dynamically import the AdPreRoll component (client-only).
 * Keep loading: () => null to avoid SSR rendering.
 */
const AdPreRoll = dynamic(() => import("@/components/ui/ads/AdPreRoll"), {
  ssr: false,
  loading: () => null,
});

type PreRollDetail = {
  durationMs?: number;
  skippableAfter?: number;
  meta?: Record<string, any>;
};

const AdController: React.FC = () => {
  const [showPreRoll, setShowPreRoll] = useState(false);
  const [detail, setDetail] = useState<PreRollDetail | null>(null);

  useEffect(() => {
    function onTrigger(e: Event) {
      const d = (e as CustomEvent).detail ?? {};
      setDetail(d);
      setShowPreRoll(true);
    }

    window.addEventListener("triggerPreRoll", onTrigger as EventListener);
    return () => {
      window.removeEventListener("triggerPreRoll", onTrigger as EventListener);
    };
  }, []);

  // Auto-hide after durationMs if provided (safety fallback)
  useEffect(() => {
    if (!showPreRoll || !detail?.durationMs) return;
    const t = setTimeout(() => setShowPreRoll(false), detail.durationMs);
    return () => clearTimeout(t);
  }, [showPreRoll, detail]);

  if (!showPreRoll) return null;

  // Provide onDone so AdPreRoll can notify when it's finished/skipped
  function handleDone() {
    setShowPreRoll(false);
  }

  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
    >
      <div className="w-full max-w-3xl mx-4">
        {/* Pass the detail payload and required onDone callback */}
        <AdPreRoll
          {...(detail ?? {})}
          onDone={handleDone}
        />
      </div>
    </div>
  );
};

export default AdController;
