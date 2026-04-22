import { useEffect, useRef } from 'react';
import { LAP_PROGRESS_END, SCROLL_HAPTIC_MILESTONES } from '../data/scenes.js';
import { safeVibrate } from '../lib/vibrate.js';

/** Мин. пауза между короткими вибро-отметками при скролле (мс). */
const SCROLL_HAPTIC_MIN_GAP_MS = 100;

function pickScrollHapticCrossing(prev, cur, milestones, lapEnd) {
  if (prev === cur) return null;
  const forward = cur > prev;
  const crossed = [];
  for (const m of milestones) {
    if (m.p >= lapEnd - 0.002) continue;
    if (forward) {
      if (prev < m.p && cur >= m.p) crossed.push(m);
    } else if (prev > m.p && cur <= m.p) {
      crossed.push(m);
    }
  }
  if (!crossed.length) return null;
  crossed.sort((a, b) => (forward ? b.p - a.p : a.p - b.p));
  return crossed[0];
}

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Document Y of region top + scroll range; avoid getBoundingClientRect every rAF. */
function readLayoutIntoCache(el, cache) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const h = el.offsetHeight;
  const range = Math.max(1, h - window.innerHeight);
  cache.top = top;
  cache.range = range;
}

function documentProgressFromCache(cache) {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const { top, range } = cache;
  if (range <= 1) return 0;
  const raw = (scrollTop - top) / range;
  return Math.min(1, Math.max(0, raw));
}

/**
 * rAF loop with smoothed progress; invokes onFrame each frame.
 * Callback ref pattern avoids re-subscribing when onFrame identity changes.
 */
export function useStoryEngine({ regionRef, onFrame, lapEnd = LAP_PROGRESS_END }) {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const store = useRef({
    smooth: 0,
    finishPulse: false,
    podiumPulse: false,
  });

  const prevProgressRef = useRef(0);
  const lastScrollHapticAt = useRef(0);
  const scrollHapticPrimedRef = useRef(false);

  useEffect(() => {
    scrollHapticPrimedRef.current = false;
    const st = store.current;
    const layout = { top: 0, range: 1 };
    let raf = 0;

    const remeasure = () => {
      readLayoutIntoCache(regionRef.current, layout);
    };

    const tick = () => {
      if (!regionRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const target = documentProgressFromCache(layout);
      const lerp = REDUCED ? 1 : 0.12;
      st.smooth += (target - st.smooth) * lerp;

      const prevForHaptic = scrollHapticPrimedRef.current
        ? prevProgressRef.current
        : st.smooth;
      if (!scrollHapticPrimedRef.current) {
        scrollHapticPrimedRef.current = true;
      } else if (!REDUCED && st.smooth < lapEnd + 0.02) {
        const milestone = pickScrollHapticCrossing(
          prevForHaptic,
          st.smooth,
          SCROLL_HAPTIC_MILESTONES,
          lapEnd,
        );
        if (milestone) {
          const now = performance.now();
          if (now - lastScrollHapticAt.current >= SCROLL_HAPTIC_MIN_GAP_MS) {
            lastScrollHapticAt.current = now;
            safeVibrate(milestone.pattern);
          }
        }
      }
      prevProgressRef.current = st.smooth;

      if (!st.finishPulse && st.smooth >= lapEnd - 0.0015) {
        st.finishPulse = true;
        safeVibrate([14, 36, 18]);
      }
      const postStart = lapEnd;
      if (!st.podiumPulse && st.smooth >= postStart + (1 - postStart) * 0.88) {
        st.podiumPulse = true;
        safeVibrate([12, 24, 12]);
      }

      const lapT = Math.min(1, st.smooth / lapEnd);
      onFrameRef.current?.({ progress: st.smooth, lapT, raw: target });
      raf = requestAnimationFrame(tick);
    };

    remeasure();
    raf = requestAnimationFrame(tick);

    const el = regionRef.current;
    const ro =
      el && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(remeasure) : null;
    if (ro) ro.observe(el);

    window.addEventListener('resize', remeasure, { passive: true });
    window.visualViewport?.addEventListener('resize', remeasure, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', remeasure);
      window.visualViewport?.removeEventListener('resize', remeasure);
      ro?.disconnect();
    };
  }, [lapEnd, regionRef]);
}
