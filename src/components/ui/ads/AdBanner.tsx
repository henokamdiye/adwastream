"use client";
import { useState } from "react";
import { cn } from "@/utils/helpers";

interface AdBannerProps {
  variant?: "leaderboard" | "rectangle" | "wide";
  className?: string;
  /** Ad network slot ID — replace with your actual ad unit */
  slot?: string;
}

/**
 * AdBanner — inline horizontal banner ad slot.
 * Replace the inner div's content with your actual ad network script tag
 * (Google AdSense, Carbon, etc.). The wrapper is already sized correctly.
 */
export default function AdBanner({ variant = "leaderboard", slot, className }: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const sizes = {
    leaderboard: "h-[90px] max-w-[728px]",
    rectangle:   "h-[250px] max-w-[300px]",
    wide:        "h-[90px] w-full",
  };

  return (
    <div
      className={cn(
        "relative mx-auto flex items-center justify-center overflow-hidden rounded-xl",
        "border border-white/5 bg-white/[0.03]",
        sizes[variant],
        className,
      )}
      aria-label="Advertisement"
    >
      {/* ── Replace this placeholder with your real ad tag ── */}
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 select-none">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20">
          Advertisement
        </span>
        {/* Example: Google AdSense slot */}
        {/* <ins className="adsbygoogle" style={{display:"block"}}
             data-ad-client="ca-pub-XXXXXXXX" data-ad-slot={slot ?? ""} data-ad-format="auto" /> */}

        {/* Placeholder visual — remove when real ads are wired */}
        <div className="flex items-center gap-3 text-white/10">
          <div className="h-8 w-8 rounded-lg bg-white/5" />
          <div className="flex flex-col gap-1">
            <div className="h-2 w-32 rounded-full bg-white/5" />
            <div className="h-2 w-20 rounded-full bg-white/5" />
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/40 transition hover:bg-white/20 hover:text-white/70"
        aria-label="Close ad"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
          <path d="M.7.7l6.6 6.6M7.3.7L.7 7.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Subtle gold top line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-xl"
           style={{ background: "linear-gradient(90deg,transparent,rgba(255,215,0,0.15),transparent)" }} />
    </div>
  );
}
