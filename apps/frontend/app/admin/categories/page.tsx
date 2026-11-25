"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { Category, ChildCategory, SubCategory } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/useApi";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { DataTable, PageHeader } from "@/components/admin/AdminKit";
import type { Column } from "@/components/admin/AdminKit";
import { RowActions, StatusToggle } from "@/components/admin/RowActions";
import { useCrudActions } from "@/components/admin/crud";
import { CategoryFormModal } from "@/components/admin/categories/CategoryFormModal";
import type { CategoryKind, CategoryRecord } from "@/components/admin/categories/CategoryFormModal";

type SubRow = SubCategory & { category?: { name: string }; _count?: { childCategories?: number; products?: number } };
type ChildRow = ChildCategory & { subCategory?: { name: string; category?: { name: string } }; _count?: { products?: number } };

const TABS: { kind: CategoryKind; label: string; entity: string; path: string }[] = [
  { kind: "category", label: "Categories", entity: "Category", path: "/admin/categories" },
  { kind: "sub", label: "Sub-categories", entity: "Sub-category", path: "/admin/sub-categories" },
  { kind: "child", label: "Child categories", entity: "Child category", path: "/admin/child-categories" },
];

export default function AdminCategoriesPage() {
  const [kind, setKind] = useState<CategoryKind>("category");
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // All three lists load up front: sub/child forms need the parents, and tabs switch instantly.
  const cats = useApi(async () => (await api.get<Category[]>("/admin/categories")).data);
  const subs = useApi(async () => (await api.get<SubRow[]>("/admin/sub-categories")).data);
  const children = useApi(async () => (await api.get<ChildRow[]>("/admin/child-categories")).data);

  const reloadAll = () => {
    cats.reload();
    subs.reload();
    children.reload();
  };
  const { remove, setStatus } = useCrudActions(reloadAll);

  const tab = TABS.find((t) => t.kind === kind)!;
  const state = kind === "category" ? cats : kind === "sub" ? subs : children;

  const openForm = (record: CategoryRecord | null) => {
    setEditing(record);
    setFormOpen(true);
  };

  const statusCol = <T extends { id: string; name: string; status: boolean }>(): Column<T> => ({
    key: "status",
    header: "Status",
    render: (r) => <StatusToggle active={r.status} name={r.name} onToggle={(s) => setStatus(`${tab.path}/${r.id}`, tab.entity, r.name, s)} />,
  });
  const actionsCol = <T extends { id: string; name: string; status: boolean }>(toRecord: (r: T) => CategoryRecord): Column<T> => ({
    key: "actions",
    header: "",
    className: "w-24",
    render: (r) => <RowActions name={r.name} onEdit={() => openForm(toRecord(r))} onDelete={() => remove(`${tab.path}/${r.id}`, tab.entity, r.name)} />,
  });

  const categoryColumns: Column<Category>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "sub", header: "Sub-categories", render: (c) => c._count?.subCategories ?? 0 },
    { key: "products", header: "Products", render: (c) => c._count?.products ?? 0 },
    statusCol<Category>(),
    actionsCol<Category>((c) => ({ id: c.id, name: c.name, status: c.status, icon: c.icon })),
  ];
  const subColumns: Column<SubRow>[] = [
    { key: "name", header: "Name", render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "category", header: "Category", render: (s) => s.category?.name ?? "-" },
    { key: "child", header: "Child categories", render: (s) => s._count?.childCategories ?? 0 },
    { key: "products", header: "Products", render: (s) => s._count?.products ?? 0 },
    statusCol<SubRow>(),
    actionsCol<SubRow>((s) => ({ id: s.id, name: s.name, status: s.status, categoryId: s.categoryId })),
  ];
  const childColumns: Column<ChildRow>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "parent", header: "Sub-category", render: (c) => (c.subCategory ? `${c.subCategory.category?.name ? `${c.subCategory.category.name} / ` : ""}${c.subCategory.name}` : "-") },
    { key: "products", header: "Products", render: (c) => c._count?.products ?? 0 },
    statusCol<ChildRow>(),
    actionsCol<ChildRow>((c) => ({ id: c.id, name: c.name, status: c.status, subCategoryId: c.subCategoryId })),
  ];

  const parents =
    kind === "sub"
      ? (cats.data ?? []).map((c) => ({ id: c.id, label: c.name }))
      : kind === "child"
        ? (subs.data ?? []).map((s) => ({ id: s.id, label: `${s.category?.name ? `${s.category.name} / ` : ""}${s.name}` }))
        : [];
  const needsParent = kind !== "category" && parents.length === 0 && !state.loading;

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organise products into categories, sub-categories and child categories."
        actions={
          <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => openForm(null)} disabled={needsParent}>
            Add {tab.entity.toLowerCase()}
          </Button>
        }
      />
      <div role="tablist" aria-label="Category levels" className="mb-4 flex gap-1 border-b border-sand">
        {TABS.map((t) => (
          <button
            key={t.kind}
            type="button"
            role="tab"
            id={`tab-${t.kind}`}
            aria-selected={kind === t.kind}
            aria-controls="category-panel"
            onClick={() => setKind(t.kind)}
            className={cn("-mb-px border-b-2 px-4 py-2 text-sm font-medium", kind === t.kind ? "border-gold text-gold-dark" : "border-transparent text-ink/60 hover:text-ink")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id="category-panel" role="tabpanel" aria-labelledby={`tab-${kind}`} aria-live="polite">
        {needsParent && (
          <p className="mb-3 rounded-md bg-parchment px-3 py-2 text-sm text-ink/70">
            Create a {kind === "sub" ? "category" : "sub-category"} first, then you can add {tab.entity.toLowerCase()}s.
          </p>
        )}
        {state.message && !state.data ? (
          <ErrorState message={state.message} onRetry={state.reload} />
        ) : kind === "category" ? (
          <DataTable columns={categoryColumns} rows={cats.data} loading={cats.loading && !cats.data} emptyTitle="No categories yet" />
        ) : kind === "sub" ? (
          <DataTable columns={subColumns} rows={subs.data} loading={subs.loading && !subs.data} emptyTitle="No sub-categories yet" />
        ) : (
          <DataTable columns={childColumns} rows={children.data} loading={children.loading && !children.data} emptyTitle="No child categories yet" />
        )}
      </div>
      <CategoryFormModal open={formOpen} kind={kind} record={editing} parents={parents} onClose={() => setFormOpen(false)} onSaved={reloadAll} />
    </div>
  );
}
