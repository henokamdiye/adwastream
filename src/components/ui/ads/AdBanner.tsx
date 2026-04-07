"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/helpers";

interface AdBannerProps {
  variant?: "leaderboard" | "rectangle" | "wide";
  className?: string;
}

export default function AdBanner({
  variant = "leaderboard",
  className,
}: AdBannerProps) {

  const [dismissed, setDismissed] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  const sizes = {
    leaderboard: "h-[90px] max-w-[728px]",
    rectangle: "h-[250px] max-w-[300px]",
    wide: "h-[50px] max-w-[320px]",
  };

  useEffect(() => {
    if (!adRef.current) return;

    try {
      // Set Adsterra options
      (window as any).atOptions = {
        key: "df67367368efb0d29cc8c894d57d7ef2",
        format: "iframe",
        height: 50,
        width: 320,
        params: {},
      };

      // Create script
      const script = document.createElement("script");
      script.src =
        "https://www.highperformanceformat.com/df67367368efb0d29cc8c894d57d7ef2/invoke.js";
      script.async = true;

      adRef.current.appendChild(script);

    } catch (err) {
      console.error("AdBanner error:", err);
    }

  }, []);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "relative mx-auto flex items-center justify-center overflow-hidden rounded-xl",
        "border border-white/5 bg-white/[0.03]",
        sizes[variant],
        className
      )}
      aria-label="Advertisement"
    >

      {/* Ad container */}
      <div
        ref={adRef}
        className="flex h-full w-full items-center justify-center"
      />

      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/40 transition hover:bg-white/20 hover:text-white/70"
        aria-label="Close ad"
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="currentColor"
        >
          <path
            d="M.7.7l6.6 6.6M7.3.7L.7 7.3"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Gold top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-xl"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(255,215,0,0.15),transparent)",
        }}
      />

    </div>
  );
}