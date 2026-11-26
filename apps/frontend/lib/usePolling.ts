"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "./api";

/**
 * GETs `url` now and every `intervalMs` while mounted; `null` pauses it. Data belonging to a previous
 * url is never returned. `refresh` fetches again immediately.
 */
export function usePolling<T>(url: string | null, intervalMs: number) {
  const [state, setState] = useState<{ url: string | null; data: T | null; error: string | null }>({ url: null, data: null, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const run = () =>
      api
        .get<T>(url)
        .then((res) => {
          if (!cancelled) setState({ url, data: res.data, error: null });
        })
        .catch((err) => {
          if (!cancelled) setState((prev) => ({ url, data: prev.url === url ? prev.data : null, error: errorMessage(err) }));
        });
    void run();
    const timer = setInterval(() => void run(), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [url, intervalMs, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const current = state.url === url;
  return { data: current ? state.data : null, error: current ? state.error : null, refresh };
}
