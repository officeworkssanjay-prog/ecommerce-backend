"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import type { Pagination, Product } from "@/lib/types";

interface Props {
  query: string;
  onQuery: (q: string) => void;
  onSubmit: (q: string) => void;
  /** Suggested searches (real category names). */
  suggestions: string[];
}

export function SearchPanel({ query, onQuery, onSubmit, suggestions }: Props) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);

  // Live check so the shopper sees the "no results" recovery state before leaving the panel.
  const [checked, setChecked] = useState<{ q: string; total: number } | null>(null);
  const trimmed = query.trim();
  useEffect(() => {
    if (trimmed.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .get<{ products: Product[]; pagination: Pagination }>(`/storefront/products?search=${encodeURIComponent(trimmed)}&page=1&limit=1`)
        .then((res) => {
          if (!cancelled) setChecked({ q: trimmed, total: res.data.pagination.total });
        })
        .catch(() => {
          /* leave the state as is; submitting still works */
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);
  const noResults = trimmed.length >= 2 && checked?.q === trimmed && checked.total === 0;

  return (
    <div role="search" className="border-b border-ink-soft bg-ink px-4 py-5 shadow-2xl">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) onSubmit(query.trim());
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={input}
            type="search"
            aria-label="Search the store"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            maxLength={100}
            placeholder="Search jhumkas, bridal sets, bangles..."
            className="flex-1 rounded-lg bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/50 focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button type="submit" aria-label="Search" className="flex h-[46px] items-center justify-center rounded-lg bg-gold px-6 font-semibold text-ink-deep hover:bg-gold-light">
            <Search className="h-5 w-5" aria-hidden />
          </button>
        </form>
        <div aria-live="polite">
          {noResults && (
            <div className="space-y-1 rounded-lg border border-ink-soft px-4 py-3 text-cream/80">
              <p className="font-serif text-lg text-cream">No results for “{trimmed}”</p>
              <p className="text-xs">Try checking the spelling or browse these instead.</p>
            </div>
          )}
        </div>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {noResults && <span className="text-xs font-semibold uppercase tracking-wider text-cream/60">Popular searches</span>}
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => onSubmit(s)} className="rounded-full border border-ink-soft bg-ink-soft px-4 py-1.5 text-xs font-medium text-cream/80 transition-colors hover:border-gold hover:text-cream">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
