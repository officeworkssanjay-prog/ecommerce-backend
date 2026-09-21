"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import {
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") || "");
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fallback sample jewellery products
  const defaultJewellery = [
    {
      id: "jewel-1",
      name: "18K Gold Royal Kundan Choker with Zambian Emeralds",
      slug: "royal-kundan-choker-emerald-droplets",
      price: 2450,
      offerPrice: 2190,
      thumbImage:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      rating: 5,
      reviewsCount: 42,
      category: { name: "Bridal Sets", slug: "bridal-sets" },
      shortDescription:
        "Handcrafted in 22K/18K yellow gold with natural uncut polki diamonds and hand-carved emerald beads.",
    },
    {
      id: "jewel-2",
      name: "1.50 Ct VVS1 Solitaire Diamond Ring in Platinum",
      slug: "solitaire-diamond-ring-platinum-band",
      price: 3800,
      offerPrice: 3450,
      thumbImage:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
      rating: 4.9,
      reviewsCount: 38,
      category: { name: "Diamond Rings", slug: "diamond-rings" },
      shortDescription:
        "GIA certified conflict-free solitaire diamond mounted on an 950 pure platinum cathedral setting.",
    },
    {
      id: "jewel-3",
      name: "22K Solid Gold Antique Temple Nakshi Bangles (Pair)",
      slug: "antique-nakshi-temple-gold-bangles",
      price: 1950,
      offerPrice: null,
      thumbImage:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
      rating: 5,
      reviewsCount: 29,
      category: { name: "Bangles & Kadas", slug: "bangles-kadas" },
      shortDescription:
        "Traditional South Indian temple design handcrafted by master goldsmiths in South Karnataka.",
    },
    {
      id: "jewel-4",
      name: "Heritage Uncut Diamond Polki Chandbali Jhumkas",
      slug: "heritage-uncut-diamond-polki-chandbali-jhumkas",
      price: 1350,
      offerPrice: 1190,
      thumbImage:
        "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80",
      rating: 5,
      reviewsCount: 56,
      category: { name: "Polki & Jhumkas", slug: "polki-jhumkas" },
      shortDescription:
        "Royal Jaipur polki work with freshwater south sea pearls and enamel meenakari detailing on the reverse.",
    },
    {
      id: "jewel-5",
      name: "Natural Burmese Ruby & Diamond Halo Pendant",
      slug: "natural-burmese-ruby-diamond-halo-pendant",
      price: 1620,
      offerPrice: 1480,
      thumbImage:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
      rating: 4.8,
      reviewsCount: 24,
      category: { name: "Gemstone Pendants", slug: "gemstone-pendants" },
      shortDescription:
        "Pigeon blood red untreated natural ruby surrounded by brilliant round cut diamonds on 18K white gold.",
    },
    {
      id: "jewel-6",
      name: "Bridal Jadau Choker with South Sea Basra Pearls",
      slug: "bridal-jadau-choker-south-sea-pearls",
      price: 4200,
      offerPrice: 3850,
      thumbImage:
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80",
      rating: 5,
      reviewsCount: 31,
      category: { name: "Bridal Sets", slug: "bridal-sets" },
      shortDescription:
        "Exquisite bridal masterpiece designed for royal wedding ensembles, paired with matching statement earrings.",
    },
  ];

  const defaultCategories = [
    { name: "Bridal Sets", slug: "bridal-sets", count: 74 },
    { name: "Diamond Rings", slug: "diamond-rings", count: 112 },
    { name: "Gold Necklaces", slug: "gold-necklaces", count: 85 },
    { name: "Polki & Jhumkas", slug: "polki-jhumkas", count: 68 },
    { name: "Bangles & Kadas", slug: "bangles-kadas", count: 54 },
    { name: "Gemstone Pendants", slug: "gemstone-pendants", count: 46 },
  ];

  // Fetch catalog from backend API
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (currentCategory) query.set("category", currentCategory);
        if (currentSearch) query.set("search", currentSearch);
        if (currentSort) query.set("sort", currentSort);
        if (minPrice) query.set("minPrice", minPrice);
        if (maxPrice) query.set("maxPrice", maxPrice);
        query.set("page", String(currentPage));
        query.set("limit", "12");

        const [prodRes, catRes] = await Promise.all([
          api.get(`/storefront/products?${query.toString()}`),
          api.get("/storefront/categories"),
        ]);

        if (prodRes.success && prodRes.data?.products?.length > 0) {
          setProducts(prodRes.data.products);
          setTotalPages(prodRes.data.pagination?.totalPages || 1);
          setTotalCount(prodRes.data.pagination?.total || prodRes.data.products.length);
        } else {
          // Filter fallback based on category or search
          let filtered = [...defaultJewellery];
          if (currentCategory) {
            filtered = filtered.filter(
              (p) =>
                p.category?.slug === currentCategory ||
                p.category?.name.toLowerCase() === currentCategory.toLowerCase()
            );
          }
          if (currentSearch) {
            filtered = filtered.filter(
              (p) =>
                p.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
                p.shortDescription.toLowerCase().includes(currentSearch.toLowerCase())
            );
          }
          if (currentSort === "price_low") {
            filtered.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
          } else if (currentSort === "price_high") {
            filtered.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
          }
          setProducts(filtered);
          setTotalPages(1);
          setTotalCount(filtered.length);
        }

        if (catRes.success && catRes.data?.length > 0) {
          setCategories(catRes.data);
        } else {
          setCategories(defaultCategories);
        }
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts(defaultJewellery);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // reset to page 1
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
    setMobileFilterOpen(false);
  };

  const clearAllFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push("/products");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 mb-10 border border-amber-800/30 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Handcrafted Royal Vault
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            High Jewellery & Heritage Vault
          </h1>
          <p className="text-sm text-amber-100/70 leading-relaxed">
            Discover bespoke diamond solitaires, bridal kundan collections, and 22K hallmarked gold
            heirlooms handcrafted by certified artisan guilds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 2. Desktop Filters Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Refine Selection
              </span>
              {(currentCategory || currentSearch || searchParams.get("minPrice") || searchParams.get("maxPrice")) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Jewellery Category
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter("category", "")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    !currentCategory
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  All Jewellery Vault
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.slug || cat.name}
                    onClick={() => updateFilter("category", cat.slug || cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      currentCategory === (cat.slug || cat.name)
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.count && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {cat.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Price Range (USD)
              </h3>
              <form onSubmit={handlePriceApply} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ($)"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    placeholder="Max ($)"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
                >
                  Apply Price
                </button>
              </form>
            </div>

            {/* Hallmarking Trust Badge */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Guaranteed Authenticity
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/70 leading-relaxed">
                Every creation comes with laser BIS hallmark stamp, IGI diamond certificates, and
                luxury presentation casing.
              </p>
            </div>
          </div>
        </aside>

        {/* 3. Products Listing Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold flex items-center gap-2"
              >
                <Filter className="w-4 h-4 text-amber-600" />
                Filters
              </button>

              <span className="text-xs text-zinc-500">
                Showing <strong className="text-zinc-900 dark:text-zinc-100">{products.length}</strong> of {totalCount} items
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 hidden sm:inline">Sort by:</span>
                <select
                  value={currentSort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="newest">Newest Additions</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Pills */}
          {(currentCategory || currentSearch) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400">Active:</span>
              {currentCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-medium">
                  Category: {currentCategory}
                  <button onClick={() => updateFilter("category", "")}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {currentSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                  Search: "{currentSearch}"
                  <button onClick={() => updateFilter("search", "")}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid or List */}
          {products.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No matching jewellery found
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                Try adjusting your search criteria or resetting filters to browse our full vault.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={prod.thumbImage || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {prod.offerPrice && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-xs">
                        Special Offer
                      </span>
                    )}
                    <button
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-600 dark:text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Save to Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">
                        {prod.category?.name || "Fine Jewellery"}
                      </span>
                      <Link href={`/products/${prod.slug}`}>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1 line-clamp-2 hover:text-amber-600 transition-colors">
                          {prod.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-xs text-zinc-400">({prod.reviewsCount || 18})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div>
                        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          ${(prod.offerPrice || prod.price).toFixed(2)}
                        </span>
                        {prod.offerPrice && (
                          <span className="text-xs text-zinc-400 line-through ml-2">
                            ${prod.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          addItem({
                            productId: prod.id,
                            name: prod.name,
                            slug: prod.slug,
                            price: prod.offerPrice || prod.price,
                            thumbImage: prod.thumbImage,
                            qty: 1,
                            variantTotal: 0,
                          })
                        }
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View Mode */
            <div className="space-y-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row gap-5 items-center hover:shadow-lg transition-all"
                >
                  <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                    <img
                      src={prod.thumbImage || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">
                      {prod.category?.name || "Fine Jewellery"}
                    </span>
                    <Link href={`/products/${prod.slug}`}>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-amber-600 transition-colors">
                        {prod.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {prod.shortDescription || "Handcrafted master jewel featuring exquisite artisanal detail."}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-400">({prod.reviewsCount || 18})</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between self-stretch pt-2 sm:pt-0 sm:border-l border-zinc-100 dark:border-zinc-800 sm:pl-6">
                    <div>
                      <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        ${(prod.offerPrice || prod.price).toFixed(2)}
                      </span>
                      {prod.offerPrice && (
                        <p className="text-xs text-zinc-400 line-through">
                          ${prod.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        addItem({
                          productId: prod.id,
                          name: prod.name,
                          slug: prod.slug,
                          price: prod.offerPrice || prod.price,
                          thumbImage: prod.thumbImage,
                          qty: 1,
                          variantTotal: 0,
                        })
                      }
                      className="mt-4 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={currentPage <= 1}
                onClick={() => updateFilter("page", String(currentPage - 1))}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilter("page", String(i + 1))}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${
                    currentPage === i + 1
                      ? "bg-amber-600 text-white"
                      : "border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => updateFilter("page", String(currentPage + 1))}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-out Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white dark:bg-zinc-900 p-6 shadow-xl flex flex-col space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Filters</span>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase">Categories</h4>
                {categories.map((cat: any) => (
                  <button
                    key={cat.slug || cat.name}
                    onClick={() => {
                      updateFilter("category", cat.slug || cat.name);
                      setMobileFilterOpen(false);
                    }}
                    className="w-full text-left py-1.5 text-xs text-zinc-700 dark:text-zinc-300"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Close / Apply */}
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-amber-600 text-white text-xs font-bold mt-auto"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-sm text-zinc-400">Loading fine jewellery vault...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
