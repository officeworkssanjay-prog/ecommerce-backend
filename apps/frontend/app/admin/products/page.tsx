"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import { ImageUpload } from "@/components/ImageUpload";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Store,
  Tag,
  AlertCircle,
  Plus,
  Package,
  Layers,
  Trash2,
  X,
  Search,
  Sparkles,
} from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  offerPrice?: number | null;
  qty: number;
  thumbImage: string;
  shortDescription?: string;
  createdAt?: string;
  isApproved?: boolean;
  status?: boolean;
  productType?: string;
  vendor?: { shopName: string; email: string };
  category?: { name: string };
}

const mockPending: ProductItem[] = [
  {
    id: "p-101",
    name: "18K Gold Royal Kundan Choker",
    slug: "royal-kundan-choker",
    price: 2450.0,
    offerPrice: 2190.0,
    qty: 5,
    thumbImage: "/images/figma/bestseller-1.png",
    shortDescription: "Handcrafted in solid 18K gold with natural uncut polki diamonds.",
    createdAt: new Date().toISOString(),
    vendor: { shopName: "Imperial Jaipur Kundan Atelier", email: "artisan@jaipurkundan.com" },
    category: { name: "Necklaces" },
  },
  {
    id: "p-102",
    name: "Heritage Polki Chandbali Jhumkas",
    slug: "heritage-polki-chandbali-jhumkas",
    price: 1550.0,
    offerPrice: 1350.0,
    qty: 8,
    thumbImage: "/images/figma/bestseller-2.png",
    shortDescription: "Royal Jaipur polki work with freshwater pearls.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    vendor: { shopName: "Imperial Jaipur Kundan Atelier", email: "artisan@jaipurkundan.com" },
    category: { name: "Earrings" },
  },
];

const mockAllProducts: ProductItem[] = [
  {
    id: "prod-1",
    name: "18K Gold Royal Kundan Pendant Choker",
    slug: "royal-kundan-pendant-choker",
    price: 2450.0,
    offerPrice: 2190.0,
    qty: 12,
    thumbImage: "/images/figma/bestseller-1.png",
    status: true,
    isApproved: true,
    category: { name: "Necklaces" },
    vendor: { shopName: "Sawariya Royal Atelier", email: "admin@sawariya.com" },
  },
  {
    id: "prod-2",
    name: "Heritage Polki Chandbali Jhumkas",
    slug: "heritage-polki-chandbali-jhumkas",
    price: 1550.0,
    offerPrice: 1350.0,
    qty: 15,
    thumbImage: "/images/figma/bestseller-2.png",
    status: true,
    isApproved: true,
    category: { name: "Earrings" },
    vendor: { shopName: "Sawariya Royal Atelier", email: "admin@sawariya.com" },
  },
  {
    id: "prod-3",
    name: "22K Antique Nakshi Temple Gold Bangles",
    slug: "antique-nakshi-temple-gold-bangles",
    price: 2190.0,
    offerPrice: 1950.0,
    qty: 8,
    thumbImage: "/images/figma/bestseller-3.png",
    status: true,
    isApproved: true,
    category: { name: "Bangles" },
    vendor: { shopName: "Sawariya Royal Atelier", email: "admin@sawariya.com" },
  },
  {
    id: "prod-4",
    name: "1.5 Ct VVS1 Solitaire Platinum Band Ring",
    slug: "solitaire-diamond-ring-platinum-band",
    price: 3800.0,
    offerPrice: 3450.0,
    qty: 4,
    thumbImage: "/images/figma/bestseller-4.png",
    status: true,
    isApproved: true,
    category: { name: "Rings" },
    vendor: { shopName: "Sawariya Royal Atelier", email: "admin@sawariya.com" },
  },
];

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "catalog">("pending");
  const [pendingProducts, setPendingProducts] = useState<ProductItem[]>(mockPending);
  const [catalogProducts, setCatalogProducts] = useState<ProductItem[]>(mockAllProducts);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // New Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    offerPrice: "",
    qty: "15",
    shortDescription: "",
    thumbImage: "",
    productType: "NEW_ARRIVAL",
  });

  async function loadData() {
    setLoading(true);
    const [pendingRes, catalogRes] = await Promise.all([
      withFallback<ProductItem[]>(api.get("/admin/pending-products"), mockPending),
      withFallback<ProductItem[]>(api.get("/admin/products"), mockAllProducts),
    ]);
    setPendingProducts(pendingRes.data || mockPending);
    setCatalogProducts(catalogRes.data || mockAllProducts);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleModeration = async (id: string, isApproved: boolean) => {
    setActioningId(id);
    const approvedItem = pendingProducts.find((p) => p.id === id);

    setPendingProducts((prev) => prev.filter((p) => p.id !== id));
    if (isApproved && approvedItem) {
      setCatalogProducts((prev) => [
        { ...approvedItem, isApproved: true, status: true },
        ...prev,
      ]);
    }

    await api.put(`/admin/products/${id}/approval`, { isApproved });
    setActioningId(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : null,
        qty: parseInt(formData.qty) || 0,
        productType: formData.productType,
        shortDescription: formData.shortDescription,
        thumbImage: formData.thumbImage || "/images/figma/bestseller-1.png",
      };

      const res = await api.post("/admin/products", payload);
      if (res.success && res.data) {
        setCatalogProducts((prev) => [res.data, ...prev]);
      } else {
        // Fallback local addition
        const created: ProductItem = {
          id: `prod-${Date.now()}`,
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          price: parseFloat(formData.price),
          offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : null,
          qty: parseInt(formData.qty) || 0,
          thumbImage: formData.thumbImage || "/images/figma/bestseller-1.png",
          status: true,
          isApproved: true,
          productType: formData.productType,
          category: { name: "Jewellery" },
          vendor: { shopName: "Sawariya Royal Atelier", email: "admin@sawariya.com" },
        };
        setCatalogProducts((prev) => [created, ...prev]);
      }

      setFormData({
        name: "",
        price: "",
        offerPrice: "",
        qty: "15",
        shortDescription: "",
        thumbImage: "",
        productType: "NEW_ARRIVAL",
      });
      setIsModalOpen(false);
      setActiveTab("catalog");
    } catch {
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setCatalogProducts((prev) => prev.filter((p) => p.id !== id));
    await api.delete(`/admin/products/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Products & Catalog Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review vendor submissions and manage your live fine jewellery catalog.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "pending"
              ? "border-[#caa15e] text-[#caa15e]"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Moderation Queue</span>
          {pendingProducts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold">
              {pendingProducts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "catalog"
              ? "border-[#caa15e] text-[#caa15e]"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>All Live Products</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 font-bold">
            {catalogProducts.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === "pending" && (
        <>
          {pendingProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Moderation Queue Clear
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                All vendor-submitted jewellery pieces have been moderated and approved for the catalog.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
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
                        {prod.vendor && (
                          <>
                            <span className="flex items-center space-x-1">
                              <Store className="w-3.5 h-3.5 text-amber-500" />
                              <span>{prod.vendor.shopName}</span>
                            </span>
                            <span>&bull;</span>
                          </>
                        )}
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          ₹{prod.price.toLocaleString()}
                        </span>
                        <span>&bull;</span>
                        <span>{prod.qty} in stock</span>
                        {prod.category && (
                          <>
                            <span>&bull;</span>
                            <span className="text-zinc-400">{prod.category.name}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1 pt-1">
                        {prod.shortDescription}
                      </p>
                    </div>
                  </div>

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
        </>
      )}

      {/* TAB 2: ALL CATALOG PRODUCTS */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogProducts.map((prod) => (
            <div
              key={prod.id}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100">
                  <img
                    src={prod.thumbImage}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    Published
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {prod.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mt-1">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      ₹{prod.price.toLocaleString()}
                    </span>
                    <span>{prod.qty} units left</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-400">
                  {prod.vendor?.shopName || "In-House"}
                </span>
                <button
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PRODUCT MODAL (ADMIN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#caa15e] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Add New Product
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Publish an in-house artisan jewellery item to the live marketplace
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold block mb-1 text-zinc-700 dark:text-zinc-300">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 22K Solid Gold Antique Temple Nakshi Bangles"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-zinc-700 dark:text-zinc-300">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2450.00"
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-zinc-700 dark:text-zinc-300">
                    Offer / Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                    placeholder="2190.00"
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-zinc-700 dark:text-zinc-300">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    placeholder="15"
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-zinc-700 dark:text-zinc-300">
                    Collection / Tag
                  </label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="NEW_ARRIVAL">New Arrival</option>
                    <option value="FEATURED_PRODUCT">Featured Product</option>
                    <option value="TOP_PRODUCT">Top Product</option>
                    <option value="BEST_PRODUCT">Best Product</option>
                  </select>
                </div>
              </div>

              {/* REUSABLE IMAGE UPLOAD (FILE BROWSE OR DRAG & DROP) */}
              <div>
                <ImageUpload
                  value={formData.thumbImage}
                  onChange={(url) => setFormData({ ...formData, thumbImage: url })}
                  label="Product Photography / Image *"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1 text-zinc-700 dark:text-zinc-300">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Master goldsmith details, gemstone purity, hallmarking..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-md"
                >
                  {saving ? "Publishing..." : "Publish Product Directly"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
