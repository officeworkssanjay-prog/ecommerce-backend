"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateCategorySchema,
  CreateChildCategorySchema,
  CreateSubCategorySchema,
  UpdateCategorySchema,
  UpdateChildCategorySchema,
  UpdateSubCategorySchema,
} from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input, Select } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";

export type CategoryKind = "category" | "sub" | "child";

export interface ParentOption {
  id: string;
  label: string;
}

/** The record being edited (only the fields the form uses). */
export interface CategoryRecord {
  id: string;
  name: string;
  status: boolean;
  icon?: string | null;
  categoryId?: string;
  subCategoryId?: string;
}

interface Values {
  name: string;
  status: boolean;
  icon?: string | null;
  categoryId?: string;
  subCategoryId?: string;
}

const CONFIG = {
  category: { entity: "Category", path: "/admin/categories", create: CreateCategorySchema, update: UpdateCategorySchema },
  sub: { entity: "Sub-category", path: "/admin/sub-categories", create: CreateSubCategorySchema, update: UpdateSubCategorySchema },
  child: { entity: "Child category", path: "/admin/child-categories", create: CreateChildCategorySchema, update: UpdateChildCategorySchema },
} as const;

interface Props {
  open: boolean;
  kind: CategoryKind;
  record: CategoryRecord | null;
  /** Parent choices for sub-categories (categories) and child categories (sub-categories). */
  parents: ParentOption[];
  onClose: () => void;
  onSaved: () => void;
}

export function CategoryFormModal({ open, kind, record, parents, onClose, onSaved }: Props) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const cfg = CONFIG[kind];
  const parentField = kind === "sub" ? "categoryId" : kind === "child" ? "subCategoryId" : null;

  const schema = record ? cfg.update : cfg.create;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    // The three schemas share these fields; edit sends every field so the update schema validates the same shape.
    resolver: zodResolver(schema) as unknown as Resolver<Values>,
    defaultValues: { name: "", status: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      record
        ? { name: record.name, status: record.status, icon: record.icon ?? "", categoryId: record.categoryId, subCategoryId: record.subCategoryId }
        : { name: "", status: true, icon: "", categoryId: "", subCategoryId: "" }
    );
  }, [open, record, reset]);

  const close = () => {
    setFormError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const body: Record<string, unknown> = { name: values.name, status: values.status };
    if (kind === "category") body.icon = values.icon || null;
    if (parentField) body[parentField] = values[parentField];
    try {
      if (record) await api.put(`${cfg.path}/${record.id}`, body);
      else await api.post(cfg.path, body);
      toast.success(`${cfg.entity} ${record ? "updated" : "created"}`);
      onSaved();
      onClose();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  const formId = `category-form-${kind}`;
  return (
    <Modal
      open={open}
      onClose={close}
      title={`${record ? "Edit" : "Add"} ${cfg.entity.toLowerCase()}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {record ? "Save changes" : `Create ${cfg.entity.toLowerCase()}`}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        {parentField && (
          <Select label={kind === "sub" ? "Category" : "Sub-category"} required {...register(parentField)} error={errors[parentField]?.message}>
            <option value="">Select…</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        )}
        <Input label="Name" required {...register("name")} error={errors.name?.message} />
        {kind === "category" && <Input label="Icon (optional)" hint="Icon name or emoji shown beside the category" {...register("icon")} error={errors.icon?.message} />}
        <Checkbox label="Active" {...register("status")} />
      </form>
    </Modal>
  );
}
