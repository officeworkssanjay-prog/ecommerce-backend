"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CreatePincodeSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { Pincode } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useFeedback } from "@/components/ui/Feedback";

type In = z.input<typeof CreatePincodeSchema>;
type Out = z.output<typeof CreatePincodeSchema>;

export function PincodeForm({ record, onClose, onSaved }: { record: Pincode | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(CreatePincodeSchema),
    defaultValues: record
      ? { pincode: record.pincode, city: record.city ?? "", state: record.state ?? "", deliveryDays: record.deliveryDays, codAvailable: record.codAvailable, status: record.status }
      : { pincode: "", city: "", state: "", deliveryDays: 5, codAvailable: true, status: true },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (record) await api.put(`/admin/pincodes/${record.id}`, values);
      else await api.post("/admin/pincodes", values);
      toast.success(record ? "Pincode updated" : "Pincode added");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={record ? "Edit pincode" : "New pincode"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="pincode-form" loading={isSubmitting}>
            {record ? "Save changes" : "Add pincode"}
          </Button>
        </>
      }
    >
      <form id="pincode-form" onSubmit={submit} noValidate className="grid gap-4">
        <FormError message={formError} />
        <Input label="Pincode" required inputMode="numeric" maxLength={6} error={errors.pincode?.message} {...register("pincode")} />
        <Input label="City" error={errors.city?.message} {...register("city")} />
        <Input label="State" error={errors.state?.message} {...register("state")} />
        <Input label="Delivery days" type="number" min="0" max="60" step="1" required error={errors.deliveryDays?.message} {...register("deliveryDays")} />
        <Checkbox label="Cash on delivery available" {...register("codAvailable")} />
        <Checkbox label="Active" {...register("status")} />
      </form>
    </Modal>
  );
}
