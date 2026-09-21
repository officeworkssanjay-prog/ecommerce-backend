"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import {
  Store,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Star,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function VendorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { addItem } = useCart();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [vendRes, prodRes] = await Promise.all([
          api.get("/storefront/vendors"),
          api.get(`/storefront/products?limit=12`),
        ]);

        if (vendRes.success && vendRes.data) {
          const found = vendRes.data.find((v: any) => v.id === id);
          if (found) setVendor(found);
        }

        if (prodRes.success && prodRes.data?.products) {
          setProducts(prodRes.data.products);
        }
      } catch (err) {
        console.error("Failed to load vendor profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const v = vendor || {
    shopName: "Imperial Jaipur Kundan Atelier",
    phone: "+91 98290 12345",
    email: "atelier@jaipurkundan.com",
    address: "Johari Bazaar, Jaipur, Rajasthan",
    description:
      "Master royal goldsmiths specializing in 22K antique jadau, natural polki chokers, and meenakari enamelling for royal wedding collections.",
    banner:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link
        href="/vendors"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Ateliers
      </Link>

      {/* Atelier Banner Card */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow-lg">
        <div className="h-56 sm:h-72 w-full overflow-hidden relative">
          <img src={v.banner} alt={v.shopName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-20 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Certified Master Atelier
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{v.shopName}</h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              {v.description}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-800/80 backdrop-blur-md border border-zinc-700/60 text-xs text-zinc-300 space-y-1.5 flex-shrink-0">
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{v.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{v.phone}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Atelier's Vault Collection */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Handcrafted Vault Creations by this Atelier
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(products.length > 0
            ? products
            : [
                {
                  id: "jewel-1",
                  name: "18K Gold Royal Kundan Choker with Emeralds",
                  slug: "royal-kundan-choker-emerald-droplets",
                  price: 2450,
                  offerPrice: 2190,
                  thumbImage:
                    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
                },
              ]
          ).map((prod: any) => (
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
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <Link href={`/products/${prod.slug}`}>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-amber-600 transition-colors">
                    {prod.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    ${(prod.offerPrice || prod.price).toFixed(2)}
                  </span>
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
                    className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
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
