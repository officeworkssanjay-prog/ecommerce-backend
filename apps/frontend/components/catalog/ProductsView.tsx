"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Category, Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { Breadcrumb, CategoryBanner } from "./CategoryBanner";
import { getCategoryContent } from "./category-content";
import { EmptyResults, GridSkeleton, ProductGrid } from "./ProductGrid";
import { ProductFilters } from "./ProductFilters";
import type { FilterUpdates, FilterValues } from "./ProductFilters";
import { SizeStrip } from "./SizeStrip";
import { SubCategoryChips } from "./SubCategoryChips";
import { PAGE_SIZE, useProductList } from "./useProductList";
import { useWishlist } from "./useWishlist";

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "popular", label: "Popularity" },
];

function sizeOptions(products: Product[], selected: string) {
  const found = new Set<string>();
  for (const p of products)
    for (const v of p.variants ?? [])
      if (v.name.trim().toLowerCase() === "size") for (const i of v.items ?? []) if (i.status !== false) found.add(i.name);
  if (selected) found.add(selected);
  return [...found].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Catalogue listing. All filters live in the URL so results are shareable and survive refresh. */
export function ProductsView() {
  const router = useRouter();
  const params = useSearchParams();
  const wishlist = useWishlist();
  const [drawer, setDrawer] = useState(false);

  const values: FilterValues = {
    category: params.get("category") ?? "",
    subCategory: params.get("subCategory") ?? "",
    size: params.get("size") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    sale: params.get("sale") === "true",
    search: params.get("search") ?? "",
  };
  const sort = params.get("sort") ?? "recommended";
  const brand = params.get("brand") ?? "";

  const baseQuery = qs({ ...values, sale: values.sale || undefined, brand, sort });
  const list = useProductList(baseQuery);
  const categories = useApi(async () => (await api.get<Category[]>("/storefront/categories")).data, []);
  const empty = !list.loading && !list.error && list.items.length === 0;
  const bestsellers = useApi(async () => (await api.get<{ products: Product[] }>("/storefront/products?sort=popular&limit=3")).data.products, [], { enabled: empty });

  const category = categories.data?.find((c) => c.slug === values.category);
  const content = getCategoryContent({ category: values.category, categoryName: category?.name, sale: values.sale, search: values.search });
  const image = category?.icon || content.image;
  const subCategories = category?.subCategories?.filter((s) => s.status !== false) ?? [];
  const sizes = sizeOptions(list.items, values.size);

  const update = (updates: FilterUpdates & { sort?: string }) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    // Changing category invalidates a sub-category / size chosen under the old one.
    if (updates.category !== undefined && updates.category !== values.category) {
      if (updates.subCategory === undefined) next.delete("subCategory");
      if (updates.size === undefined) next.delete("size");
    }
    const s = next.toString();
    router.push(s ? `/products?${s}` : "/products", { scroll: false });
  };
  const reset = () => router.push(values.category ? `/products?category=${encodeURIComponent(values.category)}` : "/products", { scroll: false });

  const activeChips: { key: string; label: string; clear: FilterUpdates }[] = [];
  if (values.subCategory) activeChips.push({ key: "sub", label: subCategories.find((s) => s.slug === values.subCategory)?.name ?? values.subCategory, clear: { subCategory: "" } });
  if (values.size) activeChips.push({ key: "size", label: `Size ${values.size}`, clear: { size: "" } });
  if (values.minPrice || values.maxPrice) activeChips.push({ key: "price", label: `₹${values.minPrice || "0"} – ${values.maxPrice ? `₹${values.maxPrice}` : "any"}`, clear: { minPrice: "", maxPrice: "" } });
  if (values.sale) activeChips.push({ key: "sale", label: "On sale", clear: { sale: "" } });
  const hasActive = activeChips.length > 0;

  const filters = (showTitle: boolean) => (
    <ProductFilters values={values} sizes={sizes} subCategories={subCategories} hasActive={hasActive} showTitle={showTitle} onChange={update} onReset={reset} />
  );

  return (
    <>
      <Breadcrumb title={content.title} />
      <CategoryBanner content={content} image={image} />
      {category && subCategories.length > 0 && (
        <SubCategoryChips subCategories={subCategories} selected={values.subCategory} image={image} onSelect={(slug) => update({ subCategory: slug })} />
      )}
      {values.category === "bangles" && <SizeStrip selected={values.size} onSelect={(size) => update({ size })} />}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p role="status" aria-live="polite" className="text-sm text-ink/70">
            {list.initial ? "Loading products…" : `Showing ${list.total} ${list.total === 1 ? "product" : "products"}`}
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="lg:hidden" icon={<SlidersHorizontal className="h-4 w-4" aria-hidden />} onClick={() => setDrawer(true)}>
              Filters
            </Button>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-ink/70">
                Sort by:
              </label>
              <Select id="sort" value={sort} onChange={(e) => update({ sort: e.target.value === "recommended" ? "" : e.target.value })} className="w-48">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside aria-label="Filters" className="hidden lg:block">
            {filters(true)}
          </aside>

          <section aria-label="Products" aria-busy={list.loading}>
            {hasActive && (
              <ul aria-label="Active filters" className="mb-5 flex flex-wrap gap-2">
                {activeChips.map((c) => (
                  <li key={c.key} className="inline-flex items-center gap-1.5 rounded-full bg-parchment px-3 py-1 text-xs font-medium text-gold-dark">
                    {c.label}
                    <button type="button" onClick={() => update(c.clear)} aria-label={`Remove filter ${c.label}`}>
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {list.initial ? (
              <GridSkeleton />
            ) : list.error && list.items.length === 0 ? (
              <ErrorState message={list.error} onRetry={list.reload} />
            ) : empty ? (
              <EmptyResults onReset={reset} bestsellers={bestsellers.data ?? []} wishlist={wishlist} />
            ) : (
              <div className={list.loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <ProductGrid products={list.items} wishlist={wishlist} />
                {list.error && <p role="alert" className="mt-4 text-center text-sm text-danger">{list.error}</p>}
                <div className="mt-10 flex flex-col items-center gap-3">
                  <p className="text-sm text-ink/60">
                    Showing {list.items.length} of {list.total}
                  </p>
                  {list.hasMore && (
                    <Button size="lg" loading={list.moreBusy} onClick={list.loadMore} aria-label={`Load ${PAGE_SIZE} more products`}>
                      Load more
                    </Button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <Modal open={drawer} onClose={() => setDrawer(false)} title="Filters" size="sm" footer={<Button onClick={() => setDrawer(false)}>Show results</Button>}>
        {filters(false)}
      </Modal>
    </>
  );
}
