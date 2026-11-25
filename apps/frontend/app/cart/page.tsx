"use client";

import Link from "next/link";
import { useFeedback } from "@/components/ui/Feedback";
import { Button, buttonClasses } from "@/components/ui/Button";
import { CartLine, pricedFor } from "@/components/cart/CartLine";
import { CartProblemBanner } from "@/components/cart/CartProblemBanner";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { useCartPricing } from "@/components/cart/useCartPricing";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { confirm } = useFeedback();
  const { cart, pricing, loading, error, cartProblem, message, reload, rules, couponCode, setCouponCode } = useCartPricing();
  const { items, updateQuantity, removeItem, clearCart, totalItems } = cart;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4">
        <EmptyCart />
      </div>
    );
  }

  const onClear = async () => {
    if (await confirm({ title: "Clear your cart?", message: "All items will be removed.", confirmLabel: "Clear cart", danger: true })) clearCart();
  };
  const blocked = !pricing || !!error;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 pb-28 sm:px-6 lg:px-8 lg:pb-10">
      <nav aria-label="Checkout progress" className="text-xs text-ink/60">
        <ol className="flex items-center gap-2">
          <li aria-current="step" className="flex items-center gap-1.5 font-semibold text-ink">
            <span className="h-2 w-2 rounded-full bg-gold" aria-hidden /> Cart
          </li>
          <li aria-hidden>›</li>
          <li>Address</li>
          <li aria-hidden>›</li>
          <li>Payment</li>
        </ol>
      </nav>

      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">Shopping Cart</h1>
        <p className="text-sm text-ink/60">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </p>
      </div>

      <FreeShippingBar pricing={pricing} rules={rules} />
      {error && <CartProblemBanner message={message} cartProblem={cartProblem} items={items} onRemove={removeItem} onRetry={reload} />}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <ul className="space-y-3">
            {items.map((item, index) => (
              <CartLine
                key={item.id}
                item={item}
                priced={pricedFor(index, item, pricing?.items)}
                onQty={(q) => updateQuantity(item.id, q)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </ul>
          <p className="text-xs text-ink/60">Prices, discounts and shipping are confirmed by our server.</p>
          <div className="flex items-center justify-between">
            <Link href="/products" className="text-sm font-medium text-gold-dark hover:underline">
              ← Continue shopping
            </Link>
            <button type="button" onClick={onClear} className="text-xs font-medium text-ink/60 hover:text-danger">
              Clear cart
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <OrderSummary
            pricing={pricing}
            loading={loading}
            couponCode={couponCode}
            onCoupon={setCouponCode}
            blocked={blocked}
            blockedReason={error && cartProblem ? "Remove the unavailable item before checking out." : null}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-sand bg-white px-4 py-3 shadow-card lg:hidden">
        <div aria-live="polite">
          <p className="text-xs text-ink/60">Total</p>
          <p className="font-serif text-xl text-ink">{pricing ? formatPrice(pricing.finalPayable) : "…"}</p>
        </div>
        {blocked ? (
          <Button size="lg" disabled>
            Checkout
          </Button>
        ) : (
          <Link href="/checkout" className={buttonClasses("primary", "lg")}>
            Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
