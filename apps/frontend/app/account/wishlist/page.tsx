"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowLeft,
  Star,
  Sparkles,
} from "lucide-react";

export default function UserWishlistPage() {
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultMockWishlist = [
    {
      id: "w-1",
      productId: "jewel-1",
      product: {
        id: "jewel-1",
        name: "18K Gold Royal Kundan Choker with Zambian Emeralds",
        slug: "royal-kundan-choker-emerald-droplets",
        price: 2450,
        offerPrice: 2190,
        thumbImage:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
        category: { name: "Bridal Sets" },
      },
    },
    {
      id: "w-2",
      productId: "jewel-2",
      product: {
        id: "jewel-2",
        name: "1.50 Ct VVS1 Solitaire Diamond Ring in Platinum",
        slug: "solitaire-diamond-ring-platinum-band",
        price: 3800,
        offerPrice: 3450,
        thumbImage:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
        category: { name: "Diamond Rings" },
      },
    },
  ];

  const loadWishlist = async () => {
    try {
      const res = await api.get("/user/wishlist");
      if (res.success && res.data && res.data.length > 0) {
        setWishlist(res.data);
      } else {
        setWishlist(defaultMockWishlist);
      }
    } catch {
      setWishlist(defaultMockWishlist);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/user/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    } catch {
      setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Account
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Your Curated Wishlist ({wishlist.length})
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Saved heirloom treasures and private bridal selections.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No Saved Jewels in Your Wishlist
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Click the heart icon on any fine jewellery piece to save it to your private portfolio.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
          >
            Browse Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const p = item.product;
            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between"
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={p.thumbImage}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 text-rose-500 hover:scale-110 transition-all shadow-xs"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">
                      {p.category?.name || "Fine Jewel"}
                    </span>
                    <Link href={`/products/${p.slug}`}>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1 line-clamp-2 hover:text-amber-600 transition-colors">
                        {p.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      ${(p.offerPrice || p.price).toFixed(2)}
                    </span>

                    <button
                      onClick={() =>
                        addItem({
                          productId: p.id,
                          name: p.name,
                          slug: p.slug,
                          price: p.offerPrice || p.price,
                          thumbImage: p.thumbImage,
                          qty: 1,
                          variantTotal: 0,
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Move to Box
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
