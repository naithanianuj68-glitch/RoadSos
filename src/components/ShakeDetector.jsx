import { useEffect, useRef, useCallback } from 'react';

const SHAKE_THRESHOLD = 30;
const CONSECUTIVE_READINGS_REQUIRED = 3;
const READING_WINDOW_MS = 1000;
const COOLDOWN_MS = 5000;

export default function ShakeDetector({ onShake }) {
  const readingsRef = useRef([]);
  const lastShakeRef = useRef(0);

  const handleMotion = useCallback(
    (event) => {
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;

      const { x, y, z } = accelerationIncludingGravity;
      const magnitude = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);

      if (magnitude < SHAKE_THRESHOLD) return;

      const now = Date.now();

      // Discard stale readings outside the 1-second window
      readingsRef.current = readingsRef.current.filter(
        (t) => now - t < READING_WINDOW_MS
      );

      readingsRef.current.push(now);

      if (readingsRef.current.length >= CONSECUTIVE_READINGS_REQUIRED) {
        // Still within cooldown — skip
        if (now - lastShakeRef.current < COOLDOWN_MS) return;

        lastShakeRef.current = now;
        readingsRef.current = [];
        onShake?.();
      }
    },
    [onShake]
  );

  useEffect(() => {
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [handleMotion]);

  return null;
}
