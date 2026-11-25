"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema } from "@ecommerce/shared-types";
import type { ChangePasswordInput } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { FormError, Input } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";

export function PasswordForm() {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", passwordConfirmation: "" },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api.post("/user/change-password", values);
      reset();
      toast.success("Password updated");
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-3xl border border-sand bg-white p-6" aria-label="Change password">
      <h2 className="font-serif text-xl text-ink">Change password</h2>
      <FormError message={formError} />
      <Input label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register("currentPassword")} />
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, with at least one letter and one number."
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <Input label="Confirm new password" type="password" autoComplete="new-password" error={errors.passwordConfirmation?.message} {...register("passwordConfirmation")} />
      <Button type="submit" variant="dark" loading={isSubmitting}>
        Update password
      </Button>
    </form>
  );
}
