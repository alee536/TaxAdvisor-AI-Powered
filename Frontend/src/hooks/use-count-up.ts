import { useEffect, useState } from 'react';

interface Options {
  start: boolean;
  duration?: number;
  reduceMotion?: boolean;
}

export function useCountUp(target: number, { start, duration = 1200, reduceMotion = false }: Options) {
  const [value, setValue] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (!start) {
      setValue(reduceMotion ? target : 0);
      return;
    }

    if (reduceMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      }
    };

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, reduceMotion, start, target]);

  return value;
}