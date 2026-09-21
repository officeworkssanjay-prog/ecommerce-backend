"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import {
  Sparkles,
  Zap,
  ShoppingBag,
  ArrowRight,
  Star,
  Flame,
  ChevronRight,
  TrendingUp,
  Tag,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  const { addItem } = useCart();
  const [homeData, setHomeData] = useState<{
    sliders?: any[];
    categories?: any[];
    flashSale?: any;
    brands?: any[];
    newArrivals?: any[];
    featuredProducts?: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeSliderIndex, setActiveSliderIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    async function loadHome() {
      try {
        const res = await api.get("/storefront/home");
        if (res.success && res.data) {
          setHomeData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch home data", err);
      } finally {
        setLoading(false);
      }
    }
    loadHome();
  }, []);

  // Flash Sale countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance sliders
  useEffect(() => {
    if (!homeData?.sliders || homeData.sliders.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSliderIndex((prev) => (prev + 1) % homeData.sliders!.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [homeData?.sliders]);

  // Fallback defaults for instant wow aesthetic
  const defaultSliders = [
    {
      title: "Royal Heritage Kundan & Polki Sets",
      type: "Bridal Couture Collection",
      startingPrice: 1250,
      btnUrl: "/products",
      banner:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Certified Solitaire Diamond Rings",
      type: "Eternal Diamonds",
      startingPrice: 890,
      btnUrl: "/products",
      banner:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "22K Solid Gold Handcrafted Bangles",
      type: "Temple & Antique Gold",
      startingPrice: 1450,
      btnUrl: "/products",
      banner:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  const sliders = homeData?.sliders?.length ? homeData.sliders : defaultSliders;
  const currentSlide = sliders[activeSliderIndex] || sliders[0];

  const sampleCategories = [
    { name: "Bridal Sets", icon: "👑", count: 74, slug: "bridal-sets" },
    { name: "Diamond Rings", icon: "💍", count: 112, slug: "diamond-rings" },
    { name: "Gold Necklaces", icon: "✨", count: 85, slug: "gold-necklaces" },
    { name: "Polki & Jhumkas", icon: "💎", count: 68, slug: "polki-jhumkas" },
    { name: "Bangles & Kadas", icon: "💫", count: 54, slug: "bangles-kadas" },
    { name: "Gemstone Pendants", icon: "🔮", count: 46, slug: "gemstone-pendants" },
  ];

  const categories = homeData?.categories?.length ? homeData.categories : sampleCategories;

  const sampleProducts = [
    {
      id: "jewel-1",
      name: "18K Gold Royal Kundan Choker with Emerald Droplets",
      slug: "royal-kundan-choker-emerald-droplets",
      price: 2450,
      offerPrice: 2190,
      thumbImage:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      rating: 5,
      reviewsCount: 42,
      category: { name: "Bridal Sets" },
    },
    {
      id: "jewel-2",
      name: "1.5 Carat VVS1 Certified Solitaire Diamond Ring",
      slug: "solitaire-diamond-ring-platinum-band",
      price: 3800,
      offerPrice: 3450,
      thumbImage:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
      rating: 4.9,
      reviewsCount: 38,
      category: { name: "Diamond Rings" },
    },
    {
      id: "jewel-3",
      name: "22K Antique Nakshi Temple Gold Bangles (Pair)",
      slug: "antique-nakshi-temple-gold-bangles",
      price: 1950,
      offerPrice: null,
      thumbImage:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
      rating: 5,
      reviewsCount: 29,
      category: { name: "Bangles & Kadas" },
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
      category: { name: "Polki & Jhumkas" },
    },
  ];

  const featured = homeData?.featuredProducts?.length
    ? homeData.featuredProducts
    : sampleProducts;
  const newArrivals = homeData?.newArrivals?.length ? homeData.newArrivals : sampleProducts;

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* 1. Hero Carousel */}
      <section className="relative overflow-hidden bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                {currentSlide.type || "Artisan Masterpiece"}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                {currentSlide.title}
              </h1>

              <p className="text-zinc-400 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Connect directly with heritage craftspersons and discover museum-grade sculptures,
                hand-carved relics, and divine idols designed to sanctify your spaces.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={currentSlide.btnUrl || "/products"}
                  className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-300">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs">
                    Starting from{" "}
                    <strong className="text-white text-sm">
                      ${currentSlide.startingPrice || 89}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Media Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-square shadow-2xl border border-zinc-800/80 group">
                <img
                  src={currentSlide.banner}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                      Authenticity Assured
                    </span>
                    <h4 className="text-sm font-semibold text-white">Direct Artisan Certification</h4>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              {/* Slider Dots */}
              {sliders.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {sliders.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSliderIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        activeSliderIndex === i ? "w-8 bg-indigo-500" : "w-2 bg-zinc-700 hover:bg-zinc-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Curated Disciplines
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Explore by Craft & Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            All Categories <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat: any, idx: number) => (
            <Link
              key={cat.slug || idx}
              href={`/products?category=${cat.slug || cat.name}`}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all group flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {cat.icon || "🎨"}
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                {cat.subCategories ? `${cat.subCategories.length} sub-tiers` : "Explore craft"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale Urgency Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-white" /> Limited Time Flash Sale
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Up to 40% Off Heritage Artifacts
              </h3>
              <p className="text-white/80 text-sm max-w-md">
                Strictly limited quantities crafted by certified heritage guilds. Prices revert once timer expires.
              </p>
            </div>

            {/* Countdown Clocks */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10">
                <span className="text-xl font-bold font-mono">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase text-white/70">Hours</span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10">
                <span className="text-xl font-bold font-mono">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase text-white/70">Mins</span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10">
                <span className="text-xl font-bold font-mono">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase text-white/70">Secs</span>
              </div>

              <Link
                href="/flash-sale"
                className="ml-4 px-6 py-3 rounded-2xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-100 shadow-md transition-all whitespace-nowrap"
              >
                View Flash Sale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Product Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Top Selections
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Featured Artworks
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All ({featured.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((prod: any) => (
            <div
              key={prod.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col"
            >
              {/* Image & Badges */}
              <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={prod.thumbImage || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600"}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {prod.offerPrice && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-xs">
                    Save ${Number(prod.price - prod.offerPrice).toFixed(0)}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                    {prod.category?.name || "Handcrafted"}
                  </span>
                  <Link href={`/products/${prod.slug}`}>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1 line-clamp-2 hover:text-indigo-600 transition-colors">
                      {prod.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">
                      ({prod.reviewsCount || 12})
                    </span>
                  </div>
                </div>

                {/* Price & Add to Cart */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800">
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
                    className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Artisan Marketplace Banner / CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Empowering Craftsmen Worldwide
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Are you an artisan, guild, or traditional creator?
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl">
              Showcase your handcrafted sculptures, paintings, and heritage works to collectors
              across 45+ countries with zero upfront listing fees and secure payouts.
            </p>
          </div>

          <Link
            href="/account/become-vendor"
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 whitespace-nowrap transition-all"
          >
            Apply as Verified Merchant
          </Link>
        </div>
      </section>
    </div>
  );
}
