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

// ─── The JS guard injected into the iframe after it loads ─────────────────────
// Works because the proxy serves the embed from our own origin,
// giving us full contentWindow access — no sandbox needed.
const GUARD_SCRIPT = `
(function() {
  'use strict';
  var _noop = function() { return null; };

  // 1. Hard-kill window.open — the #1 popup vector
  try {
    Object.defineProperty(window, 'open', {
      value: _noop, writable: false, configurable: false
    });
  } catch(e) { window.open = _noop; }

  // 2. Block top/parent frame navigation hijacks
  try {
    Object.defineProperty(window, 'top', { get: function(){ return window; }, configurable: false });
    Object.defineProperty(window, 'parent', { get: function(){ return window; }, configurable: false });
  } catch(e) {}

  // 3. Block location-based redirects that escape the current origin
  var _origin = window.location.origin;
  var _safeNav = function(url) {
    try { return new URL(url, _origin).origin === _origin; } catch(e) { return false; }
  };
  try {
    var _locProto = Object.getPrototypeOf(window.location);
    var _origAssign  = _locProto.assign.bind(window.location);
    var _origReplace = _locProto.replace.bind(window.location);
    Object.defineProperty(window.location, 'assign',  { value: function(u){ if(_safeNav(u)) _origAssign(u);  }, writable:false, configurable:false });
    Object.defineProperty(window.location, 'replace', { value: function(u){ if(_safeNav(u)) _origReplace(u); }, writable:false, configurable:false });
  } catch(e) {}

  // 4. Intercept href setting on all <a> tags — block target=_blank external
  var _ce = document.createElement.bind(document);
  document.createElement = function(tag) {
    var el = _ce(tag);
    if (typeof tag === 'string' && tag.toLowerCase() === 'a') {
      el.addEventListener('click', function(e) {
        var href = el.getAttribute('href') || '';
        var target = el.getAttribute('target') || '';
        if (target === '_blank' || target === '_top' || target === '_parent') {
          e.preventDefault(); e.stopImmediatePropagation(); return;
        }
        try {
          if (new URL(href, _origin).origin !== _origin) {
            e.preventDefault(); e.stopImmediatePropagation();
          }
        } catch(x) { e.preventDefault(); }
      }, true);
    }
    return el;
  };

  // 5. Nuke invisible click-jacking overlays & full-screen ad divs
  function nukeOverlays() {
    var W = window.innerWidth, H = window.innerHeight;
    var suspects = document.querySelectorAll(
      'div[style*="position:fixed"],div[style*="position: fixed"],' +
      'div[style*="position:absolute"],iframe[style*="position:fixed"]'
    );
    suspects.forEach(function(el) {
      var s = window.getComputedStyle(el);
      var w = parseFloat(s.width), h = parseFloat(s.height);
      var z = parseInt(s.zIndex) || 0;
      var op = parseFloat(s.opacity);
      var hasVideo = el.querySelector('video') || el.tagName === 'VIDEO';
      if (hasVideo) return;
      // Full-screen high-z overlay
      if (w > W * 0.75 && h > H * 0.75 && z > 999) { el.remove(); return; }
      // Invisible click-bait layer
      if (op < 0.05 && z > 100 && s.pointerEvents !== 'none') { el.remove(); return; }
      // Suspiciously large absolute-positioned element with no video content
      if (w > W * 0.9 && h > H * 0.9 && z > 500) { el.remove(); }
    });

    // Also nuke any <a> wrapping the entire viewport
    document.querySelectorAll('a').forEach(function(a) {
      var r = a.getBoundingClientRect();
      if (r.width > W * 0.8 && r.height > H * 0.8) {
        var href = a.getAttribute('href') || '';
        try { if (new URL(href, _origin).origin !== _origin) a.remove(); } catch(e) { a.remove(); }
      }
    });
  }

  // Run observer + immediate nuke
  var obs = new MutationObserver(function(ms) {
    for (var i = 0; i < ms.length; i++) {
      if (ms[i].addedNodes.length) { nukeOverlays(); break; }
    }
  });
  function startObs() {
    nukeOverlays();
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObs);
  } else { startObs(); }

  // 6. Kill clipboard hijacking
  document.execCommand = function() { return false; };

  // 7. Kill context-menu ad tricks
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); }, true);

  // 8. Periodic sweep (catches delayed ad injections)
  setInterval(nukeOverlays, 1500);

  console.log('[AdwaStream] guard v2 active');
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
  const guardedRef   = useRef(false); // track if guard was already injected
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

  // ── Parent-window popup blocker ─────────────────────────────────────────
  // First line of defence — even if the iframe is cross-origin
  useEffect(() => {
    const orig = window.open;
    window.open = () => null;
    return () => { window.open = orig; };
  }, []);

  // ── Inject guard into iframe contentWindow after load ───────────────────
  // Works when iframe is served through our /api/player/proxy (same-origin).
  const installGuard = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const cw = frame.contentWindow as any;
      if (!cw) return;

      // Re-kill window.open directly on the iframe's window object
      cw.open = () => null;
      try {
        Object.defineProperty(cw, "open", {
          value: () => null, writable: false, configurable: false,
        });
      } catch {}

      // Inject the full guard script
      if (!guardedRef.current) {
        const script = cw.document?.createElement("script");
        if (script) {
          script.textContent = GUARD_SCRIPT;
          (cw.document?.head || cw.document?.documentElement)?.appendChild(script);
        }
        guardedRef.current = true;
      }

      // Sweep iframe's DOM for overlays every 2 s from parent
      if (sweepRef.current) clearInterval(sweepRef.current);
      sweepRef.current = setInterval(() => {
        try {
          const doc = frame.contentDocument;
          if (!doc || !doc.body) return;
          const W = frame.clientWidth, H = frame.clientHeight;
          doc.querySelectorAll<HTMLElement>(
            'div[style*="position:fixed"],div[style*="position: fixed"],' +
            'div[style*="position:absolute"],iframe[style*="position:fixed"]',
          ).forEach((el) => {
            const s = getComputedStyle(el);
            const w = parseFloat(s.width), h = parseFloat(s.height);
            const z = parseInt(s.zIndex) || 0, op = parseFloat(s.opacity);
            const hasVideo = el.querySelector("video") || el.tagName === "VIDEO";
            if (hasVideo) return;
            if (w > W * 0.75 && h > H * 0.75 && z > 999) { el.remove(); return; }
            if (op < 0.05 && z > 100 && s.pointerEvents !== "none") el.remove();
          });
          // Nuke full-viewport anchor tags pointing elsewhere
          doc.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
            const r = a.getBoundingClientRect();
            if (r.width > W * 0.8 && r.height > H * 0.8) {
              try {
                const u = new URL(a.href, frame.src);
                if (u.origin !== new URL(frame.src).origin) a.remove();
              } catch { a.remove(); }
            }
          });
        } catch {
          // cross-origin — guard script in the page handles it
        }
      }, 2000);
    } catch {
      // cross-origin iframe — the proxy's injected guard script handles it
    }
  }, []);

  // Re-run guard on every source change
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

        <Card shadow="md" radius="none" className="relative h-screen overflow-hidden bg-black">
          <Skeleton className="absolute h-full w-full" />

          {seen && (
            <iframe
              ref={iframeRef}
              allowFullScreen
              key={PLAYER.source}
              src={PLAYER.source}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              onLoad={installGuard}
              className={cn("absolute inset-0 z-10 h-full w-full", {
                "pointer-events-none": idle && !mobile,
              })}
            />
          )}

          {/* Show AdsWarning on first visit so user can dismiss it */}
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