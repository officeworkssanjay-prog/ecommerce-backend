"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime, formatMoney, humanize } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { Badge, orderStatusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { FormError, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ORDER_TRANSITIONS } from "./transitions";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-sand bg-white p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/60">{title}</h3>
      <div className="text-sm text-ink">{children}</div>
    </section>
  );
}

export function OrderDetailModal({ order, onClose, onChanged }: { order: Order | null; onClose: () => void; onChanged: () => void }) {
  const { confirm, toast } = useFeedback();
  const [next, setNext] = useState<OrderStatus | "">("");
  const [busy, setBusy] = useState<"status" | "paid" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;
  const options = ORDER_TRANSITIONS[order.orderStatus] ?? [];
  const canMarkPaid = order.paymentMethod === "COD" && order.paymentStatus === "UNPAID" && order.orderStatus !== "CANCELED";
  const addr = order.orderAddress;
  const coupon = order.coupon;

  const close = () => {
    setNext("");
    setError(null);
    onClose();
  };

  const send = async (body: { orderStatus?: OrderStatus; paymentStatus?: "PAID" }, kind: "status" | "paid", success: string) => {
    setBusy(kind);
    setError(null);
    try {
      await api.put(`/admin/orders/${order.id}/status`, body);
      toast.success(success);
      setNext("");
      onChanged();
      onClose();
    } catch (err) {
      setError(errorMessage(err)); // e.g. 409 "cannot be moved to ..." or "updated by someone else"
    } finally {
      setBusy(null);
    }
  };

  const changeStatus = async () => {
    if (!next) return;
    if (next === "CANCELED") {
      const ok = await confirm({
        title: `Cancel order #${order.invoiceId}?`,
        message: "The ordered items will be returned to stock. This cannot be undone.",
        confirmLabel: "Cancel order",
        danger: true,
      });
      if (!ok) return;
    }
    await send({ orderStatus: next }, "status", `Order moved to ${humanize(next).toLowerCase()}`);
  };

  const markPaid = async () => {
    const ok = await confirm({ title: "Mark as paid?", message: `Confirm that cash for order #${order.invoiceId} (${formatMoney(order.amount)}) has been collected.`, confirmLabel: "Mark as paid" });
    if (ok) await send({ paymentStatus: "PAID" }, "paid", "Order marked as paid");
  };

  return (
    <Modal open onClose={close} title={`Order #${order.invoiceId}`} size="lg" footer={<Button variant="ghost" onClick={close}>Close</Button>}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink/70">
          <Badge tone={orderStatusTone(order.orderStatus)}>{humanize(order.orderStatus)}</Badge>
          <Badge tone={order.paymentStatus === "PAID" ? "success" : "gold"}>{order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}</Badge>
          <span>Placed {formatDateTime(order.createdAt)}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Section title="Customer and delivery address">
            {order.user && (
              <p className="font-medium">
                {order.user.name} <span className="font-normal text-ink/60">({order.user.email})</span>
              </p>
            )}
            {addr && (
              <address className="mt-1 not-italic text-ink/80">
                {addr.name}
                <br />
                {addr.address}, {addr.city}, {addr.state} {addr.zipCode}
                <br />
                {addr.country}
                <br />
                {addr.phone}
              </address>
            )}
          </Section>
          <Section title="Shipping, coupon and payment">
            <p>
              Shipping: {order.shippingMethod?.name ?? "-"} ({formatMoney(order.shippingMethod?.cost)})
            </p>
            <p>Coupon: {coupon ? `${coupon.code} (-${formatMoney(coupon.calculatedDiscount)})` : "None"}</p>
            <p>Payment method: {order.paymentMethod}</p>
            <p>Transaction: {order.transaction?.transactionId ?? "-"}</p>
          </Section>
        </div>

        <div className="overflow-x-auto rounded-md border border-sand bg-white">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Items in this order</caption>
            <thead className="bg-parchment/60 text-xs uppercase tracking-wider text-ink/60">
              <tr>
                <th scope="col" className="px-3 py-2">Item</th>
                <th scope="col" className="px-3 py-2">Qty</th>
                <th scope="col" className="px-3 py-2 text-right">Unit price</th>
                <th scope="col" className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {order.orderProducts.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2">
                    {l.productName}
                    {l.variants && Object.keys(l.variants).length > 0 && (
                      <span className="block text-xs text-ink/55">
                        {Object.entries(l.variants).map(([k, v]) => `${k}: ${typeof v === "string" ? v : v.name}`).join(", ")}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">{l.qty}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(Number(l.unitPrice) + Number(l.variantTotal))}</td>
                  <td className="px-3 py-2 text-right">{formatMoney((Number(l.unitPrice) + Number(l.variantTotal)) * l.qty)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-sand text-sm">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right text-ink/60">Subtotal</td>
                <td className="px-3 py-2 text-right">{formatMoney(order.subTotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right font-semibold">Total</td>
                <td className="px-3 py-2 text-right font-semibold">{formatMoney(order.amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <Section title="Update order">
          <div aria-live="polite" className="flex flex-col gap-3">
            <FormError message={error} />
            {options.length > 0 ? (
              <div className="flex flex-wrap items-end gap-3">
                <Select label="Move to" value={next} onChange={(e) => setNext(e.target.value as OrderStatus | "")} className="min-w-56">
                  <option value="">Select next status…</option>
                  {options.map((s) => (
                    <option key={s} value={s}>
                      {humanize(s)}
                    </option>
                  ))}
                </Select>
                <Button onClick={changeStatus} disabled={!next} loading={busy === "status"} variant={next === "CANCELED" ? "danger" : "primary"}>
                  Update status
                </Button>
              </div>
            ) : (
              <p className="text-ink/60">This order is {humanize(order.orderStatus).toLowerCase()}; its status can no longer change.</p>
            )}
            {canMarkPaid && (
              <div>
                <Button variant="outline" onClick={markPaid} loading={busy === "paid"}>
                  Mark as paid
                </Button>
                <p className="mt-1 text-xs text-ink/55">Cash on delivery orders are also marked paid automatically when delivered.</p>
              </div>
            )}
          </div>
        </Section>
      </div>
    </Modal>
  );
}
