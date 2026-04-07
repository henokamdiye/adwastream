"use client";
import { useState, useEffect, useRef } from "react";

export default function AdStickyBottom() {
  const [visible, setVisible]     = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef    = useRef(false);

  // Show after 5 s, only once per session
  useEffect(() => {
    if (sessionStorage.getItem("adStickyDismissed")) return;
    const t = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Load Adsterra script once the container is visible
  useEffect(() => {
    if (!visible || loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    const script = document.createElement("script");
    script.src =
      "https://pl29085033.profitablecpmratenetwork.com/c5/14/99/c514994a5300c2501ab0e78ea0d66080.js";
    script.async = true;
    script.type = "text/javascript";
    containerRef.current.appendChild(script);
  }, [visible]);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("adStickyDismissed", "1");
  };

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[999] flex justify-center px-3 pb-3"
      style={{ animation: "slideUpAd 0.45s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <div
        className="relative flex w-full max-w-2xl items-center gap-3 overflow-hidden rounded-2xl px-4 py-3"
        style={{
          background: "rgba(10,10,10,0.94)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "0 -8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,215,0,0.05) inset",
        }}
      >
        {/* Gold top accent */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(255,215,0,0.35),transparent)",
          }}
        />

        {/* Ad label */}
        <span className="shrink-0 rounded border border-white/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white/25">
          Ad
        </span>

        {/* Adsterra renders here */}
        <div
          ref={containerRef}
          className="flex flex-1 min-h-[50px] items-center justify-center"
        />

        {/* Dismiss — large tap target */}
        <button
          onClick={dismiss}
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-white/40 transition hover:bg-white/15 hover:text-white active:scale-90"
          aria-label="Close advertisement"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M1 1l8 8M9 1l-8 8" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes slideUpAd {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}