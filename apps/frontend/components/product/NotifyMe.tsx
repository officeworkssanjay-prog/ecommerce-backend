"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockAlertSchema } from "@ecommerce/shared-types";
import type { z } from "zod";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";

type Input = z.input<typeof StockAlertSchema>;

/** Sold-out products: records the shopper's email so the store can follow up. */
export function NotifyMe({ slug }: { slug: string }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Input>({ resolver: zodResolver(StockAlertSchema), defaultValues: { email: "" } });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api.post(`/storefront/products/${encodeURIComponent(slug)}/notify`, values);
      toast.success("We have saved your request");
      reset();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  const fieldError = errors.email?.message;
  return (
    <form onSubmit={submit} noValidate className="space-y-2 rounded-md border border-sand bg-parchment p-4">
      <label htmlFor="notify-email" className="text-sm font-medium text-ink">
        Notify me when this is back in stock
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="notify-email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          disabled={isSubmitting}
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? "notify-email-error" : undefined}
          className="w-full rounded-md border border-sand bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/50 focus:outline-none focus:ring-2 focus:ring-gold"
          {...register("email")}
        />
        <Button type="submit" loading={isSubmitting} className="whitespace-nowrap">
          Notify me
        </Button>
      </div>
      {fieldError && (
        <p id="notify-email-error" className="text-xs text-danger">
          {fieldError}
        </p>
      )}
      <FormError message={formError} />
    </form>
  );
}
