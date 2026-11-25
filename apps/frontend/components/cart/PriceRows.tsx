import type { PricingResult } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Skeleton } from "@/components/ui/States";

/** Subtotal / discount / shipping / total, all from the server's pricing. */
export function PriceRows({ pricing, loading }: { pricing: PricingResult | null; loading: boolean }) {
  if (!pricing) {
    return (
      <div className="space-y-2" aria-busy={loading}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-7 w-full" />
      </div>
    );
  }
  return (
    <div aria-live="polite" aria-busy={loading} className={loading ? "opacity-60" : undefined}>
      <dl className="space-y-2.5 text-sm text-ink/70">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="font-medium text-ink">{formatPrice(pricing.subTotal)}</dd>
        </div>
        {pricing.discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Coupon{pricing.coupon ? ` · ${pricing.coupon.code}` : ""}</dt>
            <dd>− {formatPrice(pricing.discount)}</dd>
          </div>
        )}
        {pricing.prepaidDiscount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Prepaid discount</dt>
            <dd>− {formatPrice(pricing.prepaidDiscount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Shipping{pricing.shippingRule ? ` · ${pricing.shippingRule.name}` : ""}</dt>
          <dd className={pricing.shippingCost === 0 ? "font-semibold text-success" : "font-medium text-ink"}>{pricing.shippingCost === 0 ? "FREE" : formatPrice(pricing.shippingCost)}</dd>
        </div>
        {pricing.codFee > 0 && (
          <div className="flex justify-between">
            <dt>COD fee</dt>
            <dd className="font-medium text-ink">{formatPrice(pricing.codFee)}</dd>
          </div>
        )}
        {pricing.giftWrapFee > 0 && (
          <div className="flex justify-between">
            <dt>Gift wrap</dt>
            <dd className="font-medium text-ink">{formatPrice(pricing.giftWrapFee)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-3 flex items-baseline justify-between border-t border-sand pt-3">
        <span className="font-serif text-lg text-ink">Total</span>
        <span className="font-serif text-2xl text-ink">{formatPrice(pricing.finalPayable)}</span>
      </div>
      <p className="mt-1 text-xs text-ink/60">Inclusive of all taxes</p>
      {pricing.discount > 0 && <p className="mt-1 text-xs font-medium text-success">You save {formatPrice(pricing.discount)} on this order</p>}
    </div>
  );
}
