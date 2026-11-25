"use client";

import type { PricingResult, ShippingRule } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { eligibleRule } from "@/components/cart/usePricing";

interface Props {
  rules: ShippingRule[];
  pricing: PricingResult;
  onSelect: (id: string) => void;
  onContinue: () => void;
}

export function DeliveryStep({ rules, pricing, onSelect, onContinue }: Props) {
  const options = rules.filter((r) => r.status && eligibleRule(r, pricing.subTotal - pricing.discount));
  const selected = pricing.shippingRule?.id;
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/70">Select a delivery service.</p>
      {options.length === 0 ? (
        <p className="text-sm text-ink/70">Shipping for this order is calculated by the store: {pricing.shippingCost === 0 ? "free" : formatPrice(pricing.shippingCost)}.</p>
      ) : (
        <fieldset className="space-y-3">
          <legend className="sr-only">Delivery method</legend>
          {options.map((r) => (
            <label key={r.id} className={cn("flex cursor-pointer items-center justify-between gap-3 rounded-md border p-4 text-sm focus-within:outline-2 focus-within:outline-gold", selected === r.id ? "border-gold bg-parchment" : "border-sand bg-white hover:bg-parchment/50")}>
              <span className="flex items-center gap-3">
                <input type="radio" name="shipping" checked={selected === r.id} onChange={() => onSelect(r.id)} className="accent-gold" />
                <span className="font-medium text-ink">{r.name}</span>
              </span>
              <span className={r.cost === 0 ? "font-semibold text-success" : "font-medium text-ink"}>{r.cost === 0 ? "FREE" : formatPrice(r.cost)}</span>
            </label>
          ))}
        </fieldset>
      )}
      <p className="text-xs text-ink/60">Orders are carefully packed. Dispatch updates are shared on your order page.</p>
      <Button size="lg" className="w-full" onClick={onContinue}>
        Continue to payment
      </Button>
    </div>
  );
}
