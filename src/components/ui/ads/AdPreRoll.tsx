"use client";
import { useState, useEffect, useRef } from "react";

interface AdPreRollProps {
  onDone: () => void;
  skipAfter?: number;
}

export default function AdPreRoll({ onDone, skipAfter = 5 }: AdPreRollProps) {
  const [countdown, setCountdown] = useState(skipAfter);
  const [canSkip,   setCanSkip]   = useState(false);
  const [elapsed,   setElapsed]   = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef    = useRef(false);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load Adsterra banner inside pre-roll
  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    const script = document.createElement("script");
    script.src =
      "https://pl29085033.profitablecpmratenetwork.com/c5/14/99/c514994a5300c2501ab0e78ea0d66080.js";
    script.async = true;
    script.type = "text/javascript";
    containerRef.current.appendChild(script);
  }, []);

  // Countdown ticker
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
      setCountdown((c) => {
        if (c <= 1) {
          setCanSkip(true);
          clearInterval(intervalRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current!); };
  }, []);

  // Auto-close after 15 s
  useEffect(() => { if (elapsed >= 15) onDone(); }, [elapsed, onDone]);

  const circumference = 2 * Math.PI * 16;
  const dashOffset = canSkip
    ? 0
    : circumference * (1 - (skipAfter - countdown) / skipAfter);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black">
      {/* Adsterra ad display area */}
      <div
        className="relative flex w-full max-w-lg flex-col items-center justify-center overflow-hidden rounded-xl px-4"
        style={{ minHeight: 90 }}
      >
        <div
          ref={containerRef}
          className="flex min-h-[90px] w-full items-center justify-center"
        />
        {/* Ad label */}
        <span
          className="absolute left-3 top-2 rounded px-1.5 py-px text-[8px] font-bold uppercase tracking-widest text-white/40"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Ad
        </span>
      </div>

      {/* Skip / countdown — bottom-right */}
      <div className="absolute bottom-6 right-6">
        {canSkip ? (
          <button
            onClick={onDone}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#8b6914,#daa520,#ffd700,#ffe87c,#ffd700,#8b6914)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s linear infinite",
              boxShadow: "0 4px 20px rgba(255,215,0,0.35)",
            }}
          >
            Skip Ad
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        ) : (
          <div
            className="flex items-center gap-3 rounded-lg px-4 py-2.5"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="relative h-9 w-9">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke="rgba(255,255,255,0.1)" strokeWidth="2.5"
                />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke="rgba(255,215,0,0.75)" strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.95s linear" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {countdown}
              </span>
            </div>
            <span className="text-xs text-white/55">
              Skip in {countdown}s
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </div>
  );
}