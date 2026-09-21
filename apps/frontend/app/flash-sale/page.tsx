"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import {
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  Star,
  ShieldCheck,
  Tag,
  ArrowRight,
} from "lucide-react";

export default function FlashSalePage() {
  const { addItem } = useCart();
  const [flashSale, setFlashSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 18,
    minutes: 42,
    seconds: 15,
  });

  const defaultFlashProducts = [
    {
      id: "fs-1",
      name: "18K Gold Polki Floral Choker Set with South Sea Pearls",
      slug: "royal-kundan-choker-emerald-droplets",
      price: 2450,
      offerPrice: 1790,
      discount: "27% OFF",
      soldPercent: 78,
      thumbImage:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      rating: 5,
    },
    {
      id: "fs-2",
      name: "1.20 Ct Brilliant Solitaire Diamond Engagement Ring",
      slug: "solitaire-diamond-ring-platinum-band",
      price: 2800,
      offerPrice: 2190,
      discount: "22% OFF",
      soldPercent: 85,
      thumbImage:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
      rating: 4.9,
    },
    {
      id: "fs-3",
      name: "Handcrafted Peacock Meenakari Gold Jhumkas",
      slug: "heritage-uncut-diamond-polki-chandbali-jhumkas",
      price: 1350,
      offerPrice: 990,
      discount: "26% OFF",
      soldPercent: 62,
      thumbImage:
        "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80",
      rating: 5,
    },
    {
      id: "fs-4",
      name: "22K Solid Gold Antique Royal Kada (Single)",
      slug: "antique-nakshi-temple-gold-bangles",
      price: 1650,
      offerPrice: 1290,
      discount: "21% OFF",
      soldPercent: 90,
      thumbImage:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
      rating: 4.8,
    },
  ];

  useEffect(() => {
    async function loadFlashSale() {
      try {
        const res = await api.get("/storefront/flash-sale");
        if (res.success && res.data) {
          setFlashSale(res.data);
        }
      } catch (err) {
        console.error("Failed to load flash sale", err);
      } finally {
        setLoading(false);
      }
    }
    loadFlashSale();
  }, []);

  // Timer Countdown
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

  const products =
    flashSale?.products && flashSale.products.length > 0
      ? flashSale.products.map((p: any) => ({
          id: p.product.id,
          name: p.product.name,
          slug: p.product.slug,
          price: p.product.price,
          offerPrice: p.product.offerPrice || p.product.price * 0.75,
          thumbImage: p.product.thumbImage,
          rating: 5,
          soldPercent: 75,
        }))
      : defaultFlashProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner with Countdown */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-900 via-rose-950 to-zinc-950 p-8 sm:p-14 text-white border border-amber-800/40 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-rose-400 text-rose-400" /> Royal Vault Flash Event
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Exclusive Heirloom Jewellery at Exceptional Privileges
            </h1>
            <p className="text-sm text-amber-100/70 leading-relaxed">
              Curated limited editions directly released from certified royal guilds. Every piece is
              certified BIS 916 hallmarked and accompanied by IGI authenticity cards.
            </p>
          </div>

          {/* Clock Module */}
          <div className="flex flex-col items-center p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Event Closes In
            </span>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-white">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase">Hours</span>
              </div>
              <span className="text-xl font-bold text-amber-400">:</span>
              <div className="w-16 h-16 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-white">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase">Mins</span>
              </div>
              <span className="text-xl font-bold text-amber-400">:</span>
              <div className="w-16 h-16 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-white">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Featured Flash Offers
            </h2>
            <p className="text-xs text-zinc-500">Strictly limited inventory per collector</p>
          </div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full">
            {products.length} Items on Exclusive Sale
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod: any) => (
            <div
              key={prod.id}
              className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={prod.thumbImage}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-xs">
                  Save ${Number(prod.price - prod.offerPrice).toFixed(0)}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <Link href={`/products/${prod.slug}`}>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-amber-600 transition-colors">
                      {prod.name}
                    </h3>
                  </Link>

                  {/* Stock sold bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Claimed: {prod.soldPercent || 70}%</span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">Almost Gone</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full"
                        style={{ width: `${prod.soldPercent || 70}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      ${prod.offerPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-400 line-through ml-2">
                      ${prod.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      addItem({
                        productId: prod.id,
                        name: prod.name,
                        slug: prod.slug,
                        price: prod.offerPrice,
                        thumbImage: prod.thumbImage,
                        qty: 1,
                        variantTotal: 0,
                      })
                    }
                    className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
                    title="Claim Jewel"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
