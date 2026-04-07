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

// ─── ULTRA GUARD v4 — CLICK-PROOF (2026 TV embed protection) ───────────────
// Same battle-tested version used in MoviePlayer — specifically kills ads that appear when you click the player screen
const GUARD_SCRIPT = `
(function() {
  'use strict';
  console.log('[AdwaStream] guard v4 CLICK-PROOF active — zero ads on player clicks (TV version)');

  var _noop = function() { return null; };
  var _adAttempts = 0;
  var _videoStarted = false;
  var _clicked = false;
  var _origin = window.location.origin;

  // 1. TOTAL POPUP KILL
  function killPopups() {
    try { Object.defineProperty(window, 'open', { value: _noop, writable: false, configurable: false }); } catch(e) { window.open = _noop; }
    ['popup','openNew','showAd','launchAd','_open','popunder'].forEach(function(k) {
      try { Object.defineProperty(window, k, { value: _noop, writable: false, configurable: false }); } catch(e) {}
    });
  }
  killPopups();

  // 2. FRAME ESCAPE BLOCK
  try {
    Object.defineProperty(window, 'top', { get: function(){ return window; }, configurable: false });
    Object.defineProperty(window, 'parent', { get: function(){ return window; }, configurable: false });
  } catch(e) {}

  // 3. SAFE NAVIGATION
  var _safeNav = function(url) {
    try { return new URL(url, _origin).origin === _origin; } catch(e) { return false; }
  };

  // 4. GLOBAL CAPTURING CLICK BLOCKER — THIS FIXES ADS ON PLAYER CLICK
  function blockAdClicks(e) {
    if (_videoStarted || _clicked) {
      var target = e.target;
      var isVideo = target.tagName === 'VIDEO' || (target.closest && target.closest('video'));
      var isControl = target.closest && (
        target.closest('.plyr') || 
        target.closest('.jwplayer') || 
        target.closest('button') || 
        target.closest('[class*="control"]') ||
        target.closest('[class*="player"]')
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

  // 5. OVERRIDE .click() 
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

  // 6. NUKE INLINE EVENT HANDLERS
  function nukeEventHandlers() {
    var all = document.querySelectorAll('*');
    all.forEach(function(el) {
      if (el.tagName === 'VIDEO') return;
      ['onclick','onmousedown','ontouchstart','onmouseup','ondblclick'].forEach(function(ev) {
        if (el[ev]) el[ev] = null;
      });
    });
  }

  // 7. AGGRESSIVE OVERLAY NUKE (runs instantly on clicks)
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

  // 8. MUTATION OBSERVER + FAST SWEEP
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

  // 9. VIDEO DETECTION → STRICT MODE
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

  // 10. FINAL BLOCKS
  document.write = document.writeln = _noop;
  window.alert = window.confirm = window.prompt = _noop;
  document.execCommand = function() { return false; };
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); }, true);

  console.log('[guard] one-ad-per-movie + click-proof protection ready for TV player');
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

  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const guardedRef   = useRef(false);
  const sweepRef     = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Parent-window total popup block
  useEffect(() => {
    const orig = window.open;
    window.open = () => null;
    return () => { window.open = orig; };
  }, []);

  // Inject ultra guard + parent sweep
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

  useEffect(() => {
    guardedRef.current = false;
    return () => {
      if (sweepRef.current) clearInterval(sweepRef.current);
    };
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