"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Pagination, Product, ProductType } from "@/lib/types";
import { ErrorState, PageLoader } from "@/components/ui/States";
import { buttonClasses } from "@/components/ui/Button";
import { StarRating } from "@/components/catalog/StarRating";
import { useWishlist } from "@/components/catalog/useWishlist";
import { discountPercent } from "@/components/catalog/pricing";
import { ProductGallery } from "./ProductGallery";
import { ProductPurchase } from "./ProductPurchase";
import { ProductAccordions } from "./ProductAccordions";
import { ReviewsSection } from "./ReviewsSection";
import { CompleteTheLook } from "./CompleteTheLook";
import { RecentlyViewed, RelatedProducts } from "./ProductStrips";

const TYPE_LABELS: Partial<Record<ProductType, string>> = { BEST_PRODUCT: "Bestseller", NEW_ARRIVAL: "New", FEATURED_PRODUCT: "Featured", TOP_PRODUCT: "Top pick" };

export function ProductDetail({ slug }: { slug: string }) {
  const { data: product, loading, error, message, reload } = useApi(async () => (await api.get<Product>(`/storefront/products/${encodeURIComponent(slug)}`)).data, [slug]);
  const categorySlug = product?.category?.slug;
  const { data: others } = useApi(
    async () => {
      const res = await api.get<{ products: Product[]; pagination: Pagination }>(`/storefront/products?category=${encodeURIComponent(categorySlug ?? "")}&sort=popular&limit=12`);
      return res.data.products;
    },
    [categorySlug, product?.id],
    { enabled: !!product && !!categorySlug }
  );
  const wishlist = useWishlist();

  if (loading && !product) return <PageLoader label="Loading product…" className="min-h-[60vh]" />;
  if (error || !product) {
    return error?.isNotFound ? (
      <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="font-serif text-2xl text-ink">Product not found</h1>
        <p className="max-w-md text-sm text-ink/60">{message}</p>
        <Link href="/products" className={buttonClasses("primary", "md")}>
          Browse all jewellery
        </Link>
      </div>
    ) : (
      <ErrorState message={message} onRetry={reload} />
    );
  }

  const reviews = product.reviews ?? [];
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const pool = (others ?? []).filter((p) => p.id !== product.id);
  const related = pool.slice(0, 4);
  const companions = (pool.length >= 6 ? pool.slice(4, 6) : pool.slice(0, 2)).slice(0, 2);
  const label = product.productType ? TYPE_LABELS[product.productType] : undefined;
  const off = discountPercent(product);
  const toggleWishlist = () => wishlist.toggle(product.id);

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink/55">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <Link href={`/products?category=${product.category.slug ?? ""}`} className="hover:text-ink">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span aria-current="page" className="font-medium text-ink">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery
            name={product.name}
            thumbImage={product.thumbImage}
            gallery={product.imageGallery ?? []}
            videoLink={product.videoLink}
            badge={label ?? (off > 0 ? `${off}% off` : undefined)}
            wishlisted={wishlist.has(product.id)}
            wishlistBusy={wishlist.busyId === product.id}
            onToggleWishlist={toggleWishlist}
          />
          <div className="space-y-6">
            <header className="space-y-2">
              {product.category?.name && <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-dark">{product.category.name}</p>}
              <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">{product.name}</h1>
              {product.shortDescription && <p className="text-sm leading-relaxed text-ink/70">{product.shortDescription}</p>}
              {reviews.length > 0 && (
                <a href="#reviews" className="flex items-center gap-2 pt-1 text-sm text-ink/70 hover:text-ink">
                  <StarRating value={average} />
                  <span>
                    {average.toFixed(1)} / {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </a>
              )}
            </header>
            <ProductPurchase key={product.id} product={product} wishlisted={wishlist.has(product.id)} wishlistBusy={wishlist.busyId === product.id} onToggleWishlist={toggleWishlist} />
            <ProductAccordions product={product} />
          </div>
        </div>
      </div>

      <CompleteTheLook key={product.id + companions.map((c) => c.id).join()} current={product} companions={companions} />
      <ReviewsSection productId={product.id} reviews={reviews} />
      <RelatedProducts products={related} wishlist={wishlist} />
      <RecentlyViewed currentSlug={product.slug} />
    </div>
  );
}
