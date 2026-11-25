"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import type { PricingResult } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Props {
  pricing: PricingResult | null;
  loading: boolean;
  couponCode?: string;
  onCoupon: (code: string | undefined) => void;
  idPrefix?: string;
}

/** Coupon entry with the spec's error (red) and applied (green) states. The server decides validity. */
export function CouponBox({ pricing, loading, couponCode, onCoupon, idPrefix = "coupon" }: Props) {
  const [input, setInput] = useState("");
  const applied = pricing?.coupon ?? null;
  const error = pricing?.couponError ?? null;
  const id = `${idPrefix}-code`;

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const code = input.trim();
    if (code) onCoupon(code);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-ink/70">
        Coupon code
      </label>
      {applied ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-success/40 bg-success/10 p-3 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {applied.code} applied! {applied.discountType === "PERCENT" ? `${applied.discount}% off` : `${formatPrice(applied.discount)} off`}
          </span>
          <button
            type="button"
            onClick={() => {
              setInput("");
              onCoupon(undefined);
            }}
            aria-label={`Remove coupon ${applied.code}`}
            className="rounded p-1 text-ink/60 hover:text-danger"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <form onSubmit={apply} className="flex gap-2">
          <input
            id={id}
            type="text"
            placeholder="e.g. ROYAL10"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={40}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn("h-10 w-full rounded-md border bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none", error ? "border-danger" : "border-sand")}
          />
          <Button type="submit" variant="outline" disabled={!input.trim()}>
            Apply
          </Button>
        </form>
      )}
      <div aria-live="polite">
        {error && !applied && (
          <p id={`${id}-error`} className="flex items-center gap-1 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden /> {error}
          </p>
        )}
        {couponCode && !applied && !error && loading && <p className="text-xs text-ink/60">Checking coupon…</p>}
      </div>
    </div>
  );
}
