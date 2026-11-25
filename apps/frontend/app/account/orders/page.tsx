"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Order } from "@/lib/types";
import { formatDate, formatMoney, humanize } from "@/lib/format";
import { Badge, orderStatusTone } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { Modal } from "@/components/ui/Modal";
import { useFeedback } from "@/components/ui/Feedback";
import { AccountHeader, AccountPage } from "@/components/account/AccountHeader";
import { OrderDetail } from "@/components/account/OrderDetail";

const canCancel = (o: Order) => o.orderStatus === "PENDING" && o.paymentStatus === "UNPAID";

export default function UserOrdersPage() {
  const { confirm, toast } = useFeedback();
  const orders = useApi(async () => (await api.get<Order[]>("/order/user/orders")).data, []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const selected = orders.data?.find((o) => o.id === openId) ?? null;

  const cancel = async (order: Order) => {
    const ok = await confirm({
      title: `Cancel order #${order.invoiceId}?`,
      message: "This cannot be undone. Items return to stock.",
      confirmLabel: "Cancel order",
      danger: true,
    });
    if (!ok) return;
    setCancelling(order.id);
    try {
      await api.post(`/order/${order.id}/cancel`);
      toast.success(`Order #${order.invoiceId} cancelled`);
      orders.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCancelling(null);
    }
  };

  return (
    <AccountPage>
      <AccountHeader title="My orders" description="Your order history and delivery progress." />

      {orders.loading && !orders.data ? (
        <div role="status" aria-live="polite" className="space-y-4">
          <span className="sr-only">Loading your orders…</span>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : orders.error || !orders.data ? (
        <ErrorState message={orders.message} onRetry={orders.reload} />
      ) : orders.data.length === 0 ? (
        <EmptyState
          icon={<Package className="h-10 w-10" aria-hidden />}
          title="No orders yet"
          description="Your first sparkle is waiting."
          action={
            <Link href="/products" className={buttonClasses("primary", "md")}>
              Shop now
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {orders.data.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-sand bg-white p-5">
              <div className="space-y-1">
                <p className="font-serif text-lg text-ink">Order #{o.invoiceId}</p>
                <p className="text-xs text-ink/60">
                  {formatDate(o.createdAt)} · {o.productQty} {o.productQty === 1 ? "item" : "items"} · {formatMoney(o.amount)}
                </p>
                <div className="flex gap-2 pt-1">
                  <Badge tone={orderStatusTone(o.orderStatus)}>{humanize(o.orderStatus)}</Badge>
                  <Badge tone={o.paymentStatus === "PAID" ? "success" : "neutral"}>{humanize(o.paymentStatus)}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpenId(o.id)} aria-label={`View details of order ${o.invoiceId}`}>
                  View details
                </Button>
                {canCancel(o) && (
                  <Button variant="danger" size="sm" loading={cancelling === o.id} onClick={() => cancel(o)} aria-label={`Cancel order ${o.invoiceId}`}>
                    Cancel order
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!selected} onClose={() => setOpenId(null)} title={selected ? `Order #${selected.invoiceId}` : "Order"} size="lg">
        {selected && <OrderDetail order={selected} />}
      </Modal>
    </AccountPage>
  );
}
