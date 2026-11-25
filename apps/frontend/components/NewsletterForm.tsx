"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { NewsletterSchema } from "@ecommerce/shared-types";
import type { z } from "zod";
import { ApiError, api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { Button } from "@/components/ui/Button";

type NewsletterInput = z.input<typeof NewsletterSchema>;
type Status = { kind: "success" | "info" | "error"; message: string } | null;

/** Footer newsletter signup (double opt-in is handled by the server). */
export function NewsletterForm() {
  const [status, setStatus] = useState<Status>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({ resolver: zodResolver(NewsletterSchema), defaultValues: { email: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setStatus(null);
    try {
      const res = await api.post("/storefront/newsletter-subscribe", values);
      setStatus({ kind: "success", message: res.message || "Thank you for subscribing!" });
      reset();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Already subscribed: not a failure, just tell the shopper.
        setStatus({ kind: "info", message: err.message });
        return;
      }
      setStatus({ kind: "error", message: applyServerErrors(err, setError) });
    }
  });

  const fieldError = errors.email?.message;
  const Icon = status?.kind === "success" ? CheckCircle2 : status?.kind === "info" ? Info : AlertCircle;

  return (
    <div className="w-full md:w-auto">
      <form onSubmit={onSubmit} noValidate className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <div className="sm:w-80">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            disabled={isSubmitting}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? "newsletter-email-error" : undefined}
            className="w-full rounded-md bg-white px-4 py-3 text-xs text-ink placeholder:text-ink/50 focus:outline-none focus:ring-2 focus:ring-gold sm:text-sm"
            {...register("email")}
          />
        </div>
        <Button type="submit" loading={isSubmitting} className="h-auto whitespace-nowrap rounded-md px-6 py-3 text-xs sm:text-sm">
          {isSubmitting ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
      <div aria-live="polite" className="mt-2 min-h-4">
        {fieldError && (
          <p id="newsletter-email-error" className="flex items-center gap-1 text-xs text-red-300">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden /> {fieldError}
          </p>
        )}
        {status && (
          <p className={`flex items-center gap-1 text-xs ${status.kind === "success" ? "text-emerald-400" : status.kind === "info" ? "text-gold-light" : "text-red-300"}`}>
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> {status.message}
          </p>
        )}
      </div>
    </div>
  );
}
