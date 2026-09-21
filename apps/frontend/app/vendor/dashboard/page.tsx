"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api, withFallback } from "@/lib/api";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
  totalWithdrawn: number;
  currentBalance: number;
}

const defaultDashboard: DashboardData = {
  totalProducts: 14,
  totalOrders: 38,
  totalEarnings: 3420.5,
  totalWithdrawn: 1200.0,
  currentBalance: 2220.5,
};

export default function VendorDashboardPage() {
  const [data, setData] = useState<DashboardData>(defaultDashboard);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const res = await withFallback<DashboardData>(
        api.get("/vendor/dashboard"),
        defaultDashboard
      );
      setData(res.data);
      setIsFallback(res.isFallback);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Merchant Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time sales analytics, order fulfillment, and available payout balance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/vendor/products"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {isFallback && (
        <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Database connection pending. Displaying live merchant preview metrics.
          </span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Available Balance
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              ${data.currentBalance.toFixed(2)}
            </h3>
          </div>
          <Link
            href="/vendor/withdrawals"
            className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800 w-full justify-between"
          >
            <span>Request Payout</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Earnings
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              ${data.totalEarnings.toFixed(2)}
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 pt-2 block border-t border-zinc-100 dark:border-zinc-800">
            From paid & delivered orders
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Store Orders
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {data.totalOrders}
            </h3>
          </div>
          <Link
            href="/vendor/orders"
            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800 w-full justify-between"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Live Catalog
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {data.totalProducts} Items
            </h3>
          </div>
          <Link
            href="/vendor/products"
            className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800 w-full justify-between"
          >
            <span>Manage Inventory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Fulfillment Action Center
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Keep your dispatch metrics high by preparing items and updating customer status promptly.
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Ready for Dispatch
                </span>
              </div>
              <Link
                href="/vendor/orders"
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Review Items &rarr;
              </Link>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Payouts Disbursed
                </span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                ${data.totalWithdrawn.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Seller Shop Customization
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Enhance your storefront banner, bio, and customer contact information.
          </p>
          <Link
            href="/vendor/shop-profile"
            className="inline-flex items-center justify-center w-full py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition"
          >
            Customize Shop Profile &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
