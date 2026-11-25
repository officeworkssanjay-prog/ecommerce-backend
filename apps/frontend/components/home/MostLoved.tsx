"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product, ProductType } from "@/lib/types";
import { effectivePrice, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useCart } from "@/context/CartContext";
import { useFeedback } from "@/components/ui/Feedback";
import { useWishlist } from "@/components/catalog/useWishlist";
import { defaultSelection, discountPercent, needsOptions } from "@/components/catalog/pricing";
import { SectionHeading, sectionWidth } from "./SectionHeading";

const typeLabels: Record<ProductType, string> = {
  BEST_PRODUCT: "Bestseller",
  NEW_ARRIVAL: "New",
  FEATURED_PRODUCT: "Featured",
  TOP_PRODUCT: "Top pick",
};

function badgeFor(p: Product): string | null {
  if (p.category?.slug === "bridal-sets") return "Bridal";
  return p.productType ? typeLabels[p.productType] : null;
}

const cta = "mt-4 flex w-full items-center justify-center rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-ink-deep";

function LovedCard({ product, wishlisted, busy, onToggle }: { product: Product; wishlisted: boolean; busy: boolean; onToggle: (id: string) => void }) {
  const { addItem } = useCart();
  const { toast } = useFeedback();
  const price = effectivePrice(product);
  const onOffer = discountPercent(product) > 0;
  const badge = badgeFor(product);
  const href = `/products/${product.slug}`;

  const add = () => {
    addItem({ productId: product.id, name: product.name, slug: product.slug, thumbImage: product.thumbImage, price, qty: 1, ...defaultSelection(product) });
    toast.success(`${product.name} added to your bag`);
  };

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-parchment">
        <Link href={href} tabIndex={-1} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.thumbImage} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>
        {badge && <span className="absolute left-3 top-3 rounded-md bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">{badge}</span>}
        <button
          type="button"
          onClick={() => onToggle(product.id)}
          disabled={busy}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/70 shadow-md transition-colors hover:text-danger disabled:opacity-50"
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-danger text-danger")} aria-hidden />
        </button>
      </div>
      <Link href={href} className="mt-4 line-clamp-2 text-sm font-medium text-ink hover:text-gold-dark">
        {product.name}
      </Link>
      <p className="mt-1">
        <span className="text-base font-bold text-ink">{formatPrice(price)}</span>
        {onOffer && <span className="ml-2 text-sm text-ink/40 line-through">{formatPrice(product.price)}</span>}
      </p>
      {product.qty <= 0 ? (
        <span className={cn(cta, "cursor-not-allowed bg-sand text-ink/60 hover:bg-sand hover:text-ink/60")}>Sold out</span>
      ) : needsOptions(product) ? (
        <Link href={href} className={cta}>
          Select options
        </Link>
      ) : (
        <button type="button" onClick={add} className={cta}>
          Add to Cart
        </button>
      )}
    </article>
  );
}

export function MostLoved({ products }: { products: Product[] }) {
  const wishlist = useWishlist();
  if (products.length === 0) return null;
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className={sectionWidth}>
        <SectionHeading eyebrow="BESTSELLERS" title="Most loved" linkHref="/products?sort=popular" linkLabel="View all" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <LovedCard key={p.id} product={p} wishlisted={wishlist.has(p.id)} busy={wishlist.busyId === p.id} onToggle={wishlist.toggle} />
          ))}
        </div>
      </div>
    </section>
  );
}
