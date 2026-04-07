"use client";
import { useState, useEffect } from "react";

/**
 * AdStickyBottom — Integrated with Adsterra iframe ad
 */
export default function AdStickyBottom() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("adStickyDismissed")) return;

    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible || dismissed) return;

    // Inject Adsterra iframe ad script
    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/df67367368efb0d29cc8c894d57d7ef2/invoke.js";
    script.async = true;

    const inlineScript = document.createElement("script");
    inlineScript.innerHTML = `
      atOptions = {
        'key' : 'df67367368efb0d29cc8c894d57d7ef2',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    document.getElementById("ad-container")?.appendChild(inlineScript);
    document.getElementById("ad-container")?.appendChild(script);

    return () => {
      script.remove();
      inlineScript.remove();
    };
  }, [visible, dismissed]);

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem("adStickyDismissed", "1");
  };

  if (!visible || dismissed) return null;

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
        <div id="ad-container" className="flex justify-center w-full"></div>

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