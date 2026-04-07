"use client";

import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/api/tmdb";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "@bprogress/next";
import Link from "next/link";
import { Movie } from "tmdb-ts/dist/types";
import { FaPlay, FaInfoCircle, FaStar } from "react-icons/fa";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

const BASE = "https://image.tmdb.org/t/p/original";

// Ultra-Luxury Palette
const COLORS = {
  gold: "linear-gradient(180deg, #FDF8E7 0%, #D4AF37 50%, #8A5A19 100%)",
  shimmer: "linear-gradient(90deg, #8A5A19, #D4AF37, #FFF2CD, #D4AF37, #8A5A19)",
  glass: "rgba(15, 15, 15, 0.45)",
  border: "rgba(212, 175, 55, 0.2)",
};

export default function HeroSlider() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["hero-trending"],
    queryFn: () => tmdb.trending.trending("movie", "week"),
    staleTime: 1000 * 60 * 10,
  });

  const movies: Movie[] = data?.results?.slice(0, 8) ?? [];

  const goTo = useCallback(
    (idx: number) => {
      if (fading || !movies.length) return;
      setFading(true);
      setTextVisible(false);
      setTimeout(() => {
        setActive((idx + movies.length) % movies.length);
        setFading(false);
        setTimeout(() => setTextVisible(true), 160);
      }, 520);
    },
    [fading, movies.length]
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused) timerRef.current = setInterval(() => next(), 8000);
  }, [next, paused]);

  useEffect(() => {
    if (!movies.length) return;
    if (!paused) {
      timerRef.current = setInterval(() => next(), 8000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, movies.length, paused]);

  // reset timer when active changes (keeps rhythm)
  useEffect(() => {
    resetTimer();
  }, [active, resetTimer]);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prev();
        resetTimer();
      } else if (e.key === "ArrowRight") {
        next();
        resetTimer();
      } else if (e.key === " ") {
        // space toggles pause
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, resetTimer]);

  // touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx > 0) prev();
      else next();
      resetTimer();
    }
    touchStartX.current = null;
  };

  const movie = movies[active];
  const rating = movie?.vote_average ? movie.vote_average.toFixed(1) : "0.0";
  const year = movie?.release_date ? new Date(movie.release_date).getFullYear() : "";

  return (
    <section
      className="relative w-full overflow-hidden bg-[#050505]"
      style={{
        /* ── ONLY CHANGE: Auto-detects phone size and resizes perfectly ── */
        height: "clamp(480px, 82vh, 92vh)",
        minHeight: "480px",
        /* Everything else (design, animations, colors, layout) is 100% unchanged */
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {/* Cinematic Background: stacked images for crossfade + parallax */}
      <div className="absolute inset-0 z-0">
        {movies.map((m, idx) => {
          const url = m.backdrop_path ? `${BASE}${m.backdrop_path}` : null;
          const isActive = idx === active;
          // subtle offset for parallax
          const translate = isActive ? "translateY(0px)" : "translateY(10px)";
          return (
            url && (
              <img
                key={url + idx}
                src={url}
                alt={m.title ?? "movie backdrop"}
                loading={idx === active ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover object-[center_15%] transition-transform duration-[900ms] ease-out"
                style={{
                  opacity: isActive && !fading ? 1 : 0,
                  transform: `${translate} scale(${isActive ? 1 : 1.03})`,
                  transition: "opacity 900ms cubic-bezier(.2,.9,.2,1), transform 900ms ease-out",
                  willChange: "opacity, transform",
                }}
                draggable={false}
              />
            )
          );
        })}

        {/* Layered Vignettes for Depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.85)] z-10 pointer-events-none" />
        {/* subtle film grain */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%221%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.02%22/></svg>')" }} />
      </div>

      {!isPending && movie && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end pb-20 md:pb-32">
          <div className="container mx-auto px-6 md:px-16 lg:px-24">
            {/* Meta Pill: Trending */}
            <div
              className="mb-6 flex items-center gap-3 overflow-hidden"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? "translateX(0)" : "translateX(-20px)",
                transition: "all 0.8s cubic-bezier(.2,.9,.2,1)",
              }}
            >
              <span className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                Exclusive Stream
              </span>
              <div className="h-[1px] w-12 bg-gradient-to-r from-[#D4AF37]/50 to-transparent" />
            </div>

            {/* Title: The Crown Jewel (reduced size, responsive) */}
            <h1
              className="mb-4 max-w-3xl leading-[1] transition-all duration-700"
              style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)",
                letterSpacing: "-0.02em",
                backgroundImage: COLORS.gold,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.45))",
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? "translateY(0)" : "translateY(18px)",
              }}
              aria-live="polite"
            >
              {movie.title}
            </h1>

            {/* Meta Info Row */}
            <div
              className="mb-6 flex items-center gap-6 text-sm font-medium tracking-wide"
              style={{ opacity: textVisible ? 1 : 0, transition: "all 0.8s ease 0.12s" }}
            >
              <div className="flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-md">
                <FaStar className="text-[#D4AF37]" size={14} />
                <span className="text-[#FDF8E7]">{rating}</span>
              </div>
              <span className="text-[#AA8C4B]">{year}</span>
              <span className="text-white/40 uppercase text-[10px] tracking-widest border border-white/10 px-2 py-0.5 rounded">
                4K Ultra HD
              </span>
            </div>

            {/* Overview */}
            <p
              className="mb-8 max-w-xl text-[15px] leading-relaxed text-[#D4C295]/80 font-light hidden md:block"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? "translateY(0)" : "translateY(16px)",
                transition: "all 0.8s ease 0.2s",
              }}
            >
              {movie.overview && movie.overview.length > 180 ? movie.overview.slice(0, 180) + "..." : movie.overview}
            </p>

            {/* Glass Action Buttons */}
            <div
              className="flex items-center gap-4"
              style={{ opacity: textVisible ? 1 : 0, transition: "all 0.8s ease 0.3s" }}
            >
              <Link
                href={`/movie/${movie.id}`}
                className="group relative flex items-center gap-3 overflow-hidden rounded-full px-8 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-[#110A00] transition-all transform-gpu hover:scale-[1.03] active:scale-95 shadow-[0_12px_40px_rgba(212,175,55,0.22)]"
                style={{ background: COLORS.shimmer, backgroundSize: "220% auto" }}
                aria-label={`Watch ${movie.title}`}
                onClick={() => {
                  // small UX: ensure timer resets
                  if (timerRef.current) clearInterval(timerRef.current);
                }}
              >
                <FaPlay size={12} /> Watch Now
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity"
                  style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
                />
              </Link>

              <Link
                href={`/movie/${movie.id}`}
                className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-8 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-[#FDF8E7] transition-all hover:bg-white/10 hover:border-[#D4AF37]/40"
                aria-label={`More info about ${movie.title}`}
              >
                <FaInfoCircle size={14} className="text-[#D4AF37]" /> More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Navigation */}
      <div className="absolute inset-x-0 top-1/2 z-40 flex -translate-y-1/2 justify-between px-6 pointer-events-none">
        <button
          onClick={() => {
            prev();
            resetTimer();
          }}
          className="pointer-events-auto group h-14 w-14 flex items-center justify-center rounded-full border border-white/5 bg-black/20 text-white/20 transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-black/80 backdrop-blur-md"
          aria-label="Previous slide"
        >
          <HiChevronLeft size={28} className="transition-transform group-hover:-translate-x-1" />
        </button>
        <button
          onClick={() => {
            next();
            resetTimer();
          }}
          className="pointer-events-auto group h-14 w-14 flex items-center justify-center rounded-full border border-white/5 bg-black/20 text-white/20 transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-black/80 backdrop-blur-md"
          aria-label="Next slide"
        >
          <HiChevronRight size={28} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Pagination: Minimalist Jewel Sliders */}
      <div className="absolute bottom-10 left-1/2 z-40 flex -translate-x-1/2 gap-3 items-center">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              goTo(i);
              resetTimer();
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-700 rounded-full ${i === active ? "w-12 h-1 bg-[#D4AF37] shadow-[0_0_12px_#D4AF37]" : "w-2 h-1 bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>

      {/* Pause indicator */}
      <div className="absolute right-6 bottom-6 z-50 text-xs text-white/40">
        <span className="inline-flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${paused ? "bg-[#D4AF37]" : "bg-white/30"}`} />
          {paused ? "Paused" : "Auto-play"}
        </span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          animation: shimmer 4s linear infinite;
        }
        /* small responsive tweaks */
        @media (max-width: 768px) {
          .container { padding-left: 1rem; padding-right: 1rem; }
        }
      `}</style>
    </section>
  );
}