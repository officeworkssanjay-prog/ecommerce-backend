"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  Sparkles,
  ArrowRight,
  Star,
  Flame,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const { addItem } = useCart();

  // Active Hero Slide Index
  const [heroIndex, setHeroIndex] = useState(0);

  // Flash Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 38,
    seconds: 42,
  });

  // Ticker countdown
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

  // 5 Hero Slides from Figma "desktop-hero-states"
  const heroSlides = [
    {
      id: "slide-1",
      eyebrow: "New Collection 2026",
      title: "Elegant Jewellery,\nAffordable Price",
      description:
        "From weddings to daily wear, trending designs for every occasion.",
      image: "/images/figma/hero.png",
      ctaPrimary: "Shop Now",
      ctaPrimaryHref: "/products",
      ctaSecondary: "View Collection",
      ctaSecondaryHref: "/products",
      counter: "01 / 05",
    },
    {
      id: "slide-2",
      eyebrow: "The Bridal Edit",
      title: "Every Ritual,\nBeautifully Adorned",
      description:
        "From weddings to daily wear, trending designs for every occasion.",
      image: "/images/figma/bridal-banner.png",
      ctaPrimary: "Explore Bridal",
      ctaPrimaryHref: "/products?category=bridal",
      ctaSecondary: "Book a Stylist",
      ctaSecondaryHref: "/contact",
      counter: "02 / 05",
    },
    {
      id: "slide-3",
      eyebrow: "Statement Necklaces",
      title: "Elegant Jewellery,\nAffordable Price",
      description:
        "From weddings to daily wear, trending designs for every occasion.",
      image: "/images/figma/curated-large.png",
      ctaPrimary: "Shop Now",
      ctaPrimaryHref: "/products?category=necklace",
      ctaSecondary: "View Collection",
      ctaSecondaryHref: "/products?category=necklace",
      counter: "03 / 05",
    },
    {
      id: "slide-4",
      eyebrow: "Rings & Stackables",
      title: "Elegant Jewellery,\nAffordable Price",
      description:
        "From weddings to daily wear, trending designs for every occasion.",
      image: "/images/figma/brand-story.png",
      ctaPrimary: "Shop Now",
      ctaPrimaryHref: "/products?category=rings",
      ctaSecondary: "View Collection",
      ctaSecondaryHref: "/products?category=rings",
      counter: "04 / 05",
    },
    {
      id: "slide-5",
      eyebrow: "Festive Sale",
      title: "Elegant Jewellery,\nAffordable Price",
      description:
        "From weddings to daily wear, trending designs for every occasion.",
      image: "/images/figma/hero-slide-5.png",
      ctaPrimary: "Shop Now",
      ctaPrimaryHref: "/flash-sale",
      ctaSecondary: "View Collection",
      ctaSecondaryHref: "/flash-sale",
      counter: "05 / 05",
    },
  ];

  // Auto advance hero
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Categories (8 circular cards with original Figma assets)
  const categories = [
    {
      name: "Necklaces",
      href: "/products?category=necklace",
      image: "/images/figma/cat-necklaces.png",
    },
    {
      name: "Earrings",
      href: "/products?category=earrings",
      image: "/images/figma/cat-earrings.png",
    },
    {
      name: "Bangles",
      href: "/products?category=bangles",
      image: "/images/figma/cat-bangles.png",
    },
    {
      name: "Rings",
      href: "/products?category=rings",
      image: "/images/figma/cat-rings.png",
    },
    {
      name: "Bridal Sets",
      href: "/products?category=bridal",
      image: "/images/figma/cat-bridal.png",
    },
    {
      name: "Chains",
      href: "/products?category=necklace&sub=layered-chains",
      image: "/images/figma/cat-chains.png",
    },
    {
      name: "Anklets",
      href: "/products?category=anklets",
      image: "/images/figma/cat-anklets.png",
    },
    {
      name: "Nath & Tikka",
      href: "/products?category=bridal&sub=maang-tikka",
      image: "/images/figma/cat-nath-tikka.png",
    },
  ];

  // Most Loved / Bestsellers (Original Figma assets)
  const bestsellers = [
    {
      id: "prod-1",
      name: "18K Gold Royal Kundan Pendant Choker",
      slug: "royal-kundan-pendant-choker",
      price: 2450,
      offerPrice: 2190,
      image: "/images/figma/bestseller-1.png",
      rating: 5,
      reviewsCount: 38,
      category: "Necklaces",
      badge: "BESTSELLER",
    },
    {
      id: "prod-2",
      name: "Heritage Polki Chandbali Jhumkas",
      slug: "heritage-polki-chandbali-jhumkas",
      price: 1550,
      offerPrice: 1350,
      image: "/images/figma/bestseller-2.png",
      rating: 4.9,
      reviewsCount: 42,
      category: "Earrings",
      badge: "POPULAR",
    },
    {
      id: "prod-3",
      name: "22K Antique Nakshi Temple Gold Bangles (Pair)",
      slug: "antique-nakshi-temple-gold-bangles",
      price: 2190,
      offerPrice: 1950,
      image: "/images/figma/bestseller-3.png",
      rating: 5,
      reviewsCount: 29,
      category: "Bangles",
      badge: "HOT",
    },
    {
      id: "prod-4",
      name: "1.5 Ct VVS1 Certified Solitaire Platinum Band Ring",
      slug: "solitaire-diamond-ring-platinum-band",
      price: 3800,
      offerPrice: 3450,
      image: "/images/figma/bestseller-4.png",
      rating: 5,
      reviewsCount: 51,
      category: "Rings",
      badge: "EXCLUSIVE",
    },
  ];

  // Testimonials (Original Figma portraits)
  const testimonials = [
    {
      name: "Pooja Sharma",
      location: "Mumbai",
      comment:
        "The Kundan bridal choker exceeded all my expectations! The craftsmanship, heavy weight, and polish looked identical to pure royal heritage jewellery. Received endless compliments on my wedding day.",
      avatar: "/images/figma/testimonial-1.png",
    },
    {
      name: "Ananya Verma",
      location: "New Delhi",
      comment:
        "Ordered the Polki chandbalis and Nakshi bangles. The delivery was fast, safely insured, and the luxury packaging felt like unboxing a treasure. Authentic Karigar work at very honest pricing!",
      avatar: "/images/figma/testimonial-2.png",
    },
    {
      name: "Sneha Patel",
      location: "Ahmedabad",
      comment:
        "I was hesitant about ordering fine jewellery online, but Sawariya Arts won my trust completely. BIS hallmark certificate was included, and the solitaire ring brilliance is mesmerizing.",
      avatar: "/images/figma/testimonial-3.png",
    },
  ];

  // Instagram Gallery (Original Figma assets)
  const instaPosts = [
    {
      image: "/images/figma/insta-1.png",
      handle: "@sawariyaarts",
    },
    {
      image: "/images/figma/insta-2.png",
      handle: "@sawariyaarts",
    },
    {
      image: "/images/figma/insta-3.png",
      handle: "@sawariyaarts",
    },
    {
      image: "/images/figma/insta-4.png",
      handle: "@sawariyaarts",
    },
  ];

  const currentSlide = heroSlides[heroIndex];

  return (
    <div className="bg-[#faf8f5] text-[#221517] font-sans selection:bg-[#caa15e]/30 selection:text-[#221517]">
      {/* ==============================================================
          1. HERO CAROUSEL BANNER SECTION (FIGMA "desktop-hero-states")
      ============================================================== */}
      <section className="relative overflow-hidden bg-[#180e10] text-white min-h-[600px] lg:min-h-[700px] flex items-center">
        {/* Background Image with Slow Zoom Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                heroIndex === idx ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover object-[center_20%] transition-transform duration-[7000ms] ease-out ${
                  heroIndex === idx ? "scale-105" : "scale-100"
                }`}
              />
              {/* Figma "Hero contrast scrim" overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#180e10]/95 via-[#180e10]/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#180e10] via-transparent to-transparent opacity-85" />
            </div>
          ))}
        </div>

        {/* Content Container */}
        <div className="relative max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full z-10">
          <div key={currentSlide.id} className="max-w-2xl space-y-6 animate-in fade-in duration-500">
            {/* Golden Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#caa15e]/20 border border-[#caa15e]/40 text-[#f5ebd7] text-xs font-semibold tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#caa15e]" />
              {currentSlide.eyebrow}
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] drop-shadow-md whitespace-pre-line">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-zinc-300 text-sm sm:text-base font-normal max-w-xl leading-relaxed">
              {currentSlide.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                href={currentSlide.ctaPrimaryHref}
                className="px-8 py-3.5 rounded-full bg-[#caa15e] hover:bg-[#b88c49] text-zinc-950 text-sm font-bold shadow-lg shadow-amber-950/40 hover:scale-105 transition-all"
              >
                {currentSlide.ctaPrimary}
              </Link>

              <Link
                href={currentSlide.ctaSecondaryHref}
                className="px-7 py-3.5 rounded-full border border-white/40 hover:border-white text-white text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                {currentSlide.ctaSecondary}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Slider Navigation & Counter Controls (Exact Figma desktop-hero-states) */}
        <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-20 flex items-center justify-between pointer-events-none">
          {/* Left / Right Arrow Controls */}
          <div className="flex items-center gap-2.5 pointer-events-auto">
            <button
              onClick={() =>
                setHeroIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))
              }
              className="w-10 h-10 rounded-full bg-[#221517]/80 hover:bg-[#caa15e] text-white hover:text-zinc-950 border border-white/20 hover:border-[#caa15e] flex items-center justify-center transition-all shadow-md backdrop-blur-xs"
              title="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
              className="w-10 h-10 rounded-full bg-[#221517]/80 hover:bg-[#caa15e] text-white hover:text-zinc-950 border border-white/20 hover:border-[#caa15e] flex items-center justify-center transition-all shadow-md backdrop-blur-xs"
              title="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 5-Slide Progress Bars & Exact Counter (01 / 05) */}
          <div className="flex items-center gap-4 pointer-events-auto bg-[#221517]/80 px-4 py-2 rounded-full border border-white/15 backdrop-blur-xs">
            {/* 5 Progress Bars */}
            <div className="flex items-center gap-1.5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    heroIndex === i
                      ? "w-8 bg-[#caa15e]"
                      : "w-3 bg-white/30 hover:bg-white/60"
                  }`}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Slide Counter Text */}
            <span className="text-xs font-mono font-bold tracking-widest text-[#f5ebd7]">
              {currentSlide.counter}
            </span>
          </div>
        </div>
      </section>

      {/* ==============================================================
          2. TRUST / VALUE PROPOSITIONS STRIP
      ============================================================== */}
      <section className="bg-[#faf5ee] border-b border-[#ebdcc9] py-8">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#f0e3ce] text-[#8b6528] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#221517]">100% Certified</h4>
                <p className="text-[11px] text-zinc-600">BIS Hallmarked Gold</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#f0e3ce] text-[#8b6528] flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#221517]">Free Express Delivery</h4>
                <p className="text-[11px] text-zinc-600">On all orders above ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#f0e3ce] text-[#8b6528] flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#221517]">15-Day Easy Returns</h4>
                <p className="text-[11px] text-zinc-600">Hassle-free exchange</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#f0e3ce] text-[#8b6528] flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#221517]">Secure Checkout</h4>
                <p className="text-[11px] text-zinc-600">100% Encrypted & Safe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          3. "SHOP BY CATEGORY" (8 CIRCULAR CARDS - FIGMA ASSETS)
      ============================================================== */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[11px] font-bold text-[#caa15e] tracking-widest uppercase">
              DISCOVER
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221517] tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-[#8b6528] hover:text-[#caa15e] flex items-center gap-1 group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 8 Circular items */}
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex flex-col items-center text-center group"
            >
              {/* Circular Avatar Container with Gold Border */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden p-1 border-2 border-transparent group-hover:border-[#caa15e] transition-all duration-300 shadow-sm bg-white">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <h3 className="mt-3 text-xs sm:text-sm font-medium text-[#221517] group-hover:text-[#8b6528] transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ==============================================================
          4. "CURATED FOR YOU" (ASYMMETRIC SHOWCASE GRID - FIGMA ASSETS)
      ============================================================== */}
      <section className="bg-[#f5ede1] py-16 sm:py-20 border-y border-[#ebdcc9]">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[11px] font-bold text-[#caa15e] tracking-widest uppercase">
                SELECTION
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221517] tracking-tight mt-1">
                Curated For You
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-[#8b6528] hover:text-[#caa15e] flex items-center gap-1 group"
            >
              Explore All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Asymmetric Grid: 1 Tall Left, 2 Stacked Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Left Large Card */}
            <div className="lg:col-span-6 flex flex-col">
              <Link
                href="/products?category=necklace"
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] lg:h-full min-h-[380px] shadow-lg border border-amber-900/10 block"
              >
                <img
                  src="/images/figma/curated-large.png"
                  alt="Meenakari & Kundan Sets"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <div className="absolute top-5 left-5">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#caa15e] text-zinc-950 font-bold text-xs shadow-md">
                    FEATURED
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                    Meenakari & Kundan Sets
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-md">
                    Heirloom heritage pieces crafted with precision and uncut gemstones.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#f5ebd7] group-hover:translate-x-1 transition-transform pt-1">
                    Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Right 2 Stacked Cards */}
            <div className="lg:col-span-6 flex flex-col gap-6 sm:gap-8 justify-between">
              {/* Top Right Card */}
              <Link
                href="/products?category=earrings"
                className="group relative rounded-2xl overflow-hidden h-[240px] sm:h-[260px] shadow-lg border border-amber-900/10 block"
              >
                <img
                  src="/images/figma/curated-top-right.png"
                  alt="Polki & Temple Earrings"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-[#caa15e] text-zinc-950 font-bold text-[11px] shadow-sm">
                    NEW ARRIVALS
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold">
                    Polki & Temple Earrings
                  </h3>
                  <p className="text-xs text-zinc-300">
                    Intricately carved artisan drops and heritage chandbalis.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#f5ebd7] group-hover:translate-x-1 transition-transform pt-1">
                    Shop Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>

              {/* Bottom Right Card */}
              <Link
                href="/products?category=bangles"
                className="group relative rounded-2xl overflow-hidden h-[240px] sm:h-[260px] shadow-lg border border-amber-900/10 block"
              >
                <img
                  src="/images/figma/curated-bottom-right.png"
                  alt="Handcrafted Bangles & Kadas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-[#caa15e] text-zinc-950 font-bold text-[11px] shadow-sm">
                    BESTSELLER
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold">
                    Handcrafted Bangles & Kadas
                  </h3>
                  <p className="text-xs text-zinc-300">
                    Traditional 22K nakshi work and solid antique filigree.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#f5ebd7] group-hover:translate-x-1 transition-transform pt-1">
                    Shop Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          5. "FIND YOUR LOOK" (OCCASIONS SECTION - FIGMA ASSETS)
      ============================================================== */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[11px] font-bold text-[#caa15e] tracking-widest uppercase">
              SHOP BY OCCASION
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221517] tracking-tight mt-1">
              Find Your Look
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-[#8b6528] hover:text-[#caa15e] flex items-center gap-1 group"
          >
            View All Looks
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* 1. Everyday Minimalist */}
          <Link
            href="/products?look=everyday"
            className="group rounded-2xl overflow-hidden bg-white shadow-md border border-zinc-200/80 hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="/images/figma/occasion-everyday.png"
                alt="Everyday Minimalist"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#221517] font-bold text-[11px] shadow-xs">
                  DAILY WEAR
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#221517] group-hover:text-[#8b6528] transition-colors">
                  Everyday Minimalist
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Delicate 18K & silver accents designed for effortless elegance all day long.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b6528] group-hover:translate-x-1 transition-transform pt-2">
                Explore Minimalist <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* 2. Festive Elegance */}
          <Link
            href="/products?look=festive"
            className="group rounded-2xl overflow-hidden bg-white shadow-md border border-zinc-200/80 hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="/images/figma/occasion-festive.png"
                alt="Festive Elegance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-[#caa15e] text-zinc-950 font-bold text-[11px] shadow-xs">
                  FESTIVE SPECIAL
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#221517] group-hover:text-[#8b6528] transition-colors">
                  Festive Elegance
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Radiant jewels for pujas, family celebrations, and milestone gatherings.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b6528] group-hover:translate-x-1 transition-transform pt-2">
                Explore Festive <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* 3. Royal Bridal */}
          <Link
            href="/products?category=bridal"
            className="group rounded-2xl overflow-hidden bg-white shadow-md border border-zinc-200/80 hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="/images/figma/occasion-bridal.png"
                alt="Royal Bridal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-[#221517] text-[#f5ebd7] font-bold text-[11px] shadow-xs">
                  BRIDAL TROUSSEAU
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#221517] group-hover:text-[#8b6528] transition-colors">
                  Royal Bridal
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                  Grand heirloom bridal sets crafted for your most unforgettable milestone.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b6528] group-hover:translate-x-1 transition-transform pt-2">
                Explore Bridal <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ==============================================================
          6. "MOST LOVED" (BESTSELLER PRODUCT CARDS - FIGMA ASSETS)
      ============================================================== */}
      <section className="bg-[#f7f2ea] py-16 sm:py-20 border-y border-[#ebdcc9]">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[11px] font-bold text-[#caa15e] tracking-widest uppercase">
                BESTSELLERS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221517] tracking-tight mt-1">
                Most Loved
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-[#8b6528] hover:text-[#caa15e] flex items-center gap-1 group"
            >
              View Catalog
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-[#ebdcc9] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-zinc-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#221517] text-[#f5ebd7] text-[10px] font-bold uppercase tracking-wider">
                    {item.badge}
                  </span>

                  {/* Wishlist Button */}
                  <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-zinc-700 hover:text-rose-500 shadow-md transition-colors"
                    title="Add to Wishlist"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Info Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                      {item.category}
                    </span>
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="text-sm font-semibold text-[#221517] hover:text-[#8b6528] line-clamp-2 transition-colors mt-0.5">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Stars */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        ({item.reviewsCount})
                      </span>
                    </div>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-[#221517]">
                        ₹{item.offerPrice.toLocaleString()}
                      </span>
                      {item.price && (
                        <span className="text-xs text-zinc-400 line-through ml-2">
                          ₹{item.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        addItem({
                          productId: item.id,
                          name: item.name,
                          slug: item.slug,
                          price: item.offerPrice,
                          thumbImage: item.image,
                          qty: 1,
                          variantTotal: 0,
                        })
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-[#221517] hover:bg-[#caa15e] text-white hover:text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Add to Bag"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================================================
          7. "UP TO 40% OFF" FLASH SALE COUNTDOWN STRIP
      ============================================================== */}
      <section className="bg-[#241517] text-white py-14 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-[1340px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#caa15e]/20 border border-[#caa15e]/30 text-[#f5ebd7] text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-[#caa15e] fill-[#caa15e]" /> Limited Time Flash Sale
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Up to 40% Off
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm max-w-md">
              Strictly limited quantities crafted by certified heritage guilds. Prices revert once timer expires.
            </p>

            <div className="pt-2">
              <Link
                href="/flash-sale"
                className="inline-block px-7 py-3 rounded-full bg-[#caa15e] hover:bg-[#b88c49] text-zinc-950 text-xs sm:text-sm font-bold shadow-lg transition-all"
              >
                Shop Flash Sale
              </Link>
            </div>
          </div>

          {/* Countdown Timer Dials */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#2e1c1f] border border-[#caa15e]/30 shadow-inner">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#f5ebd7]">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400">Hours</span>
            </div>
            <span className="text-2xl font-bold text-[#caa15e]">:</span>
            <div className="flex flex-col items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#2e1c1f] border border-[#caa15e]/30 shadow-inner">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#f5ebd7]">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400">Mins</span>
            </div>
            <span className="text-2xl font-bold text-[#caa15e]">:</span>
            <div className="flex flex-col items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#2e1c1f] border border-[#caa15e]/30 shadow-inner">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#f5ebd7]">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          8. "HEIRLOOM CRAFT, EVERYDAY PRICE" (KARIGAR STORY - FIGMA ASSET)
      ============================================================== */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Artisan Hands at Workbench Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-900/10 aspect-[4/3]">
              <img
                src="/images/figma/brand-story.png"
                alt="Artisan shaping heirloom jewelry"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-amber-900/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#8b6528]">
                    GENUINE KARIGAR GUILD
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[#221517]">
                    Handcrafted in Jaipur & Thrissur
                  </p>
                </div>
                <ShieldCheck className="w-6 h-6 text-[#caa15e]" />
              </div>
            </div>
          </div>

          {/* Right: Story & Stats */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-bold text-[#caa15e] tracking-widest uppercase">
              OUR PROMISE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#221517] tracking-tight leading-[1.15]">
              Heirloom Craft, <br />
              Everyday Price
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
              We bridge the gap between generational master craftsmen in Jaipur, Kolkata, and Thrissur directly to your doorstep. Without excessive retail markups or middleman commissions, you enjoy museum-grade fine jewellery at transparent, honest prices.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#ebdcc9]">
              <div>
                <span className="font-serif text-3xl font-bold text-[#221517]">40+</span>
                <p className="text-xs text-zinc-500 mt-0.5">Master Karigars</p>
              </div>
              <div>
                <span className="font-serif text-3xl font-bold text-[#221517]">25k+</span>
                <p className="text-xs text-zinc-500 mt-0.5">Happy Patrons</p>
              </div>
              <div>
                <span className="font-serif text-3xl font-bold text-[#221517]">4.9★</span>
                <p className="text-xs text-zinc-500 mt-0.5">Trust Rating</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#8b6528] hover:text-[#caa15e] group"
              >
                Read Our Story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          9. FULL-WIDTH BRIDAL BANNER ("Every Ritual, Beautifully Adorned" - FIGMA ASSET)
      ============================================================== */}
      <section className="relative overflow-hidden bg-[#180e10] text-white min-h-[500px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="/images/figma/bridal-banner.png"
            alt="Royal Indian Bride"
            className="w-full h-full object-cover object-[center_35%] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#180e10]/95 via-[#180e10]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#180e10] via-transparent to-transparent opacity-70" />
        </div>

        <div className="relative max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full z-10">
          <div className="max-w-xl space-y-5">
            <span className="px-3.5 py-1.5 rounded-full bg-[#caa15e] text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-sm">
              BRIDAL COUTURE
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              Every Ritual, <br />
              Beautifully Adorned
            </h2>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              From the haldi ceremony to the grand reception, discover bespoke bridal jewellery sets crafted to sanctify every auspicious moment.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/products?category=bridal"
                className="px-8 py-3.5 rounded-full bg-[#caa15e] hover:bg-[#b88c49] text-zinc-950 font-bold text-xs sm:text-sm shadow-lg transition-all"
              >
                Shop Bridal
              </Link>
              <Link
                href="/contact"
                className="px-7 py-3.5 rounded-full border border-white/40 hover:border-white text-white font-semibold text-xs sm:text-sm hover:bg-white/10 transition-all"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          10. "WHAT THEY SAY" (CUSTOMER REVIEWS - FIGMA PORTRAITS)
      ============================================================== */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-[#caa15e] tracking-widest uppercase">
            TESTIMONIALS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221517] tracking-tight mt-1">
            What They Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-2xl border border-[#ebdcc9] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              {/* Star Rating */}
              <div className="space-y-3">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#ebdcc9]"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#221517]">{t.name}</h4>
                  <p className="text-[10px] text-zinc-500">{t.location} • Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==============================================================
          11. "FOLLOW US" (INSTAGRAM GALLERY - FIGMA ASSETS)
      ============================================================== */}
      <section className="bg-[#f5ede1] py-16 sm:py-20 border-t border-[#ebdcc9]">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-bold text-[#caa15e] tracking-widest uppercase">
              @SAWARIYAARTS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221517] tracking-tight mt-1">
              Follow Us
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {instaPosts.map((post, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-amber-900/10 block"
              >
                <img
                  src={post.image}
                  alt="Sawariya Arts styling"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="flex flex-col items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <svg className="w-6 h-6 text-[#caa15e] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span className="text-[11px] font-semibold">{post.handle}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
