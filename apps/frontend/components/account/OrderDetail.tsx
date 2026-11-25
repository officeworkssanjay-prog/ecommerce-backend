"use client";

import type { Order } from "@/lib/types";
import { formatDateTime, formatMoney, humanize } from "@/lib/format";
import { Badge, orderStatusTone } from "@/components/ui/Badge";
import { OrderTimeline } from "./OrderTimeline";

export function OrderDetail({ order }: { order: Order }) {
  const a = order.orderAddress;
  const discount = order.coupon?.calculatedDiscount ?? 0;
  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={orderStatusTone(order.orderStatus)}>{humanize(order.orderStatus)}</Badge>
        <Badge tone={order.paymentStatus === "PAID" ? "success" : "neutral"}>{humanize(order.paymentStatus)}</Badge>
        <span className="text-xs text-ink/60">
          Placed {formatDateTime(order.createdAt)} · {order.paymentMethod === "COD" ? "Cash on delivery" : humanize(order.paymentMethod)}
        </span>
      </div>

      <OrderTimeline status={order.orderStatus} />

      <ul className="divide-y divide-sand rounded-xl border border-sand bg-white">
        {order.orderProducts.map((p) => (
          <li key={p.id} className="flex items-start justify-between gap-3 p-3">
            <div>
              <p className="font-semibold text-ink">{p.productName}</p>
              <p className="text-xs text-ink/60">
                Qty {p.qty}
                {p.variants && Object.keys(p.variants).length > 0 && ` · ${Object.entries(p.variants).map(([k, v]) => `${k}: ${v.name}`).join(", ")}`}
              </p>
            </div>
            <span className="font-semibold text-ink">{formatMoney((p.unitPrice + p.variantTotal) * p.qty)}</span>
          </li>
        ))}
      </ul>

      <dl className="space-y-1.5 text-xs text-ink/70">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatMoney(order.subTotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Discount ({order.coupon?.code})</dt>
            <dd>-{formatMoney(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>{order.shippingMethod.name}</dt>
          <dd>{order.shippingMethod.cost === 0 ? "FREE" : formatMoney(order.shippingMethod.cost)}</dd>
        </div>
        <div className="flex justify-between border-t border-sand pt-2 text-base font-bold text-ink">
          <dt>Total</dt>
          <dd>{formatMoney(order.amount)}</dd>
        </div>
      </dl>

      <div className="rounded-xl bg-parchment/50 p-3 text-xs text-ink/70">
        <p className="mb-1 font-bold uppercase tracking-wider text-ink">Delivered to</p>
        {a.name}, {a.address}, {a.city}, {a.state} {a.zipCode}, {a.country} · {a.phone}
      </div>
    </div>
  );
}
