"use client";
import { useState, useEffect } from "react";

/**
 * AdStickyBottom — appears 4 seconds after page load, easily dismissable.
 * Non-blocking: it slides up gently from the bottom and has an obvious X.
 */
export default function AdStickyBottom() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check session storage so it doesn't re-show on every page navigation
    if (sessionStorage.getItem("adStickyDismissed")) return;
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("adStickyDismissed", "1");
  };

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[999] flex justify-center pb-4 px-3"
      style={{ animation: "slideUpAd 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <div
        className="relative flex w-full max-w-2xl items-center justify-between gap-4 overflow-hidden rounded-2xl px-5 py-3"
        style={{
          background: "rgba(12,12,12,0.92)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.05) inset",
        }}
      >
        {/* Gold accent top line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
             style={{ background: "linear-gradient(90deg,transparent,rgba(255,215,0,0.3),transparent)" }} />

        {/* Ad label + placeholder */}
        <div className="flex flex-1 items-center gap-4">
          <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/30 border border-white/10">
            Ad
          </span>

          {/* ── Replace with real ad unit ── */}
          <div className="flex flex-1 items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-white/5" />
            <div className="flex flex-col gap-1.5">
              <div className="h-2 w-48 rounded-full bg-white/8" />
              <div className="h-1.5 w-32 rounded-full bg-white/5" />
            </div>
          </div>
        </div>

        {/* Dismiss — big, easy to tap */}
        <button
          onClick={dismiss}
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-white/50 transition hover:bg-white/15 hover:text-white active:scale-95"
          aria-label="Close advertisement"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes slideUpAd {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
