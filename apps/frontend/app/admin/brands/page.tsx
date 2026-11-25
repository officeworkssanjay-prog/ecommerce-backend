"use client";

import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { api } from "@/lib/api";
import type { Brand } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { DataTable, PageHeader } from "@/components/admin/AdminKit";
import type { Column } from "@/components/admin/AdminKit";
import { RowActions, StatusToggle } from "@/components/admin/RowActions";
import { useCrudActions } from "@/components/admin/crud";
import { BrandFormModal } from "@/components/admin/brands/BrandFormModal";

type BrandRow = Brand & { _count?: { products: number } };

export default function AdminBrandsPage() {
  const { data, loading, message, reload } = useApi(async () => (await api.get<BrandRow[]>("/admin/brands")).data);
  const { remove, setStatus } = useCrudActions(reload);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const openForm = (brand: Brand | null) => {
    setEditing(brand);
    setFormOpen(true);
  };

  const columns: Column<BrandRow>[] = [
    {
      key: "name",
      header: "Brand",
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-parchment">
            {b.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.logo} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs font-semibold text-gold-dark" aria-hidden>
                {b.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="font-medium">{b.name}</span>
        </div>
      ),
    },
    { key: "products", header: "Products", render: (b) => b._count?.products ?? 0 },
    {
      key: "featured",
      header: "Featured",
      render: (b) =>
        b.isFeatured ? (
          <Badge tone="gold">
            <Star className="mr-1 h-3 w-3" aria-hidden /> Featured
          </Badge>
        ) : (
          <span className="text-ink/40">No</span>
        ),
    },
    { key: "status", header: "Status", render: (b) => <StatusToggle active={b.status} name={b.name} onToggle={(s) => setStatus(`/admin/brands/${b.id}`, "Brand", b.name, s)} /> },
    { key: "actions", header: "", className: "w-24", render: (b) => <RowActions name={b.name} onEdit={() => openForm(b)} onDelete={() => remove(`/admin/brands/${b.id}`, "Brand", b.name)} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Brands"
        description="Brands you can assign to products."
        actions={
          <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => openForm(null)}>
            Add brand
          </Button>
        }
      />
      {message && !data ? (
        <ErrorState message={message} onRetry={reload} />
      ) : (
        <DataTable columns={columns} rows={data} loading={loading && !data} emptyTitle="No brands yet" emptyDescription="Add your first brand to group products." />
      )}
      <BrandFormModal open={formOpen} brand={editing} onClose={() => setFormOpen(false)} onSaved={reload} />
    </div>
  );
}
