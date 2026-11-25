"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { BroadcastMailSchema } from "@ecommerce/shared-types";
import type { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { useApi } from "@/lib/useApi";
import { formatDate } from "@/lib/format";
import type { Subscriber } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Textarea } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";

type Values = z.infer<typeof BroadcastMailSchema>;

export default function SubscribersPage() {
  const { toast } = useFeedback();
  const { data, loading, error, message, reload } = useApi(async () => (await api.get<Subscriber[]>("/admin/subscribers")).data);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(BroadcastMailSchema), defaultValues: { subject: "", message: "" } });

  const submit = handleSubmit(async (values) => {
    setNotice(null);
    setFormError(null);
    try {
      await api.post("/admin/subscribers/send-mail", values);
      toast.success("Message sent");
      reset();
    } catch (err) {
      if (err instanceof ApiError && err.status === 501) setNotice(err.message);
      else setFormError(applyServerErrors(err, setError));
    }
  });

  const verified = (data ?? []).filter((s) => s.isVerified).length;

  const columns = [
    { key: "email", header: "Email", render: (s: Subscriber) => <span className="font-medium">{s.email}</span> },
    { key: "verified", header: "Verified", render: (s: Subscriber) => <StatusPill active={s.isVerified} onLabel="Verified" offLabel="Pending" /> },
    { key: "date", header: "Subscribed", render: (s: Subscriber) => formatDate(s.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Subscribers" description={data ? `${data.length} subscribers, ${verified} verified.` : "Newsletter sign-ups."} />
      {error ? <ErrorState message={message} onRetry={reload} /> : <DataTable columns={columns} rows={data} loading={loading} emptyTitle="No subscribers yet" />}

      <section aria-labelledby="broadcast" className="rounded-lg border border-sand bg-white p-5">
        <h2 id="broadcast" className="font-serif text-lg text-ink">
          Send a message to subscribers
        </h2>
        <div role="status" aria-live="polite" className="mt-3 flex items-start gap-2 rounded-md border border-gold/60 bg-parchment px-3 py-2 text-sm text-ink">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" aria-hidden />
          <span>{notice ?? "Email sending is not set up yet, so broadcasts cannot be delivered. You can prepare a message, but nothing will be sent until mail is configured on the server."}</span>
        </div>
        <form onSubmit={submit} noValidate className="mt-4 grid gap-4">
          <FormError message={formError} />
          <Input label="Subject" required error={errors.subject?.message} {...register("subject")} />
          <Textarea label="Message" rows={6} required error={errors.message?.message} {...register("message")} />
          <div>
            <Button type="submit" loading={isSubmitting}>
              Send to verified subscribers
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
