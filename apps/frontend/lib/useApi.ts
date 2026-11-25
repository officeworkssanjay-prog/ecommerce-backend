"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, errorMessage } from "./api";

export interface UseApiState<T> {
  data: T | null;
  error: ApiError | null;
  /** Human-readable message for `error`. */
  message: string | null;
  loading: boolean;
  reload: () => void;
}

interface Settled<T> {
  /** Identifies the request this result belongs to. */
  token: object | null;
  data: T | null;
  error: ApiError | null;
}

/**
 * Loads data when mounted and whenever `deps` change. Errors are surfaced (never replaced by fake
 * data); render <ErrorState message={message} onRetry={reload} /> for them. While a new request is in
 * flight the previous data stays available, so lists don't flash empty.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = [], options: { enabled?: boolean } = {}): UseApiState<T> {
  const enabled = options.enabled ?? true;
  const [tick, setTick] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>({ token: null, data: null, error: null });

  // A fresh token per (deps, reload, enabled) combination: "loading" is simply "the latest token hasn't settled".
  // `deps` should be primitives (ids, page numbers, filters), so a serialised copy is a stable key.
  const depsKey = JSON.stringify(deps);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the extra deps are what make a new token (= a refetch)
  const token = useMemo(() => ({}), [depsKey, tick, enabled]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (!cancelled) setSettled({ token, data, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setSettled((prev) => ({ token, data: prev.data, error: err instanceof ApiError ? err : new ApiError(0, errorMessage(err)) }));
        }
      });
    return () => {
      cancelled = true;
    };
    // `fetcher` is intentionally not a dependency: callers pass inline closures; `deps` decide when to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  const current = settled.token === token;
  const error = current ? settled.error : null;
  return {
    data: settled.data,
    error,
    message: error ? error.message : null,
    loading: enabled && !current,
    reload,
  };
}
