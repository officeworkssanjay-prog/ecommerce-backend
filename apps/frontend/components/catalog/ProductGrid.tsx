"use client";

import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "./ProductCard";
import type { useWishlist } from "./useWishlist";

type Wishlist = ReturnType<typeof useWishlist>;

export const GRID_CLASS = "grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6";

export function ProductGrid({ products, wishlist }: { products: Product[]; wishlist: Wishlist }) {
  return (
    <ul className={GRID_CLASS}>
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} wishlisted={wishlist.has(p.id)} wishlistBusy={wishlist.busyId === p.id} onToggleWishlist={wishlist.toggle} />
        </li>
      ))}
    </ul>
  );
}

export function GridSkeleton() {
  return (
    <div className={GRID_CLASS} aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/5] animate-pulse bg-parchment motion-reduce:animate-none" />
          <div className="h-4 w-3/4 animate-pulse bg-parchment motion-reduce:animate-none" />
          <div className="h-4 w-1/3 animate-pulse bg-parchment motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}

export function EmptyResults({ onReset, bestsellers, wishlist }: { onReset: () => void; bestsellers: Product[]; wishlist: Wishlist }) {
  return (
    <div className="space-y-10 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-serif text-2xl text-ink">No pieces match these filters</h2>
        <p className="max-w-md text-sm text-ink/60">Try widening your price range or clearing a filter.</p>
        <Button onClick={onReset}>Reset filters</Button>
      </div>
      {bestsellers.length > 0 && (
        <section aria-labelledby="bestsellers-heading" className="space-y-5">
          <h3 id="bestsellers-heading" className="text-center font-serif text-xl text-ink">
            Bestsellers
          </h3>
          <ProductGrid products={bestsellers} wishlist={wishlist} />
        </section>
      )}
    </div>
  );
}
