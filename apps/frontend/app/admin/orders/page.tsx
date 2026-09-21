"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Filter,
} from "lucide-react";

interface AdminOrder {
  id: string;
  invoiceId: number;
  subTotal: number;
  amount: number;
  productQty: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  user: { name: string; email: string };
  orderAddress: any;
}

const mockOrders: AdminOrder[] = [
  {
    id: "ord-1",
    invoiceId: 1042,
    subTotal: 57.98,
    amount: 67.98,
    productQty: 2,
    paymentMethod: "STRIPE",
    paymentStatus: "PAID",
    orderStatus: "PENDING",
    createdAt: new Date().toISOString(),
    user: { name: "Emily Watson", email: "emily@example.com" },
    orderAddress: { city: "Austin", state: "TX" },
  },
  {
    id: "ord-2",
    invoiceId: 1041,
    subTotal: 120.0,
    amount: 120.0,
    productQty: 3,
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    orderStatus: "SHIPPED",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    user: { name: "Marcus Vance", email: "marcus@example.com" },
    orderAddress: { city: "Chicago", state: "IL" },
  },
];

const allStatuses = [
  "PENDING",
  "PROCESSED_AND_READY_TO_SHIP",
  "DROPPED_OFF",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(mockOrders);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function fetchOrders() {
    setLoading(true);
    const endpoint =
      statusFilter === "ALL" ? "/admin/orders" : `/admin/orders?status=${statusFilter}`;
    const res = await withFallback<AdminOrder[]>(api.get(endpoint), mockOrders);
    setOrders(res.data || mockOrders);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: string,
    newPaymentStatus?: string
  ) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: newStatus,
              ...(newPaymentStatus && { paymentStatus: newPaymentStatus }),
            }
          : o
      )
    );

    await api.put(`/admin/orders/${orderId}/status`, {
      orderStatus: newStatus,
      ...(newPaymentStatus && { paymentStatus: newPaymentStatus }),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Logistics Pipeline & Orders
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Global state machine controller: Transition orders across all delivery and payment phases.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Order Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Order Stage Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      #{ord.invoiceId}
                    </span>
                    <span className="text-[11px] text-zinc-400 block">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      {ord.user.name}
                    </p>
                    <span className="text-[11px] text-zinc-400">
                      {ord.orderAddress?.city}, {ord.orderAddress?.state}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-sm text-zinc-900 dark:text-zinc-100">
                    ${ord.amount.toFixed(2)}
                    <span className="text-[11px] text-zinc-400 font-normal block">
                      {ord.productQty} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={ord.paymentStatus}
                      onChange={(e) =>
                        handleStatusChange(ord.id, ord.orderStatus, e.target.value)
                      }
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        ord.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300"
                      }`}
                    >
                      <option value="UNPAID">UNPAID</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {allStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
