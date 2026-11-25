"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatPrice } from "@/lib/format";
import type { ShippingRule } from "@/lib/types";
import { Button, buttonClasses } from "@/components/ui/Button";
import { CartLine, pricedFor } from "@/components/cart/CartLine";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { readPrefs } from "@/components/cart/prefs";
import { usePricing } from "@/components/cart/usePricing";

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, totalItems, toApiItems } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const prefs = isCartOpen ? readPrefs() : {};
  const { pricing, loading, error, cartProblem, message, reload } = usePricing(toApiItems(), {
    couponCode: prefs.couponCode,
    shippingRuleId: prefs.shippingRuleId,
    enabled: isCartOpen,
  });
  const rules = useApi(async () => (await api.get<ShippingRule[]>("/storefront/shipping-rules")).data, [], { enabled: isCartOpen });

  useEffect(() => {
    if (!isCartOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-ink-deep/50" onClick={closeCart} aria-hidden />
      <div className="fixed inset-y-0 right-0 flex w-full max-w-full sm:w-auto sm:pl-10">
        <div ref={panel} role="dialog" aria-modal="true" aria-label="Shopping cart" tabIndex={-1} className="flex h-full w-full flex-col bg-cream shadow-2xl outline-none sm:w-screen sm:max-w-md">
          <div className="flex items-center justify-between border-b border-sand px-5 py-4 sm:px-6">
            <h2 className="font-serif text-xl text-ink">Your Cart ({totalItems})</h2>
            <button type="button" onClick={closeCart} aria-label="Close cart" className="rounded-md p-1.5 text-ink/60 hover:bg-parchment">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {items.length > 0 && (
            <div className="px-5 pt-4 sm:px-6">
              <FreeShippingBar pricing={pricing} rules={rules.data ?? []} compact />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-2 sm:px-6">
            {items.length === 0 ? (
              <EmptyCart compact onNavigate={closeCart} />
            ) : (
              <ul className="divide-y divide-sand">
                {items.map((item, index) => (
                  <CartLine
                    key={item.id}
                    item={item}
                    compact
                    priced={pricedFor(index, item, pricing?.items)}
                    onQty={(q) => updateQuantity(item.id, q)}
                    onRemove={() => removeItem(item.id)}
                    onNavigate={closeCart}
                  />
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-3 border-t border-sand bg-white p-5 sm:p-6">
              {error && (
                <div role="alert" className="space-y-2 text-xs text-danger">
                  <p>
                    {cartProblem ? message : "Something went wrong. Check your connection and try again."}
                    {cartProblem && " Remove the unavailable item to continue."}
                  </p>
                  {!cartProblem && (
                    <Button size="sm" variant="outline" onClick={reload}>
                      Retry
                    </Button>
                  )}
                </div>
              )}
              <div className="flex items-baseline justify-between" aria-live="polite">
                <span className="text-sm text-ink/70">Subtotal</span>
                <span className="font-serif text-2xl text-ink">{pricing ? formatPrice(pricing.subTotal) : loading ? "…" : "—"}</span>
              </div>
              <p className="text-xs text-ink/60">Shipping, taxes and offers calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={closeCart} className={buttonClasses("outline", "lg")}>
                  View Cart
                </Link>
                {error ? (
                  <Button size="lg" disabled>
                    Checkout
                  </Button>
                ) : (
                  <Link href="/checkout" onClick={closeCart} className={buttonClasses("primary", "lg")}>
                    Checkout
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
