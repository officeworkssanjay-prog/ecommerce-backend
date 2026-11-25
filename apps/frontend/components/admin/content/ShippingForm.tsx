"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CreateShippingRuleSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { ShippingRule } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useFeedback } from "@/components/ui/Feedback";

type In = z.input<typeof CreateShippingRuleSchema>;
type Out = z.output<typeof CreateShippingRuleSchema>;

export function ShippingForm({ rule, onClose, onSaved }: { rule: ShippingRule | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(CreateShippingRuleSchema),
    defaultValues: rule
      ? { name: rule.name, type: rule.type === "min_cost" ? "min_cost" : "flat_cost", minCost: Number(rule.minCost ?? 0), cost: Number(rule.cost), status: rule.status }
      : { name: "", type: "flat_cost", minCost: 0, cost: 0, status: true },
  });
  const type = useWatch({ control, name: "type" });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    const body = { ...values, minCost: values.type === "flat_cost" ? 0 : values.minCost };
    try {
      if (rule) await api.put(`/admin/shipping-rules/${rule.id}`, body);
      else await api.post("/admin/shipping-rules", body);
      toast.success(rule ? "Shipping rule updated" : "Shipping rule created");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={rule ? "Edit shipping rule" : "New shipping rule"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="shipping-form" loading={isSubmitting}>
            {rule ? "Save changes" : "Create rule"}
          </Button>
        </>
      }
    >
      <form id="shipping-form" onSubmit={submit} noValidate className="grid gap-4">
        <FormError message={formError} />
        <Input label="Name" required error={errors.name?.message} {...register("name")} />
        <Select
          label="Type"
          error={errors.type?.message}
          hint={
            type === "min_cost"
              ? "Minimum order cost: this rule applies only when the order total is at least the amount below."
              : "Flat cost: the same shipping charge applies to every order."
          }
          {...register("type")}
        >
          <option value="flat_cost">Flat cost</option>
          <option value="min_cost">Minimum order cost</option>
        </Select>
        {type === "min_cost" && <Input label="Order must be at least" type="number" step="0.01" min="0" error={errors.minCost?.message} {...register("minCost")} />}
        <Input label="Shipping cost" type="number" step="0.01" min="0" required hint="Charged to the customer. Use 0 for free shipping." error={errors.cost?.message} {...register("cost")} />
        <Checkbox label="Active" {...register("status")} />
      </form>
    </Modal>
  );
}
