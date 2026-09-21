"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api, withFallback } from "@/lib/api";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  Clock,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";

interface AdminDashboardData {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  pendingProducts: number;
  pendingWithdrawals: number;
  totalRevenue: number;
}

const defaultAdminStats: AdminDashboardData = {
  totalUsers: 142,
  totalVendors: 18,
  totalProducts: 86,
  totalOrders: 312,
  pendingProducts: 5,
  pendingWithdrawals: 2,
  totalRevenue: 28450.0,
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData>(defaultAdminStats);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    async function loadStats() {
      const res = await withFallback<AdminDashboardData>(
        api.get("/admin/dashboard"),
        defaultAdminStats
      );
      setData(res.data);
      setIsFallback(res.isFallback);
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Platform Executive Overview
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Global marketplace activity, transaction volume, and operational moderation queues.
          </p>
        </div>
      </div>

      {isFallback && (
        <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
          <span>
            Database connection pending. Displaying platform preview analytics.
          </span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Gross Platform Sales
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              ${data.totalRevenue.toLocaleString()}
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 pt-2 block border-t border-zinc-100 dark:border-zinc-800">
            Across all verified gateways
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Total Orders
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {data.totalOrders}
            </h3>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800 w-full justify-between"
          >
            <span>Logistics Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Active Merchants
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {data.totalVendors}
            </h3>
          </div>
          <Link
            href="/admin/vendors"
            className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800 w-full justify-between"
          >
            <span>Vendor Approvals</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Shopper Accounts
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {data.totalUsers}
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 pt-2 block border-t border-zinc-100 dark:border-zinc-800">
            Registered customer profiles
          </span>
        </div>
      </div>

      {/* Moderation Alert Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20 shrink-0">
              {data.pendingProducts}
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Products Awaiting Moderation
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Seller items submitted and waiting for catalog approval.
              </p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition shadow-sm"
          >
            Review &rarr;
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/20 shrink-0">
              {data.pendingWithdrawals}
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Pending Payout Requests
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Merchants requesting wallet balance disbursements.
              </p>
            </div>
          </div>
          <Link
            href="/admin/withdrawals"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm"
          >
            Disburse &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
