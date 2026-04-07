"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/helpers";

interface AdBannerProps {
  variant?: "leaderboard" | "rectangle" | "wide";
  className?: string;
}

export default function AdBanner({ variant = "leaderboard", className }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current || dismissed) return;
    loadedRef.current = true;

    const script = document.createElement("script");
    script.src =
      "https://pl29085033.profitablecpmratenetwork.com/c5/14/99/c514994a5300c2501ab0e78ea0d66080.js";
    script.async = true;
    script.type = "text/javascript";
    containerRef.current.appendChild(script);
  }, [dismissed]);

  if (dismissed) return null;

  const sizes: Record<string, string> = {
    leaderboard: "min-h-[90px] max-w-[728px]",
    rectangle: "min-h-[250px] max-w-[300px]",
    wide: "min-h-[90px] w-full",
  };

  return (
    <div
      className={cn(
        "relative mx-auto overflow-hidden rounded-xl",
        "border border-white/5 bg-black/20",
        sizes[variant],
        className,
      )}
      aria-label="Advertisement"
    >
      {/* Adsterra renders into this container */}
      <div ref={containerRef} className="flex min-h-[90px] w-full items-center justify-center" />

      {/* Gold accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(255,215,0,0.15),transparent)",
        }}
      />

      {/* Ad label */}
      <span className="absolute left-2 top-1.5 rounded px-1 py-px text-[8px] font-semibold uppercase tracking-widest text-white/20">
        Ad
      </span>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/8 text-white/30 transition hover:bg-white/15 hover:text-white/60"
        aria-label="Close ad"
      >
        <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 1l6 6M7 1l-6 6" />
        </svg>
      </button>
    </div>
  );
}