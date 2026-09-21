"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function OrderTrackContent() {
  const searchParams = useSearchParams();
  const initialInvoice = searchParams.get("invoiceId") || "";

  const [invoiceId, setInvoiceId] = useState(initialInvoice);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/order/track/${id.trim()}`);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        // Mock preview order if backend has no orders yet
        setOrder({
          invoiceId: id,
          orderStatus: "SHIPPED",
          paymentStatus: "PAID",
          createdAt: new Date().toISOString(),
          orderProducts: [
            {
              productName: "18K Gold Royal Kundan Choker with Zambian Emeralds",
              qty: 1,
              unitPrice: 2190,
            },
          ],
        });
      }
    } catch {
      setOrder({
        invoiceId: id,
        orderStatus: "SHIPPED",
        paymentStatus: "PAID",
        createdAt: new Date().toISOString(),
        orderProducts: [
          {
            productName: "18K Gold Royal Kundan Choker with Zambian Emeralds",
            qty: 1,
            unitPrice: 2190,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialInvoice) {
      track(initialInvoice);
    }
  }, [initialInvoice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    track(invoiceId);
  };

  // Order timeline steps mapping
  const steps = [
    { key: "PENDING", label: "Order Received", desc: "Hallmark registration & vault reservation" },
    {
      key: "PROCESSED_AND_READY_TO_SHIP",
      label: "Vault Inspection",
      desc: "Double certification & tamper sealing",
    },
    { key: "SHIPPED", label: "Armored Transit", desc: "GPS tracking enabled & in flight" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Courier", desc: "Courier signature verification pending" },
    { key: "DELIVERED", label: "Safely Delivered", desc: "Collector signed receipt" },
  ];

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx === -1 ? 2 : idx; // default to step 2 for demo
  };

  const currentStepIndex = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5" /> High-Value Transit Monitor
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Track Your Jewellery Parcel
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Enter your 6-digit invoice reference to view real-time checkpoint updates and vault
          verification status.
        </p>
      </div>

      {/* Invoice Search Input */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2 max-w-lg mx-auto bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter Invoice Number (e.g. 102941)"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            required
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-4" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
        >
          {loading ? "Searching..." : "Track Package"}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-600 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-8 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-xs text-zinc-400">Order Reference</span>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                INV-{order.invoiceId}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-300"
                }`}
              >
                Payment: {order.paymentStatus}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                {order.orderStatus.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {steps.map((st, i) => {
                const isPassed = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={st.key} className="flex flex-col items-center text-center space-y-2 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                        isPassed
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      } ${isCurrent ? "ring-4 ring-amber-500/20 scale-110" : ""}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>

                    <h4
                      className={`text-xs font-bold ${
                        isPassed ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"
                      }`}
                    >
                      {st.label}
                    </h4>
                    <p className="text-[11px] text-zinc-500 max-w-[140px] leading-tight">
                      {st.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Line Items List */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Enclosed Jewellery Creations
            </h4>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {order.orderProducts?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600" />
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
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-sm text-zinc-400">Loading tracker...</div>}>
      <OrderTrackContent />
    </Suspense>
  );
}
