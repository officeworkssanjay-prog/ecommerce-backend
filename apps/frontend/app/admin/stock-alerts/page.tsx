"use client";

import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatDateTime } from "@/lib/format";
import type { StockAlert } from "@/lib/types";
import { ErrorState } from "@/components/ui/States";
import { DataTable, PageHeader } from "@/components/admin/AdminKit";

export default function StockAlertsPage() {
  const { data, loading, error, message, reload } = useApi(async () => (await api.get<StockAlert[]>("/admin/stock-alerts")).data);

  const columns = [
    { key: "email", header: "Email", render: (r: StockAlert) => <span className="font-medium">{r.email}</span> },
    { key: "product", header: "Product", render: (r: StockAlert) => r.product.name },
    { key: "stock", header: "In stock", render: (r: StockAlert) => (r.product.qty > 0 ? r.product.qty : "Sold out") },
    { key: "requested", header: "Requested", render: (r: StockAlert) => formatDateTime(r.createdAt) },
    { key: "notified", header: "Notified", render: (r: StockAlert) => (r.notifiedAt ? formatDateTime(r.notifiedAt) : "Not yet") },
  ];

  return (
    <div>
      <PageHeader title="Stock alerts" description="Customers who asked to hear when a sold-out product is back." />
      {error ? <ErrorState message={message} onRetry={reload} /> : <DataTable columns={columns} rows={data} loading={loading} emptyTitle="No stock alerts" emptyDescription="Requests from sold-out product pages will appear here." />}
    </div>
  );
}
