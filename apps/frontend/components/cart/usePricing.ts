"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, api, errorMessage } from "@/lib/api";
import type { ApiCartItem } from "@/context/CartContext";
import type { PricingResult } from "@/lib/types";

interface Options {
  couponCode?: string;
  shippingRuleId?: string;
  enabled?: boolean;
  debounceMs?: number;
}

export interface PricingState {
  pricing: PricingResult | null;
  /** True while a request is in flight. */
  loading: boolean;
  error: ApiError | null;
  /** The server rejected the cart itself (item gone, out of stock, bad option). */
  cartProblem: boolean;
  message: string | null;
  reload: () => void;
}

/** Asks the server to price the cart. Re-runs (debounced) whenever items, coupon or shipping change. */
export function usePricing(items: ApiCartItem[], { couponCode, shippingRuleId, enabled = true, debounceMs = 300 }: Options = {}): PricingState {
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);
  const latest = useRef(0);
  const key = JSON.stringify({ items, couponCode, shippingRuleId });

  useEffect(() => {
    const id = ++latest.current;
    const req = JSON.parse(key) as { items: ApiCartItem[]; couponCode?: string; shippingRuleId?: string };
    if (!enabled || req.items.length === 0) return;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .post<PricingResult>("/order/calculate-pricing", {
          items: req.items,
          couponCode: req.couponCode || undefined,
          shippingRuleId: req.shippingRuleId || undefined,
        })
        .then((res) => {
          if (id !== latest.current) return;
          setPricing(res.data);
          setError(null);
        })
        .catch((err) => {
          if (id !== latest.current) return;
          setPricing(null);
          setError(err instanceof ApiError ? err : new ApiError(0, errorMessage(err)));
        })
        .finally(() => {
          if (id === latest.current) setLoading(false);
        });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [key, enabled, tick, debounceMs]);

  const active = enabled && items.length > 0;
  const err = active ? error : null;
  return {
    pricing: active ? pricing : null,
    loading: active && loading,
    error: err,
    cartProblem: !!err && (err.status === 400 || err.status === 409),
    message: err ? err.message : null,
    reload: () => setTick((t) => t + 1),
  };
}

/** Whether a shipping rule applies to an order of this size (before shipping). */
export function eligibleRule(rule: { type: string; minCost: number }, amountBeforeShipping: number) {
  return rule.type !== "min_cost" || amountBeforeShipping >= Number(rule.minCost);
}
