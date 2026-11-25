"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CreateProductAdminSchema, UpdateProductAdminSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { humanize } from "@/lib/format";
import type { Brand, Category, ChildCategory, Product, SubCategory } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input, Select, Textarea } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { ImageUpload } from "@/components/ImageUpload";

type Values = z.input<typeof CreateProductAdminSchema>;
type Output = z.output<typeof CreateProductAdminSchema>;

const PRODUCT_TYPES = ["NEW_ARRIVAL", "FEATURED_PRODUCT", "TOP_PRODUCT", "BEST_PRODUCT"] as const;

export interface CatalogueOptions {
  categories: Category[];
  subCategories: SubCategory[];
  childCategories: ChildCategory[];
  brands: Brand[];
}

const blank = {
  name: "",
  categoryId: "",
  subCategoryId: "",
  childCategoryId: "",
  brandId: "",
  thumbImage: "",
  qty: 0,
  price: 0,
  offerPrice: "",
  offerStartDate: "",
  offerEndDate: "",
  shortDescription: "",
  longDescription: "",
  videoLink: "",
  sku: "",
  productType: "",
  seoTitle: "",
  seoDescription: "",
  status: true,
} as unknown as Values;

const dateInput = (v?: string | null) => (v ? v.slice(0, 10) : "");

function fromProduct(p: Product): Values {
  return {
    name: p.name,
    categoryId: p.categoryId,
    subCategoryId: p.subCategoryId ?? "",
    childCategoryId: p.childCategoryId ?? "",
    brandId: p.brandId ?? "",
    thumbImage: p.thumbImage,
    qty: p.qty,
    price: p.price,
    offerPrice: p.offerPrice ?? "",
    offerStartDate: dateInput(p.offerStartDate),
    offerEndDate: dateInput(p.offerEndDate),
    shortDescription: p.shortDescription ?? "",
    longDescription: p.longDescription ?? "",
    videoLink: p.videoLink ?? "",
    sku: p.sku ?? "",
    productType: p.productType ?? "",
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    status: p.status,
  } as unknown as Values;
}

export function ProductFormModal({ open, product, options, onClose, onSaved }: { open: boolean; product: Product | null; options: CatalogueOptions; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, Output>({
    // Edit sends every field, so the update schema validates the same shape as create.
    resolver: zodResolver((product ? UpdateProductAdminSchema : CreateProductAdminSchema) as typeof CreateProductAdminSchema) as unknown as Resolver<Values, unknown, Output>,
    defaultValues: blank,
  });

  useEffect(() => {
    if (!open) return;
    reset(product ? fromProduct(product) : blank);
  }, [open, product, reset]);

  const categoryId = useWatch({ control, name: "categoryId" });
  const subCategoryId = useWatch({ control, name: "subCategoryId" }) as string | null | undefined;
  const subs = options.subCategories.filter((s) => s.categoryId === categoryId);
  const children = options.childCategories.filter((c) => c.subCategoryId === subCategoryId);

  const close = () => {
    setFormError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (product) await api.put(`/admin/products/${product.id}`, values);
      else await api.post("/admin/products", values);
      toast.success(product ? "Product updated" : "Product created");
      onSaved();
      onClose();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  const msg = (k: keyof Values) => errors[k]?.message as string | undefined;

  return (
    <Modal
      open={open}
      onClose={close}
      title={product ? "Edit product" : "Add product"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" loading={isSubmitting}>
            {product ? "Save changes" : "Create product"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />

        <Input label="Product name" required {...register("name")} error={msg("name")} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Category"
            required
            {...register("categoryId", {
              onChange: () => {
                setValue("subCategoryId", "");
                setValue("childCategoryId", "");
              },
            })}
            error={msg("categoryId")}
          >
            <option value="">Select…</option>
            {options.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            label="Sub-category"
            disabled={!categoryId}
            {...register("subCategoryId", { onChange: () => setValue("childCategoryId", "") })}
            error={msg("subCategoryId")}
          >
            <option value="">None</option>
            {subs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select label="Child category" disabled={!subCategoryId} {...register("childCategoryId")} error={msg("childCategoryId")}>
            <option value="">None</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Brand" {...register("brandId")} error={msg("brandId")}>
            <option value="">No brand</option>
            {options.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input label="SKU" {...register("sku")} error={msg("sku")} />
          <Select label="Product type" {...register("productType")} error={msg("productType")}>
            <option value="">Standard</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {humanize(t)}
              </option>
            ))}
          </Select>
        </div>

        <Controller control={control} name="thumbImage" render={({ field }) => <ImageUpload label="Thumbnail" value={field.value} onChange={(u) => field.onChange(u ?? "")} error={msg("thumbImage")} />} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Price" type="number" step="0.01" min="0" required {...register("price")} error={msg("price")} />
          <Input label="Offer price" type="number" step="0.01" min="0" hint="Leave empty for no offer" {...register("offerPrice")} error={msg("offerPrice")} />
          <Input label="Stock quantity" type="number" step="1" min="0" required {...register("qty")} error={msg("qty")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Offer starts" type="date" {...register("offerStartDate")} error={msg("offerStartDate")} />
          <Input label="Offer ends" type="date" {...register("offerEndDate")} error={msg("offerEndDate")} />
        </div>

        <Textarea label="Short description" rows={2} {...register("shortDescription")} error={msg("shortDescription")} />
        <Textarea label="Long description" rows={5} {...register("longDescription")} error={msg("longDescription")} />
        <Input label="Video link" type="url" placeholder="https://" {...register("videoLink")} error={msg("videoLink")} />

        <fieldset className="flex flex-col gap-4 rounded-md border border-sand p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-ink/70">Search engine listing</legend>
          <Input label="SEO title" {...register("seoTitle")} error={msg("seoTitle")} />
          <Textarea label="SEO description" rows={2} {...register("seoDescription")} error={msg("seoDescription")} />
        </fieldset>

        <Checkbox label="Active (visible on the storefront)" {...register("status")} />
      </form>
    </Modal>
  );
}
