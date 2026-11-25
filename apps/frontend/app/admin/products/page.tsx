"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { effectivePrice, formatMoney } from "@/lib/format";
import type { Brand, Category, ChildCategory, Product, SubCategory } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { DataTable, PageHeader } from "@/components/admin/AdminKit";
import type { Column } from "@/components/admin/AdminKit";
import { RowActions, StatusToggle } from "@/components/admin/RowActions";
import { useCrudActions } from "@/components/admin/crud";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";

export default function AdminProductsPage() {
  const products = useApi(async () => (await api.get<Product[]>("/admin/products")).data);
  // Reference data for the form's cascading selects
  const categories = useApi(async () => (await api.get<Category[]>("/admin/categories")).data);
  const subCategories = useApi(async () => (await api.get<SubCategory[]>("/admin/sub-categories")).data);
  const childCategories = useApi(async () => (await api.get<ChildCategory[]>("/admin/child-categories")).data);
  const brands = useApi(async () => (await api.get<Brand[]>("/admin/brands")).data);

  const { remove, setStatus } = useCrudActions(products.reload);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const openForm = (p: Product | null) => {
    setEditing(p);
    setFormOpen(true);
  };

  const refError = [categories, subCategories, childCategories, brands].find((r) => r.message && !r.data);
  const refLoading = [categories, subCategories, childCategories, brands].some((r) => r.loading && !r.data);

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-parchment">
            {p.thumbImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.thumbImage} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <div className="font-medium">{p.name}</div>
            {p.sku && <div className="text-xs text-ink/55">SKU {p.sku}</div>}
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (p) => p.category?.name ?? "-" },
    {
      key: "price",
      header: "Price",
      render: (p) => {
        const current = effectivePrice(p);
        const onOffer = p.offerPrice != null && current !== Number(p.price);
        return onOffer ? (
          <div>
            <span className="font-medium">{formatMoney(current)}</span>
            <span className="ml-1 text-xs text-ink/50 line-through">{formatMoney(p.price)}</span>
          </div>
        ) : (
          formatMoney(p.price)
        );
      },
    },
    { key: "qty", header: "Stock", render: (p) => (p.qty <= 0 ? <Badge tone="danger">Out of stock</Badge> : p.qty <= 5 ? <Badge tone="gold">{p.qty} left</Badge> : p.qty) },
    { key: "status", header: "Status", render: (p) => <StatusToggle active={p.status} name={p.name} onToggle={(s) => setStatus(`/admin/products/${p.id}`, "Product", p.name, s)} /> },
    { key: "actions", header: "", className: "w-24", render: (p) => <RowActions name={p.name} onEdit={() => openForm(p)} onDelete={() => remove(`/admin/products/${p.id}`, "Product", p.name)} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your catalogue, prices and stock."
        actions={
          <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => openForm(null)} disabled={refLoading || Boolean(refError)}>
            Add product
          </Button>
        }
      />
      {refError && (
        <div className="mb-4">
          <ErrorState message={`Could not load categories or brands: ${refError.message}`} onRetry={() => [categories, subCategories, childCategories, brands].forEach((r) => r.reload())} />
        </div>
      )}
      <div aria-live="polite">
        {products.message && !products.data ? (
          <ErrorState message={products.message} onRetry={products.reload} />
        ) : (
          <DataTable columns={columns} rows={products.data} loading={products.loading && !products.data} emptyTitle="No products yet" emptyDescription="Add your first product to start selling." />
        )}
      </div>
      <ProductFormModal
        open={formOpen}
        product={editing}
        options={{ categories: categories.data ?? [], subCategories: subCategories.data ?? [], childCategories: childCategories.data ?? [], brands: brands.data ?? [] }}
        onClose={() => setFormOpen(false)}
        onSaved={products.reload}
      />
    </div>
  );
}
