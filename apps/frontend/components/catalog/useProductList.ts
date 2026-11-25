"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Pagination, Product } from "@/lib/types";

export const PAGE_SIZE = 12;

interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

interface Loaded {
  key: string;
  items: Product[];
  page: number;
  total: number;
  totalPages: number;
  error: string | null;
}

/** Accumulating ("load more") product list for a filter query string like `?category=bangles`. */
export function useProductList(baseQuery: string) {
  const [state, setState] = useState<Loaded | null>(null);
  const [tick, setTick] = useState(0);
  const [moreBusy, setMoreBusy] = useState(false);

  const fetchPage = useCallback(
    async (page: number) => {
      const sep = baseQuery ? "&" : "?";
      return (await api.get<ProductsResponse>(`/storefront/products${baseQuery}${sep}page=${page}&limit=${PAGE_SIZE}`)).data;
    },
    [baseQuery]
  );

  useEffect(() => {
    let cancelled = false;
    fetchPage(1)
      .then((d) => {
        if (!cancelled) setState({ key: baseQuery, items: d.products, page: 1, total: d.pagination.total, totalPages: d.pagination.totalPages, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ key: baseQuery, items: [], page: 1, total: 0, totalPages: 0, error: errorMessage(err, "Could not load products.") });
      });
    return () => {
      cancelled = true;
    };
  }, [baseQuery, fetchPage, tick]);

  const loadMore = useCallback(async () => {
    if (!state || state.key !== baseQuery) return;
    setMoreBusy(true);
    try {
      const d = await fetchPage(state.page + 1);
      setState((prev) =>
        prev && prev.key === baseQuery
          ? {
              ...prev,
              items: [...prev.items, ...d.products.filter((p) => !prev.items.some((x) => x.id === p.id))],
              page: prev.page + 1,
              total: d.pagination.total,
              totalPages: d.pagination.totalPages,
            }
          : prev
      );
    } catch (err) {
      setState((prev) => (prev ? { ...prev, error: errorMessage(err, "Could not load more products.") } : prev));
    } finally {
      setMoreBusy(false);
    }
  }, [state, baseQuery, fetchPage]);

  const current = !!state && state.key === baseQuery;
  return {
    items: state?.items ?? [],
    total: state?.total ?? 0,
    hasMore: !!state && state.page < state.totalPages,
    error: current ? state.error : null,
    loading: !current,
    initial: state === null,
    moreBusy,
    loadMore,
    reload: () => {
      setState(null);
      setTick((t) => t + 1);
    },
  };
}
