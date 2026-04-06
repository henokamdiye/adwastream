"use client";
import { useState, useEffect, useRef } from "react";

interface AdPreRollProps {
  /** Called when ad is skipped or finishes */
  onDone: () => void;
  /** Seconds before skip is available */
  skipAfter?: number;
}

/**
 * AdPreRoll — a 15-second skippable pre-roll shown before playback begins.
 * Replace the inner content with your video ad tag / VAST URL.
 */
export default function AdPreRoll({ onDone, skipAfter = 5 }: AdPreRollProps) {
  const [countdown, setCountdown] = useState(skipAfter);
  const [canSkip,   setCanSkip]   = useState(false);
  const [adSeconds, setAdSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { setCanSkip(true); clearInterval(intervalRef.current!); return 0; }
        return c - 1;
      });
      setAdSeconds((s) => s + 1);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Auto-advance after 15 seconds
  useEffect(() => { if (adSeconds >= 15) onDone(); }, [adSeconds, onDone]);

  const circumference = 2 * Math.PI * 16; // r=16
  const progress = canSkip ? 0 : (circumference * (1 - (skipAfter - countdown) / skipAfter));

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-end bg-black/60 pb-16 pr-4">
      {/* ── Ad placeholder — wire up a VAST/VPAID tag here ── */}
      {/* The actual ad would overlay the video. This shows the skip UI only. */}

      {/* Ad label top-left */}
      <div className="absolute left-4 top-4 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60"
           style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}>
        Ad
      </div>

      {/* Skip / countdown button */}
      {canSkip ? (
        <button
          onClick={onDone}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#b8860b,#ffd700,#b8860b)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
            color: "#000",
            boxShadow: "0 2px 16px rgba(255,215,0,0.3)",
          }}
        >
          Skip Ad
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2.5 backdrop-blur-sm"
             style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          {/* Circular countdown */}
          <div className="relative h-8 w-8">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="16" fill="none"
                stroke="rgba(255,215,0,0.7)" strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
              {countdown}
            </span>
          </div>
          <span className="text-xs text-white/60">Skip in {countdown}s</span>
        </div>
      )}
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  );
}
