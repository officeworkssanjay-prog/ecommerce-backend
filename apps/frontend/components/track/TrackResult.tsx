import { forwardRef } from "react";
import Link from "next/link";
import { formatDate, formatMoney, humanize } from "@/lib/format";
import { Badge, orderStatusTone } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import type { TrackedOrder } from "./trackTypes";

export const TrackResult = forwardRef<HTMLDivElement, { order: TrackedOrder }>(function TrackResult({ order }, ref) {
  return (
    <div ref={ref} tabIndex={-1} className="space-y-6 outline-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/70">
          Order #{order.invoiceId} · {formatDate(order.createdAt)}
        </p>
        <div className="flex gap-2">
          <Badge tone={orderStatusTone(order.orderStatus)}>{humanize(order.orderStatus)}</Badge>
          <Badge tone={order.paymentStatus === "PAID" ? "success" : "neutral"}>{humanize(order.paymentStatus)}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="track-progress" className="rounded-sm border border-sand bg-white p-6 shadow-card">
          <h2 id="track-progress" className="mb-6 font-serif text-2xl text-ink">
            Order progress
          </h2>
          <OrderTimeline status={order.orderStatus} layout="vertical" updatedAt={order.updatedAt} />
        </section>

        <div className="space-y-6">
          <section aria-labelledby="track-items" className="rounded-sm border border-sand bg-white p-6 shadow-card">
            <h2 id="track-items" className="mb-3 font-serif text-xl text-ink">
              Your jewellery
            </h2>
            <ul className="divide-y divide-sand text-sm">
              {order.orderProducts.map((p, i) => (
                <li key={`${p.productName}-${i}`} className="flex justify-between gap-3 py-3">
                  <span className="text-ink">
                    {p.productName} <span className="text-ink/50">× {p.qty}</span>
                  </span>
                  <span className="font-semibold text-ink">{formatMoney(p.unitPrice * p.qty)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="track-help" className="rounded-sm bg-ink-deep p-6 text-cream">
            <h2 id="track-help" className="font-serif text-xl">
              Need help?
            </h2>
            <p className="mt-1 text-sm text-cream/70">Questions about this order? Our team is happy to help.</p>
            <Link href="/contact" className={buttonClasses("primary", "md", "mt-4")}>
              Contact us
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
});
