"use client";

import Link from "next/link";
import { cn } from "@/utils/helpers";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * ADWA STREAM - Ultra Luxury Metallic Branding
 * Fixes "background" vs "backgroundClip" shorthand conflict.
 */
export default function BrandLogo({ animate = true, className, size = "md" }: BrandLogoProps) {
  const sz = { 
    sm: "text-2xl", 
    md: "text-3xl md:text-4xl", 
    lg: "text-5xl md:text-6xl" 
  }[size];

  // Professional Metallic Palette
  const GOLD_GRADIENT = "linear-gradient(135deg, #8A5A19 0%, #D4AF37 25%, #FFF2CD 50%, #D4AF37 75%, #8A5A19 100%)";
  const CHAMPAGNE_GRADIENT = "linear-gradient(135deg, #CDBA88 0%, #FDF8E7 50%, #CDBA88 100%)";

  return (
    <Link href="/" className="group flex items-baseline gap-0.5 select-none outline-none">
      {/* ADWA: Deep Polished Gold */}
      <span
        className={cn(
          sz, 
          "font-bold transition-all duration-500 group-hover:brightness-110", 
          className
        )}
        style={{
          fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
          letterSpacing: "0.02em",
          // Fix: Using backgroundImage instead of background shorthand
          backgroundImage: animate
            ? "linear-gradient(90deg, #8A5A19, #D4AF37, #FFF2CD, #D4AF37, #8A5A19)"
            : GOLD_GRADIENT,
          backgroundSize: animate ? "200% auto" : "100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: animate ? "goldShine 4s linear infinite" : undefined,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 15px rgba(212,175,55,0.2))",
        }}
      >
        ADWA
      </span>

      {/* STREAM: Elegant Champagne Metallic (No White) */}
      <span
        className={cn(sz, "font-light transition-all duration-500 group-hover:brightness-125")}
        style={{
          fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
          letterSpacing: "0.08em",
          backgroundImage: CHAMPAGNE_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: 0.9,
        }}
      >
        STREAM
      </span>

      {/* Jewel-cut accent dot */}
      <span
        className="mb-1 ml-0.5 inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"
        style={{ 
          backgroundImage: "radial-gradient(circle at 30% 30%, #FFF2CD, #D4AF37 70%)",
        }}
      />

      <style>{`
        @keyframes goldShine {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </Link>
  );
}