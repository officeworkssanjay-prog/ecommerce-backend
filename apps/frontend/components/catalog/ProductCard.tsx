"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product, ProductType } from "@/lib/types";
import { formatPrice, effectivePrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useFeedback } from "@/components/ui/Feedback";
import { cn } from "@/lib/cn";
import { defaultSelection, discountPercent, needsOptions } from "./pricing";

interface ProductCardProps {
  product: Product;
  /** Overrides the corner pill; defaults to the product type label. */
  badge?: string;
  wishlisted?: boolean;
  wishlistBusy?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

const TYPE_LABELS: Record<ProductType, string> = {
  BEST_PRODUCT: "Bestseller",
  NEW_ARRIVAL: "New",
  FEATURED_PRODUCT: "Featured",
  TOP_PRODUCT: "Top pick",
};

const buttonClass =
  "flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink/50";

export function ProductCard({ product, badge, wishlisted, wishlistBusy, onToggleWishlist }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useFeedback();
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const soldOut = product.qty <= 0;
  const options = needsOptions(product);
  const label = badge ?? (product.productType ? TYPE_LABELS[product.productType] : undefined);
  const href = `/products/${product.slug}`;

  const handleAdd = () => {
    addItem({ productId: product.id, name: product.name, slug: product.slug, thumbImage: product.thumbImage, price, qty: 1, ...defaultSelection(product) });
    toast.success(`${product.name} added to your bag`);
  };

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
        <Link href={href} tabIndex={-1} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbImage}
            alt=""
            loading="lazy"
            className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none", soldOut && "opacity-60")}
          />
        </Link>
        {label && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-white">{label}</span>}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            disabled={wishlistBusy}
            aria-pressed={!!wishlisted}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/70 shadow-md transition-colors hover:text-danger disabled:opacity-50"
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-danger text-danger")} aria-hidden />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 py-3">
        <Link href={href}>
          <h3 className="line-clamp-2 text-sm text-ink transition-colors hover:text-gold-dark">{product.name}</h3>
        </Link>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-bold text-ink">{formatPrice(price)}</span>
          {off > 0 && (
            <>
              <span className="text-xs text-ink/45 line-through">{formatPrice(product.price)}</span>
              <span className="text-xs font-medium text-success">{off}% off</span>
            </>
          )}
        </p>
      </div>

      {soldOut ? (
        <button type="button" disabled className={buttonClass}>
          Out of stock
        </button>
      ) : options ? (
        <Link href={href} className={buttonClass}>
          Select options
        </Link>
      ) : (
        <button type="button" onClick={handleAdd} className={buttonClass}>
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Add to Cart
        </button>
      )}
    </article>
  );
}
