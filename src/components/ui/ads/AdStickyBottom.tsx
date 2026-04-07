"use client";
import { useState, useEffect } from "react";

/**
 * AdStickyBottom — Integrated with your Adsterra Direct Link
 */
export default function AdStickyBottom() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // YOUR DIRECT LINK
  const AD_LINK = "https://www.profitablecpmratenetwork.com/gd5iruty?key=6ed2d11b5284120bc0849bf320f9facf";

  useEffect(() => {
    if (sessionStorage.getItem("adStickyDismissed")) return;
    // Show after 4 seconds for better user experience
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents clicking the ad when clicking X
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem("adStickyDismissed", "1");
  };

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[999] flex justify-center pb-6 px-4"
      style={{ animation: "slideUpAd 0.6s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <div
        className="relative flex w-full max-w-2xl items-center justify-between gap-4 overflow-hidden rounded-2xl p-1"
        style={{
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.1) inset",
        }}
      >
        {/* The Clickable Ad Area */}
        <a 
          href={AD_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center gap-4 px-4 py-2 transition-all hover:bg-white/5 group"
        >
          {/* Gold accent top line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
               style={{ background: "linear-gradient(90deg,transparent,rgba(255,215,0,0.4),transparent)" }} />

          <span className="shrink-0 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500 border border-yellow-500/20 bg-yellow-500/5">
            Sponsored
          </span>

          <div className="flex flex-1 items-center gap-4">
            {/* Ad Icon (Matching your UI style) */}
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-yellow-500/20 to-transparent flex items-center justify-center border border-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-yellow-500">
                    <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
                </svg>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">
                Stream in Ultra HD 4K
              </span>
              <span className="text-[11px] text-white/50 font-medium">
                No subscription required. Click to watch now.
              </span>
            </div>
          </div>
        </a>

        {/* Dismiss Button */}
        <button
          onClick={dismiss}
          className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/30 transition hover:bg-white/10 hover:text-white active:scale-90"
          aria-label="Close advertisement"
        >
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor">
            <path d="M1 1l8 8M9 1l-8 8" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUpAd {
          from { transform: translateY(120%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}