"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";

interface AdPreRollProps {
  /** Called when ad is skipped or finishes */
  onDone: () => void;
  /** Seconds before skip is available */
  skipAfter?: number;
}

export default function AdPreRoll({ onDone, skipAfter = 5 }: AdPreRollProps) {
  const [countdown, setCountdown] = useState(skipAfter);
  const [canSkip, setCanSkip] = useState(false);
  const [adSeconds, setAdSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const BRAND_GOLD = "#F5C300";
  const DIRECT_LINK = "https://www.profitablecpmratenetwork.com/gd5iruty?key=6ed2d11b5284120bc0849bf320f9facf";

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setCanSkip(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return c - 1;
      });
      setAdSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (adSeconds >= 20) onDone();
  }, [adSeconds, onDone]);

  const handleBackgroundClick = () => {
    window.open(DIRECT_LINK, "_blank");
  };

  // Inject Adsterra iframe script dynamically
  useEffect(() => {
    const container = document.getElementById("adsterra-preroll-container");
    if (!container) return;

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
    container.appendChild(inlineScript);

    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/df67367368efb0d29cc8c894d57d7ef2/invoke.js";
    script.async = true;
    container.appendChild(script);

    return () => {
      inlineScript.remove();
      script.remove();
    };
  }, []);

  const circumference = 2 * Math.PI * 16;
  const progress = canSkip ? 0 : circumference * (1 - (skipAfter - countdown) / skipAfter);

  return (
    <>
      <div className="absolute inset-0 z-[100] flex items-end justify-end bg-black/40 backdrop-blur-sm pb-16 pr-8 transition-all duration-500">
        
        {/* Invisible click layer */}
        <div 
          onClick={handleBackgroundClick}
          className="absolute inset-0 z-10 cursor-pointer"
        />

        {/* Ad label */}
        <div 
          className="absolute left-6 top-6 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[3px] text-white flex items-center gap-2 z-20"
          style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${BRAND_GOLD}44` }}
        >
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Advertisement
        </div>

        {/* Skip / countdown button */}
        <div className="z-20">
          {canSkip ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBackgroundClick();
                onDone();
              }}
              className="group flex items-center gap-3 rounded-full px-8 py-3.5 text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-2xl"
              style={{
                background: BRAND_GOLD,
                color: "#000",
                boxShadow: `0 0 30px ${BRAND_GOLD}44`,
              }}
            >
              SKIP AD
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-4 rounded-full bg-black/80 px-6 py-3 border border-white/10 backdrop-blur-xl">
              <div className="relative h-10 w-10">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="16" fill="none"
                    stroke={BRAND_GOLD}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={progress}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white font-mono">
                  {countdown}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Waiting</span>
                <span className="text-xs text-white font-medium">Video starts in {countdown}s</span>
              </div>
            </div>
          )}
        </div>

        {/* Container where Adsterra iframe will render */}
        <div id="adsterra-preroll-container" className="absolute bottom-20 left-6 z-10" />

      </div>
    </>
  );
}