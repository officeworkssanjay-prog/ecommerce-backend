"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  offerPrice?: number | null;
  qty: number;
  thumbImage: string;
  isApproved: boolean;
  status: boolean;
  category?: { name: string };
}

const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Handcrafted Terracotta Ceramic Planter",
    slug: "handcrafted-terracotta-planter",
    price: 34.99,
    offerPrice: 28.99,
    qty: 18,
    thumbImage: "https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=600&q=80",
    isApproved: true,
    status: true,
    category: { name: "Ceramics & Clay" },
  },
  {
    id: "prod-2",
    name: "Rustic Stoneware Teapot with Infuser",
    slug: "rustic-stoneware-teapot",
    price: 49.0,
    offerPrice: null,
    qty: 8,
    thumbImage: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    isApproved: false, // Pending moderation
    status: true,
    category: { name: "Kitchen & Dining" },
  },
  {
    id: "prod-3",
    name: "Glazed Porcelain Vase Minimalist",
    slug: "glazed-porcelain-vase",
    price: 65.0,
    offerPrice: 55.0,
    qty: 12,
    thumbImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
    isApproved: true,
    status: true,
    category: { name: "Home Decor" },
  },
];

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    offerPrice: "",
    qty: "10",
    shortDescription: "",
    thumbImage: "",
    productType: "NEW_ARRIVAL",
  });

  async function fetchProducts() {
    setLoading(true);
    const res = await withFallback<Product[]>(api.get("/vendor/products"), mockProducts);
    setProducts(res.data || mockProducts);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: !currentStatus } : p))
    );
    await api.put(`/vendor/products/${id}/status`, { status: !currentStatus });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    setSaving(true);

    const res = await api.post("/vendor/products", {
      ...formData,
      price: parseFloat(formData.price),
      offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : null,
      qty: parseInt(formData.qty) || 0,
      thumbImage: formData.thumbImage || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
    });

    if (res.success && res.data) {
      setProducts((prev) => [res.data, ...prev]);
    } else {
      // Fallback local addition if offline
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        price: parseFloat(formData.price),
        offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : null,
        qty: parseInt(formData.qty) || 0,
        thumbImage: formData.thumbImage || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
        isApproved: false, // New products require Admin moderation
        status: true,
        category: { name: "Handmade Art" },
      };
      setProducts((prev) => [newProd, ...prev]);
    }

    setSaving(false);
    setIsModalOpen(false);
    setFormData({
      name: "",
      price: "",
      offerPrice: "",
      qty: "10",
      shortDescription: "",
      thumbImage: "",
      productType: "NEW_ARRIVAL",
    });
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Product Inventory
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your listed handmade products, stock quantities, and moderation statuses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by title..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Review Status</th>
                <th className="px-6 py-4">Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 flex items-center space-x-3.5">
                    <img
                      src={prod.thumbImage}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1">
                        {prod.name}
                      </p>
                      <span className="text-[11px] text-zinc-400">
                        {prod.category?.name || "General Category"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                    ${(prod.offerPrice || prod.price).toFixed(2)}
                    {prod.offerPrice && (
                      <span className="text-zinc-400 line-through text-[11px] block font-normal">
                        ${prod.price.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        prod.qty > 5
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                      }`}
                    >
                      {prod.qty} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {prod.isApproved ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Live in Store</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Approval</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(prod.id, prod.status)}
                      className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
                    >
                      {prod.status ? (
                        <ToggleRight className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/products/${prod.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex transition"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Submit Product for Approval
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Handmade Ceramic Pitcher"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Regular Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45.00"
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Sale / Offer Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                    placeholder="Optional"
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    placeholder="10"
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Product Tag</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="NEW_ARRIVAL">New Arrival</option>
                    <option value="FEATURED_PRODUCT">Featured Product</option>
                    <option value="TOP_PRODUCT">Top Product</option>
                    <option value="BEST_PRODUCT">Best Product</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.thumbImage}
                  onChange={(e) => setFormData({ ...formData, thumbImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Short Description</label>
                <textarea
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Artisan craftsmanship details, materials, dimensions..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20"
                >
                  {saving ? "Submitting..." : "Submit for Moderation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
