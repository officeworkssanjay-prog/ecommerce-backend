"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CreateCouponSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { Coupon } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useFeedback } from "@/components/ui/Feedback";
import { toDateTimeInput } from "./helpers";

type In = z.input<typeof CreateCouponSchema>;
type Out = z.output<typeof CreateCouponSchema>;

export function CouponForm({ coupon, onClose, onSaved }: { coupon: Coupon | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(CreateCouponSchema),
    defaultValues: coupon
      ? {
          name: coupon.name,
          code: coupon.code,
          quantity: coupon.quantity,
          maxUse: coupon.maxUse,
          startDate: toDateTimeInput(coupon.startDate) as unknown as Date,
          endDate: toDateTimeInput(coupon.endDate) as unknown as Date,
          discountType: coupon.discountType,
          discount: Number(coupon.discount),
          status: coupon.status,
        }
      : { name: "", code: "", quantity: 100, maxUse: 1, discountType: "PERCENT", discount: 10, status: true },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (coupon) await api.put(`/admin/coupons/${coupon.id}`, values);
      else await api.post("/admin/coupons", values);
      toast.success(coupon ? "Coupon updated" : "Coupon created");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={coupon ? "Edit coupon" : "New coupon"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="coupon-form" loading={isSubmitting}>
            {coupon ? "Save changes" : "Create coupon"}
          </Button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <FormError message={formError} />
        <Input label="Name" required className="sm:col-span-2" error={errors.name?.message} {...register("name")} />
        <Input label="Code" required hint="Saved in capital letters; letters, numbers, - and _" error={errors.code?.message} {...register("code")} />
        <Select label="Discount type" error={errors.discountType?.message} {...register("discountType")}>
          <option value="PERCENT">Percentage (max 100)</option>
          <option value="AMOUNT">Fixed amount</option>
        </Select>
        <Input label="Discount" type="number" step="0.01" min="0" required error={errors.discount?.message} {...register("discount")} />
        <Input
          label="Total quantity"
          type="number"
          min="1"
          required
          hint={coupon ? `Cannot go below the ${coupon.totalUsed} already redeemed` : "How many times the coupon can be redeemed overall"}
          error={errors.quantity?.message}
          {...register("quantity")}
        />
        <Input label="Uses per customer" type="number" min="1" error={errors.maxUse?.message} {...register("maxUse")} />
        <div className="hidden sm:block" />
        <Input label="Starts" type="datetime-local" required error={errors.startDate?.message} {...register("startDate")} />
        <Input label="Ends" type="datetime-local" required error={errors.endDate?.message} {...register("endDate")} />
        <Checkbox label="Active" className="sm:col-span-2" {...register("status")} />
      </form>
    </Modal>
  );
}
