"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { memo, useMemo, useCallback, useRef, useEffect } from "react";
import { Episode, TvShowDetails } from "tmdb-ts";
import useBreakpoints from "@/hooks/useBreakpoints";
import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { usePlayerEvents } from "@/hooks/usePlayerEvents";

const AdsWarning                   = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const TvShowPlayerHeader           = dynamic(() => import("./Header"));
const TvShowPlayerSourceSelection  = dynamic(() => import("./SourceSelection"));
const TvShowPlayerEpisodeSelection = dynamic(() => import("./EpisodeSelection"));

// ─── Shared guard script (same as Movie player) ───────────────────────────────
const GUARD_SCRIPT = `
(function() {
  'use strict';
  var _noop = function() { return null; };

  try {
    Object.defineProperty(window, 'open', {
      value: _noop, writable: false, configurable: false
    });
  } catch(e) { window.open = _noop; }

  try {
    Object.defineProperty(window, 'top',    { get: function(){ return window; }, configurable: false });
    Object.defineProperty(window, 'parent', { get: function(){ return window; }, configurable: false });
  } catch(e) {}

  var _origin = window.location.origin;
  var _safeNav = function(url) {
    try { return new URL(url, _origin).origin === _origin; } catch(e) { return false; }
  };
  try {
    var _lp = Object.getPrototypeOf(window.location);
    var _a = _lp.assign.bind(window.location), _r = _lp.replace.bind(window.location);
    Object.defineProperty(window.location, 'assign',  { value: function(u){ if(_safeNav(u))_a(u); }, writable:false, configurable:false });
    Object.defineProperty(window.location, 'replace', { value: function(u){ if(_safeNav(u))_r(u); }, writable:false, configurable:false });
  } catch(e) {}

  var _ce = document.createElement.bind(document);
  document.createElement = function(tag) {
    var el = _ce(tag);
    if (typeof tag === 'string' && tag.toLowerCase() === 'a') {
      el.addEventListener('click', function(e) {
        var t = el.getAttribute('target') || '';
        if (t === '_blank' || t === '_top' || t === '_parent') {
          e.preventDefault(); e.stopImmediatePropagation(); return;
        }
        var h = el.getAttribute('href') || '';
        try { if (new URL(h, _origin).origin !== _origin) { e.preventDefault(); e.stopImmediatePropagation(); } }
        catch(x) { e.preventDefault(); }
      }, true);
    }
    return el;
  };

  function nukeOverlays() {
    var W = window.innerWidth, H = window.innerHeight;
    document.querySelectorAll(
      'div[style*="position:fixed"],div[style*="position: fixed"],' +
      'div[style*="position:absolute"],iframe[style*="position:fixed"]'
    ).forEach(function(el) {
      var s = window.getComputedStyle(el);
      var w = parseFloat(s.width), h = parseFloat(s.height);
      var z = parseInt(s.zIndex)||0, op = parseFloat(s.opacity);
      if (el.querySelector('video') || el.tagName === 'VIDEO') return;
      if (w > W*0.75 && h > H*0.75 && z > 999) { el.remove(); return; }
      if (op < 0.05 && z > 100 && s.pointerEvents !== 'none') { el.remove(); return; }
      if (w > W*0.9 && h > H*0.9 && z > 500) { el.remove(); }
    });
    document.querySelectorAll('a').forEach(function(a) {
      var r = a.getBoundingClientRect();
      if (r.width > W*0.8 && r.height > H*0.8) {
        try { if (new URL(a.getAttribute('href')||'', _origin).origin !== _origin) a.remove(); }
        catch(e) { a.remove(); }
      }
    });
  }

  var obs = new MutationObserver(function(ms) {
    for (var i=0;i<ms.length;i++) { if (ms[i].addedNodes.length) { nukeOverlays(); break; } }
  });
  function startObs() {
    nukeOverlays();
    if (document.body) obs.observe(document.body, { childList:true, subtree:true });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', startObs); }
  else { startObs(); }

  document.execCommand = function() { return false; };
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); }, true);
  setInterval(nukeOverlays, 1500);
  console.log('[AdwaStream] guard v2 active');
})();
`;

export interface TvShowPlayerProps {
  tv: TvShowDetails;
  id: number;
  seriesName: string;
  seasonName: string;
  episode: Episode;
  episodes: Episode[];
  nextEpisodeNumber: number | null;
  prevEpisodeNumber: number | null;
  startAt?: number;
}

const TvShowPlayer: React.FC<TvShowPlayerProps> = ({
  tv, id, episode, episodes, startAt, ...props
}) => {
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });

  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const guardedRef = useRef(false);
  const sweepRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mobile }  = useBreakpoints();
  const players     = getTvShowPlayers(id, episode.season_number, episode.episode_number, startAt);
  const idle        = useIdle(3000);
  const [sourceOpened,  sourceHandlers]  = useDisclosure(false);
  const [episodeOpened, episodeHandlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src", parseAsInteger.withDefault(0),
  );

  usePlayerEvents({
    saveHistory: true,
    metadata: { season: episode.season_number, episode: episode.episode_number },
  });
  useDocumentTitle(
    `Play ${props.seriesName} - ${props.seasonName} - ${episode.name} | ${siteConfig.name}`,
  );

  const PLAYER = useMemo(
    () => players[selectedSource] || players[0],
    [players, selectedSource],
  );

  // ── Parent-window guard ─────────────────────────────────────────────────
  useEffect(() => {
    const orig = window.open;
    window.open = () => null;
    return () => { window.open = orig; };
  }, []);

  // ── Inject guard into iframe contentWindow ──────────────────────────────
  const installGuard = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const cw = frame.contentWindow as any;
      if (!cw) return;

      cw.open = () => null;
      try {
        Object.defineProperty(cw, "open", {
          value: () => null, writable: false, configurable: false,
        });
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
            'div[style*="position:fixed"],div[style*="position: fixed"],' +
            'div[style*="position:absolute"],iframe[style*="position:fixed"]',
          ).forEach((el) => {
            const s = getComputedStyle(el);
            const w = parseFloat(s.width), h = parseFloat(s.height);
            const z = parseInt(s.zIndex) || 0, op = parseFloat(s.opacity);
            if (el.querySelector("video") || el.tagName === "VIDEO") return;
            if (w > W * 0.75 && h > H * 0.75 && z > 999) { el.remove(); return; }
            if (op < 0.05 && z > 100 && s.pointerEvents !== "none") el.remove();
          });
          doc.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
            const r = a.getBoundingClientRect();
            if (r.width > W * 0.8 && r.height > H * 0.8) {
              try {
                if (new URL(a.href, frame.src).origin !== new URL(frame.src).origin) a.remove();
              } catch { a.remove(); }
            }
          });
        } catch {
          // cross-origin — guard script in page handles it
        }
      }, 2000);
    } catch {
      // cross-origin fallback
    }
  }, []);

  useEffect(() => {
    guardedRef.current = false;
    return () => { if (sweepRef.current) clearInterval(sweepRef.current); };
  }, [PLAYER.source]);

  return (
    <>
      <div className={cn("relative", SpacingClasses.reset)}>
        <TvShowPlayerHeader
          id={id}
          episode={episode}
          hidden={idle && !mobile}
          selectedSource={selectedSource}
          onOpenSource={sourceHandlers.open}
          onOpenEpisode={episodeHandlers.open}
          {...props}
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

          <AdsWarning />
        </Card>
      </div>

      <TvShowPlayerSourceSelection
        opened={sourceOpened}
        onClose={sourceHandlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
      <TvShowPlayerEpisodeSelection
        id={id}
        opened={episodeOpened}
        onClose={episodeHandlers.close}
        episodes={episodes}
      />
    </>
  );
};

export default memo(TvShowPlayer);