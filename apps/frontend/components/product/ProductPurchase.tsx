"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, Minus, Plus, Ruler } from "lucide-react";
import type { Product } from "@/lib/types";
import { effectivePrice, formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";
import { useFeedback } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { SizeGuideModal } from "@/components/catalog/SizeGuideModal";
import { activeVariants, discountPercent } from "@/components/catalog/pricing";
import { cn } from "@/lib/cn";

type Selection = NonNullable<CartItem["variants"]>;
const MAX_QTY = 20;

interface Props {
  product: Product;
  wishlisted: boolean;
  wishlistBusy: boolean;
  onToggleWishlist: () => void;
}

/** Price, option pickers, quantity and the add-to-cart / buy-now / wishlist actions (plus the mobile sticky bar). */
export function ProductPurchase({ product, wishlisted, wishlistBusy, onToggleWishlist }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useFeedback();
  const groups = activeVariants(product);
  const [selected, setSelected] = useState<Selection>(() =>
    Object.fromEntries(
      groups.map((g) => {
        const pick = g.items.find((i) => i.isDefault) ?? g.items[0];
        return [g.name, { id: pick.id, name: pick.name, price: pick.price }];
      })
    )
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [guide, setGuide] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const base = effectivePrice(product);
  const variantTotal = Object.values(selected).reduce((sum, v) => sum + Number(v.price), 0);
  const price = base + variantTotal;
  const regular = Number(product.price) + variantTotal;
  const off = discountPercent(product);
  const soldOut = product.qty <= 0;
  const maxQty = Math.max(1, Math.min(MAX_QTY, product.qty));
  // The size guide is a bangle-size chart, so it is offered for bangles only.
  const hasSizeGroup = product.category?.slug === "bangles" && groups.some((g) => /size/i.test(g.name));

  const put = () =>
    addItem({ productId: product.id, name: product.name, slug: product.slug, thumbImage: product.thumbImage, price: base, qty, variantTotal, variants: groups.length ? selected : undefined });

  const addToCart = () => {
    put();
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
    toast.success(`${product.name} added to your cart`);
  };
  const buyNow = () => {
    put();
    router.push("/checkout");
  };

  const addLabel = soldOut ? "Out of stock" : added ? "Added" : "Add to Cart";
  const addIcon = added ? <Check className="h-4 w-4" aria-hidden /> : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-serif text-3xl font-semibold text-ink">{formatPrice(price)}</span>
          {off > 0 && (
            <>
              <span className="text-base text-ink/45 line-through">{formatPrice(regular)}</span>
              <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-semibold text-gold-dark">{off}% off</span>
            </>
          )}
        </p>
        {off > 0 && (
          <p className="text-sm font-medium text-success">
            You save {formatPrice(regular - price)} ({off}%)
          </p>
        )}
        <p className="text-xs text-ink/55">Inclusive of all taxes</p>
        {soldOut ? (
          <p className="pt-1 text-sm font-semibold text-danger">Sold out</p>
        ) : (
          product.qty <= 5 && <p className="pt-1 text-sm font-medium text-gold-dark">Only {product.qty} left</p>
        )}
      </div>

      {groups.map((g) => {
        const isSize = /size/i.test(g.name);
        return (
          <fieldset key={g.id} className="space-y-2">
            <legend className="flex w-full items-center justify-between text-sm">
              <span>
                <span className="font-medium text-ink">{g.name}:</span> <span className="text-ink/70">{selected[g.name]?.name}</span>
              </span>
              {isSize && hasSizeGroup && (
                <button type="button" onClick={() => setGuide(true)} className="inline-flex items-center gap-1 text-xs font-medium text-gold-dark underline underline-offset-2">
                  <Ruler className="h-3.5 w-3.5" aria-hidden /> Size guide
                </button>
              )}
            </legend>
            <div className="flex flex-wrap gap-2">
              {g.items.map((item) => {
                const active = selected[g.name]?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected((prev) => ({ ...prev, [g.name]: { id: item.id, name: item.name, price: item.price } }))}
                    className={cn("min-w-14 border px-4 py-2 text-sm transition-colors", active ? "border-gold bg-parchment font-semibold text-ink" : "border-sand bg-white text-ink/80 hover:border-gold")}
                  >
                    {item.name}
                    {item.price > 0 && <span className="text-xs text-ink/55"> (+{formatPrice(item.price)})</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div className="flex items-center gap-4">
        <span id="qty-label" className="text-sm font-medium text-ink">
          Quantity
        </span>
        <div role="group" aria-labelledby="qty-label" className="flex items-center border border-sand bg-white">
          <button type="button" aria-label="Decrease quantity" disabled={soldOut || qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2.5 text-ink/70 hover:bg-parchment disabled:opacity-40">
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </button>
          <span aria-live="polite" className="min-w-10 px-2 text-center text-sm font-semibold text-ink">
            {qty}
          </span>
          <button type="button" aria-label="Increase quantity" disabled={soldOut || qty >= maxQty} onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="px-3 py-2.5 text-ink/70 hover:bg-parchment disabled:opacity-40">
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
        {!soldOut && qty >= maxQty && <span className="text-xs text-ink/55">Maximum for this order</span>}
      </div>

      <div className="flex gap-3">
        <Button size="lg" variant="dark" className="flex-1" onClick={addToCart} disabled={soldOut} icon={addIcon}>
          {addLabel}
        </Button>
        <Button size="lg" className="flex-1" onClick={buyNow} disabled={soldOut}>
          Buy Now
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-12 shrink-0 !px-0"
          aria-pressed={wishlisted}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          loading={wishlistBusy}
          onClick={onToggleWishlist}
          icon={<Heart className={cn("h-5 w-5", wishlisted && "fill-danger text-danger")} aria-hidden />}
        />
      </div>
      <p role="status" className="sr-only">
        {added ? `${product.name} added to your cart` : ""}
      </p>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-sand bg-white px-4 py-3 lg:hidden">
        <span className="font-serif text-lg font-semibold text-ink">{formatPrice(price)}</span>
        <Button className="flex-1" variant="dark" onClick={addToCart} disabled={soldOut} icon={addIcon}>
          {addLabel}
        </Button>
        <Button className="flex-1" onClick={buyNow} disabled={soldOut}>
          Buy Now
        </Button>
      </div>

      {hasSizeGroup && <SizeGuideModal open={guide} onClose={() => setGuide(false)} />}
    </div>
  );
}
