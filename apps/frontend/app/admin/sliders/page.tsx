"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatMoney } from "@/lib/format";
import type { Slider } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";
import { SliderForm } from "@/components/admin/content/SliderForm";
import { RowActions, deleteWithConfirm, patchRecord } from "@/components/admin/content/helpers";

export default function SlidersPage() {
  const fb = useFeedback();
  const { data, loading, error, message, reload } = useApi(async () => (await api.get<Slider[]>("/admin/sliders")).data);
  const [editing, setEditing] = useState<Slider | null | "new">(null);

  const columns = [
    {
      key: "banner",
      header: "Banner",
      render: (s: Slider) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.banner} alt="" className="h-12 w-24 rounded object-cover" />
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (s: Slider) => (
        <>
          <div className="font-medium">{s.title || "Untitled"}</div>
          <div className="text-xs text-ink/60">{s.type}</div>
        </>
      ),
    },
    { key: "startingPrice", header: "Starting price", render: (s: Slider) => (s.startingPrice != null ? formatMoney(Number(s.startingPrice)) : "–") },
    { key: "serial", header: "Order" },
    {
      key: "status",
      header: "Status",
      render: (s: Slider) => (
        <button
          type="button"
          aria-label={`${s.status ? "Disable" : "Enable"} slider ${s.title || s.serial}`}
          onClick={() => patchRecord(fb, `/admin/sliders/${s.id}`, { status: !s.status }, s.status ? "Slider disabled" : "Slider enabled", reload)}
        >
          <StatusPill active={s.status} />
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s: Slider) => (
        <RowActions
          name={`slider ${s.title || s.serial}`}
          onEdit={() => setEditing(s)}
          onDelete={() =>
            deleteWithConfirm(fb, { path: `/admin/sliders/${s.id}`, title: "Delete slider?", message: "This hero slide will be removed from the home page.", success: "Slider deleted", onDone: reload })
          }
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Hero sliders"
        description="Banners shown at the top of the home page, in display order."
        actions={
          <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setEditing("new")}>
            New slider
          </Button>
        }
      />
      {error ? (
        <ErrorState message={message} onRetry={reload} />
      ) : (
        <DataTable columns={columns} rows={data} loading={loading} emptyTitle="No sliders yet" emptyDescription="Add a banner to feature on the home page." />
      )}
      {editing && (
        <SliderForm
          slider={editing === "new" ? null : editing}
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
