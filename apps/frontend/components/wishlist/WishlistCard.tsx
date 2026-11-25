import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { effectivePrice, formatPrice } from "@/lib/format";
import { Button, buttonClasses } from "@/components/ui/Button";
import { discountPercent, needsOptions } from "@/components/catalog/pricing";

interface Props {
  product: Product;
  removing: boolean;
  onRemove: () => void;
  onAdd: () => void;
}

export function WishlistCard({ product: p, removing, onRemove, onAdd }: Props) {
  const soldOut = p.qty <= 0 || !p.status;
  const price = effectivePrice(p);
  const off = discountPercent(p);
  return (
    <li className="flex flex-col overflow-hidden rounded-sm border border-sand bg-white">
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-[11px] text-ink/60">Saved to your wishlist</span>
        <Button size="sm" variant="ghost" loading={removing} aria-label={`Remove ${p.name} from wishlist`} onClick={onRemove}>
          <Heart className="h-4 w-4 fill-gold text-gold-dark" aria-hidden />
        </Button>
      </div>
      <Link href={`/products/${p.slug}`} className="block aspect-square overflow-hidden bg-parchment">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.thumbImage} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <Link href={`/products/${p.slug}`} className="font-serif text-lg text-ink hover:text-gold-dark">
            {p.name}
          </Link>
          <p className="flex flex-wrap items-baseline gap-2 text-sm">
            <span className="font-bold text-ink">{formatPrice(price)}</span>
            {off > 0 && (
              <>
                <span className="text-xs text-ink/50 line-through">{formatPrice(p.price)}</span>
                <span className="rounded-sm bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold text-success">{off}% off</span>
              </>
            )}
          </p>
          {soldOut && <p className="text-xs font-semibold text-danger">Sold out</p>}
        </div>
        <div className="mt-auto">
          {!soldOut && needsOptions(p) ? (
            <Link href={`/products/${p.slug}`} className={buttonClasses("dark", "md", "w-full")}>
              Select options
            </Link>
          ) : (
            <Button variant="dark" className="w-full" disabled={soldOut} icon={<ShoppingBag className="h-4 w-4" aria-hidden />} onClick={onAdd}>
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
