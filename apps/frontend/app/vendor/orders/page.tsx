"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface OrderProductItem {
  id: string;
  orderId: string;
  productName: string;
  unitPrice: number;
  qty: number;
  variantTotal: number;
  order: {
    invoiceId: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
    orderAddress: any;
  };
}

const mockOrderItems: OrderProductItem[] = [
  {
    id: "op-1",
    orderId: "order-101",
    productName: "Handcrafted Terracotta Ceramic Planter",
    unitPrice: 28.99,
    qty: 2,
    variantTotal: 0,
    order: {
      invoiceId: 1042,
      orderStatus: "PENDING",
      paymentStatus: "PAID",
      createdAt: new Date().toISOString(),
      orderAddress: {
        name: "Emily Watson",
        phone: "+1 555-0192",
        city: "Austin",
        state: "TX",
        country: "USA",
        address: "742 Evergreen Terrace",
      },
    },
  },
  {
    id: "op-2",
    orderId: "order-102",
    productName: "Rustic Stoneware Teapot with Infuser",
    unitPrice: 49.0,
    qty: 1,
    variantTotal: 0,
    order: {
      invoiceId: 1039,
      orderStatus: "PROCESSED_AND_READY_TO_SHIP",
      paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      orderAddress: {
        name: "David Miller",
        phone: "+1 555-0144",
        city: "Seattle",
        state: "WA",
        country: "USA",
        address: "100 Pine Street",
      },
    },
  },
];

export default function VendorOrdersPage() {
  const [items, setItems] = useState<OrderProductItem[]>(mockOrderItems);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchOrders() {
    setLoading(true);
    const res = await withFallback<OrderProductItem[]>(
      api.get("/vendor/orders"),
      mockOrderItems
    );
    setItems(res.data || mockOrderItems);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleMarkReadyToShip = async (orderId: string) => {
    setUpdatingId(orderId);
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.orderId === orderId
          ? {
              ...item,
              order: { ...item.order, orderStatus: "PROCESSED_AND_READY_TO_SHIP" },
            }
          : item
      )
    );

    await api.put(`/vendor/orders/${orderId}/status`, {
      orderStatus: "PROCESSED_AND_READY_TO_SHIP",
    });
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Store Orders & Fulfillment
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review customer purchases containing your artisan items and mark them ready for courier pickup.
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {items.map((item) => {
          const isPending = item.order.orderStatus === "PENDING";
          const isReady =
            item.order.orderStatus === "PROCESSED_AND_READY_TO_SHIP";

          return (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4"
            >
              {/* Top info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    #{item.order.invoiceId}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Invoice #{item.order.invoiceId}
                    </h3>
                    <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-2 text-xs">
                  <span
                    className={`px-3 py-1 rounded-full font-semibold ${
                      item.order.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {item.order.paymentStatus}
                  </span>

                  <span
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-semibold ${
                      isReady
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{item.order.orderStatus.replace(/_/g, " ")}</span>
                  </span>
                </div>
              </div>

              {/* Items & Shipping row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                    Purchased Item
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {item.productName}
                  </p>
                  <p className="text-zinc-400 mt-0.5">
                    Qty: {item.qty} &bull; Unit Price: ${item.unitPrice.toFixed(2)} &bull; Line Total: $
                    {((item.unitPrice + item.variantTotal) * item.qty).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                    Ship To
                  </p>
                  <div className="flex items-start space-x-2 text-zinc-700 dark:text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>
                      {item.order.orderAddress?.name}, {item.order.orderAddress?.address},{" "}
                      {item.order.orderAddress?.city}, {item.order.orderAddress?.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isPending && (
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    onClick={() => handleMarkReadyToShip(item.orderId)}
                    disabled={updatingId === item.orderId}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>
                      {updatingId === item.orderId
                        ? "Updating..."
                        : "Mark Ready for Courier Dispatch"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
