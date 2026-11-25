"use client";

import Link from "next/link";
import { Clock, Flame } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { FlashSale } from "@/lib/types";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/States";
import { CountdownDials } from "@/components/catalog/CountdownDials";
import { ProductCard } from "@/components/catalog/ProductCard";
import { useCountdown } from "@/components/catalog/useCountdown";
import { useWishlist } from "@/components/catalog/useWishlist";

function FlashSaleContent({ sale }: { sale: FlashSale }) {
  const time = useCountdown(sale.endDate);
  const wishlist = useWishlist();
  const products = sale.products.filter((p) => p.status !== false).map((p) => p.product);

  if (time.expired) return <NoSale />;

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-gold-dark/40 bg-gradient-to-r from-gold-dark via-ink to-ink-deep p-8 text-white shadow-2xl sm:p-14">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="max-w-xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <Flame className="h-4 w-4 fill-current" aria-hidden /> Flash Sale
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Exclusive Jewellery at Exceptional Prices</h1>
            <p className="text-sm leading-relaxed text-white/70">Limited-time offers on handpicked pieces. Prices revert when the timer ends.</p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gold-light">
              <Clock className="h-3.5 w-3.5" aria-hidden /> Sale Closes In
            </span>
            <CountdownDials time={time} size="lg" />
          </div>
        </div>
      </div>

      <section className="space-y-6" aria-labelledby="offers-heading">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="offers-heading" className="font-serif text-2xl font-bold tracking-tight text-ink">
              Featured Flash Offers
            </h2>
            <p className="text-xs text-ink/55">While stocks last</p>
          </div>
          <span className="rounded-full bg-parchment px-3 py-1 text-xs font-semibold text-gold-dark">
            {products.length} {products.length === 1 ? "item" : "items"} on sale
          </span>
        </div>
        {products.length === 0 ? (
          <EmptyState title="No products in this sale yet" description="Check back soon, new offers are added regularly." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} wishlisted={wishlist.has(p.id)} wishlistBusy={wishlist.busyId === p.id} onToggleWishlist={wishlist.toggle} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function NoSale() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <EmptyState
        icon={<Flame className="h-10 w-10" aria-hidden />}
        title="No flash sale is running right now"
        description="Our next sale will be announced soon. Meanwhile, explore the full collection."
        action={
          <Link href="/products" className={buttonClasses("primary", "md")}>
            Shop all jewellery
          </Link>
        }
      />
    </div>
  );
}

export default function FlashSalePage() {
  const { data, loading, message, error, reload } = useApi(async () => (await api.get<FlashSale | null>("/storefront/flash-sale")).data);

  if (loading && data === null && !error) return <PageLoader label="Loading flash sale…" className="min-h-[60vh]" />;
  if (error) return <ErrorState message={message} onRetry={reload} />;
  if (!data) return <NoSale />;
  return <FlashSaleContent sale={data} />;
}
