"use client";

import { useEffect, useState } from "react";

const KEY = "sawariya:recently-viewed";
const CAP = 8;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/** Slugs of products viewed on this device (newest first); records `currentSlug` and leaves it out of the result. */
export function useRecentlyViewed(currentSlug: string): string[] {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    const previous = read();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    setSlugs(previous.filter((s) => s !== currentSlug).slice(0, CAP));
    try {
      window.localStorage.setItem(KEY, JSON.stringify([currentSlug, ...previous.filter((s) => s !== currentSlug)].slice(0, CAP)));
    } catch {
      /* storage unavailable: the strip simply stays empty */
    }
  }, [currentSlug]);

  return slugs;
}
