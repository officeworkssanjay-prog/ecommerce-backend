"use client";

import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import type { PricingResult } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Skeleton } from "@/components/ui/States";
import { PriceRows } from "@/components/cart/PriceRows";

function Body({ pricing, loading }: { pricing: PricingResult | null; loading: boolean }) {
  return (
    <div className="space-y-4">
      {pricing ? (
        <ul className="space-y-3">
          {pricing.items.map((i, idx) => (
            <li key={`${i.productId}-${idx}`} className="flex items-center gap-3 text-sm">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-sand bg-white">
                {i.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{i.name}</p>
                <p className="text-xs text-ink/60">Qty {i.qty}</p>
              </div>
              <span className="font-medium text-ink">{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Skeleton className="h-12 w-full" />
      )}
      <div className="border-t border-sand pt-4">
        <PriceRows pricing={pricing} loading={loading} />
      </div>
      {pricing?.couponError && <p className="text-xs text-danger">Coupon not applied: {pricing.couponError}</p>}
      <p className="flex items-center justify-center gap-1.5 text-xs text-ink/60">
        <Lock className="h-3.5 w-3.5" aria-hidden /> 100% secure checkout
      </p>
    </div>
  );
}

/** Order summary shown on every step: a collapsible bar on mobile, a card on desktop. */
export function CheckoutSummary({ pricing, loading }: { pricing: PricingResult | null; loading: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="rounded-md bg-parchment lg:hidden">
        <button type="button" aria-expanded={open} aria-controls="mobile-summary" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 p-4 text-sm font-medium text-ink">
          <span className="flex items-center gap-2">
            {open ? "Hide" : "Show"} order summary
            <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} aria-hidden />
          </span>
          <span className="font-serif text-lg">{pricing ? formatPrice(pricing.finalPayable) : "…"}</span>
        </button>
        <div id="mobile-summary" hidden={!open} className="px-4 pb-4">
          <Body pricing={pricing} loading={loading} />
        </div>
      </div>
      <aside aria-label="Order summary" className="hidden space-y-4 rounded-md bg-parchment p-6 lg:sticky lg:top-24 lg:block">
        <h2 className="font-serif text-xl text-ink">Order summary</h2>
        <Body pricing={pricing} loading={loading} />
      </aside>
    </>
  );
}
