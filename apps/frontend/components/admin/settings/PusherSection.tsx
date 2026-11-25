"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { UpdatePusherSettingSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { AdminSettings } from "@/lib/types";
import { Input } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { SettingsCard } from "./SettingsCard";

type In = z.input<typeof UpdatePusherSettingSchema>;
type Out = z.output<typeof UpdatePusherSettingSchema>;

export function PusherSection({ value, onSaved }: { value: AdminSettings["pusher"]; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(UpdatePusherSettingSchema),
    defaultValues: { appId: value?.appId ?? "", key: value?.key ?? "", secret: "", cluster: value?.cluster ?? "mt1" },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    const { secret, ...rest } = values;
    try {
      await api.put("/admin/settings/pusher", secret ? { ...rest, secret } : rest);
      toast.success("Pusher settings saved");
      reset({ ...values, secret: "" });
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <SettingsCard title="Pusher (realtime)" description="Optional. Used for live chat updates; the store works without it." onSubmit={submit} saving={isSubmitting} error={formError}>
      <Input label="App ID" required error={errors.appId?.message} {...register("appId")} />
      <Input label="Key" required error={errors.key?.message} {...register("key")} />
      <Input
        label="Secret"
        type="password"
        autoComplete="new-password"
        placeholder="Leave blank to keep the current secret"
        hint={value?.hasSecret ? `A secret is saved (${value.secret}).` : "No secret saved yet. Enter one to save these settings."}
        error={errors.secret?.message}
        {...register("secret")}
      />
      <Input label="Cluster" required error={errors.cluster?.message} {...register("cluster")} />
    </SettingsCard>
  );
}
