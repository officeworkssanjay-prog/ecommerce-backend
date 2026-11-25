"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import { Button } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";
import type { Column } from "@/components/admin/AdminKit";

interface AdminReview {
  id: string;
  rating: number;
  review: string;
  status: boolean;
  createdAt: string;
  product?: { name: string; slug: string };
  user?: { name: string; email: string };
}

type Filter = "" | "pending" | "approved";

export default function AdminReviewsPage() {
  const { confirm, toast } = useFeedback();
  const [filter, setFilter] = useState<Filter>("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data, loading, message, reload } = useApi(async () => (await api.get<AdminReview[]>("/admin/reviews")).data);

  const rows = (data ?? []).filter((r) => (filter === "pending" ? !r.status : filter === "approved" ? r.status : true));

  const setStatus = async (r: AdminReview, status: boolean) => {
    if (!status) {
      const ok = await confirm({ title: "Hide this review?", message: "It will no longer be shown on the product page.", confirmLabel: "Hide", danger: true });
      if (!ok) return;
    }
    setBusyId(r.id);
    try {
      await api.put(`/admin/reviews/${r.id}/status`, { status });
      toast.success(status ? "Review approved" : "Review hidden");
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<AdminReview>[] = [
    {
      key: "rating",
      header: "Rating",
      render: (r) => (
        <span className="inline-flex items-center gap-1 font-medium" aria-label={`${r.rating} out of 5 stars`}>
          <Star className="h-4 w-4 fill-gold text-gold" aria-hidden /> {r.rating}/5
        </span>
      ),
    },
    { key: "review", header: "Review", className: "max-w-sm", render: (r) => <p className="line-clamp-3 whitespace-pre-line">{r.review}</p> },
    { key: "product", header: "Product", render: (r) => r.product?.name ?? "-" },
    {
      key: "user",
      header: "Customer",
      render: (r) =>
        r.user ? (
          <div>
            <div>{r.user.name}</div>
            <div className="text-xs text-ink/55">{r.user.email}</div>
          </div>
        ) : (
          "-"
        ),
    },
    { key: "createdAt", header: "Date", render: (r) => formatDate(r.createdAt) },
    { key: "status", header: "Status", render: (r) => <StatusPill active={r.status} onLabel="Approved" offLabel="Pending / hidden" /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) =>
        r.status ? (
          <Button size="sm" variant="ghost" loading={busyId === r.id} onClick={() => setStatus(r, false)} aria-label={`Hide review by ${r.user?.name ?? "customer"}`}>
            Hide
          </Button>
        ) : (
          <Button size="sm" variant="outline" loading={busyId === r.id} onClick={() => setStatus(r, true)} aria-label={`Approve review by ${r.user?.name ?? "customer"}`}>
            Approve
          </Button>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Reviews" description="Approve customer reviews before they appear on product pages." />
      <div className="mb-4">
        <Select aria-label="Filter reviews" value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="w-48">
          <option value="">All reviews</option>
          <option value="pending">Pending approval</option>
          <option value="approved">Approved</option>
        </Select>
      </div>
      <div aria-live="polite">
        {message && !data ? (
          <ErrorState message={message} onRetry={reload} />
        ) : (
          <DataTable columns={columns} rows={rows} loading={loading && !data} emptyTitle="No reviews to show" />
        )}
      </div>
    </div>
  );
}
