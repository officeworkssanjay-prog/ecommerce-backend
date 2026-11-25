"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { AddFlashSaleProductSchema, UpdateFlashSaleSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { FlashSale, Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useFeedback } from "@/components/ui/Feedback";
import { toDateTimeInput } from "./helpers";

type SaleIn = z.input<typeof UpdateFlashSaleSchema>;
type SaleOut = z.output<typeof UpdateFlashSaleSchema>;

/** Create (no sale yet) or edit the single flash sale. */
export function FlashSaleForm({ sale, onSaved }: { sale: FlashSale | null; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SaleIn, unknown, SaleOut>({
    resolver: zodResolver(UpdateFlashSaleSchema),
    defaultValues: { endDate: sale ? (toDateTimeInput(sale.endDate) as unknown as Date) : undefined, showAtHome: sale?.showAtHome ?? true },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    if (!sale && !values.endDate) {
      setError("endDate", { message: "End date is required" });
      return;
    }
    try {
      await api.put("/admin/flash-sale", values);
      toast.success(sale ? "Flash sale updated" : "Flash sale created");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-lg border border-sand bg-white p-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormError message={formError} />
      </div>
      <Input label="Sale ends" type="datetime-local" required hint="Must be in the future" error={errors.endDate?.message} {...register("endDate")} />
      <Checkbox label="Show on the home page" className="self-end pb-2" {...register("showAtHome")} />
      <div className="sm:col-span-2">
        <Button type="submit" loading={isSubmitting}>
          {sale ? "Save flash sale" : "Create flash sale"}
        </Button>
      </div>
    </form>
  );
}

type AddIn = z.input<typeof AddFlashSaleProductSchema>;
type AddOut = z.output<typeof AddFlashSaleProductSchema>;

export function AddProductModal({ flashSaleId, products, existing, onClose, onSaved }: { flashSaleId: string; products: Product[]; existing: string[]; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddIn, unknown, AddOut>({
    resolver: zodResolver(AddFlashSaleProductSchema),
    defaultValues: { flashSaleId, productId: "", showAtHome: false },
  });
  const available = products.filter((p) => !existing.includes(p.id));

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api.post("/admin/flash-sale/products", values);
      toast.success("Product added to flash sale");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="Add product to flash sale"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="flash-add-form" loading={isSubmitting}>
            Add product
          </Button>
        </>
      }
    >
      <form id="flash-add-form" onSubmit={submit} noValidate className="grid gap-4">
        <FormError message={formError} />
        <input type="hidden" {...register("flashSaleId")} />
        <Select label="Product" required error={errors.productId?.message ?? errors.flashSaleId?.message} {...register("productId")}>
          <option value="">Select a product</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Checkbox label="Show on the home page" {...register("showAtHome")} />
      </form>
    </Modal>
  );
}
