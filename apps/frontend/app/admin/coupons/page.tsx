"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  Tag,
  Plus,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  CheckCircle2,
  X,
} from "lucide-react";

interface Coupon {
  id: string;
  name: string;
  code: string;
  discountType: "PERCENT" | "AMOUNT";
  discount: number;
  quantity: number;
  totalUsed: number;
  startDate: string;
  endDate: string;
  status: boolean;
}

const mockCoupons: Coupon[] = [
  {
    id: "cp-1",
    name: "Summer Artisan Festival",
    code: "SUMMER15",
    discountType: "PERCENT",
    discount: 15,
    quantity: 500,
    totalUsed: 142,
    startDate: "2026-06-01",
    endDate: "2026-09-30",
    status: true,
  },
  {
    id: "cp-2",
    name: "New Collector Flat Discount",
    code: "WELCOME20",
    discountType: "AMOUNT",
    discount: 20,
    quantity: 200,
    totalUsed: 65,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: true,
  },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    discountType: "PERCENT" as "PERCENT" | "AMOUNT",
    discount: "10",
    quantity: "100",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  });

  async function fetchCoupons() {
    setLoading(true);
    const res = await withFallback<Coupon[]>(api.get("/admin/coupons"), mockCoupons);
    setCoupons(res.data || mockCoupons);
    setLoading(false);
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post("/admin/coupons", {
      ...formData,
      discount: parseFloat(formData.discount),
      quantity: parseInt(formData.quantity),
      status: true,
    });

    if (res.success && res.data) {
      setCoupons((prev) => [res.data, ...prev]);
    } else {
      setCoupons((prev) => [
        {
          id: `cp-${Date.now()}`,
          name: formData.name,
          code: formData.code.toUpperCase(),
          discountType: formData.discountType,
          discount: parseFloat(formData.discount),
          quantity: parseInt(formData.quantity),
          totalUsed: 0,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: true,
        },
        ...prev,
      ]);
    }

    setIsModalOpen(false);
    setFormData({
      name: "",
      code: "",
      discountType: "PERCENT",
      discount: "10",
      quantity: "100",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    });
  };

  const handleDelete = async (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    await api.delete(`/admin/coupons/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Promotional Coupons
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create promotional discount voucher codes for customer cart redemption.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {c.name}
                  </h3>
                  <span className="inline-block px-2.5 py-0.5 mt-1 rounded-lg text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 tracking-wider">
                    {c.code}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-zinc-500">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                  Discount Value
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {c.discountType === "PERCENT" ? `${c.discount}% OFF` : `$${c.discount} OFF`}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                  Redemptions
                </span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {c.totalUsed} / {c.quantity} used
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Valid until {new Date(c.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Create Promo Coupon
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Winter Sale"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WINTER25"
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="AMOUNT">Flat Amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-600/20"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
