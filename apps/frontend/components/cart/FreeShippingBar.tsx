import { PartyPopper, Truck } from "lucide-react";
import type { PricingResult, ShippingRule } from "@/lib/types";
import { formatPrice } from "@/lib/format";

/** The lowest order value at which an active shipping rule becomes free (from the real rules). */
export function freeShippingThreshold(rules: ShippingRule[]): number | null {
  const thresholds = rules.filter((r) => r.status && r.type === "min_cost" && Number(r.cost) === 0).map((r) => Number(r.minCost));
  return thresholds.length ? Math.min(...thresholds) : null;
}

interface Props {
  pricing: PricingResult | null;
  rules: ShippingRule[];
  compact?: boolean;
}

export function FreeShippingBar({ pricing, rules, compact }: Props) {
  const threshold = freeShippingThreshold(rules);
  if (!pricing || threshold === null) return null;
  const amount = pricing.subTotal - pricing.discount;
  const remaining = Math.max(0, threshold - amount);
  const pct = Math.min(100, Math.round((amount / threshold) * 100));
  const unlocked = remaining === 0;
  return (
    <div role="status" aria-live="polite" className={`rounded-md border border-sand bg-parchment/60 ${compact ? "p-3" : "p-4"}`}>
      <p className="flex items-center gap-2 text-xs font-medium text-ink sm:text-sm">
        {unlocked ? <PartyPopper className="h-4 w-4 text-success" aria-hidden /> : <Truck className="h-4 w-4 text-gold-dark" aria-hidden />}
        {unlocked ? "You've unlocked free shipping." : `You're ${formatPrice(remaining)} away from free shipping.`}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand" aria-hidden>
        <div className="h-full rounded-full bg-gold transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
