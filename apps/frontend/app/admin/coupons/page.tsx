"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatDate, formatMoney } from "@/lib/format";
import type { Coupon } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";
import { CouponForm } from "@/components/admin/content/CouponForm";
import { RowActions, deleteWithConfirm, patchRecord } from "@/components/admin/content/helpers";

export default function CouponsPage() {
  const fb = useFeedback();
  const { data, loading, error, message, reload } = useApi(async () => (await api.get<Coupon[]>("/admin/coupons")).data);
  const [editing, setEditing] = useState<Coupon | null | "new">(null);

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (c: Coupon) => (
        <>
          <div className="font-mono font-semibold">{c.code}</div>
          <div className="text-xs text-ink/60">{c.name}</div>
        </>
      ),
    },
    { key: "discount", header: "Discount", render: (c: Coupon) => (c.discountType === "PERCENT" ? `${Number(c.discount)}%` : formatMoney(Number(c.discount))) },
    { key: "used", header: "Used / quantity", render: (c: Coupon) => `${c.totalUsed} / ${c.quantity}` },
    {
      key: "validity",
      header: "Validity",
      render: (c: Coupon) => (
        <>
          {formatDate(c.startDate)} – {formatDate(c.endDate)}
          {new Date(c.endDate).getTime() < Date.now() && (
            <Badge tone="danger" className="ml-2">
              Expired
            </Badge>
          )}
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c: Coupon) => (
        <button
          type="button"
          onClick={() => patchRecord(fb, `/admin/coupons/${c.id}`, { status: !c.status }, c.status ? "Coupon disabled" : "Coupon enabled", reload)}
          aria-label={`${c.status ? "Disable" : "Enable"} coupon ${c.code}`}
        >
          <StatusPill active={c.status} />
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c: Coupon) => (
        <RowActions
          name={`coupon ${c.code}`}
          onEdit={() => setEditing(c)}
          onDelete={() =>
            deleteWithConfirm(fb, { path: `/admin/coupons/${c.id}`, title: "Delete coupon?", message: `${c.code} will be removed permanently.`, success: "Coupon deleted", onDone: reload })
          }
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Discount codes customers can apply at checkout."
        actions={
          <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setEditing("new")}>
            New coupon
          </Button>
        }
      />
      {error ? (
        <ErrorState message={message} onRetry={reload} />
      ) : (
        <DataTable columns={columns} rows={data} loading={loading} emptyTitle="No coupons yet" emptyDescription="Create a code to offer customers a discount." />
      )}
      {editing && (
        <CouponForm
          coupon={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
