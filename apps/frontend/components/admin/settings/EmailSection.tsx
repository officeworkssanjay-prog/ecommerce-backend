"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { UpdateEmailSettingSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { AdminSettings } from "@/lib/types";
import { Input, Select } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { SettingsCard } from "./SettingsCard";

type In = z.input<typeof UpdateEmailSettingSchema>;
type Out = z.output<typeof UpdateEmailSettingSchema>;

export function EmailSection({ value, onSaved }: { value: AdminSettings["email"]; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(UpdateEmailSettingSchema),
    // The stored password is never loaded into the form.
    defaultValues: {
      email: value?.email ?? "",
      host: value?.host ?? "",
      username: value?.username ?? "",
      password: "",
      port: value?.port ?? 587,
      encryption: value?.encryption === "ssl" || value?.encryption === "none" ? value.encryption : "tls",
    },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    const { password, ...rest } = values;
    try {
      await api.put("/admin/settings/email", password ? { ...rest, password } : rest);
      toast.success("Email settings saved");
      reset({ ...values, password: "" });
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <SettingsCard
      title="Email (SMTP)"
      description="Outgoing mail server used for store emails. Note that sending newsletters is not enabled yet."
      onSubmit={submit}
      saving={isSubmitting}
      error={formError}
    >
      <Input label="From email" type="email" required error={errors.email?.message} {...register("email")} />
      <Input label="Host" required error={errors.host?.message} {...register("host")} />
      <Input label="Username" required autoComplete="off" error={errors.username?.message} {...register("username")} />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Leave blank to keep the current password"
        hint={value?.hasPassword ? `A password is saved (${value.password}).` : "No password saved yet. Enter one to save these settings."}
        error={errors.password?.message}
        {...register("password")}
      />
      <Input label="Port" type="number" error={errors.port?.message} {...register("port")} />
      <Select label="Encryption" error={errors.encryption?.message} {...register("encryption")}>
        <option value="tls">TLS</option>
        <option value="ssl">SSL</option>
        <option value="none">None</option>
      </Select>
    </SettingsCard>
  );
}
