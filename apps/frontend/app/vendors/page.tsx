"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Store,
  Sparkles,
  ShieldCheck,
  MapPin,
  Package,
  ArrowRight,
  Phone,
  Award,
} from "lucide-react";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultVendors = [
    {
      id: "v-1",
      shopName: "Imperial Jaipur Kundan Atelier",
      phone: "+91 98290 12345",
      address: "Johari Bazaar, Jaipur, Rajasthan",
      description:
        "Master royal goldsmiths specializing in 22K antique jadau, natural polki chokers, and meenakari enamelling for royal wedding collections.",
      banner:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      _count: { products: 28 },
    },
    {
      id: "v-2",
      shopName: "Surat Diamond Guild",
      phone: "+91 98250 54321",
      address: "Varachha Road, Surat, Gujarat",
      description:
        "World-renowned diamond cutting and setting studio offering GIA & IGI certified solitaires, platinum bands, and eternity rings.",
      banner:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      _count: { products: 42 },
    },
    {
      id: "v-3",
      shopName: "Mysore Heritage Temple Jewels",
      phone: "+91 98450 98765",
      address: "Devaraja Market, Mysore, Karnataka",
      description:
        "Specialists in South Indian 22K antique temple jewellery, handcrafted nakshi deities, and traditional solid gold bridal vanki and oddiyanam.",
      banner:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      _count: { products: 19 },
    },
  ];

  useEffect(() => {
    async function loadVendors() {
      try {
        const res = await api.get("/storefront/vendors");
        if (res.success && res.data && res.data.length > 0) {
          setVendors(res.data);
        } else {
          setVendors(defaultVendors);
        }
      } catch {
        setVendors(defaultVendors);
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-white border border-amber-800/30">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> Certified Master Guilds
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Artisanal Jewellery Ateliers
          </h1>
          <p className="text-sm text-amber-100/70 leading-relaxed">
            Connect directly with verified independent master jewellers, royal goldsmith families,
            and certified diamond setters from world-famous heritage clusters.
          </p>
        </div>
      </div>

      {/* Grid of Ateliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vendors.map((v) => (
          <div
            key={v.id}
            className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            {/* Banner */}
            <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={v.banner || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"}
                alt={v.shopName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Atelier
              </span>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                  {v.shopName}
                </h3>
                {v.address && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="truncate">{v.address}</span>
                  </p>
                )}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {v.description || "Master jewel creator dedicated to preserving traditional heritage goldsmithing."}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">
                  {v._count?.products || 18} Vault Creations
                </span>

                <Link
                  href={`/vendors/${v.id}`}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  Visit Atelier
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
