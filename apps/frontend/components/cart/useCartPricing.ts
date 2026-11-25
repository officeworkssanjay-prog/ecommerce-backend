"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { ShippingRule } from "@/lib/types";
import { readPrefs, writePrefs } from "./prefs";
import { usePricing } from "./usePricing";

/** Cart + coupon + shipping choice + server pricing, shared by the cart page. Choices persist for checkout. */
export function useCartPricing(extra: { paymentMethod?: "COD" | "RAZORPAY"; giftWrap?: boolean } = {}) {
  const cart = useCart();
  const [couponCode, setCouponCode] = useState<string | undefined>(() => (typeof window === "undefined" ? undefined : readPrefs().couponCode));
  const [shippingRuleId, setShippingRuleId] = useState<string | undefined>(() => (typeof window === "undefined" ? undefined : readPrefs().shippingRuleId));

  useEffect(() => {
    writePrefs({ couponCode, shippingRuleId });
  }, [couponCode, shippingRuleId]);

  const rules = useApi(async () => (await api.get<ShippingRule[]>("/storefront/shipping-rules")).data, []);
  const state = usePricing(cart.toApiItems(), { couponCode, shippingRuleId, ...extra });

  // A rejected shipping choice (no longer eligible) falls back to the server's automatic pick.
  if (shippingRuleId && state.error && /shipping method/i.test(state.error.message)) setShippingRuleId(undefined);

  return { cart, couponCode, setCouponCode, shippingRuleId, setShippingRuleId, rules: rules.data ?? [], ...state };
}
