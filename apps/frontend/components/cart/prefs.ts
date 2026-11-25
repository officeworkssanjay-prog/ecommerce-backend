/** Coupon and shipping choice made in the cart, remembered for the checkout step (session only). */
const KEY = "sawariya_checkout_prefs";

export interface CheckoutPrefs {
  couponCode?: string;
  shippingRuleId?: string;
}

export function readPrefs(): CheckoutPrefs {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const p = parsed as Record<string, unknown>;
    return {
      couponCode: typeof p.couponCode === "string" ? p.couponCode : undefined,
      shippingRuleId: typeof p.shippingRuleId === "string" ? p.shippingRuleId : undefined,
    };
  } catch {
    return {};
  }
}

export function writePrefs(prefs: CheckoutPrefs) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* private mode: the choice is simply not remembered */
  }
}

export function clearPrefs() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
