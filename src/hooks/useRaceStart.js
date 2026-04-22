import { useCallback, useEffect, useRef, useState } from 'react';
import { safeVibrate } from '../lib/vibrate.js';

/**
 * First deliberate scroll gesture → race started (green lights).
 */
const TOP_EPS = 2;
/** Считаем, что ушли от верха — после этого возврат в самый верх снова гасит старт */
const AWAY_FROM_TOP = 48;

export function useRaceStart() {
  const [raceStarted, setRaceStarted] = useState(false);
  const fired = useRef(false);
  const hadScrolledAwayFromTop = useRef(false);

  const arm = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setRaceStarted(true);
    safeVibrate(8);
  }, []);

  useEffect(() => {
    if (!raceStarted) {
      hadScrolledAwayFromTop.current = false;
      return undefined;
    }

    const scrollTop = () => window.scrollY || document.documentElement.scrollTop;

    const onScroll = () => {
      const y = scrollTop();
      if (y > AWAY_FROM_TOP) {
        hadScrolledAwayFromTop.current = true;
      }
      if (y <= TOP_EPS && hadScrolledAwayFromTop.current) {
        hadScrolledAwayFromTop.current = false;
        fired.current = false;
        setRaceStarted(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [raceStarted]);

  useEffect(() => {
    if (raceStarted) return undefined;

    let touchY = null;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 0.75 && Math.abs(e.deltaX) < 0.75) return;
      arm();
    };

    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e) => {
      if (touchY == null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      if (Math.abs(y - touchY) > 12) arm();
    };

    const onKey = (e) => {
      if (['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key)) arm();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [arm, raceStarted]);

  return raceStarted;
}
