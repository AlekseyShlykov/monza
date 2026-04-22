import { useCallback, useEffect, useRef, useState } from 'react';
import { safeVibrate } from '../lib/vibrate.js';

/**
 * First deliberate scroll gesture → race started (green lights).
 */
export function useRaceStart() {
  const [raceStarted, setRaceStarted] = useState(false);
  const fired = useRef(false);

  const arm = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setRaceStarted(true);
    safeVibrate(8);
  }, []);

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
