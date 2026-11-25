"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import type { PricingResult } from "@/lib/types";
import { buttonClasses, Button } from "@/components/ui/Button";
import { CouponBox } from "./CouponBox";
import { PriceRows } from "./PriceRows";

interface Props {
  pricing: PricingResult | null;
  loading: boolean;
  couponCode?: string;
  onCoupon: (code: string | undefined) => void;
  /** Disable checkout (pricing failed or still unknown). */
  blocked: boolean;
  /** Helper copy shown under a disabled CTA when the cart has a problem. */
  blockedReason?: string | null;
}

export function OrderSummary({ pricing, loading, couponCode, onCoupon, blocked, blockedReason }: Props) {
  return (
    <aside aria-label="Order summary" className="space-y-5 rounded-md bg-parchment p-6 lg:sticky lg:top-24">
      <h2 className="font-serif text-xl text-ink">Order summary</h2>
      <CouponBox pricing={pricing} loading={loading} couponCode={couponCode} onCoupon={onCoupon} />
      <div className="border-t border-sand pt-4">
        <PriceRows pricing={pricing} loading={loading} />
      </div>
      <div className="hidden lg:block">
        {blocked ? (
          <Button size="lg" className="w-full" disabled>
            Proceed to checkout
          </Button>
        ) : (
          <Link href="/checkout" className={buttonClasses("primary", "lg", "w-full")}>
            Proceed to checkout <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
      {blocked && blockedReason && <p className="text-xs text-danger">{blockedReason}</p>}
      <p className="flex items-center justify-center gap-1.5 text-xs text-ink/60">
        <Lock className="h-3.5 w-3.5" aria-hidden /> 100% secure checkout
      </p>
    </aside>
  );
}
