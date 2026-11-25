"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { effectivePrice, formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/catalog/ProductCard";
import { useRecentlyViewed } from "./useRecentlyViewed";

interface WishlistApi {
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  busyId: string | null;
}

/** "You may also like" grid of real products; renders nothing when there are none. */
export function RelatedProducts({ products, wishlist }: { products: Product[]; wishlist: WishlistApi }) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-dark">Curated for you</p>
      <h2 id="related-heading" className="mt-2 font-serif text-3xl text-ink">
        You may also like
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} wishlisted={wishlist.has(p.id)} wishlistBusy={wishlist.busyId === p.id} onToggleWishlist={wishlist.toggle} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Products viewed earlier on this device (localStorage), loaded by slug; hidden while empty. */
export function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const slugs = useRecentlyViewed(currentSlug);
  const { data } = useApi(
    async () => {
      const results = await Promise.allSettled(slugs.map((s) => api.get<Product>(`/storefront/products/${encodeURIComponent(s)}`)));
      return results.flatMap((r) => (r.status === "fulfilled" ? [r.value.data] : []));
    },
    [slugs.join(",")],
    { enabled: slugs.length > 0 }
  );
  const products = slugs.length > 0 ? (data ?? []) : [];
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <h2 id="recent-heading" className="font-serif text-2xl text-ink">
        Recently viewed
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/products/${p.slug}`} className="group block">
              <span className="block aspect-[4/5] overflow-hidden bg-parchment">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbImage} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
              </span>
              <span className="mt-2 line-clamp-1 block text-sm text-ink group-hover:text-gold-dark">{p.name}</span>
              <span className="block text-sm font-semibold text-ink">{formatPrice(effectivePrice(p))}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
