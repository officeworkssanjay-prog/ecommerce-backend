import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/format";

function paymentText(order: Order): { title: string; detail: string } {
  if (order.paymentMethod === "COD") {
    return { title: "Cash on delivery", detail: `Pay ${formatPrice(order.amount)} when your order arrives.` };
  }
  const paid = order.paymentStatus === "PAID";
  return {
    title: "UPI, Cards & Netbanking (via Razorpay)",
    detail: paid ? `${formatPrice(order.amount)} paid successfully${order.transaction?.transactionId ? ` · Ref ${order.transaction.transactionId}` : ""}` : "Payment not yet received.",
  };
}

/** Items, delivery address snapshot, payment and totals: real order data only. */
export function OrderDetails({ order }: { order: Order }) {
  const a = order.orderAddress;
  const pay = paymentText(order);
  const discount = order.coupon?.calculatedDiscount ?? 0;
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 rounded-md bg-white p-6 lg:col-span-7">
        <section aria-labelledby="oc-items">
          <h2 id="oc-items" className="font-serif text-xl text-ink">
            Your jewellery
          </h2>
          <ul className="mt-3 divide-y divide-sand">
            {order.orderProducts.map((l) => {
              const options = l.variants ? Object.values(l.variants).map((v) => v.name) : [];
              return (
                <li key={l.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{l.productName}</p>
                    <p className="text-xs text-ink/60">{[...options, `Qty ${l.qty}`].join(" · ")}</p>
                  </div>
                  <span className="shrink-0 font-medium text-ink">{formatPrice((l.unitPrice + l.variantTotal) * l.qty)}</span>
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-labelledby="oc-addr" className="border-t border-sand pt-5 text-sm">
          <h3 id="oc-addr" className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
            Delivering to
          </h3>
          <p className="mt-2 font-medium text-ink">{a.name}</p>
          <p className="text-ink/70">
            {a.address}, {a.city}, {a.state} {a.zipCode}, {a.country}
          </p>
          <p className="text-ink/60">{a.phone}</p>
          <p className="mt-2 text-ink/70">Shipping: {order.shippingMethod.name}</p>
        </section>
        <section aria-labelledby="oc-pay" className="border-t border-sand pt-5 text-sm">
          <h3 id="oc-pay" className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
            Payment
          </h3>
          <p className="mt-2 font-medium text-ink">{pay.title}</p>
          <p className={order.paymentStatus === "PAID" ? "text-success" : "text-ink/70"}>{pay.detail}</p>
        </section>
      </div>

      <aside aria-label="Order summary" className="h-fit rounded-md bg-parchment p-6 lg:col-span-5">
        <h2 className="font-serif text-xl text-ink">Order summary</h2>
        <dl className="mt-4 space-y-2.5 text-sm text-ink/70">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="font-medium text-ink">{formatPrice(order.subTotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <dt>Coupon{order.coupon ? ` · ${order.coupon.code}` : ""}</dt>
              <dd>− {formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd className={order.shippingMethod.cost === 0 ? "font-semibold text-success" : "font-medium text-ink"}>{order.shippingMethod.cost === 0 ? "FREE" : formatPrice(order.shippingMethod.cost)}</dd>
          </div>
        </dl>
        <div className="mt-3 flex items-baseline justify-between border-t border-sand pt-3">
          <span className="font-serif text-lg text-ink">Total</span>
          <span className="font-serif text-2xl text-ink">{formatPrice(order.amount)}</span>
        </div>
        <p className="mt-1 text-xs text-ink/60">Inclusive of all taxes</p>
        {discount > 0 && <p className="mt-1 text-xs font-medium text-success">You saved {formatPrice(discount)} on this order</p>}
      </aside>
    </div>
  );
}
