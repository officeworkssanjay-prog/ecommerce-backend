"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { UpdateGeneralSettingSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { AdminSettings } from "@/lib/types";
import { Input, Textarea } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { SettingsCard } from "./SettingsCard";

type In = z.input<typeof UpdateGeneralSettingSchema>;
type Out = z.output<typeof UpdateGeneralSettingSchema>;

export function GeneralSection({ value, onSaved }: { value: AdminSettings["general"]; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(UpdateGeneralSettingSchema),
    defaultValues: {
      siteName: value?.siteName ?? "",
      contactEmail: value?.contactEmail ?? "",
      contactPhone: value?.contactPhone ?? "",
      contactAddress: value?.contactAddress ?? "",
      mapUrl: value?.mapUrl ?? "",
      currencyName: value?.currencyName ?? "INR",
      currencyIcon: value?.currencyIcon ?? "₹",
      timeZone: value?.timeZone ?? "Asia/Kolkata",
    },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api.put("/admin/settings/general", values);
      toast.success("General settings saved");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <SettingsCard title="General" description="Store name and contact details." onSubmit={submit} saving={isSubmitting} error={formError}>
      <Input label="Site name" required className="sm:col-span-2" error={errors.siteName?.message} {...register("siteName")} />
      <Input label="Contact email" type="email" error={errors.contactEmail?.message} {...register("contactEmail")} />
      <Input label="Contact phone" type="tel" error={errors.contactPhone?.message} {...register("contactPhone")} />
      <Textarea label="Address" rows={2} className="sm:col-span-2" error={errors.contactAddress?.message} {...register("contactAddress")} />
      <Input label="Map URL" className="sm:col-span-2" error={errors.mapUrl?.message} {...register("mapUrl")} />
      <Input label="Currency code" required hint="3 letters, e.g. INR" error={errors.currencyName?.message} {...register("currencyName")} />
      <Input label="Currency symbol" required error={errors.currencyIcon?.message} {...register("currencyIcon")} />
      <Input label="Time zone" required hint="e.g. Asia/Kolkata" error={errors.timeZone?.message} {...register("timeZone")} />
    </SettingsCard>
  );
}
