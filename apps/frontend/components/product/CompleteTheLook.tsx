"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { effectivePrice, formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useFeedback } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { needsOptions } from "@/components/catalog/pricing";

/** Dark "Complete the Look" band: the current piece plus a few companions that can be added in one go. */
export function CompleteTheLook({ current, companions }: { current: Product; companions: Product[] }) {
  const { addItem } = useCart();
  const { toast } = useFeedback();
  // Pieces that need an option chosen can't be bulk-added, so they are only linked.
  const items = [current, ...companions].slice(0, 3);
  const addable = (p: Product) => p.qty > 0 && !needsOptions(p);
  const [checked, setChecked] = useState<Set<string>>(() => new Set(items.filter(addable).map((p) => p.id)));

  if (companions.length === 0) return null;

  const picked = items.filter((p) => checked.has(p.id));
  const total = picked.reduce((s, p) => s + effectivePrice(p), 0);

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addAll = () => {
    picked.forEach((p) => addItem({ productId: p.id, name: p.name, slug: p.slug, thumbImage: p.thumbImage, price: effectivePrice(p), qty: 1, variantTotal: 0 }));
    toast.success(`${picked.length} ${picked.length === 1 ? "piece" : "pieces"} added to your cart`);
  };

  return (
    <section aria-labelledby="look-heading" className="bg-ink-deep py-14 text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <ul className="grid grid-cols-3 gap-3">
          {items.map((p) => (
            <li key={p.id} className="aspect-[4/5] overflow-hidden bg-ink-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumbImage} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
            </li>
          ))}
        </ul>
        <div className="space-y-5">
          <header>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">Better together</p>
            <h2 id="look-heading" className="mt-2 font-serif text-3xl">
              Complete the Look
            </h2>
            <p className="mt-2 text-sm text-cream/70">Timeless pieces, styled as one.</p>
          </header>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {items.map((p) => {
              const ok = addable(p);
              return (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    id={`look-${p.id}`}
                    checked={checked.has(p.id)}
                    disabled={!ok}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4 accent-gold"
                  />
                  <label htmlFor={`look-${p.id}`} className="flex-1 text-sm">
                    {p.name}
                    {!ok && <span className="block text-xs text-cream/55">{p.qty <= 0 ? "Sold out" : "Choose options on its page"}</span>}
                  </label>
                  {p.id !== current.id && (
                    <Link href={`/products/${p.slug}`} className="text-xs text-gold underline underline-offset-2">
                      View
                    </Link>
                  )}
                  <span className="text-sm font-semibold">{formatPrice(effectivePrice(p))}</span>
                </li>
              );
            })}
          </ul>
          <p className="flex justify-between text-sm">
            <span>Complete look total</span>
            <span className="font-serif text-xl text-gold">{formatPrice(total)}</span>
          </p>
          <Button size="lg" className="w-full" disabled={picked.length === 0} onClick={addAll}>
            Add All · {formatPrice(total)}
          </Button>
        </div>
      </div>
    </section>
  );
}
