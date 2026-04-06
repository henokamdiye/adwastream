"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { cn } from "@/utils/helpers";
import type { StreamOutput } from "@/app/api/player/stream/route";

export interface StreamPlayerProps {
  tmdbId: string | number;
  mediaType: "movie" | "tv";
  title?: string;
  releaseYear?: number;
  imdbId?: string;
  season?: number;
  episode?: number;
  startAt?: number;
  onFallback?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
}

type FetchState = "loading" | "ready" | "error";

/* ─── tiny gold spinner ─────────────────────────────────────────────────────── */
function GoldSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-16 w-16">
        <svg className="h-full w-full" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,215,0,0.1)" strokeWidth="4" />
          <circle
            cx="32" cy="32" r="28" fill="none"
            stroke="url(#gs)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray="60 116"
            style={{ animation: "spin 1.2s linear infinite", transformOrigin: "center" }}
          />
          <defs>
            <linearGradient id="gs" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7a5c00" />
              <stop offset="50%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#7a5c00" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="absolute inset-0 m-auto h-5 w-5" viewBox="0 0 24 24" fill="rgba(255,215,0,0.7)">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]"
           style={{
             background: "linear-gradient(90deg,#7a5c00,#ffd700,#7a5c00)",
             backgroundSize: "200% auto",
             WebkitBackgroundClip: "text", backgroundClip: "text",
             WebkitTextFillColor: "transparent",
             animation: "goldShine 2.5s linear infinite",
           }}>
          {label}
        </p>
        <p className="mt-1 text-[10px] text-white/25 tracking-wider">Extracting ad-free stream</p>
      </div>
      <div className="h-0.5 w-40 overflow-hidden rounded-full bg-white/5">
        <div className="h-full w-1/3 rounded-full"
             style={{
               background: "linear-gradient(90deg,#b8860b,#ffd700,#b8860b)",
               backgroundSize: "200% 100%",
               animation: "shimmer 1.6s linear infinite",
             }} />
      </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes goldShine{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      `}</style>
    </div>
  );
}

/* ─── caption track ─────────────────────────────────────────────────────────── */
interface Caption { language: string; url: string; type: string; }

/* ─── main component ────────────────────────────────────────────────────────── */
const StreamPlayer = forwardRef<HTMLVideoElement, StreamPlayerProps>(function StreamPlayer(
  { tmdbId, mediaType, title, releaseYear, imdbId, season, episode, startAt, onFallback,
    onTimeUpdate, onPlay, onPause, onEnded, className },
  ref,
) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const hlsRef    = useRef<any>(null);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [streams,    setStreams]    = useState<StreamOutput["streams"]>([]);
  const [captions,   setCaptions]  = useState<Caption[]>([]);
  const [provider,   setProvider]  = useState("");
  const [loadLabel,  setLoadLabel] = useState("Extracting stream…");
  const [activeCaption, setActiveCaption] = useState<string | null>(null);

  // Forward ref
  useImperativeHandle(ref, () => videoRef.current!, []);

  /* ─── fetch stream info ─────────────────────────────────────── */
  useEffect(() => {
    const ctrl = new AbortController();

    const labels = ["Extracting stream…","Scanning providers…","Removing ads…","Almost ready…"];
    let i = 0;
    const t = setInterval(() => setLoadLabel(labels[++i % labels.length]), 4200);

    const params = new URLSearchParams({
      tmdbId: String(tmdbId),
      type:   mediaType,
      ...(title       ? { title }             : {}),
      ...(releaseYear ? { year: String(releaseYear) } : {}),
      ...(imdbId      ? { imdbId }            : {}),
      ...(season      ? { season:  String(season)  } : {}),
      ...(episode     ? { episode: String(episode) } : {}),
    });

    fetch(`/api/player/stream?${params}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: StreamOutput | { success: false; error: string }) => {
        clearInterval(t);
        if (data.success) {
          setStreams(data.streams);
          setCaptions(data.captions ?? []);
          setProvider(data.provider);
          setFetchState("ready");
        } else {
          setFetchState("error");
          onFallback?.();
        }
      })
      .catch((err) => {
        clearInterval(t);
        if (err.name !== "AbortError") { setFetchState("error"); onFallback?.(); }
      });

    return () => { ctrl.abort(); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, mediaType, season, episode]);

  /* ─── attach player ─────────────────────────────────────────── */
  useEffect(() => {
    if (fetchState !== "ready" || !streams.length || !videoRef.current) return;
    const video = videoRef.current;

    // prefer HLS, then MP4
    const hlsStream = streams.find((s) => s.type === "hls");
    const mp4Stream = streams.find((s) => s.type === "mp4");
    const chosen    = hlsStream ?? mp4Stream ?? streams[0];

    const teardown = () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };

    if (chosen.type === "hls") {
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = chosen.url;
            if (startAt) video.currentTime = startAt;
          } else { onFallback?.(); }
          return;
        }
        teardown();
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false, fragLoadingMaxRetry: 3 });
        hlsRef.current = hls;
        hls.loadSource(chosen.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => { if (startAt) video.currentTime = startAt; });
        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (data.fatal) { teardown(); onFallback?.(); }
        });
      }).catch(() => { video.src = chosen.url; });
    } else {
      video.src = chosen.url;
      if (startAt) video.currentTime = startAt;
    }

    return teardown;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchState, streams]);

  /* ─── event handlers ────────────────────────────────────────── */
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v) onTimeUpdate?.(v.currentTime, v.duration);
  }, [onTimeUpdate]);

  /* ─── loading state ─────────────────────────────────────────── */
  if (fetchState === "loading") {
    return (
      <div className={cn("relative flex items-center justify-center bg-black", className)}>
        <GoldSpinner label={loadLabel} />
      </div>
    );
  }

  /* ─── error state (brief, then fallback already called) ──────── */
  if (fetchState === "error") {
    return (
      <div className={cn("relative flex items-center justify-center bg-black", className)}>
        <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/5 px-7 py-5 text-center">
          <p className="text-sm font-semibold text-yellow-400/80">Switching to embedded player…</p>
          <p className="mt-1 text-xs text-white/30">Provider extraction unavailable</p>
        </div>
      </div>
    );
  }

  /* ─── playback ──────────────────────────────────────────────── */
  return (
    <div className={cn("group relative bg-black", className)}>
      {/* top gold accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
           style={{ background: "linear-gradient(90deg,transparent,rgba(255,215,0,0.5),transparent)" }} />

      <video
        ref={videoRef}
        controls
        autoPlay={false}
        playsInline
        className="h-full w-full object-contain"
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        crossOrigin="anonymous"
      >
        {/* caption tracks */}
        {captions.map((c) => (
          <track
            key={c.url}
            kind="subtitles"
            src={c.url}
            srcLang={c.language}
            label={c.language}
          />
        ))}
      </video>

      {/* provider badge */}
      {provider && (
        <div className="pointer-events-none absolute bottom-14 right-3 z-20 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-widest"
                style={{ background:"rgba(0,0,0,0.7)", color:"rgba(255,215,0,0.6)", backdropFilter:"blur(6px)" }}>
            AdwaStream · ad-free
          </span>
        </div>
      )}
    </div>
  );
});

export default StreamPlayer;
