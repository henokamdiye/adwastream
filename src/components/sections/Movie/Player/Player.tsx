"use client";

import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { usePlayerEvents } from "@/hooks/usePlayerEvents";

const AdsWarning                 = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const MoviePlayerHeader          = dynamic(() => import("./Header"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));

// ─── ULTRA GUARD v4 — CLICK-PROOF (2026 movie embed protection) ─────────────
// (Exactly the same battle-tested version as before — nothing removed)
const GUARD_SCRIPT = `
(function() {
  'use strict';
  console.log('[AdwaStream] guard v4 CLICK-PROOF active — zero ads on player clicks');

  var _noop = function() { return null; };
  var _adAttempts = 0;
  var _videoStarted = false;
  var _clicked = false;
  var _origin = window.location.origin;

  function killPopups() {
    try { Object.defineProperty(window, 'open', { value: _noop, writable: false, configurable: false }); } catch(e) { window.open = _noop; }
    ['popup','openNew','showAd','launchAd','_open','popunder'].forEach(function(k) {
      try { Object.defineProperty(window, k, { value: _noop, writable: false, configurable: false }); } catch(e) {}
    });
  }
  killPopups();

  try {
    Object.defineProperty(window, 'top', { get: function(){ return window; }, configurable: false });
    Object.defineProperty(window, 'parent', { get: function(){ return window; }, configurable: false });
  } catch(e) {}

  var _safeNav = function(url) {
    try { return new URL(url, _origin).origin === _origin; } catch(e) { return false; }
  };

  function blockAdClicks(e) {
    if (_videoStarted || _clicked) {
      var target = e.target;
      var isVideo = target.tagName === 'VIDEO' || (target.closest && target.closest('video'));
      var isControl = target.closest && (
        target.closest('.plyr') || target.closest('.jwplayer') || 
        target.closest('button') || target.closest('[class*="control"]') || target.closest('[class*="player"]')
      );
      if (!isVideo && !isControl) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log('[guard] blocked suspicious click on player area');
        nukeOverlays(true);
        return false;
      }
    }
    if (!_clicked) {
      _clicked = true;
      _adAttempts = 99;
      console.log('[guard] first click detected → strict ad-free mode');
      setTimeout(nukeOverlays, 10);
      setTimeout(nukeOverlays, 80);
    }
  }
  document.addEventListener('click', blockAdClicks, true);
  document.addEventListener('mousedown', blockAdClicks, true);
  document.addEventListener('touchstart', blockAdClicks, true);

  var _protoClick = HTMLElement.prototype.click;
  HTMLElement.prototype.click = function() {
    if (_videoStarted || _clicked) {
      if (this.tagName === 'VIDEO' || (this.closest && (this.closest('video') || this.closest('.plyr') || this.closest('.jwplayer')))) {
        return _protoClick.call(this);
      }
      console.log('[guard] blocked synthetic .click() from ad script');
      return;
    }
    return _protoClick.call(this);
  };

  function nukeEventHandlers() {
    var all = document.querySelectorAll('*');
    all.forEach(function(el) {
      if (el.tagName === 'VIDEO') return;
      ['onclick','onmousedown','ontouchstart','onmouseup','ondblclick'].forEach(function(ev) {
        if (el[ev]) el[ev] = null;
      });
    });
  }

  function nukeOverlays(immediate = false) {
    var W = window.innerWidth, H = window.innerHeight;
    var suspects = document.querySelectorAll(
      'div,iframe,section,aside,[style*="position:fixed"],[style*="position: fixed"],' +
      '[style*="position:absolute"],[id*="ad"],[class*="ad"],[class*="popup"],[class*="overlay"],' +
      '[class*="modal"],[id*="popup"],[id*="exit"],[id*="banner"],[class*="click"]'
    );
    suspects.forEach(function(el) {
      if (el.tagName === 'VIDEO' || el.querySelector('video')) return;
      var s = window.getComputedStyle(el);
      var w = parseFloat(s.width) || 0, h = parseFloat(s.height) || 0;
      var z = parseInt(s.zIndex) || 0, op = parseFloat(s.opacity) || 1;
      var rect = el.getBoundingClientRect();

      if (w > W * 0.7 && h > H * 0.7 && z > 999) { el.remove(); _adAttempts++; return; }
      if (op < 0.1 && z > 100) { el.remove(); _adAttempts++; return; }
      if (rect.width > W * 0.85 && rect.height > H * 0.85 && z > 500) { el.remove(); _adAttempts++; return; }
      if (/ad|popup|exit|banner|overlay|modal|click/i.test(el.id + ' ' + el.className)) {
        el.remove(); _adAttempts++; return;
      }
    });

    document.querySelectorAll('a').forEach(function(a) {
      var r = a.getBoundingClientRect();
      if (r.width > W * 0.8 && r.height > H * 0.8) a.remove();
    });

    nukeEventHandlers();
  }

  var obs = new MutationObserver(function() { nukeOverlays(); });
  function startObs() {
    nukeOverlays();
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObs);
  } else { startObs(); }
  setInterval(nukeOverlays, 800);
  setInterval(nukeEventHandlers, 600);

  function detectVideoStart() {
    var check = setInterval(function() {
      var video = document.querySelector('video');
      if (video && !video.paused && video.currentTime > 0.3) {
        _videoStarted = true;
        _adAttempts = 99;
        console.log('[guard] video playing → strict mode (zero ads)');
        clearInterval(check);
        nukeOverlays();
        setTimeout(nukeOverlays, 300);
      }
    }, 600);
  }
  detectVideoStart();

  document.write = document.writeln = _noop;
  window.alert = window.confirm = window.prompt = _noop;
  document.execCommand = function() { return false; };
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); }, true);

  console.log('[guard] one-ad-per-movie + click-proof protection ready');
})();
`;

interface MoviePlayerProps {
  movie: MovieDetails;
  startAt?: number;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });

  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const guardedRef   = useRef(false);
  const sweepRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const players      = getMoviePlayers(movie.id, startAt);
  const title        = mutateMovieTitle(movie);
  const idle         = useIdle(3000);
  const { mobile }   = useBreakpoints();
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src", parseAsInteger.withDefault(0),
  );

  usePlayerEvents({ saveHistory: true });
  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  const PLAYER = useMemo(
    () => players[selectedSource] || players[0],
    [players, selectedSource],
  );

  // Parent popup block (unchanged)
  useEffect(() => {
    const orig = window.open;
    window.open = () => null;
    return () => { window.open = orig; };
  }, []);

  // ── SMART MOBILE + AUTO-ROTATE SUPPORT ───────────────────────────────
  // Uses 100dvh (dynamic viewport height) so it perfectly fits phones
  // in BOTH portrait and landscape. Automatically re-adapts when you rotate the phone.
  const installGuard = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;

    try {
      const cw = frame.contentWindow as any;
      if (!cw) return;

      cw.open = () => null;
      try {
        Object.defineProperty(cw, "open", { value: () => null, writable: false, configurable: false });
      } catch {}

      if (!guardedRef.current) {
        const script = cw.document?.createElement("script");
        if (script) {
          script.textContent = GUARD_SCRIPT;
          (cw.document?.head || cw.document?.documentElement)?.appendChild(script);
        }
        guardedRef.current = true;
      }

      if (sweepRef.current) clearInterval(sweepRef.current);
      sweepRef.current = setInterval(() => {
        try {
          const doc = frame.contentDocument;
          if (!doc || !doc.body) return;
          const W = frame.clientWidth, H = frame.clientHeight;

          doc.querySelectorAll<HTMLElement>(
            'div[style*="position:fixed"],div[style*="position: fixed"],div[style*="position:absolute"],' +
            'iframe[style*="position:fixed"],[id*="ad"],[class*="ad"],[class*="popup"],[class*="overlay"]'
          ).forEach((el) => {
            const s = getComputedStyle(el);
            const w = parseFloat(s.width), h = parseFloat(s.height);
            const z = parseInt(s.zIndex) || 0, op = parseFloat(s.opacity);
            const hasVideo = el.querySelector("video") || el.tagName === 'VIDEO';
            if (hasVideo) return;
            if ((w > W * 0.75 && h > H * 0.75 && z > 999) || 
                (op < 0.05 && z > 100) || 
                (w > W * 0.9 && h > H * 0.9)) {
              el.remove();
            }
          });

          doc.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
            const r = a.getBoundingClientRect();
            if (r.width > W * 0.8 && r.height > H * 0.8) a.remove();
          });
        } catch {}
      }, 1200);

    } catch (e) {}
  }, []);

  // ── SMART AUTO-ROTATE DETECTION ─────────────────────────────────────
  // When the phone is rotated (portrait ↔ landscape), we instantly re-run the guard
  // and clean the player so everything stays perfectly sized and ad-free.
  useEffect(() => {
    const handleRotate = () => {
      // Force guard re-install with new screen dimensions
      if (iframeRef.current) {
        guardedRef.current = false; // allow fresh injection if needed
        installGuard();
      }
    };

    window.addEventListener("resize", handleRotate);
    window.addEventListener("orientationchange", handleRotate);

    return () => {
      window.removeEventListener("resize", handleRotate);
      window.removeEventListener("orientationchange", handleRotate);
    };
  }, [installGuard]);

  // Reset guard when source changes (unchanged)
  useEffect(() => {
    guardedRef.current = false;
    return () => {
      if (sweepRef.current) clearInterval(sweepRef.current);
    };
  }, [PLAYER.source]);

  return (
    <>
      <div className={cn("relative", SpacingClasses.reset)}>
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile}
        />

        {/* ── PERFECT MOBILE + ROTATION COMPATIBLE CARD ── */}
        <Card 
          shadow="md" 
          radius="none" 
          className="relative h-[100dvh] overflow-hidden bg-black"  // ← 100dvh = perfect on phones in any orientation
        >
          <Skeleton className="absolute h-full w-full" />

          {seen && (
            <iframe
              ref={iframeRef}
              allowFullScreen
              key={PLAYER.source}
              src={PLAYER.source}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; magnetometer"
              onLoad={installGuard}
              className={cn("absolute inset-0 z-10 h-full w-full", {
                "pointer-events-none": idle && !mobile,
              })}
            />
          )}

          <AdsWarning />
        </Card>
      </div>

      <MoviePlayerSourceSelection
        opened={opened}
        onClose={handlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";
export default MoviePlayer;