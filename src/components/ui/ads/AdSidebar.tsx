"use client";
import { useState } from "react";

/**
 * AdSidebar — sticky sidebar ad slot for movie/show detail pages (desktop only).
 * Replace the inner content with your ad network's code.
 */
export default function AdSidebar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <aside
      className="relative hidden xl:flex flex-col gap-2 w-[300px] shrink-0"
      aria-label="Advertisement"
    >
      <div className="sticky top-24 flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20">
            Sponsored
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/20 hover:text-white/50 transition"
            aria-label="Dismiss"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 300×250 rectangle slot */}
        <div
          className="relative flex h-[250px] w-[300px] flex-col items-center justify-center overflow-hidden rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* ── Replace with real ad unit ── */}
          <div className="flex flex-col items-center gap-3 text-white/10 select-none">
            <div className="h-16 w-16 rounded-2xl bg-white/5" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-2 w-28 rounded-full bg-white/5" />
              <div className="h-2 w-20 rounded-full bg-white/5" />
              <div className="h-2 w-24 rounded-full bg-white/5" />
            </div>
          </div>
          {/* Gold accent */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
               style={{ background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.12),transparent)" }} />
        </div>

        {/* 300×600 optional half-page slot (commented out, uncomment to use) */}
        {/* <div className="flex h-[600px] w-[300px] items-center justify-center rounded-2xl bg-white/[0.025] border border-white/6"> */}
        {/*   Tall ad unit */}
        {/* </div> */}
      </div>
    </aside>
  );
}
