"use client";

import { useEffect, useState } from "react";

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  /** False until the first client tick (avoids a server/client mismatch). */
  ready: boolean;
  expired: boolean;
}

/** Ticks every second until `endDate`. Hours are total hours remaining (can exceed 24). */
export function useCountdown(endDate?: string | null): Countdown {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  if (!endDate || now === null) return { hours: 0, minutes: 0, seconds: 0, ready: false, expired: false };
  const remaining = Math.max(0, new Date(endDate).getTime() - now);
  const total = Math.floor(remaining / 1000);
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    ready: true,
    expired: remaining === 0,
  };
}
