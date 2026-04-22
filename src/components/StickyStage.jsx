import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import monzaPathSvg from '../../monzapath.svg?raw';
import { LAP_PROGRESS_END, scenes, sceneOpacity } from '../data/scenes.js';
import { useStoryEngine } from '../hooks/useStoryEngine.js';
import { PostLapGallery } from './PostLapGallery.jsx';
import { StartLights } from './StartLights.jsx';
import { StoryCaption } from './StoryCaption.jsx';

const DESKTOP_MQ = '(min-width: 641px)';

function subscribeDesktop(cb) {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function getDesktopSnapshot() {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches;
}

function getDesktopServerSnapshot() {
  return false;
}

const VIEW_W = 1681;
const VIEW_H = 998;
/** monzapath.svg viewBox (must match file) */
const PATH_SRC_W = 1653;
const PATH_SRC_H = 965;

const lapPathD = (() => {
  const m = monzaPathSvg.match(/<path[^>]*\bd="([^"]+)"/i);
  return m ? m[1].trim() : '';
})();

const PATH_SX = VIEW_W / PATH_SRC_W;
const PATH_SY = VIEW_H / PATH_SRC_H;

/** Reverse lap direction; start 10% further along path (path parameter offset). */
const LAP_PATH_PHASE = 0.1;

const TRAIL_MAX = 26;
const TRAIL_MIN_DIST = 11;

function buildTrailPoints(buffer, x, y) {
  const last = buffer[buffer.length - 1];
  if (last && Math.hypot(last.x - x, last.y - y) < TRAIL_MIN_DIST) return buffer;
  buffer.push({ x, y });
  if (buffer.length > TRAIL_MAX) buffer.shift();
  return buffer;
}

function StickyStageComponent({ raceStarted }) {
  const desktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, getDesktopServerSnapshot);

  const regionRef = useRef(null);
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const trailRef = useRef(null);
  const glowRef = useRef(null);
  const trailBuf = useRef([]);
  const lenRef = useRef(0);
  const trailClearedForLapEnd = useRef(false);
  const [uiProgress, setUiProgress] = useState(0);
  const frameCount = useRef(0);

  const postT =
    uiProgress <= LAP_PROGRESS_END
      ? 0
      : Math.min(1, (uiProgress - LAP_PROGRESS_END) / (1 - LAP_PROGRESS_END));

  /** Scene timeline matches scroll progress until lap end, then holds at finish window. */
  const lapStoryT = Math.min(LAP_PROGRESS_END, uiProgress);

  useEffect(() => {
    lenRef.current = 0;
    trailBuf.current = [];
    trailClearedForLapEnd.current = false;
  }, [lapPathD]);

  const onFrame = useCallback(({ lapT, progress }) => {
    const path = pathRef.current;
    const dot = dotRef.current;
    const trail = trailRef.current;
    const glow = glowRef.current;
    if (!path || !dot || !trail) return;

    if (!lenRef.current) {
      try {
        lenRef.current = path.getTotalLength();
      } catch {
        lenRef.current = 1;
      }
    }

    const len = lenRef.current || 1;
    let frac = (1 - lapT + LAP_PATH_PHASE) % 1;
    if (frac < 0) frac += 1;
    const dist = frac * len;
    const pt = path.getPointAtLength(dist);
    const x = pt.x * PATH_SX;
    const y = pt.y * PATH_SY;

    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    if (glow) {
      glow.setAttribute('cx', x);
      glow.setAttribute('cy', y);
    }

    if (progress >= LAP_PROGRESS_END) {
      if (!trailClearedForLapEnd.current) {
        trailClearedForLapEnd.current = true;
        trailBuf.current = [];
        trail.setAttribute('points', '');
      }
    } else {
      trailClearedForLapEnd.current = false;
      trailBuf.current = buildTrailPoints(trailBuf.current, x, y);
    }

    frameCount.current += 1;
    const fc = frameCount.current;
    if (progress < LAP_PROGRESS_END && fc % 2 === 0 && trailBuf.current.length > 1) {
      trail.setAttribute('points', trailBuf.current.map((p) => `${p.x},${p.y}`).join(' '));
    }
    if (fc % 4 === 0) {
      startTransition(() => {
        setUiProgress((prev) =>
          Math.abs(prev - progress) < 0.0004 ? prev : progress,
        );
      });
    }
  }, []);

  useStoryEngine({ regionRef, onFrame, lapEnd: LAP_PROGRESS_END });

  const dominant = useMemo(() => {
    const weighted = scenes.map((s) => ({ scene: s, w: sceneOpacity(s, lapStoryT) }));
    const best = weighted.reduce((a, b) => (b.w > a.w ? b : a), weighted[0]);
    if (best.w >= 0.03) return best;
    const nearest = scenes.reduce((a, b) =>
      Math.abs(b.pFocus - lapStoryT) < Math.abs(a.pFocus - lapStoryT) ? b : a,
    );
    return { scene: nearest, w: 0.28 };
  }, [lapStoryT]);

  /* На десктопе чуть меньше доля ряда с трассой — больше высоты под подпись и картинки */
  const rowTrackFr = (1 - postT * 0.48) * (desktop ? 0.9 : 1);
  const rowBottomFr = (desktop ? 2.22 : 2) + postT * 1.42;
  const mapLift = `translate3d(0, calc(-1 * ${postT} * min(5.5vh, 3.5rem)), 0)`;

  return (
    <section ref={regionRef} className="story-region" aria-label="Monza lap scroll story">
      <div
        className="story-region__sticky"
        style={{
          '--post-lap': String(postT),
          gridTemplateRows: `minmax(64px, ${rowTrackFr}fr) minmax(0, ${rowBottomFr}fr)`,
        }}
      >
        <div className="stage" style={{ transform: mapLift }}>
          <div className="stage__glow" aria-hidden />
          <div className="stage__frame">
            <div className="stage__media">
              <p className="stage__brand">MONZA</p>
              <img
                className="stage__map"
                src={`${import.meta.env.BASE_URL}monza.svg`}
                width={VIEW_W}
                height={VIEW_H}
                alt="Autodromo Nazionale Monza circuit"
                decoding="async"
                fetchPriority="high"
              />
              <svg
                className="stage__overlay"
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                aria-hidden
              >
                <defs>
                  <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#d90429" stopOpacity="0.62" />
                    <stop offset="100%" stopColor="#8b0000" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <path ref={pathRef} className="stage__lap-path" d={lapPathD} />
                <polyline ref={trailRef} className="stage__trail" points="" fill="none" />
                <circle ref={glowRef} className="stage__dot-glow" r="42" fill="url(#dotGlow)" />
                <circle ref={dotRef} className="stage__dot" r="15" />
              </svg>
              <StartLights active={raceStarted} />
            </div>
          </div>
        </div>
        <div className="story-column">
          <StoryCaption scene={dominant.scene} strength={dominant.w} />
          <PostLapGallery postT={postT} />
        </div>
      </div>
    </section>
  );
}

export const StickyStage = memo(StickyStageComponent);
