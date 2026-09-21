"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Store,
  Tag,
  AlertCircle,
} from "lucide-react";

interface PendingProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  qty: number;
  thumbImage: string;
  shortDescription?: string;
  createdAt: string;
  vendor: { shopName: string; email: string };
  category?: { name: string };
}

const mockPending: PendingProduct[] = [
  {
    id: "p-101",
    name: "Ceramic Glazed Bonsai Planter",
    slug: "ceramic-glazed-bonsai-planter",
    price: 38.0,
    qty: 15,
    thumbImage: "https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Hand-thrown stoneware planter with drainage hole and tray.",
    createdAt: new Date().toISOString(),
    vendor: { shopName: "Artisan Potteries", email: "artisan@studio.com" },
    category: { name: "Ceramics" },
  },
  {
    id: "p-102",
    name: "Hand-Woven Natural Jute Floor Rug",
    slug: "hand-woven-jute-rug",
    price: 79.5,
    qty: 6,
    thumbImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Organic jute fiber eco-friendly living room rug.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    vendor: { shopName: "Earthly Weaves", email: "weaves@studio.com" },
    category: { name: "Home Decor" },
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<PendingProduct[]>(mockPending);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function fetchPending() {
    setLoading(true);
    const res = await withFallback<PendingProduct[]>(
      api.get("/admin/pending-products"),
      mockPending
    );
    setProducts(res.data || mockPending);
    setLoading(false);
  }

  useEffect(() => {
    fetchPending();
  }, []);

  const handleModeration = async (id: string, isApproved: boolean) => {
    setActioningId(id);
    // Optimistic remove
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await api.put(`/admin/products/${id}/approval`, { isApproved });
    setActioningId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Product Moderation Queue
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review vendor-submitted artisan products for catalog compliance before publishing live.
          </p>
        </div>
      </div>

      {/* List */}
      {products.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            Moderation Queue Clear
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            All seller submitted products have been reviewed and approved for marketplace listing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Product Info */}
              <div className="flex items-start space-x-4">
                <img
                  src={prod.thumbImage}
                  alt={prod.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {prod.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center space-x-1">
                      <Store className="w-3.5 h-3.5 text-amber-500" />
                      <span>{prod.vendor.shopName}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      ${prod.price.toFixed(2)}
                    </span>
                    <span>&bull;</span>
                    <span>{prod.qty} units</span>
                    <span>&bull;</span>
                    <span className="text-zinc-400">{prod.category?.name}</span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-1 pt-1">
                    {prod.shortDescription}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => handleModeration(prod.id, false)}
                  disabled={actioningId === prod.id}
                  className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 font-semibold text-xs transition flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleModeration(prod.id, true)}
                  disabled={actioningId === prod.id}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Publish</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
