"use client";

import { useState } from "react";
import { api, qs } from "@/lib/api";
import { formatDateTime, formatMoney, humanize } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { Badge, orderStatusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { DataTable, PageHeader } from "@/components/admin/AdminKit";
import type { Column } from "@/components/admin/AdminKit";
import { OrderDetailModal } from "@/components/admin/orders/OrderDetailModal";
import { ORDER_STATUSES } from "@/components/admin/orders/transitions";

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, loading, message, reload } = useApi(async () => (await api.get<Order[]>(`/admin/orders${qs({ status })}`)).data, [status]);

  // Always show the freshest copy of the open order (it changes after a reload).
  const selected = data?.find((o) => o.id === selectedId) ?? null;

  const columns: Column<Order>[] = [
    { key: "invoice", header: "Order", render: (o) => <span className="font-medium">#{o.invoiceId}</span> },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <div>
          <div>{o.user?.name ?? "-"}</div>
          <div className="text-xs text-ink/55">{o.user?.email}</div>
        </div>
      ),
    },
    { key: "date", header: "Placed", render: (o) => formatDateTime(o.createdAt) },
    { key: "items", header: "Items", render: (o) => o.productQty },
    { key: "amount", header: "Total", render: (o) => formatMoney(o.amount) },
    {
      key: "payment",
      header: "Payment",
      render: (o) => (
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-ink/60">{o.paymentMethod}</span>
          <Badge tone={o.paymentStatus === "PAID" ? "success" : "gold"}>{o.paymentStatus === "PAID" ? "Paid" : "Unpaid"}</Badge>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (o) => <Badge tone={orderStatusTone(o.orderStatus)}>{humanize(o.orderStatus)}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (o) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedId(o.id)} aria-label={`View order #${o.invoiceId}`}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Orders" description="Review orders and move them through fulfilment." />
      <div className="mb-4">
        <Select aria-label="Filter by order status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-64">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </Select>
      </div>
      <div aria-live="polite">
        {message && !data ? (
          <ErrorState message={message} onRetry={reload} />
        ) : (
          <DataTable columns={columns} rows={data} loading={loading && !data} emptyTitle={status ? "No orders with this status" : "No orders yet"} />
        )}
      </div>
      <OrderDetailModal order={selected} onClose={() => setSelectedId(null)} onChanged={reload} />
    </div>
  );
}
