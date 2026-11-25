"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { UpdatePaymentGatewaySchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { AdminSettings } from "@/lib/types";
import { Checkbox, Input } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { SettingsCard } from "./SettingsCard";

type Gateways = AdminSettings["paymentGateways"];

// Reuse the shared schema's Razorpay branch so validation matches the API.
const RazorpaySettings = UpdatePaymentGatewaySchema.options[0].shape.settings;
type RzIn = z.input<typeof RazorpaySettings>;
type RzOut = z.output<typeof RazorpaySettings>;

function RazorpayCard({ value, keysConfigured, onSaved }: { value: Gateways["razorpay"]; keysConfigured: boolean; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RzIn, unknown, RzOut>({
    resolver: zodResolver(RazorpaySettings),
    defaultValues: { status: value?.status ?? false, countryName: value?.countryName ?? "", currencyName: value?.currencyName ?? "INR", currencyRate: value?.currencyRate ?? 1 },
  });

  const submit = handleSubmit(async (settings) => {
    setFormError(null);
    try {
      await api.put("/admin/settings/payment-gateways", { gateway: "RAZORPAY", settings });
      toast.success("Razorpay settings saved");
      onSaved();
    } catch (err) {
      // The server validates the wrapped body, so field errors arrive as "settings.<field>".
      const msg = applyServerErrors(err, ((name: string, e: { type: string; message?: string }) => setError(name.replace(/^settings\./, "") as keyof RzIn, e)) as typeof setError);
      setFormError(msg);
    }
  });

  return (
    <SettingsCard
      title="Online payments: Razorpay"
      description={
        keysConfigured ? (
          <span className="inline-flex items-center gap-1.5 text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> API keys are configured on the server.
          </span>
        ) : (
          <span role="alert" className="inline-flex items-start gap-1.5 text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Online payments are unavailable until RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set on the server.
          </span>
        )
      }
      onSubmit={submit}
      saving={isSubmitting}
      error={formError}
    >
      <Checkbox label="Enable Razorpay at checkout" className="sm:col-span-2" {...register("status")} />
      <Input label="Country" error={errors.countryName?.message} {...register("countryName")} />
      <Input label="Currency code" hint="3 letters, e.g. INR" error={errors.currencyName?.message} {...register("currencyName")} />
      <Input label="Currency rate" type="number" step="any" min="0" hint="Conversion rate applied to the store currency" error={errors.currencyRate?.message} {...register("currencyRate")} />
    </SettingsCard>
  );
}

function CodCard({ value, onSaved }: { value: Gateways["cod"]; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm<{ status: boolean }>({ defaultValues: { status: value?.status ?? false } });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    setSaving(true);
    try {
      await api.put("/admin/settings/payment-gateways", { gateway: "COD", settings: { status: values.status } });
      toast.success("Cash on delivery settings saved");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, () => undefined));
    } finally {
      setSaving(false);
    }
  });

  return (
    <SettingsCard title="Cash on delivery" description="Let customers pay when the order arrives." onSubmit={submit} saving={saving} error={formError}>
      <Checkbox label="Enable cash on delivery" className="sm:col-span-2" {...register("status")} />
    </SettingsCard>
  );
}

export function PaymentsSection({ value, onSaved }: { value: Gateways; onSaved: () => void }) {
  return (
    <>
      <RazorpayCard value={value.razorpay} keysConfigured={value.razorpayKeysConfigured} onSaved={onSaved} />
      <CodCard value={value.cod} onSaved={onSaved} />
    </>
  );
}
