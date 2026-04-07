"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AdSidebar — sticky sidebar ad slot (300x250)
 * Loads Adsterra container ad safely
 */

export default function AdSidebar() {

  const [dismissed, setDismissed] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    try {
      const script = document.createElement("script");

      script.src =
        "https://pl29085631.profitablecpmratenetwork.com/d3c17ab3744090b17bf40615b7b0da9a/invoke.js";

      script.async = true;

      adRef.current.appendChild(script);

    } catch (err) {
      console.error("AdSidebar error:", err);
    }

  }, []);

  if (dismissed) return null;

  return (
    <aside
      className="relative hidden xl:flex flex-col gap-2 w-[300px] shrink-0"
      aria-label="Advertisement"
    >

      <div className="sticky top-24 flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center justify-between px-1">

          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20">
            Sponsored
          </span>

          <button
            onClick={() => setDismissed(true)}
            className="text-white/20 hover:text-white/50 transition"
            aria-label="Dismiss"
          >

            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="currentColor"
            >
              <path
                d="M1 1l8 8M9 1l-8 8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>

          </button>

        </div>

        {/* Ad Container */}
        <div
          className="relative flex h-[250px] w-[300px] items-center justify-center overflow-hidden rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >

          {/* Adsterra container */}
          <div
            ref={adRef}
            id="container-d3c17ab3744090b17bf40615b7b0da9a"
            className="w-full h-full flex items-center justify-center"
          />

          {/* Gold Accent */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(255,215,0,0.12),transparent)",
            }}
          />

        </div>

      </div>

    </aside>
  );
}