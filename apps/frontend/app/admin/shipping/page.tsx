"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatMoney } from "@/lib/format";
import type { ShippingRule } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";
import { ShippingForm } from "@/components/admin/content/ShippingForm";
import { RowActions, deleteWithConfirm, patchRecord } from "@/components/admin/content/helpers";

export default function ShippingPage() {
  const fb = useFeedback();
  const { data, loading, error, message, reload } = useApi(async () => (await api.get<ShippingRule[]>("/admin/shipping-rules")).data);
  const [editing, setEditing] = useState<ShippingRule | null | "new">(null);

  const columns = [
    { key: "name", header: "Name", render: (r: ShippingRule) => <span className="font-medium">{r.name}</span> },
    {
      key: "type",
      header: "Applies",
      render: (r: ShippingRule) => (r.type === "min_cost" ? `Orders of ${formatMoney(Number(r.minCost))} or more` : "All orders (flat cost)"),
    },
    { key: "cost", header: "Cost", render: (r: ShippingRule) => (Number(r.cost) === 0 ? "Free" : formatMoney(Number(r.cost))) },
    {
      key: "status",
      header: "Status",
      render: (r: ShippingRule) => (
        <button
          type="button"
          aria-label={`${r.status ? "Disable" : "Enable"} ${r.name}`}
          onClick={() => patchRecord(fb, `/admin/shipping-rules/${r.id}`, { status: !r.status }, r.status ? "Rule disabled" : "Rule enabled", reload)}
        >
          <StatusPill active={r.status} />
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r: ShippingRule) => (
        <RowActions
          name={r.name}
          onEdit={() => setEditing(r)}
          onDelete={() =>
            deleteWithConfirm(fb, { path: `/admin/shipping-rules/${r.id}`, title: "Delete shipping rule?", message: `"${r.name}" will be removed permanently.`, success: "Shipping rule deleted", onDone: reload })
          }
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Shipping rules"
        description="Flat cost charges the same amount on every order. Minimum order cost applies only when the order total reaches the stated amount."
        actions={
          <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setEditing("new")}>
            New rule
          </Button>
        }
      />
      {error ? (
        <ErrorState message={message} onRetry={reload} />
      ) : (
        <DataTable columns={columns} rows={data} loading={loading} emptyTitle="No shipping rules" emptyDescription="Add a rule so customers can check out with a shipping charge." />
      )}
      {editing && (
        <ShippingForm
          rule={editing === "new" ? null : editing}
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
