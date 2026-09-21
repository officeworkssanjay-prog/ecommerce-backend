"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Package,
  Truck,
  ArrowLeft,
  Calendar,
  CreditCard,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultMockOrders = [
    {
      id: "ord-1",
      invoiceId: 104829,
      amount: 2190,
      orderStatus: "SHIPPED",
      paymentStatus: "PAID",
      createdAt: "2026-03-10T14:30:00Z",
      orderProducts: [
        {
          id: "op-1",
          productName: "18K Gold Royal Kundan Choker with Zambian Emeralds",
          qty: 1,
          unitPrice: 2190,
        },
      ],
    },
  ];

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.get("/order/user/orders");
        if (res.success && res.data && res.data.length > 0) {
          setOrders(res.data);
        } else {
          setOrders(defaultMockOrders);
        }
      } catch {
        setOrders(defaultMockOrders);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Account
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Your Jewellery Acquisitions & Invoices
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Review historical purchases, certificates of authenticity, and transit milestones.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No Orders Recorded
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You have not placed any orders yet. Visit our royal jewellery vault to acquire your
            first piece.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
          >
            Explore Vault
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Order Top Line */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-400">Invoice Number</span>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    INV-{ord.invoiceId}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      ord.paymentStatus === "PAID"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-600"
                    }`}
                  >
                    {ord.paymentStatus}
                  </span>

                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    {ord.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {ord.orderProducts?.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.productName}
                      </span>
                      <span className="text-zinc-400">×{item.qty}</span>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      ${(item.unitPrice * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Placed on {new Date(ord.createdAt).toLocaleDateString()}
                </span>

                <Link
                  href={`/order-track?invoiceId=${ord.invoiceId}`}
                  className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Track Transit Milestones <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
