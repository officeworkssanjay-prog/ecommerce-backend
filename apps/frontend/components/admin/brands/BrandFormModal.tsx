"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CreateBrandSchema, UpdateBrandSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { Brand } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { ImageUpload } from "@/components/ImageUpload";

type Values = z.input<typeof CreateBrandSchema>;
type Output = z.output<typeof CreateBrandSchema>;

const blank: Values = { name: "", logo: null, isFeatured: false, status: true };

export function BrandFormModal({ open, brand, onClose, onSaved }: { open: boolean; brand: Brand | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const editing = Boolean(brand);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, Output>({
    // Edit sends every field, so the update schema validates the same shape as create.
    resolver: zodResolver((editing ? UpdateBrandSchema : CreateBrandSchema) as typeof CreateBrandSchema),
    defaultValues: blank,
  });

  useEffect(() => {
    if (!open) return;
    reset(brand ? { name: brand.name, logo: brand.logo ?? null, isFeatured: brand.isFeatured, status: brand.status } : blank);
  }, [open, brand, reset]);

  const close = () => {
    setFormError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (brand) await api.put(`/admin/brands/${brand.id}`, values);
      else await api.post("/admin/brands", values);
      toast.success(brand ? "Brand updated" : "Brand created");
      onSaved();
      onClose();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <Modal
      open={open}
      onClose={close}
      title={brand ? "Edit brand" : "Add brand"}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="brand-form" loading={isSubmitting}>
            {brand ? "Save changes" : "Create brand"}
          </Button>
        </>
      }
    >
      <form id="brand-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        <Input label="Brand name" required {...register("name")} error={errors.name?.message} />
        <Controller control={control} name="logo" render={({ field }) => <ImageUpload label="Logo" value={field.value} onChange={field.onChange} error={errors.logo?.message} />} />
        <Checkbox label="Featured brand (shown on the storefront)" {...register("isFeatured")} />
        <Checkbox label="Active" {...register("status")} />
      </form>
    </Modal>
  );
}
