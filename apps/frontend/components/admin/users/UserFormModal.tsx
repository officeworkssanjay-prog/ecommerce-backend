"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CreateUserSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Select } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";

type Values = z.input<typeof CreateUserSchema>;
type Output = z.output<typeof CreateUserSchema>;
const blank: Values = { name: "", email: "", password: "", role: "USER", phone: "" };

export function UserFormModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, Output>({ resolver: zodResolver(CreateUserSchema), defaultValues: blank });

  useEffect(() => {
    if (open) reset(blank);
  }, [open, reset]);

  const close = () => {
    setFormError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      // An empty phone box means "no phone"
      await api.post("/admin/users", { ...values, phone: values.phone || undefined });
      toast.success("User created");
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
      title="Add user"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={isSubmitting}>
            Create user
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        <Input label="Full name" required autoComplete="off" {...register("name")} error={errors.name?.message} />
        <Input label="Email" type="email" required autoComplete="off" {...register("email")} error={errors.email?.message} />
        <Input label="Phone" type="tel" autoComplete="off" {...register("phone")} error={errors.phone?.message} />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          hint="At least 8 characters with a letter and a number"
          {...register("password")}
          error={errors.password?.message}
        />
        <Select label="Role" {...register("role")} error={errors.role?.message}>
          <option value="USER">Customer</option>
          <option value="ADMIN">Admin (full access to this panel)</option>
        </Select>
      </form>
    </Modal>
  );
}
