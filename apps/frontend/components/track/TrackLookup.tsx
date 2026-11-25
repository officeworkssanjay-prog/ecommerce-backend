"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { TrackOrderParamsSchema, TrackOrderQuerySchema } from "@ecommerce/shared-types";
import { ApiError, api, errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { FormError, Input } from "@/components/ui/Field";
import { NOT_FOUND, type TrackedOrder } from "./trackTypes";

interface Props {
  initialInvoice: string;
  onFound: (order: TrackedOrder | null) => void;
}

export function TrackLookup({ initialInvoice, onFound }: Props) {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ invoice?: string; email?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    onFound(null);
    const p = TrackOrderParamsSchema.safeParse({ invoiceId: invoice.trim().replace(/^#/, "") });
    const q = TrackOrderQuerySchema.safeParse({ email });
    setErrors({ invoice: p.success ? undefined : p.error.issues[0]?.message, email: q.success ? undefined : q.error.issues[0]?.message });
    if (!p.success || !q.success) return;

    setLoading(true);
    try {
      const res = await api.get<TrackedOrder>(`/order/track/${p.data.invoiceId}?email=${encodeURIComponent(q.data.email)}`);
      onFound(res.data);
    } catch (err) {
      setFormError(err instanceof ApiError && err.isNotFound ? NOT_FOUND : errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-2xl gap-4 rounded-sm border border-sand bg-white p-6 shadow-card sm:grid-cols-[1fr_1fr_auto] sm:items-start">
      <Input label="Invoice number" inputMode="numeric" placeholder="e.g. 100234" value={invoice} onChange={(e) => setInvoice(e.target.value)} error={errors.invoice} required />
      <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
      <Button type="submit" loading={loading} icon={<Search className="h-4 w-4" aria-hidden />} className="w-full sm:mt-6 sm:w-auto">
        Track order
      </Button>
      <div className="sm:col-span-3" aria-live="polite">
        <FormError message={formError} />
      </div>
    </form>
  );
}
