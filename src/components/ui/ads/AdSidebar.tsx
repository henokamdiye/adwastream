"use client";
import { useState, useEffect, useRef } from "react";

export default function AdSidebar() {
  const [dismissed, setDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef    = useRef(false);

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

  return (
    <aside
      className="relative hidden xl:flex flex-col gap-2 w-[300px] shrink-0"
      aria-label="Advertisement"
    >
      <div className="sticky top-24 flex flex-col gap-1.5">
        {/* Header row */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/20">
            Sponsored
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/20 transition hover:text-white/50"
            aria-label="Dismiss"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M1 1l8 8M9 1l-8 8" />
            </svg>
          </button>
        </div>

        {/* 300×250 ad container */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            width: 300,
            minHeight: 250,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Adsterra renders here */}
          <div
            ref={containerRef}
            className="flex min-h-[250px] w-full items-center justify-center"
          />

          {/* Gold top accent */}
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