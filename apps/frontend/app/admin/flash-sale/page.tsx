"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { FlashSale, Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorState, PageLoader } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";
import { AddProductModal, FlashSaleForm } from "@/components/admin/content/FlashSaleForms";
import { RowActions, deleteWithConfirm } from "@/components/admin/content/helpers";

type Item = FlashSale["products"][number];

export default function FlashSalePage() {
  const fb = useFeedback();
  const sale = useApi(async () => (await api.get<FlashSale | null>("/admin/flash-sale")).data);
  const products = useApi(async () => (await api.get<Product[]>("/admin/products")).data);
  const [adding, setAdding] = useState(false);

  if (sale.loading && !sale.data) return <PageLoader />;
  if (sale.error) return <ErrorState message={sale.message} onRetry={sale.reload} />;
  const current = sale.data;

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (i: Item) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={i.product.thumbImage} alt="" className="h-10 w-10 rounded object-cover" />
          <span className="font-medium">{i.product.name}</span>
        </div>
      ),
    },
    { key: "price", header: "Price", render: (i: Item) => formatMoney(Number(i.product.price)) },
    { key: "home", header: "On home page", render: (i: Item) => <StatusPill active={i.showAtHome} onLabel="Shown" offLabel="Hidden" /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (i: Item) => (
        <RowActions
          name={`${i.product.name} from flash sale`}
          onDelete={() =>
            deleteWithConfirm(fb, { path: `/admin/flash-sale/products/${i.id}`, title: "Remove from flash sale?", message: `${i.product.name} will no longer be part of the flash sale.`, success: "Product removed", onDone: sale.reload })
          }
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flash sale"
        description={current ? `Ends ${formatDateTime(current.endDate)}` : "No flash sale exists yet."}
        actions={
          current && (
            <>
              <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setAdding(true)} disabled={products.loading || !!products.error}>
                Add product
              </Button>
            </>
          )
        }
      />
      <FlashSaleForm key={current?.id ?? "new"} sale={current} onSaved={sale.reload} />
      {current && (
        <>
          {products.error && <ErrorState message={products.message} onRetry={products.reload} />}
          <DataTable columns={columns} rows={current.products} emptyTitle="No products in the flash sale" emptyDescription="Add products to feature them during the sale." />
        </>
      )}
      {adding && current && (
        <AddProductModal
          flashSaleId={current.id}
          products={products.data ?? []}
          existing={current.products.map((p) => p.product.id)}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            sale.reload();
          }}
        />
      )}
    </div>
  );
}
