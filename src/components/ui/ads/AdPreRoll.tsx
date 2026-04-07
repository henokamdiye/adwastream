"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script"; // Import Next.js Script for pro loading

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

  // Brand Colors matching your player
  const BRAND_GOLD = "#F5C300";

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

  // Auto-advance after 20 seconds (safety limit)
  useEffect(() => {
    if (adSeconds >= 20) onDone();
  }, [adSeconds, onDone]);

  const circumference = 2 * Math.PI * 16;
  const progress = canSkip ? 0 : circumference * (1 - (skipAfter - countdown) / skipAfter);

  return (
    <>
      {/* --- Adsterra Integration --- */}
      <Script
        id="adsterra-preroll"
        src="https://pl29085033.profitablecpmratenetwork.com/c5/14/99/c514994a5300c2501ab0e78ea0d66080.js"
        strategy="afterInteractive" // Loads after the page becomes interactive
      />

      <div className="absolute inset-0 z-[100] flex items-end justify-end bg-black/40 backdrop-blur-sm pb-16 pr-8 transition-all duration-500">
        
        {/* Ad label top-left - Matching your cinematic HUD */}
        <div 
          className="absolute left-6 top-6 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[3px] text-white flex items-center gap-2"
          style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${BRAND_GOLD}44` }}
        >
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Advertisement
        </div>

        {/* Skip / countdown button */}
        {canSkip ? (
          <button
            onClick={onDone}
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
          <div 
            className="flex items-center gap-4 rounded-full bg-black/80 px-6 py-3 border border-white/10 backdrop-blur-xl"
          >
            {/* Circular countdown */}
            <div className="relative h-10 w-10">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
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

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    </>
  );
}