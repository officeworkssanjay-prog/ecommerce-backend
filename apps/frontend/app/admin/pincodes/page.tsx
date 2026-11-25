"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Pincode } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";
import { PincodeForm } from "@/components/admin/content/PincodeForm";
import { RowActions, deleteWithConfirm, patchRecord } from "@/components/admin/content/helpers";

export default function PincodesPage() {
  const fb = useFeedback();
  const { data, loading, error, message, reload } = useApi(async () => (await api.get<Pincode[]>("/admin/pincodes")).data);
  const [editing, setEditing] = useState<Pincode | null | "new">(null);

  const columns = [
    { key: "pincode", header: "Pincode", render: (r: Pincode) => <span className="font-medium">{r.pincode}</span> },
    { key: "place", header: "City / State", render: (r: Pincode) => [r.city, r.state].filter(Boolean).join(", ") || "—" },
    { key: "days", header: "Delivery", render: (r: Pincode) => `${r.deliveryDays} ${r.deliveryDays === 1 ? "day" : "days"}` },
    { key: "cod", header: "COD", render: (r: Pincode) => (r.codAvailable ? "Available" : "Not available") },
    {
      key: "status",
      header: "Status",
      render: (r: Pincode) => (
        <button
          type="button"
          aria-label={`${r.status ? "Disable" : "Enable"} ${r.pincode}`}
          onClick={() => patchRecord(fb, `/admin/pincodes/${r.id}`, { status: !r.status }, r.status ? "Pincode disabled" : "Pincode enabled", reload)}
        >
          <StatusPill active={r.status} />
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r: Pincode) => (
        <RowActions
          name={r.pincode}
          onEdit={() => setEditing(r)}
          onDelete={() =>
            deleteWithConfirm(fb, { path: `/admin/pincodes/${r.id}`, title: "Delete pincode?", message: `"${r.pincode}" will be removed permanently.`, success: "Pincode deleted", onDone: reload })
          }
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pincodes"
        description="Add the pincodes you deliver to. While the list is empty the store does not restrict delivery; once it has active pincodes, only those can check out."
        actions={
          <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setEditing("new")}>
            New pincode
          </Button>
        }
      />
      {error ? (
        <ErrorState message={message} onRetry={reload} />
      ) : (
        <DataTable columns={columns} rows={data} loading={loading} emptyTitle="No pincodes" emptyDescription="Add a pincode to start restricting delivery to serviceable areas." />
      )}
      {editing && (
        <PincodeForm
          record={editing === "new" ? null : editing}
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
